package com.example.backend.dto;

import com.example.backend.entity.Message;
import java.time.OffsetDateTime;
import java.util.UUID;

public record MessageResponse(
        UUID id,
        String content,
        UUID senderUserId,
        String senderName,
        OffsetDateTime sentAt,
        Boolean isRead
) {
    public static MessageResponse from(Message m) {
        return new MessageResponse(
                m.getId(),
                m.getContent(),
                m.getSenderUser().getId(),
                m.getSenderUser().getFirstname() + " " + m.getSenderUser().getLastname(),
                m.getSentAt(),
                m.getIsRead()
        );
    }
}