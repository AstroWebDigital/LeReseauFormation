package com.example.backend.dto;

import com.example.backend.entity.Vehicle;
import com.example.backend.validation.OnCreate;
import com.example.backend.validation.OnUpdate;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class VehicleRequest {

    // --- Champs obligatoires pour la création et la mise à jour (OnCreate/OnUpdate) ---

    @NotBlank(groups = {OnCreate.class, OnUpdate.class})
    @Size(max = 255, groups = {OnCreate.class, OnUpdate.class})
    private String brand;

    @NotBlank(groups = {OnCreate.class, OnUpdate.class})
    @Size(max = 255, groups = {OnCreate.class, OnUpdate.class})
    private String model;

    @NotBlank(groups = {OnCreate.class, OnUpdate.class})
    @Size(max = 255, groups = {OnCreate.class, OnUpdate.class})
    private String plateNumber; // License plate

    @NotBlank(groups = {OnCreate.class, OnUpdate.class})
    @Size(max = 50, groups = {OnCreate.class, OnUpdate.class})
    private String type; // Ex: Sedan, SUV

    @NotBlank(groups = {OnCreate.class, OnUpdate.class})
    @Size(max = 50, groups = {OnCreate.class, OnUpdate.class})
    private String fuel; // Ex: Essence, Diesel, Electric

    @NotBlank(groups = {OnCreate.class, OnUpdate.class})
    @Size(max = 50, groups = {OnCreate.class, OnUpdate.class})
    private String transmission; // Ex: Automatic, Manual

    @NotNull(groups = {OnCreate.class, OnUpdate.class})
    @DecimalMin(value = "0.0", inclusive = false, message = "Le prix doit être supérieur à zéro")
    private BigDecimal baseDailyPrice;

    @NotNull(groups = {OnCreate.class, OnUpdate.class})
    @PositiveOrZero
    private Integer mileage;

    @Size(max = 255, groups = {OnCreate.class, OnUpdate.class})
    private String defaultParkingLocation;

    // --- Champs spécifiques à la mise à jour (Optionnels ou système) ---

    // Champ status
    @NotBlank(groups = OnUpdate.class) // Obligatoire pour la mise à jour
    @Null(groups = OnCreate.class, message = "Le statut est défini par défaut à la création")
    private String status;

    // Champ listingDate
    @NotNull(groups = OnUpdate.class) // Obligatoire pour la mise à jour (ex: si admin change la date)
    @Null(groups = OnCreate.class, message = "La date de mise en ligne est définie par le système à la création")
    private LocalDate listingDate;

    // Champ optionnel pour la mise à jour
    private LocalDate lastMaintenanceDate;


    // Méthode pour la création d'une NOUVELLE entité
    public Vehicle toNewEntity() {
        Vehicle vehicle = new Vehicle();
        // Mappage de tous les champs
        vehicle.setBrand(this.brand);
        vehicle.setModel(this.model);
        vehicle.setPlateNumber(this.plateNumber);
        vehicle.setType(this.type);
        vehicle.setFuel(this.fuel);
        vehicle.setTransmission(this.transmission);
        vehicle.setBaseDailyPrice(this.baseDailyPrice);
        vehicle.setMileage(this.mileage);
        vehicle.setDefaultParkingLocation(this.defaultParkingLocation);

        // Les champs de relation (alp, createdAt, status) sont gérés dans le Service

        return vehicle;
    }

    // Méthode pour la mise à jour d'une entité EXISTANTE
    public void updateEntity(Vehicle existingVehicle) {
        existingVehicle.setBrand(this.brand);
        existingVehicle.setModel(this.model);
        existingVehicle.setPlateNumber(this.plateNumber);
        existingVehicle.setType(this.type);
        existingVehicle.setFuel(this.fuel);
        existingVehicle.setTransmission(this.transmission);
        existingVehicle.setBaseDailyPrice(this.baseDailyPrice);
        existingVehicle.setMileage(this.mileage);
        existingVehicle.setDefaultParkingLocation(this.defaultParkingLocation);

        // Mise à jour optionnelle du statut (si l'utilisateur a le droit)
        if (this.status != null) {
            existingVehicle.setStatus(this.status);
        }
        if (this.listingDate != null) {
            existingVehicle.setListingDate(this.listingDate);
        }
        if (this.lastMaintenanceDate != null) {
            existingVehicle.setLastMaintenanceDate(this.lastMaintenanceDate);
        }
    }
}