package com.example.backend.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
public class DashboardDTO {

    // ── KPIs ──────────────────────────────────────────────────────────────────
    private int totalVehicles;
    private int availableVehicles;
    private int rentedVehicles;
    private int activeReservations;
    private int pendingReservations;
    private int totalDocuments;
    private int expiredDocuments;
    private int expiringDocuments;      // expiration dans les 30 prochains jours
    private BigDecimal averageDailyRate;

    // ── Réservations récentes (5 dernières) ──────────────────────────────────
    private List<ReservationResponse> recentReservations;

    // ── Véhicules de la flotte ────────────────────────────────────────────────
    private List<VehicleDTO> myVehicles;

    // ── Alertes documents ─────────────────────────────────────────────────────
    private List<DocumentAlertDTO> documentAlerts;

    // ── CA mensuel sur les 6 derniers mois ────────────────────────────────────
    private List<MonthlyRevenueDTO> monthlyRevenue;

    // ── Sous-objets ──────────────────────────────────────────────────────────

    @Data
    @Builder
    public static class DocumentAlertDTO {
        private String id;
        private String vehicleName;
        private String type;        // assurance, carte_grise, permis
        private String status;      // expire, en_attente
        private String expirationDate;
        private String severity;    // high, medium, low
    }

    @Data
    @Builder
    public static class MonthlyRevenueDTO {
        private String month;       // "Jan", "Fév", etc.
        private BigDecimal amount;
        private int reservationCount;
    }

    @Data
    @Builder
    public static class VehicleDTO {
        private String id;
        private String brand;
        private String model;
        private int year;
        private String licensePlate;
        private String status;
        private String defaultParkingLocation;
        private String fuel;
        private String transmission;
        private BigDecimal baseDailyPrice;
        private String profilPhoto;
        private int mileage;
        private String lastMaintenanceDate;
        private String nextMaintenanceDate;
        private BigDecimal monthlyRevenue;
        private int occupancyRate;  // pourcentage
    }
}
