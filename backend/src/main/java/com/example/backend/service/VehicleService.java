package com.example.backend.service;

import com.example.backend.entity.Vehicle;
import com.example.backend.entity.User;
import com.example.backend.repository.VehicleRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import jakarta.transaction.Transactional;
import java.time.LocalDate;
import java.util.UUID;

@Service
public class VehicleService {

    private static final int DEFAULT_PAGE_SIZE = 20;
    private static final String AVAILABLE_STATUS = "disponible";

    private final VehicleRepository vehicleRepository;

    public VehicleService(VehicleRepository vehicleRepository) {
        this.vehicleRepository = vehicleRepository;
    }

    @Transactional
    public Vehicle createVehicle(Vehicle vehicle, User owner) {
        vehicle.setUser(owner);                          // ← setAlp(ownerAlp) → setUser(owner)
        vehicle.setStatus(AVAILABLE_STATUS);
        vehicle.setListingDate(LocalDate.now());
        return vehicleRepository.save(vehicle);
    }

    @Transactional
    public Vehicle updateVehicle(UUID id, Vehicle vehicleDetails, User currentUser) {
        Vehicle existingVehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Véhicule non trouvé."));

        if (!existingVehicle.getUser().getId().equals(currentUser.getId())) {  // ← getAlp().getUser() → getUser()
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Vous n'êtes pas autorisé à modifier ce véhicule.");
        }

        existingVehicle.setBrand(vehicleDetails.getBrand());
        existingVehicle.setModel(vehicleDetails.getModel());
        existingVehicle.setPlateNumber(vehicleDetails.getPlateNumber());
        existingVehicle.setType(vehicleDetails.getType());
        existingVehicle.setFuel(vehicleDetails.getFuel());
        existingVehicle.setTransmission(vehicleDetails.getTransmission());
        existingVehicle.setBaseDailyPrice(vehicleDetails.getBaseDailyPrice());
        existingVehicle.setMileage(vehicleDetails.getMileage());
        existingVehicle.setDefaultParkingLocation(vehicleDetails.getDefaultParkingLocation());
        if (vehicleDetails.getStatus() != null) existingVehicle.setStatus(vehicleDetails.getStatus());
        if (vehicleDetails.getLastMaintenanceDate() != null) existingVehicle.setLastMaintenanceDate(vehicleDetails.getLastMaintenanceDate());

        return vehicleRepository.save(existingVehicle);
    }

    @Transactional
    public void deleteVehicle(UUID id, User currentUser) {
        Vehicle existingVehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Véhicule non trouvé."));

        if (!existingVehicle.getUser().getId().equals(currentUser.getId())) {  // ← getAlp().getUser() → getUser()
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Vous n'êtes pas autorisé à supprimer ce véhicule.");
        }

        vehicleRepository.delete(existingVehicle);
    }

    public Vehicle getVehicleById(UUID id) {
        return vehicleRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Véhicule non trouvé."));
    }

    public Page<Vehicle> getAvailableVehicles(int page, int size) {
        int pageSize = (size > 0 && size <= DEFAULT_PAGE_SIZE) ? size : DEFAULT_PAGE_SIZE;
        Sort sort = Sort.by("listingDate").descending();
        Pageable pageable = PageRequest.of(page, pageSize, sort);
        return vehicleRepository.findByStatus(AVAILABLE_STATUS, pageable);
    }

    public Page<Vehicle> getVehiclesByUserId(UUID userId, int page, int size) {
        return vehicleRepository.findByUserId(userId, PageRequest.of(page, size)); // ← findByAlpUserId → findByUserId
    }
}