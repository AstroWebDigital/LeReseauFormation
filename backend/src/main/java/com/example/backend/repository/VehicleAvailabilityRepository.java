package com.example.backend.repository;

import com.example.backend.entity.VehicleAvailability;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface VehicleAvailabilityRepository extends JpaRepository<VehicleAvailability, UUID> {
    List<VehicleAvailability> findByVehicleIdOrderByStartDateAsc(UUID vehicleId);
    boolean existsByVehicleId(UUID vehicleId);
}
