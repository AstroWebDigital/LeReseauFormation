package com.example.backend.service;

import com.example.backend.entity.Reservation;
import com.example.backend.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.UUID;
// import com.example.backend.repository.AlpRepository; // Décommentez si vous en avez besoin pour la logique métier

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final EmailService emailService;
    // private final AlpRepository alpRepository; // Décommentez si vous en avez besoin pour la logique métier

    /**
     * Déclenche les notifications (email) suite à la confirmation d'une réservation.
     * @param reservation L'entité Reservation confirmée.
     */
    public void sendReservationConfirmation(Reservation reservation) {

        // 1. Notification pour le CUSTOMER (Envoi de la confirmation)
        sendConfirmationToCustomer(reservation);

        // 2. Notification pour l'ALP (Agent Logistique Polyvalent)
        // Cette étape nécessite de déterminer quel ALP est responsable.
        User alpUser = determineResponsibleAlp(reservation);
        if (alpUser != null) {
            sendNotificationToAlp(alpUser, reservation);
        }
    }

    // --- Méthode d'envoi au Customer ---

    private void sendConfirmationToCustomer(Reservation reservation) {
        String customerEmail = reservation.getCustomer().getUser().getEmail();

        if (customerEmail != null && !customerEmail.isEmpty()) {
            try {
                // Utilisation de la méthode spécifique du EmailService
                emailService.sendReservationConfirmationEmail(reservation);
            } catch (Exception e) {
                System.err.println("Erreur lors de l'envoi de l'email de confirmation au client " + customerEmail + " : " + e.getMessage());
            }
        }
    }

    // --- Méthode d'envoi à l'ALP ---

    private void sendNotificationToAlp(User alpUser, Reservation reservation) {
        String alpEmail = alpUser.getEmail();

        if (alpEmail != null && !alpEmail.isEmpty()) {
            try {
                // Utilisation de la méthode spécifique du EmailService
                emailService.sendReservationNotificationToAlpEmail(alpUser, reservation);
            } catch (Exception e) {
                System.err.println("Erreur lors de l'envoi de la notification à l'ALP " + alpEmail + " : " + e.getMessage());
            }
        }
    }

    // --- Logique métier : Déterminer le destinataire ALP ---

    /**
     * Logique métier pour identifier l'ALP responsable de cette réservation.
     * REMPLACEZ CE STUB par votre logique de recherche d'ALP (par secteur, par disponibilité, etc.).
     * @param reservation La réservation.
     * @return L'entité User de l'ALP responsable ou null.
     */
    private User determineResponsibleAlp(Reservation reservation) {

        // 🚨 Exemple de ce que vous devrez faire avec votre AlpRepository :
        /*
        String sector = reservation.getVehicle().getSector();
        return alpRepository.findBySector(sector)
                            .map(Alp::getUser) // Si vous avez le mapping Alp -> User
                            .orElse(null);
        */

        // Actuellement, retourne null pour éviter une erreur si la logique n'est pas encore codée.
        return null;
    }
}