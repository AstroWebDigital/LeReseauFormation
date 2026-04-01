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
        List<ReservationResponse> history = reservationService.getMyReservations(auth.getName());
        return ResponseEntity.ok(history);
    }

    @GetMapping("/history/{customerId}")
    public ResponseEntity<List<ReservationResponse>> getCustomerHistory(@PathVariable UUID customerId) {
        List<ReservationResponse> history = reservationService.getCustomerHistory(customerId);
        return ResponseEntity.ok(history);
    }
}