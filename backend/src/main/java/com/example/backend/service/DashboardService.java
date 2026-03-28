package com.example.backend.service;

import com.example.backend.dto.DashboardDTO;
import com.example.backend.dto.ReservationResponse;
import com.example.backend.entity.*;
import com.example.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.format.TextStyle;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final VehicleRepository vehicleRepository;
    private final ReservationRepository reservationRepository;
    private final DocumentRepository documentRepository;
    private final ReservationService reservationService;

    public DashboardDTO buildDashboard(User user) {
        UUID userId = user.getId();

        // ── Véhicules ─────────────────────────────────────────────────────────
        // VehicleRepository.findByUserId() prend un Pageable → on récupère tout avec une grande page
        List<Vehicle> vehicles = vehicleRepository
                .findByUserId(userId, PageRequest.of(0, 1000))
                .getContent();

        int totalVehicles = vehicles.size();

        int availableVehicles = (int) vehicles.stream()
                .filter(v -> "AVAILABLE".equalsIgnoreCase(v.getStatus()))
                .count();
        int rentedVehicles = (int) vehicles.stream()
                .filter(v -> "RENTED".equalsIgnoreCase(v.getStatus()))
                .count();

        BigDecimal avgPrice = vehicles.stream()
                .map(Vehicle::getBaseDailyPrice)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        if (totalVehicles > 0)
            avgPrice = avgPrice.divide(BigDecimal.valueOf(totalVehicles), 2, RoundingMode.HALF_UP);

        // ── Réservations ──────────────────────────────────────────────────────
        // findByVehicleUserId : méthode à ajouter dans ReservationRepository
        List<Reservation> allReservations = reservationRepository.findByVehicleUserId(userId);

        int activeReservations = (int) allReservations.stream()
                .filter(r -> "EN_COURS".equalsIgnoreCase(r.getStatus()))
                .count();
        int pendingReservations = (int) allReservations.stream()
                .filter(r -> "EN_ATTENTE".equalsIgnoreCase(r.getStatus()))
                .count();

        // 5 dernières réservations triées par createdAt
        List<ReservationResponse> recentReservations = allReservations.stream()
                .sorted(Comparator.comparing(
                        Reservation::getCreatedAt,
                        Comparator.nullsLast(Comparator.reverseOrder())
                ))
                .limit(5)
                .map(reservationService::toResponse)
                .collect(Collectors.toList());

        // ── Documents ─────────────────────────────────────────────────────────
        // Document.expirationDate est un LocalDate (pas OffsetDateTime)
        List<Document> documents = documentRepository.findByUserId(userId);
        LocalDate today   = LocalDate.now();
        LocalDate in30Days = today.plusDays(30);

        int expiredDocs = (int) documents.stream()
                .filter(d -> d.getExpirationDate() != null
                        && d.getExpirationDate().isBefore(today))
                .count();

        int expiringDocs = (int) documents.stream()
                .filter(d -> d.getExpirationDate() != null
                        && !d.getExpirationDate().isBefore(today)
                        && d.getExpirationDate().isBefore(in30Days))
                .count();

        // Alertes : docs expirés ou expirant dans 30 jours
        List<DashboardDTO.DocumentAlertDTO> alerts = documents.stream()
                .filter(d -> d.getExpirationDate() != null
                        && d.getExpirationDate().isBefore(in30Days))
                .sorted(Comparator.comparing(Document::getExpirationDate))
                .map(d -> {
                    boolean expired = d.getExpirationDate().isBefore(today);
                    String vehicleName = d.getVehicle() != null
                            ? d.getVehicle().getBrand() + " " + d.getVehicle().getModel()
                            : "Document utilisateur";
                    return DashboardDTO.DocumentAlertDTO.builder()
                            .id(d.getId().toString())
                            .vehicleName(vehicleName)
                            .type(d.getType())
                            .status(expired ? "expire" : "en_attente")
                            .expirationDate(d.getExpirationDate().toString())
                            .severity(expired ? "high" : "medium")
                            .build();
                })
                .collect(Collectors.toList());

        // ── CA mensuel (6 derniers mois) ──────────────────────────────────────
        List<DashboardDTO.MonthlyRevenueDTO> monthlyRevenue = buildMonthlyRevenue(allReservations);

        // ── Véhicules détaillés ───────────────────────────────────────────────
        List<DashboardDTO.VehicleDTO> vehicleDTOs = vehicles.stream()
                .map(v -> {
                    List<Reservation> vRes = allReservations.stream()
                            .filter(r -> r.getVehicle() != null
                                    && r.getVehicle().getId().equals(v.getId()))
                            .collect(Collectors.toList());

                    // CA du mois courant — champ : totalAmount (pas totalPrice)
                    OffsetDateTime now = OffsetDateTime.now();
                    BigDecimal monthlyRev = vRes.stream()
                            .filter(r -> r.getStartDate() != null
                                    && r.getStartDate().getMonthValue() == now.getMonthValue()
                                    && r.getStartDate().getYear() == now.getYear())
                            .map(r -> r.getTotalAmount() != null ? r.getTotalAmount() : BigDecimal.ZERO)
                            .reduce(BigDecimal.ZERO, BigDecimal::add);

                    // Taux d'occupation approximatif sur 30 jours glissants
                    long rentedDays = vRes.stream()
                            .filter(r -> "EN_COURS".equalsIgnoreCase(r.getStatus())
                                    || "CONFIRME".equalsIgnoreCase(r.getStatus()))
                            .mapToLong(r -> {
                                if (r.getStartDate() == null || r.getEndDate() == null) return 0;
                                long days = java.time.Duration
                                        .between(r.getStartDate(), r.getEndDate())
                                        .toDays();
                                return Math.min(days, 30);
                            }).sum();
                    int occupancy = (int) Math.min(100, (rentedDays * 100) / 30);

                    return DashboardDTO.VehicleDTO.builder()
                            .id(v.getId().toString())
                            .brand(v.getBrand())
                            .model(v.getModel())
                            // Vehicle n'a pas getYear() → on met 0 par défaut
                            .year(0)
                            // Vehicle utilise plateNumber (pas licensePlate)
                            .licensePlate(v.getPlateNumber())
                            .status(v.getStatus())
                            .defaultParkingLocation(v.getDefaultParkingLocation())
                            .fuel(v.getFuel())
                            .transmission(v.getTransmission())
                            .baseDailyPrice(v.getBaseDailyPrice())
                            // Vehicle n'a pas getProfilPhoto() dans l'entité — à adapter si tu l'ajoutes
                            .profilPhoto(null)
                            .mileage(v.getMileage() != null ? v.getMileage() : 0)
                            .lastMaintenanceDate(v.getLastMaintenanceDate() != null
                                    ? v.getLastMaintenanceDate().toString() : null)
                            .monthlyRevenue(monthlyRev)
                            .occupancyRate(occupancy)
                            .build();
                })
                .collect(Collectors.toList());

        return DashboardDTO.builder()
                .totalVehicles(totalVehicles)
                .availableVehicles(availableVehicles)
                .rentedVehicles(rentedVehicles)
                .activeReservations(activeReservations)
                .pendingReservations(pendingReservations)
                .totalDocuments(documents.size())
                .expiredDocuments(expiredDocs)
                .expiringDocuments(expiringDocs)
                .averageDailyRate(avgPrice)
                .recentReservations(recentReservations)
                .myVehicles(vehicleDTOs)
                .documentAlerts(alerts)
                .monthlyRevenue(monthlyRevenue)
                .build();
    }

    private List<DashboardDTO.MonthlyRevenueDTO> buildMonthlyRevenue(List<Reservation> reservations) {
        List<DashboardDTO.MonthlyRevenueDTO> result = new ArrayList<>();
        OffsetDateTime now = OffsetDateTime.now();

        for (int i = 5; i >= 0; i--) {
            OffsetDateTime month = now.minusMonths(i);
            String label = month.getMonth()
                    .getDisplayName(TextStyle.SHORT, Locale.FRENCH);
            label = label.substring(0, 1).toUpperCase() + label.substring(1);

            final int targetMonth = month.getMonthValue();
            final int targetYear  = month.getYear();

            List<Reservation> monthRes = reservations.stream()
                    .filter(r -> r.getStartDate() != null
                            && r.getStartDate().getMonthValue() == targetMonth
                            && r.getStartDate().getYear() == targetYear)
                    .collect(Collectors.toList());

            // Champ : totalAmount (pas totalPrice)
            BigDecimal ca = monthRes.stream()
                    .map(r -> r.getTotalAmount() != null ? r.getTotalAmount() : BigDecimal.ZERO)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            result.add(DashboardDTO.MonthlyRevenueDTO.builder()
                    .month(label)
                    .amount(ca)
                    .reservationCount(monthRes.size())
                    .build());
        }
        return result;
    }
}
