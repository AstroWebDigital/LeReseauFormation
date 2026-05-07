package com.example.backend.controller;

import com.example.backend.dto.ReservedDateRangeDto;
import com.example.backend.entity.Vehicle;
import com.example.backend.service.VehicleService;
import com.example.backend.entity.User;
import com.example.backend.service.UserService;
import com.example.backend.dto.VehicleRequest;
import com.example.backend.validation.OnCreate;
import com.example.backend.validation.OnUpdate;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/vehicles")
public class VehicleController {

    @Value("${app.upload-dir:/data/uploads}")
    private String uploadDir;

    private final VehicleService vehicleService;
    private final UserService userService;

    public VehicleController(VehicleService vehicleService, UserService userService) {
        this.vehicleService = vehicleService;
        this.userService = userService;
    }

    // ─── Routes fixes en PREMIER (avant les routes avec @PathVariable) ──────────

    /**
     * GET /api/vehicles/available
     */
    @GetMapping("/available")
    public ResponseEntity<Page<Vehicle>> getAvailableVehicles(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(vehicleService.getAvailableVehicles(page, size));
    }

    /**
     * GET /api/vehicles/bookable — disponible + réservé (pour la page de réservation)
     */
    @GetMapping("/bookable")
    public ResponseEntity<Page<Vehicle>> getBookableVehicles(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(vehicleService.getBookableVehicles(page, size));
    }

    /**
     * GET /api/vehicles/my-fleet
     */
    @GetMapping("/my-fleet")
    public ResponseEntity<Page<Vehicle>> getMyVehicles(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        User currentUser = loadCurrentUser(userDetails);
        return ResponseEntity.ok(vehicleService.getVehiclesByUserId(currentUser.getId(), page, size));
    }

    // ─── Routes dynamiques avec @PathVariable APRÈS ──────────────────────────────

    /**
     * GET /api/vehicles/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<Vehicle> getVehicleById(@PathVariable UUID id) {
        return ResponseEntity.ok(vehicleService.getVehicleById(id));
    }

    /**
     * GET /api/vehicles/{id}/reserved-dates — plages de réservation actives (pour le calendrier)
     */
    @GetMapping("/{id}/reserved-dates")
    public ResponseEntity<List<ReservedDateRangeDto>> getReservedDates(@PathVariable UUID id) {
        return ResponseEntity.ok(vehicleService.getReservedDates(id));
    }

    /**
     * PUT /api/vehicles/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<Vehicle> updateVehicle(
            @PathVariable UUID id,
            @Validated(OnUpdate.class) @RequestBody VehicleRequest vehicleRequest,
            @AuthenticationPrincipal UserDetails userDetails) {

        User currentUser = loadCurrentUser(userDetails);
        Vehicle vehicleDetails = vehicleRequest.toNewEntity();
        if (vehicleRequest.getStatus() != null) vehicleDetails.setStatus(vehicleRequest.getStatus());
        if (vehicleRequest.getLastMaintenanceDate() != null) vehicleDetails.setLastMaintenanceDate(vehicleRequest.getLastMaintenanceDate());
        return ResponseEntity.ok(vehicleService.updateVehicle(id, vehicleDetails, currentUser));
    }

    /**
     * DELETE /api/vehicles/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteVehicle(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserDetails userDetails) {
        vehicleService.deleteVehicle(id, loadCurrentUser(userDetails));
        return ResponseEntity.noContent().build();
    }

    /**
     * POST /api/vehicles
     */
    @PostMapping
    public ResponseEntity<Vehicle> createVehicle(
            @Validated(OnCreate.class) @RequestBody VehicleRequest vehicleRequest,
            @AuthenticationPrincipal UserDetails userDetails) {
        User currentUser = loadCurrentUser(userDetails);
        Vehicle createdVehicle = vehicleService.createVehicle(vehicleRequest.toNewEntity(), currentUser);
        return new ResponseEntity<>(createdVehicle, HttpStatus.CREATED);
    }

    /**
     * POST /api/vehicles/{id}/images
     */
    @PostMapping(value = "/{id}/images", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Vehicle> uploadImages(
            @PathVariable UUID id,
            @RequestParam("images") MultipartFile[] files,
            @AuthenticationPrincipal UserDetails userDetails) throws IOException {

        User currentUser = loadCurrentUser(userDetails);
        Vehicle vehicle = vehicleService.getVehicleById(id);

        if (!vehicle.getUser().getId().equals(currentUser.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Accès refusé.");
        }

        List<String> imageUrls = new ArrayList<>();
        Path uploadPath = Paths.get(uploadDir, "vehicles", id.toString());
        Files.createDirectories(uploadPath);

        for (MultipartFile file : files) {
            if (file.isEmpty()) continue;
            String filename = UUID.randomUUID() + "_" + file.getOriginalFilename();
            file.transferTo(uploadPath.resolve(filename));
            imageUrls.add("/uploads/vehicles/" + id + "/" + filename);
        }

        return ResponseEntity.ok(vehicleService.addImages(id, imageUrls));
    }

    // ─── Utilitaire ──────────────────────────────────────────────────────────────

    private User loadCurrentUser(UserDetails userDetails) {
        return userService.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Utilisateur non trouvé ou session invalide."));
    }
}