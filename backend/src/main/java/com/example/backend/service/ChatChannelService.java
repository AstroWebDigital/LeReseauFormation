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

    public ChatChannel createChannelForReservation(Reservation reservation) {
        ChatChannel channel = new ChatChannel();
        channel.setReservation(reservation);
        channel.setRenterUser(reservation.getUser());               // ← setCustomer → setRenterUser
        channel.setOwnerUser(reservation.getVehicle().getUser());   // ← setAlp → setOwnerUser
        channel.setCreatedAt(OffsetDateTime.now());
        channel.setUpdatedAt(OffsetDateTime.now());
        channel.setStatus("ACTIVE");
        channel.setChannelName("Conversation - Réservation #" + reservation.getId().toString().substring(0, 8));
        return chatChannelRepository.save(channel);
    }

    public List<ChatChannelResponse> getChannelsForUser(UUID userId) {
        List<ChatChannel> channels = chatChannelRepository.findByRenterUserIdOrOwnerUserId(userId); // ← userId, userId → userId
        return channels.stream()
                .map(channel -> new ChatChannelResponse(
                        channel.getId(),
                        channel.getRenterUser().getId(),   // ← getCustomer().getUser()
                        channel.getOwnerUser().getId(),    // ← getAlp().getUser()
                        channel.getChannelName(),
                        channel.getStatus(),
                        channel.getCreatedAt(),
                        channel.getUpdatedAt()
                ))
                .collect(Collectors.toList());
    }
}