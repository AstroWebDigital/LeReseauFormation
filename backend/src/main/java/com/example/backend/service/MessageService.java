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
import java.util.List;
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