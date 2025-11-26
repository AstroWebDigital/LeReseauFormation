package com.example.backend.service;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.OffsetDateTime;

import com.example.backend.dto.ReservationRequest;
import com.example.backend.dto.ReservationResponse;
import com.example.backend.entity.Customer;
import com.example.backend.entity.Reservation;
import com.example.backend.entity.Vehicle;
import com.example.backend.repository.CustomerRepository;
import com.example.backend.repository.ReservationRepository;
import com.example.backend.repository.VehicleRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

/**
 * Service pour la gestion des réservations, incluant la validation des conflits
 * et la mise à jour du statut du véhicule.
 */
@Service
@RequiredArgsConstructor
public class ReservationService {

    private final ReservationRepository reservationRepository;
    private final VehicleRepository vehicleRepository;
    private final CustomerRepository customerRepository;

    @Transactional
    public Reservation createReservation(ReservationRequest request) {

        // 1. Récupérer les entités liées
        Vehicle vehicle = vehicleRepository.findById(request.getVehicleId())
                .orElseThrow(() -> new EntityNotFoundException("Vehicle not found with ID: " + request.getVehicleId()));
        Customer customer = customerRepository.findById(request.getCustomerId())
                .orElseThrow(() -> new EntityNotFoundException("Customer not found with ID: " + request.getCustomerId()));

        // 2. Validation de base des dates
        if (request.getStartDate().isAfter(request.getEndDate()) || request.getStartDate().isEqual(request.getEndDate())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "La date de fin doit être strictement après la date de début.");
        }

        // VÉRIFICATION DE CONFLIT : Utilise la requête JPQL pour trouver une réservation qui se chevauche
        reservationRepository.findConflictingReservation(
                request.getVehicleId(),
                request.getStartDate(),
                request.getEndDate()
        ).ifPresent(conflict -> {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Le véhicule est déjà réservé pendant cette période (du " + conflict.getStartDate() + " au " + conflict.getEndDate() + ").");
        });


        // 3. Calcul du montant TOTAL
        BigDecimal dailyRate = vehicle.getBaseDailyPrice();
        // Calcule le nombre de jours entiers (ou 1 si la durée est inférieure à 24h mais positive)
        long days = Duration.between(request.getStartDate(), request.getEndDate()).toDays();

        // Assure que la durée est d'au moins 1 jour si la date de début est avant la date de fin
        if (days <= 0 && request.getStartDate().isBefore(request.getEndDate())) {
            days = 1;
        } else if (days <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "La réservation doit durer au moins une période significative.");
        }

        BigDecimal totalAmount = dailyRate.multiply(BigDecimal.valueOf(days));


        // 4. Créer la réservation
        Reservation reservation = new Reservation();
        reservation.setVehicle(vehicle);
        reservation.setCustomer(customer);
        reservation.setStartDate(request.getStartDate());
        reservation.setEndDate(request.getEndDate());
        reservation.setPickupLocation(request.getPickupLocation());
        reservation.setReturnLocation(request.getReturnLocation());

        // CORRECTION FINALE : Utilisation de PENDING en majuscules pour correspondre à l'Enum
        reservation.setStatus("accepte");

        // Définition des montants
        reservation.setTotalAmount(totalAmount);
        reservation.setDepositAmount(request.getDepositAmount());
        reservation.setSecurityDeposit(request.getSecurityDeposit());

        // Définition des dates de création/modification
        reservation.setCreationDate(OffsetDateTime.now());
        reservation.setCreatedAt(OffsetDateTime.now());
        reservation.setUpdatedAt(OffsetDateTime.now());


        // 5. METTRE À JOUR LE STATUT DU VÉHICULE
        vehicle.setStatus("reserve"); // Ce statut n'est pas lié à l'Enum ReservationStatus

        return reservationRepository.save(reservation);
    }

    /**
     * Convertit l'entité Reservation en DTO de réponse.
     */
    public ReservationResponse toResponse(Reservation reservation) {
        ReservationResponse response = new ReservationResponse();
        response.setId(reservation.getId());
        response.setVehicleId(reservation.getVehicle().getId());
        response.setCustomerId(reservation.getCustomer().getId());
        response.setStartDate(reservation.getStartDate());
        response.setEndDate(reservation.getEndDate());
        response.setPickupLocation(reservation.getPickupLocation());
        response.setReturnLocation(reservation.getReturnLocation());
        response.setStatus(reservation.getStatus());
        response.setTotalAmount(reservation.getTotalAmount());
        response.setDepositAmount(reservation.getDepositAmount());
        response.setSecurityDeposit(reservation.getSecurityDeposit());
        response.setCreatedAt(reservation.getCreatedAt());
        response.setUpdatedAt(reservation.getUpdatedAt());
        return response;
    }
}