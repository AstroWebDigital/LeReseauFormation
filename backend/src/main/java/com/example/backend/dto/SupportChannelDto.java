package com.example.backend.dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class SupportChannelDto {
    private String id;
    private String userId;
    private String userFirstname;
    private String userLastname;
    private String userEmail;
    private String adminId;
    private String adminFirstname;
    private String adminLastname;
    private String lastMessage;
    private String updatedAt;
    private long unreadCount;
    private List<SupportMessageDto> messages;

    @Data
    @Builder
    public static class SupportMessageDto {
        private String id;
        private String senderId;
        private String senderFirstname;
        private String senderLastname;
        private String content;
        private String sentAt;
        private boolean isRead;
        private boolean isAdmin;
    }
}
