package com.example.backend.service;

import com.example.backend.entity.ChatChannel;
import com.example.backend.entity.Message;
import com.example.backend.entity.Reservation;
import com.example.backend.entity.User;
import com.example.backend.repository.ChatChannelRepository;
import com.example.backend.repository.MessageRepository;
import com.example.backend.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

@Service
public class MessageService {

    private final MessageRepository messageRepository;
    private final ChatChannelRepository chatChannelRepository;
    private final UserRepository userRepository;

    public MessageService(MessageRepository messageRepository,
                          ChatChannelRepository chatChannelRepository,
                          UserRepository userRepository) {
        this.messageRepository = messageRepository;
        this.chatChannelRepository = chatChannelRepository;
        this.userRepository = userRepository;
    }

    public List<Message> getMessagesByChannel(UUID channelId) {
        ChatChannel channel = chatChannelRepository.findById(channelId)
                .orElseThrow(() -> new RuntimeException("Channel introuvable: " + channelId));

        return messageRepository.findByReservationOrderBySentAtAsc(channel.getReservation());
    }

    public void markAsRead(UUID channelId, UUID currentUserId) {
        messageRepository.markChannelMessagesAsRead(channelId, currentUserId);
    }

    public void sendWelcomeMessage(Reservation reservation, UUID channelId, String publicBaseUrl) {
        User renter = reservation.getUser();
        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm", Locale.FRENCH);
        String start = reservation.getStartDate() != null ? reservation.getStartDate().format(fmt) : "—";
        String end   = reservation.getEndDate()   != null ? reservation.getEndDate().format(fmt)   : "—";

        String base = publicBaseUrl != null ? publicBaseUrl.replaceAll("/+$", "") : "";
        String front = renter.getLicensePhotoFront() != null
                ? base + (renter.getLicensePhotoFront().startsWith("/") ? renter.getLicensePhotoFront() : "/" + renter.getLicensePhotoFront())
                : null;
        String back  = renter.getLicensePhotoBack() != null
                ? base + (renter.getLicensePhotoBack().startsWith("/") ? renter.getLicensePhotoBack() : "/" + renter.getLicensePhotoBack())
                : null;

        StringBuilder sb = new StringBuilder();
        sb.append("Recapitulatif de la demande de reservation\n");
        sb.append("---\n");
        sb.append("Vehicule : ").append(reservation.getVehicle().getBrand()).append(" ").append(reservation.getVehicle().getModel()).append("\n");
        sb.append("Du : ").append(start).append(" au ").append(end).append("\n");
        if (reservation.getPickupLocation() != null)
            sb.append("Prise en charge : ").append(reservation.getPickupLocation()).append("\n");
        if (reservation.getReturnLocation() != null)
            sb.append("Retour : ").append(reservation.getReturnLocation()).append("\n");
        if (reservation.getTotalAmount() != null)
            sb.append("Montant : ").append(reservation.getTotalAmount()).append(" EUR\n");
        sb.append("---\n");
        sb.append("Permis de conduire\n");
        if (renter.getLicenseNumber() != null)
            sb.append("N : ").append(renter.getLicenseNumber()).append("\n");
        if (front != null) sb.append("Recto : [IMAGE](").append(front).append(")\n");
        if (back  != null) sb.append("Verso : [IMAGE](").append(back).append(")\n");

        sendMessage(channelId, renter.getId(), sb.toString().trim());
    }

    public Message sendMessage(UUID channelId, UUID senderUserId, String content) {
        ChatChannel channel = chatChannelRepository.findById(channelId)
                .orElseThrow(() -> new RuntimeException("Channel introuvable: " + channelId));

        User sender = userRepository.findById(senderUserId)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable: " + senderUserId));

        Message message = new Message();
        message.setContent(content);
        message.setSenderUser(sender);
        message.setReservation(channel.getReservation());
        message.setSentAt(OffsetDateTime.now());
        message.setCreatedAt(OffsetDateTime.now());
        message.setIsRead(false);
        message.setHasMentions(false);

        return messageRepository.save(message);
    }
}