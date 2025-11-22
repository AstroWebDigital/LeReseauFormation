package com.example.backend.controller;

import com.example.backend.entity.Vehicle;
import com.example.backend.service.VehicleService;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/vehicles")
public class VehicleController {

    private final VehicleService vehicleService;

    public VehicleController(VehicleService vehicleService) {
        this.vehicleService = vehicleService;
    }

    /**
     * GET /api/vehicles/available : Récupère la liste paginée des véhicules disponibles.
     *
     * @param page Le numéro de page (par défaut 0).
     * @param size La taille de la page (par défaut 20, max 20).
     * @return Une réponse paginée contenant les véhicules.
     */
    @GetMapping("/available")
    public ResponseEntity<Page<Vehicle>> getAvailableVehicles(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        Page<Vehicle> vehicles = vehicleService.getAvailableVehicles(page, size);

        return ResponseEntity.ok(vehicles);
    }
}