package com.example.backend.service;

import java.time.OffsetDateTime;
import com.example.backend.dto.ReservationRequest;
import com.example.backend.dto.ReservationResponse;
import com.example.backend.entity.Customer;
import com.example.backend.entity.Reservation;
import com.example.backend.entity.Vehicle;
import com.example.backend.repository.CustomerRepository;
import com.example.backend.repository.ReservationRepository;
import com.example.backend.repository.VehicleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ReservationService {

    private final ReservationRepository reservationRepository;
    private final VehicleRepository vehicleRepository;
    private final CustomerRepository customerRepository;

    public Reservation createReservation(ReservationRequest request) {
        // Vérifie le status pour éviter violation de la contrainte PostgreSQL

        // Récupérer les entités liées
        Vehicle vehicle = vehicleRepository.findById(request.getVehicleId())
                .orElseThrow(() -> new RuntimeException("Vehicle not found"));
        Customer customer = customerRepository.findById(request.getCustomerId())
                .orElseThrow(() -> new RuntimeException("Customer not found"));

        // Créer la réservation
        Reservation reservation = new Reservation();
        reservation.setVehicle(vehicle);
        reservation.setCustomer(customer);
        reservation.setStartDate(request.getStartDate());
        reservation.setEndDate(request.getEndDate());
        reservation.setPickupLocation(request.getPickupLocation());
        reservation.setReturnLocation(request.getReturnLocation());
        reservation.setStatus(request.getStatus());
        reservation.setTotalAmount(request.getTotalAmount());
        reservation.setDepositAmount(request.getDepositAmount());
        reservation.setSecurityDeposit(request.getSecurityDeposit());
        reservation.setCreatedAt(OffsetDateTime.now());
        reservation.setUpdatedAt(OffsetDateTime.now());

        return reservationRepository.save(reservation);
    }

    // Transformation Reservation -> ReservationResponse
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
