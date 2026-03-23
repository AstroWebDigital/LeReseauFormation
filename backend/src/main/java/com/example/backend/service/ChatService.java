package com.example.backend.service;

import com.example.backend.entity.ChatChannel;
import com.example.backend.entity.Reservation;
import com.example.backend.entity.User;
import com.example.backend.repository.ChatChannelRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;

@Service
@RequiredArgsConstructor
public class ChatService {

    private final ChatChannelRepository chatChannelRepository;

    @Transactional(propagation = Propagation.MANDATORY)
    public ChatChannel createChannelForReservation(Reservation reservation) {

        User ownerUser = reservation.getVehicle().getUser();  // ← getAlp() → getUser()

        if (ownerUser == null) {
            throw new IllegalStateException("Le véhicule (ID: " + reservation.getVehicle().getId() + ") n'est pas associé à un propriétaire.");
        }

        ChatChannel channel = new ChatChannel();
        channel.setReservation(reservation);
        channel.setRenterUser(reservation.getUser());   // ← setCustomer → setRenterUser
        channel.setOwnerUser(ownerUser);                // ← setAlp → setOwnerUser
        channel.setStatus("ACTIVE");
        channel.setCreatedAt(OffsetDateTime.now());
        channel.setChannelName("Conversation - Réservation #" + reservation.getId().toString().substring(0, 8));

        return chatChannelRepository.save(channel);
    }
}