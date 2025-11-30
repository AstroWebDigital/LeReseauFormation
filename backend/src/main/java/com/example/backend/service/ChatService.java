package com.example.backend.service;

import com.example.backend.entity.Alp;
import com.example.backend.entity.ChatChannel;
import com.example.backend.entity.Reservation;
import com.example.backend.repository.AlpRepository;
import com.example.backend.repository.ChatChannelRepository;
import com.example.backend.repository.CustomerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;

@Service
@RequiredArgsConstructor
public class ChatService {

    private final ChatChannelRepository chatChannelRepository;
    private final AlpRepository alpRepository;
    private final CustomerRepository customerRepository;

    @Transactional(propagation = Propagation.MANDATORY)
    public ChatChannel createChannelForReservation(Reservation reservation) {

        // 1. Récupérer l'ALP associé au véhicule
        // Nous savons que l'ALP est maintenant chargé grâce au FetchType.EAGER dans Vehicle.java
        Alp alp = reservation.getVehicle().getAlp();

        // Vérification de l'ALP
        if (alp == null) {
            // Cette exception sera capturée dans ReservationService et annulera la transaction
            throw new IllegalStateException("Le véhicule (ID: " + reservation.getVehicle().getId() + ") n'est pas associé à un ALP. Impossible de créer le canal de chat.");
        }

        // 2. Créer le canal de discussion
        ChatChannel channel = new ChatChannel();
        channel.setReservation(reservation);
        channel.setCustomer(reservation.getCustomer());
        channel.setAlp(alp);
        channel.setCreatedAt(OffsetDateTime.now());

        // CORRECTION CRITIQUE: Définir la valeur du statut, car la colonne est NOT NULL.
        channel.setStatus("ACTIVE");

        channel.setChannelName("Conversation - Réservation #" + reservation.getId().toString().substring(0, 8));

        ChatChannel savedChannel = chatChannelRepository.save(channel);

        return savedChannel;
    }
}