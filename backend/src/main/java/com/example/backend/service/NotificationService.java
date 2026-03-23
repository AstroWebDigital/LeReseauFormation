package com.example.backend.service;

import com.example.backend.entity.Reservation;
import com.example.backend.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final EmailService emailService;

    public void sendReservationConfirmation(Reservation reservation) {
        sendConfirmationToCustomer(reservation);
        User ownerUser = determineResponsibleAlp(reservation);
        if (ownerUser != null) {
            sendNotificationToAlp(ownerUser, reservation);
        }
    }

    private void sendConfirmationToCustomer(Reservation reservation) {
        String customerEmail = reservation.getUser().getEmail();  // ← getCustomer().getUser() → getUser()
        if (customerEmail != null && !customerEmail.isEmpty()) {
            try {
                emailService.sendReservationConfirmationEmail(reservation);
            } catch (Exception e) {
                System.err.println("Erreur confirmation client " + customerEmail + " : " + e.getMessage());
            }
        }
    }

    private void sendNotificationToAlp(User ownerUser, Reservation reservation) {
        String ownerEmail = ownerUser.getEmail();
        if (ownerEmail != null && !ownerEmail.isEmpty()) {
            try {
                emailService.sendReservationNotificationToAlpEmail(ownerUser, reservation);
            } catch (Exception e) {
                System.err.println("Erreur notification propriétaire " + ownerEmail + " : " + e.getMessage());
            }
        }
    }

    private User determineResponsibleAlp(Reservation reservation) {
        // Retourne le propriétaire du véhicule directement via User
        return reservation.getVehicle().getUser();  // ← getAlp().getUser() → getUser()
    }
}