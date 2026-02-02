package com.example.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChatChannelResponse {
    private UUID id;
    private UUID customerId;
    private UUID alpId;
    private String channelName;
    private String status;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
}