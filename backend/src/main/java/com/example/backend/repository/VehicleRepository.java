package com.example.backend.repository;

import com.example.backend.entity.Vehicle;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface VehicleRepository extends JpaRepository<Vehicle, UUID> {

    /**
     * Récupère tous les véhicules ayant le statut 'AVAILABLE' ou 'LISTED' (ou tout statut que vous considérez comme disponible),
     * avec pagination.
     *
     * @param status Le statut du véhicule à filtrer (ex: "AVAILABLE").
     * @param pageable Contient les informations de pagination (page, taille, tri).
     * @return Une page de véhicules.
     */
    Page<Vehicle> findByStatus(String status, Pageable pageable);
    Page<Vehicle> findByAlpId(UUID alpId, Pageable pageable);
    Page<Vehicle> findByAlpUserId(UUID userId, Pageable pageable);

}