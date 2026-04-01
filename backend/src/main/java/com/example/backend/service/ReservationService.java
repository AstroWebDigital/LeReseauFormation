package com.example.backend.service;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import com.example.backend.dto.ReservationRequest;
import com.example.backend.dto.ReservationResponse;
import com.example.backend.entity.Reservation;
import com.example.backend.entity.User;
import com.example.backend.entity.Vehicle;
import com.example.backend.repository.ReservationRepository;
import com.example.backend.repository.UserRepository;
import com.example.backend.repository.VehicleRepository;
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
    private final UserRepository userRepository;          // ← CustomerRepository → UserRepository
    private final ChatService chatService;
    private final NotificationService notificationService;

    @Transactional
    public Reservation createReservation(ReservationRequest request, String userEmail) {

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
        reservation.setStatus("accepte");
        reservation.setTotalAmount(totalAmount);
        reservation.setDepositAmount(request.getDepositAmount());
        reservation.setSecurityDeposit(request.getSecurityDeposit());
        reservation.setCreationDate(OffsetDateTime.now());
        reservation.setCreatedAt(OffsetDateTime.now());
        reservation.setUpdatedAt(OffsetDateTime.now());

        vehicle.setStatus("reserve");

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

    public ReservationResponse toResponse(Reservation reservation) {
        ReservationResponse response = new ReservationResponse();
        response.setId(reservation.getId());
        response.setVehicleId(reservation.getVehicle().getId());
        response.setVehicleBrand(reservation.getVehicle().getBrand());
        response.setVehicleModel(reservation.getVehicle().getModel());
        response.setCustomerId(reservation.getUser().getId());  // ← getCustomer → getUser
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