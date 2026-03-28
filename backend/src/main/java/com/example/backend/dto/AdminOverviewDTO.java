package com.example.backend.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Data
public class AdminOverviewDTO {

    private UUID id;
    private String email;
    private String firstname;
    private String lastname;
    private String roles;
    private String status;

    private List<VehicleSummary> vehicles;
    private List<DocumentSummary> documents;

    @Data
    public static class VehicleSummary {
        private UUID id;
        private String brand;
        private String model;
        private String plateNumber;
        private String type;
        private String fuel;
        private String transmission;
        private String status;
        private BigDecimal baseDailyPrice;
        private Integer mileage;
        private String defaultParkingLocation;
        private List<String> images;
        private String rejectionReason;
    }

    @Data
    public static class DocumentSummary {
        private UUID id;
        private String scope;
        private String type;
        private String fileUrl;
        private String status;
        private LocalDate issueDate;
        private LocalDate expirationDate;
        private OffsetDateTime createdAt;
        private UUID vehicleId;
        private String rejectionReason;
    }
}
