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

    /**
     * GET /api/vehicles/{id} : Récupère un véhicule par son ID.
     */
    @GetMapping("/{id}")
    public ResponseEntity<Vehicle> getVehicleById(@PathVariable UUID id) {
        Vehicle vehicle = vehicleService.getVehicleById(id);
        return ResponseEntity.ok(vehicle);
    }

    /**
     * GET /api/vehicles/available : Récupère la liste paginée des véhicules disponibles.
     */
    @GetMapping("/available")
    public ResponseEntity<Page<Vehicle>> getAvailableVehicles(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        Page<Vehicle> vehicles = vehicleService.getAvailableVehicles(page, size);

        return ResponseEntity.ok(vehicles);
    }

    /**
     * POST /api/vehicles : Crée un nouveau véhicule.
     */
    @PostMapping
    public ResponseEntity<Vehicle> createVehicle(
            @Validated(OnCreate.class) @RequestBody VehicleRequest vehicleRequest,
            @AuthenticationPrincipal UserDetails userDetails) {

        // 1. Charger l'entité User complète
        User currentUser = loadCurrentUser(userDetails);

        // 2. Convertir le DTO en Entité (sans les relations)
        Vehicle vehicleToCreate = vehicleRequest.toNewEntity();

        // 3. Transmettre au service
        Vehicle createdVehicle = vehicleService.createVehicle(vehicleToCreate, currentUser);

        return new ResponseEntity<>(createdVehicle, HttpStatus.CREATED);
    }

    /**
     * PUT /api/vehicles/{id} : Met à jour un véhicule existant.
     */
    @PutMapping("/{id}")
    public ResponseEntity<Vehicle> updateVehicle(
            @PathVariable UUID id,
            @Validated(OnUpdate.class) @RequestBody VehicleRequest vehicleRequest,
            @AuthenticationPrincipal UserDetails userDetails) {

        User currentUser = loadCurrentUser(userDetails);

        // 1. Créer une "enveloppe" de détails à mettre à jour à partir du DTO
        Vehicle vehicleDetails = vehicleRequest.toNewEntity();

        // 2. Ajouter les champs spécifiques à la mise à jour (Status, MaintenanceDate)
        if (vehicleRequest.getStatus() != null) {
            vehicleDetails.setStatus(vehicleRequest.getStatus());
        }
        if (vehicleRequest.getLastMaintenanceDate() != null) {
            vehicleDetails.setLastMaintenanceDate(vehicleRequest.getLastMaintenanceDate());
        }

        Vehicle updatedVehicle = vehicleService.updateVehicle(id, vehicleDetails, currentUser);

        return ResponseEntity.ok(updatedVehicle);
    }

    /**
     * DELETE /api/vehicles/{id} : Supprime un véhicule.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteVehicle(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserDetails userDetails) {

        User currentUser = loadCurrentUser(userDetails);

        vehicleService.deleteVehicle(id, currentUser);

        return ResponseEntity.noContent().build();
    }

    /**
     * Méthode utilitaire pour charger l'entité User complète à partir de Spring Security.
     */
    private User loadCurrentUser(UserDetails userDetails) {
        // Supposant que le nom d'utilisateur est l'email
        return userService.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Utilisateur non trouvé ou session invalide."));
    }
}