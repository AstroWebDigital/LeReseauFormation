package com.example.backend.controller;

import com.example.backend.dto.ReservationRequest;
import com.example.backend.dto.ReservationResponse;
import com.example.backend.entity.Reservation;
import com.example.backend.service.ReservationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;
import org.springframework.security.core.Authentication;

@RestController
@RequestMapping("/api/reservations")
@RequiredArgsConstructor
public class ReservationController {

    private final ReservationService reservationService;

    @PostMapping
    public ResponseEntity<?> createReservation(
            @RequestBody ReservationRequest request,
            @AuthenticationPrincipal UserDetails userDetails  // ← email via JWT
    ) {
        try {
            Reservation reservation = reservationService.createReservation(request, userDetails.getUsername());
            return ResponseEntity.ok(reservationService.toResponse(reservation));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/my")
    public ResponseEntity<List<ReservationResponse>> getMyReservations(Authentication auth) {
        return ResponseEntity.ok(reservationService.getMyReservations(auth.getName()));
    }

    /** Toutes les réservations sur les véhicules du loueur connecté */
    @GetMapping("/owner")
    public ResponseEntity<List<ReservationResponse>> getOwnerReservations(Authentication auth) {
        return ResponseEntity.ok(reservationService.getOwnerReservations(auth.getName()));
    }

    /** Approuver une demande de réservation */
    @PutMapping("/{id}/approve")
    public ResponseEntity<?> approveReservation(@PathVariable UUID id, Authentication auth) {
        try {
            return ResponseEntity.ok(reservationService.approveReservation(id, auth.getName()));
        } catch (ResponseStatusException e) {
            return ResponseEntity.status(e.getStatusCode()).body(e.getReason());
        }
    }

    /** Refuser une demande de réservation */
    @PutMapping("/{id}/reject")
    public ResponseEntity<?> rejectReservation(@PathVariable UUID id, Authentication auth,
            @RequestBody(required = false) java.util.Map<String, String> body) {
        try {
            String reason = body != null ? body.get("reason") : null;
            return ResponseEntity.ok(reservationService.rejectReservation(id, auth.getName(), reason));
        } catch (ResponseStatusException e) {
            return ResponseEntity.status(e.getStatusCode()).body(e.getReason());
        }
    }

    @GetMapping("/history/{customerId}")
    public ResponseEntity<List<ReservationResponse>> getCustomerHistory(@PathVariable UUID customerId) {
        return ResponseEntity.ok(reservationService.getCustomerHistory(customerId));
    }
}