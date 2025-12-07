package com.example.backend.repository;

import com.example.backend.entity.Reservation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ReservationRepository extends JpaRepository<Reservation, UUID> {


    @Query("""
        SELECT r FROM Reservation r 
        WHERE r.vehicle.id = :vehicleId 
        AND r.status IN ('CONFIRMED', 'PENDING') 
        AND r.endDate > :newStartDate 
        AND r.startDate < :newEndDate
    """)
    Optional<Reservation> findConflictingReservation(
            @Param("vehicleId") UUID vehicleId,
            @Param("newStartDate") OffsetDateTime newStartDate,
            @Param("newEndDate") OffsetDateTime newEndDate
    );

    /**
     * Récupère toutes les réservations d'un client spécifique (customerId),
     * triées par date de début (StartDate) décroissante pour afficher le plus récent en premier.
     *
     * @param customerId L'ID du client.
     * @return La liste des réservations associées au client.
     */
    List<Reservation> findByCustomerIdOrderByStartDateDesc(UUID customerId);

    // ---------------------------------------------------------------------------------
    // MÉTHODE POUR VÉRIFIER LES RÉSERVATIONS ACTIVES
    // ---------------------------------------------------------------------------------

    /**
     * Vérifie l'existence de réservations actives pour un utilisateur donné (customerId).
     * Les statuts actifs sont 'CONFIRMED', 'PENDING', 'IN_PROGRESS'.
     *
     * @param customerId L'ID du client (utilisateur).
     * @return true si au moins une réservation active existe.
     */
    @Query("""
        SELECT CASE WHEN COUNT(r) > 0 THEN TRUE ELSE FALSE END 
        FROM Reservation r 
        WHERE r.customer.id = :customerId 
        AND r.status IN ('PENDING', 'CONFIRMED', 'IN_PROGRESS') 
    """)
    boolean existsActiveByUserId(@Param("customerId") UUID customerId);

    // ---------------------------------------------------------------------------------
    // NOUVELLE MÉTHODE POUR BLOQUER LA SUPPRESSION DU COMPTE (Vérifie l'historique complet)
    // ---------------------------------------------------------------------------------

    /**
     * Vérifie l'existence de TOUTES les réservations (actives ou historiques)
     * pour un client donné (customerId).
     * @param customerId L'ID du client (utilisateur).
     * @return true si au moins une réservation existe.
     */
    boolean existsByCustomerId(UUID customerId);
}