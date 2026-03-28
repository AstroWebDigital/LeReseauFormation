package com.example.backend.repository;

import com.example.backend.entity.Vehicle;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface VehicleRepository extends JpaRepository<Vehicle, UUID> {

    Page<Vehicle> findByStatus(String status, Pageable pageable);
    Page<Vehicle> findByUserId(UUID userId, Pageable pageable);
    List<Vehicle> findAllByUserId(UUID userId);
}