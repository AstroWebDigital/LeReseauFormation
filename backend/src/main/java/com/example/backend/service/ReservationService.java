package com.example.backend.service;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import com.example.backend.dto.ReservationRequest;
import com.example.backend.dto.ReservationResponse;
import com.example.backend.entity.Reservation;
import com.example.backend.entity.User;
import com.example.backend.entity.Vehicle;
import com.example.backend.entity.VehicleAvailability;
import com.example.backend.repository.ReservationRepository;
import com.example.backend.repository.UserRepository;
import com.example.backend.repository.VehicleAvailabilityRepository;
import com.example.backend.repository.VehicleRepository;
import com.stripe.exception.StripeException;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class ReservationService {

    private final ReservationRepository reservationRepository;
    private final VehicleRepository vehicleRepository;
    private final UserRepository userRepository;
    private final VehicleAvailabilityRepository vehicleAvailabilityRepository;
    private final ChatService chatService;
    private final NotificationService notificationService;
    private final StripePaymentService stripePaymentService;
    private final EmailService emailService;

    @Transactional
    public Reservation createReservation(ReservationRequest request, String userEmail) {

        // Vérifie que le paiement Stripe a bien été effectué
        if (request.getPaymentIntentId() != null && !request.getPaymentIntentId().isBlank()) {
            try {
                boolean paid = stripePaymentService.isPaymentSucceeded(request.getPaymentIntentId());
                if (!paid) {
                    throw new ResponseStatusException(HttpStatus.PAYMENT_REQUIRED, "Le paiement n'a pas été validé.");
                }
            } catch (StripeException e) {
                throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Erreur de vérification du paiement : " + e.getMessage());
            }
        } else {
            throw new ResponseStatusException(HttpStatus.PAYMENT_REQUIRED, "Un paiement est requis pour confirmer la réservation.");
        }

        Vehicle vehicle = vehicleRepository.findById(request.getVehicleId())
                .orElseThrow(() -> new EntityNotFoundException("Vehicle not found with ID: " + request.getVehicleId()));

        User user = userRepository.findByEmail(userEmail)   // ← JWT email
                .orElseThrow(() -> new EntityNotFoundException("User not found: " + userEmail));

        if (request.getStartDate().isAfter(request.getEndDate()) || request.getStartDate().isEqual(request.getEndDate())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "La date de fin doit être strictement après la date de début.");
        }

        reservationRepository.findConflictingReservation(
                request.getVehicleId(),
                request.getStartDate(),
                request.getEndDate()
        ).ifPresent(conflict -> {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Le véhicule est déjà réservé pendant cette période.");
        });

        // Vérifie que les dates demandées sont couvertes par l'union des plages de disponibilité
        // (les slots consécutifs ou chevauchants sont traités comme une seule plage continue)
        List<VehicleAvailability> availabilities =
                vehicleAvailabilityRepository.findByVehicleIdOrderByStartDateAsc(vehicle.getId());
        if (!availabilities.isEmpty()) {
            LocalDate reqStart = request.getStartDate().toLocalDate();
            LocalDate reqEnd   = request.getEndDate().toLocalDate();
            if (!isCoveredByUnion(reqStart, reqEnd, availabilities)) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "Les dates sélectionnées ne correspondent pas aux disponibilités du véhicule.");
            }
        }

        BigDecimal dailyRate = vehicle.getBaseDailyPrice();
        long days = Duration.between(request.getStartDate(), request.getEndDate()).toDays();
        if (days <= 0 && request.getStartDate().isBefore(request.getEndDate())) {
            days = 1;
        } else if (days <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "La réservation doit durer au moins une période significative.");
        }
        BigDecimal totalAmount = dailyRate.multiply(BigDecimal.valueOf(days));

        Reservation reservation = new Reservation();
        reservation.setVehicle(vehicle);
        reservation.setUser(user);                        // ← setCustomer → setUser
        reservation.setStartDate(request.getStartDate());
        reservation.setEndDate(request.getEndDate());
        reservation.setPickupLocation(request.getPickupLocation());
        reservation.setReturnLocation(request.getReturnLocation());
        reservation.setStatus("en_attente");
        reservation.setTotalAmount(totalAmount);
        reservation.setDepositAmount(request.getDepositAmount());
        reservation.setSecurityDeposit(request.getSecurityDeposit());
        reservation.setCreationDate(OffsetDateTime.now());
        reservation.setCreatedAt(OffsetDateTime.now());
        reservation.setUpdatedAt(OffsetDateTime.now());

        // Le véhicule reste disponible jusqu'à l'approbation du loueur
        Reservation savedReservation = reservationRepository.save(reservation);
        notificationService.sendReservationConfirmation(savedReservation);

        try {
            chatService.createChannelForReservation(savedReservation);
        } catch (Exception e) {
            System.err.println("ERREUR LORS DE LA CRÉATION DU CANAL DE CHAT: " + e.getMessage());
        }

        return savedReservation;
    }

    @Transactional(readOnly = true)
    public List<ReservationResponse> getMyReservations(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new EntityNotFoundException("User not found: " + userEmail));
        return reservationRepository.findByUserIdOrderByStartDateDesc(user.getId())
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ReservationResponse> getCustomerHistory(UUID userId) {
        if (!userRepository.existsById(userId)) {
            throw new EntityNotFoundException("User not found with ID: " + userId);
        }
        List<Reservation> reservations = reservationRepository.findByUserIdOrderByStartDateDesc(userId); // ← findByCustomerId → findByUserId
        return reservations.stream().map(this::toResponse).collect(Collectors.toList());
    }

    /**
     * Vérifie que [reqStart, reqEnd] est entièrement couvert par l'union des slots.
     * Les slots consécutifs (fin J / début J+1) et chevauchants sont fusionnés à la volée.
     * Les slots doivent être triés par startDate croissant (garantit le repository).
     */
    private boolean isCoveredByUnion(LocalDate reqStart, LocalDate reqEnd, List<VehicleAvailability> sortedSlots) {
        LocalDate coverageEnd = null;
        for (VehicleAvailability slot : sortedSlots) {
            if (slot.getEndDate().isBefore(reqStart)) continue; // slot avant le range
            if (coverageEnd == null) {
                if (slot.getStartDate().isAfter(reqStart)) return false; // trou au début
                coverageEnd = slot.getEndDate();
            } else {
                // Le slot suivant doit démarrer au plus le lendemain de la couverture actuelle
                if (slot.getStartDate().isAfter(coverageEnd.plusDays(1))) return false; // trou
                if (slot.getEndDate().isAfter(coverageEnd)) coverageEnd = slot.getEndDate();
            }
            if (!coverageEnd.isBefore(reqEnd)) return true; // pleinement couvert
        }
        return coverageEnd != null && !coverageEnd.isBefore(reqEnd);
    }

    @Transactional(readOnly = true)
    public List<ReservationResponse> getOwnerReservations(String ownerEmail) {
        User owner = userRepository.findByEmail(ownerEmail)
                .orElseThrow(() -> new EntityNotFoundException("User not found: " + ownerEmail));
        return reservationRepository.findByVehicleUserIdOrderByCreatedAtDesc(owner.getId())
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional
    public ReservationResponse approveReservation(UUID reservationId, String ownerEmail) {
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Réservation introuvable."));

        if (!reservation.getVehicle().getUser().getEmail().equals(ownerEmail)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Vous n'êtes pas propriétaire de ce véhicule.");
        }
        if (!"en_attente".equals(reservation.getStatus())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cette réservation ne peut plus être approuvée.");
        }

        reservation.setStatus("accepte");
        reservation.setUpdatedAt(OffsetDateTime.now());
        reservation.getVehicle().setStatus("reserve");

        // Refuser automatiquement les autres demandes en conflit
        List<Reservation> conflicts = reservationRepository.findConflictingPending(
                reservation.getVehicle().getId(),
                reservationId,
                reservation.getStartDate(),
                reservation.getEndDate()
        );
        for (Reservation conflict : conflicts) {
            conflict.setStatus("refuse");
            conflict.setUpdatedAt(OffsetDateTime.now());
            reservationRepository.save(conflict);
        }

        Reservation saved = reservationRepository.save(reservation);
        try { emailService.sendReservationApprovedEmail(saved); } catch (Exception e) {
            System.err.println("Email réservation approuvée : " + e.getMessage());
        }
        try { notificationService.sendReservationApprovedNotification(saved); } catch (Exception e) {
            System.err.println("Notif réservation approuvée : " + e.getMessage());
        }
        return toResponse(saved);
    }

    @Transactional
    public ReservationResponse rejectReservation(UUID reservationId, String ownerEmail, String reason) {
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Réservation introuvable."));

        if (!reservation.getVehicle().getUser().getEmail().equals(ownerEmail)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Vous n'êtes pas propriétaire de ce véhicule.");
        }
        if (!"en_attente".equals(reservation.getStatus())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cette réservation ne peut plus être refusée.");
        }

        reservation.setStatus("refuse");
        reservation.setRejectionReason(reason);
        reservation.setUpdatedAt(OffsetDateTime.now());
        Reservation saved = reservationRepository.save(reservation);
        notificationService.sendReservationRejectedNotification(saved, reason);
        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<ReservationResponse> getAllPendingReservations() {
        return reservationRepository.findAllByStatusOrderByCreatedAtDesc("en_attente")
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional
    public ReservationResponse adminApproveReservation(UUID reservationId) {
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Réservation introuvable."));
        if (!"en_attente".equals(reservation.getStatus())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cette réservation ne peut plus être approuvée.");
        }
        reservation.setStatus("accepte");
        reservation.setUpdatedAt(OffsetDateTime.now());
        reservation.getVehicle().setStatus("reserve");

        List<Reservation> conflicts = reservationRepository.findConflictingPending(
                reservation.getVehicle().getId(), reservationId,
                reservation.getStartDate(), reservation.getEndDate());
        for (Reservation conflict : conflicts) {
            conflict.setStatus("refuse");
            conflict.setUpdatedAt(OffsetDateTime.now());
            reservationRepository.save(conflict);
        }
        Reservation saved = reservationRepository.save(reservation);
        try { emailService.sendReservationApprovedEmail(saved); } catch (Exception e) {
            System.err.println("Email admin réservation approuvée : " + e.getMessage());
        }
        try { notificationService.sendReservationApprovedNotification(saved); } catch (Exception e) {
            System.err.println("Notif admin réservation approuvée : " + e.getMessage());
        }
        return toResponse(saved);
    }

    @Transactional
    public ReservationResponse adminRejectReservation(UUID reservationId, String reason) {
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Réservation introuvable."));
        if (!"en_attente".equals(reservation.getStatus())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cette réservation ne peut plus être refusée.");
        }
        reservation.setStatus("refuse");
        reservation.setRejectionReason(reason);
        reservation.setUpdatedAt(OffsetDateTime.now());
        Reservation saved = reservationRepository.save(reservation);
        notificationService.sendReservationRejectedNotification(saved, reason);
        return toResponse(saved);
    }

    public ReservationResponse toResponse(Reservation reservation) {
        ReservationResponse response = new ReservationResponse();
        response.setId(reservation.getId());
        response.setVehicleId(reservation.getVehicle().getId());
        response.setVehicleBrand(reservation.getVehicle().getBrand());
        response.setVehicleModel(reservation.getVehicle().getModel());
        response.setCustomerId(reservation.getUser().getId());
        response.setCustomerName((reservation.getUser().getFirstname() != null ? reservation.getUser().getFirstname() : "")
                + " " + (reservation.getUser().getLastname() != null ? reservation.getUser().getLastname() : "").trim());
        response.setCustomerEmail(reservation.getUser().getEmail());
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
        response.setRejectionReason(reservation.getRejectionReason());
        return response;
    }
}