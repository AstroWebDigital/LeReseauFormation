package com.example.backend.controller;

import com.example.backend.entity.Vehicle;
import com.example.backend.service.VehicleService;
import com.example.backend.entity.User;
import com.example.backend.service.UserService;
import com.example.backend.dto.VehicleRequest;
import com.example.backend.validation.OnCreate;
import com.example.backend.validation.OnUpdate;

import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.UUID;

@RestController
@RequestMapping("/api/vehicles")
public class VehicleController {

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

    // ─── Utilitaire ──────────────────────────────────────────────────────────────

    private User loadCurrentUser(UserDetails userDetails) {
        return userService.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Utilisateur non trouvé ou session invalide."));
    }
}