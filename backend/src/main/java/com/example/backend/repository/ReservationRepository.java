package com.example.backend.repository;

import com.example.backend.entity.Reservation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.OffsetDateTime;
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
}