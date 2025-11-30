package com.example.backend.controller;

import com.example.backend.dto.ReservationRequest;
import com.example.backend.dto.ReservationResponse;
import com.example.backend.entity.Reservation; // Nécessaire pour l'ancienne version de createReservation
import com.example.backend.service.ReservationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List; // Nécessaire pour getCustomerHistory
import java.util.UUID; // Nécessaire pour getCustomerHistory

@RestController
@RequestMapping("/api/reservations")
@RequiredArgsConstructor
public class ReservationController {

    private final ReservationService reservationService;

    /**
     * Endpoint pour créer une nouvelle réservation.
     * Utilise le statut 200 OK en cas de succès et 400 Bad Request en cas d'erreur (gestion via try-catch).
     */
    @PostMapping
    public ResponseEntity<?> createReservation(@RequestBody ReservationRequest request) {
        try {
            Reservation reservation = reservationService.createReservation(request);
            ReservationResponse response = reservationService.toResponse(reservation);
            // Retourne le statut 200 OK
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            // Retourne le statut 400 Bad Request avec le message d'erreur
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * Endpoint pour récupérer l'historique des réservations d'un client.
     * URL: GET /api/reservations/history/{customerId}
     * @param customerId L'ID du client dont on veut l'historique.
     * @return Une liste des réservations du client (peut être vide).
     */
    @GetMapping("/history/{customerId}")
    public ResponseEntity<List<ReservationResponse>> getCustomerHistory(@PathVariable UUID customerId) {
        List<ReservationResponse> history = reservationService.getCustomerHistory(customerId);

        // Retourne la liste (vide ou remplie) avec un statut 200 OK.
        // Côté frontend, si la liste est vide, on affichera "Aucune réservation".
        return ResponseEntity.ok(history);
    }
}