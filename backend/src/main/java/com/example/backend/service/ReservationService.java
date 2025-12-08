package com.example.backend.service;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

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
    private final ChatService chatService;
    private final NotificationService notificationService; // <--- INJECTION DU SERVICE DE NOTIFICATION

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
        long days = Duration.between(request.getStartDate(), request.getEndDate()).toDays();

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

        // Statut initial de la réservation.
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
        vehicle.setStatus("reserve");

        // 6. SAUVEGARDER LA RÉSERVATION
        Reservation savedReservation = reservationRepository.save(reservation);

        // 7. DÉCLENCHEMENT DE LA NOTIFICATION 🚀
        // Envoi l'email de confirmation au client et la notification à l'ALP.
        notificationService.sendReservationConfirmation(savedReservation);

        // 8. CRÉER LE CANAL DE DISCUSSION ASSOCIÉ À LA RÉSERVATION
        try {
            chatService.createChannelForReservation(savedReservation);
        } catch (Exception e) {
            System.err.println("ERREUR LORS DE LA CRÉATION DU CANAL DE CHAT: " + e.getMessage());
            throw e;
        }

        return savedReservation;
    }

    /**
     * NOUVEAU: Récupère l'historique des réservations d'un client spécifique, trié par date.
     * C'est la méthode manquante qui causait l'erreur de compilation.
     * @param customerId L'ID du client.
     * @return La liste des réservations converties en DTOs.
     */
    @Transactional(readOnly = true)
    public List<ReservationResponse> getCustomerHistory(UUID customerId) {
        // 1. Vérifier si le client existe (bonne pratique)
        if (!customerRepository.existsById(customerId)) {
            throw new EntityNotFoundException("Customer not found with ID: " + customerId);
        }

        // 2. Récupérer toutes les réservations du client, triées par date (nécessite une méthode dans le Repository)
        // Assurez-vous que ReservationRepository contient bien une méthode comme :
        // List<Reservation> findByCustomerIdOrderByStartDateDesc(UUID customerId);
        List<Reservation> reservations = reservationRepository.findByCustomerIdOrderByStartDateDesc(customerId);

        // 3. Convertir la liste d'entités en liste de DTOs de réponse
        return reservations.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }


    /**
     * Convertit l'entité Reservation en DTO de réponse.
     */
    public ReservationResponse toResponse(Reservation reservation) {
        ReservationResponse response = new ReservationResponse();
        response.setId(reservation.getId());
        response.setVehicleId(reservation.getVehicle().getId());

        // Ajout des détails du véhicule pour l'historique (nécessite la mise à jour du DTO ReservationResponse)
        response.setVehicleBrand(reservation.getVehicle().getBrand());
        response.setVehicleModel(reservation.getVehicle().getModel());

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