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
    List<Reservation> findByVehicleUserId(UUID userId);
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

    List<Reservation> findByUserIdOrderByStartDateDesc(UUID userId);

    @Query("""
        SELECT CASE WHEN COUNT(r) > 0 THEN TRUE ELSE FALSE END 
        FROM Reservation r 
        WHERE r.user.id = :userId 
        AND r.status IN ('PENDING', 'CONFIRMED', 'IN_PROGRESS') 
    """)
    boolean existsActiveByUserId(@Param("userId") UUID userId);

    boolean existsByUserId(UUID userId);
}