package com.example.backend.service;

import com.example.backend.entity.Notification;
import com.example.backend.entity.Reservation;
import com.example.backend.entity.User;
import com.example.backend.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;
import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final EmailService emailService;
    private final NotificationRepository notificationRepository;

    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("dd/MM/yyyy");

    public void sendReservationConfirmation(Reservation reservation) {
        sendConfirmationToCustomer(reservation);
        User ownerUser = determineResponsibleAlp(reservation);
        if (ownerUser != null) {
            sendNotificationToAlp(ownerUser, reservation);
        }
    }

    // ─── Vehicle notifications ────────────────────────────────────────────────

    public void sendVehicleApprovedNotification(User owner, String brand, String model, String plateNumber) {
        String contenu = "Votre véhicule " + brand + " " + model + " (" + plateNumber + ") a été approuvé et est maintenant disponible à la location.";
        saveNotif(owner, "VEHICULE", contenu);
    }

    public void sendVehicleRejectedNotification(User owner, String brand, String model, String plateNumber, String reason) {
        String contenu = "Votre véhicule " + brand + " " + model + " (" + plateNumber + ") a été refusé."
                + (reason != null && !reason.isBlank() ? " Motif : " + reason : "");
        saveNotif(owner, "VEHICULE", contenu);
    }

    // ─── Document notifications ───────────────────────────────────────────────

    public void sendDocumentApprovedNotification(User owner, String docType, String scope) {
        String contenu = "Votre document « " + docType + " » (" + scope + ") a été validé.";
        saveNotif(owner, "DOCUMENT", contenu);
    }

    public void sendDocumentRejectedNotification(User owner, String docType, String scope, String reason) {
        String contenu = "Votre document « " + docType + " » (" + scope + ") a été refusé."
                + (reason != null && !reason.isBlank() ? " Motif : " + reason : "");
        saveNotif(owner, "DOCUMENT", contenu);
    }

    // ─── Reservation approved notification ───────────────────────────────────

    public void sendReservationApprovedNotification(Reservation reservation) {
        User customer = reservation.getUser();
        String vehicleName = reservation.getVehicle().getBrand() + " " + reservation.getVehicle().getModel();
        String startDate = reservation.getStartDate().format(DATE_FMT);
        String endDate   = reservation.getEndDate().format(DATE_FMT);
        String contenu = "Votre réservation pour " + vehicleName + " du " + startDate + " au " + endDate + " a été confirmée.";
        saveNotif(customer, "RESERVATION", contenu);
    }

    // ─── Reservation rejected ─────────────────────────────────────────────────

    public void sendReservationRejectedNotification(Reservation reservation, String reason) {
        User customer = reservation.getUser();
        String vehicleName = reservation.getVehicle().getBrand() + " " + reservation.getVehicle().getModel();
        String startDate = reservation.getStartDate().format(DATE_FMT);
        String endDate   = reservation.getEndDate().format(DATE_FMT);

        String contenu = "Votre demande de réservation pour " + vehicleName
                + " du " + startDate + " au " + endDate + " a été refusée."
                + (reason != null && !reason.isBlank() ? " Motif : " + reason : "");

        // Notification en base
        Notification notif = new Notification();
        notif.setUser(customer);
        notif.setType("RESERVATION");
        notif.setContenu(contenu);
        notif.setCanaux("PUSH");
        notif.setSendAt(OffsetDateTime.now());
        notif.setIsRead(false);
        notificationRepository.save(notif);

        // Email
        try {
            emailService.sendReservationRejectedEmail(customer, vehicleName, startDate, endDate, reason);
        } catch (Exception e) {
            System.err.println("Erreur email refus réservation : " + e.getMessage());
        }
    }

    private void sendConfirmationToCustomer(Reservation reservation) {
        String customerEmail = reservation.getUser().getEmail();
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
        return reservation.getVehicle().getUser();
    }

    private void saveNotif(User user, String type, String contenu) {
        Notification notif = new Notification();
        notif.setUser(user);
        notif.setType(type);
        notif.setContenu(contenu);
        notif.setCanaux("PUSH");
        notif.setSendAt(OffsetDateTime.now());
        notif.setIsRead(false);
        notificationRepository.save(notif);
    }
}
