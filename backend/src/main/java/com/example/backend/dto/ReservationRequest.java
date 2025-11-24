package com.example.backend.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Data
public class ReservationRequest {
    private UUID vehicleId;
    private UUID customerId;
    private OffsetDateTime startDate;
    private OffsetDateTime endDate;
    private String pickupLocation;
    private String returnLocation;
    private String status;           // <- ajouté
    private BigDecimal totalAmount;
    private BigDecimal depositAmount;     // <- ajouté
    private BigDecimal securityDeposit;   // <- ajouté
}
