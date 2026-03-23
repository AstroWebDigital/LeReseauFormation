package com.example.backend.dto;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@Builder
public class DocumentResponseDTO {
    private UUID id;
    private String scope;
    private String type;
    private String fileUrl;
    private LocalDate issueDate;
    private LocalDate expirationDate;
    private String status;
    private UUID userId;      // ← customerId → userId
    private UUID vehicleId;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
}