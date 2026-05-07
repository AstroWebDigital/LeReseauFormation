package com.example.backend.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Data
public class ReservationResponse {
    private UUID id;
    private UUID vehicleId;
    private String vehicleBrand;
    private String vehicleModel;
    private UUID customerId;
    private String customerName;
    private String customerEmail;
    private OffsetDateTime startDate;
    private OffsetDateTime endDate;
    private String pickupLocation;
    private String returnLocation;
    private String status;
    private BigDecimal totalAmount;
    private BigDecimal depositAmount;
    private BigDecimal securityDeposit;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
    private String rejectionReason;
}