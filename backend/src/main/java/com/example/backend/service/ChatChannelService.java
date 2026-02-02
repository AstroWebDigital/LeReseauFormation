package com.example.backend.service;

import com.example.backend.dto.ChatChannelResponse;
import com.example.backend.entity.ChatChannel;
import com.example.backend.entity.Reservation;
import com.example.backend.entity.User;
import com.example.backend.repository.ChatChannelRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ChatChannelService {

    private final ChatChannelRepository chatChannelRepository;

    // Création d'un canal pour une réservation
    public ChatChannel createChannelForReservation(Reservation reservation) {
        ChatChannel channel = new ChatChannel();
        channel.setReservation(reservation);

        // Stocker directement Customer et Alp (pas besoin de .getUser())
        channel.setCustomer(reservation.getCustomer());
        channel.setAlp(reservation.getVehicle().getAlp());

        channel.setCreatedAt(OffsetDateTime.now());
        channel.setUpdatedAt(OffsetDateTime.now());
        channel.setStatus("ACTIVE");
        channel.setChannelName("Conversation - Réservation #" + reservation.getId().toString().substring(0, 8));

        return chatChannelRepository.save(channel);
    }

    // Récupération des channels pour un utilisateur (customer ou ALP)
    public List<ChatChannelResponse> getChannelsForUser(UUID userId) {
        List<ChatChannel> channels = chatChannelRepository.findByCustomerIdOrAlpId(userId);
        return channels.stream()
                .map(channel -> new ChatChannelResponse(
                        channel.getId(),
                        channel.getCustomer().getUser().getId(), // Récupérer le User ID depuis Customer
                        channel.getAlp().getUser().getId(),       // Récupérer le User ID depuis Alp
                        channel.getChannelName(),
                        channel.getStatus(),
                        channel.getCreatedAt(),
                        channel.getUpdatedAt()
                ))
                .collect(Collectors.toList());
    }
}