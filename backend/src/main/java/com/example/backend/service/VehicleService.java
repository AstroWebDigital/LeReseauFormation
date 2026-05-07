package com.example.backend.service;

import com.example.backend.dto.ReservedDateRangeDto;
import com.example.backend.entity.Vehicle;
import com.example.backend.entity.User;
import com.example.backend.repository.ReservationRepository;
import com.example.backend.repository.VehicleRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import jakarta.transaction.Transactional;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class VehicleService {

    private static final int DEFAULT_PAGE_SIZE = 20;
    private static final String AVAILABLE_STATUS = "disponible";
    private static final String PENDING_STATUS = "en_attente";

    private final VehicleRepository vehicleRepository;
    private final ReservationRepository reservationRepository;
    private final EmailService emailService;
    private final NotificationService notificationService;

    public VehicleService(VehicleRepository vehicleRepository, ReservationRepository reservationRepository, EmailService emailService, NotificationService notificationService) {
        this.vehicleRepository = vehicleRepository;
        this.reservationRepository = reservationRepository;
        this.emailService = emailService;
        this.notificationService = notificationService;
    }

    @Transactional
    public Vehicle createVehicle(Vehicle vehicle, User owner) {
        vehicle.setUser(owner);
        boolean isAdmin = owner.getRoles() != null && owner.getRoles().contains("ADMIN");
        vehicle.setStatus(isAdmin ? AVAILABLE_STATUS : PENDING_STATUS);
        vehicle.setListingDate(LocalDate.now());
        return vehicleRepository.save(vehicle);
    }

    @Transactional
    public Vehicle updateVehicle(UUID id, Vehicle vehicleDetails, User currentUser) {
        Vehicle existingVehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Véhicule non trouvé."));

        if (!existingVehicle.getUser().getId().equals(currentUser.getId())) {  // ← getAlp().getUser() → getUser()
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Vous n'êtes pas autorisé à modifier ce véhicule.");
        }

        existingVehicle.setBrand(vehicleDetails.getBrand());
        existingVehicle.setModel(vehicleDetails.getModel());
        existingVehicle.setPlateNumber(vehicleDetails.getPlateNumber());
        existingVehicle.setType(vehicleDetails.getType());
        existingVehicle.setFuel(vehicleDetails.getFuel());
        existingVehicle.setTransmission(vehicleDetails.getTransmission());
        existingVehicle.setBaseDailyPrice(vehicleDetails.getBaseDailyPrice());
        existingVehicle.setMileage(vehicleDetails.getMileage());
        existingVehicle.setDefaultParkingLocation(vehicleDetails.getDefaultParkingLocation());
        boolean isAdmin = currentUser.getRoles() != null && currentUser.getRoles().contains("ADMIN");
        existingVehicle.setStatus(isAdmin ? AVAILABLE_STATUS : PENDING_STATUS);
        existingVehicle.setRejectionReason(null);
        if (vehicleDetails.getLastMaintenanceDate() != null) existingVehicle.setLastMaintenanceDate(vehicleDetails.getLastMaintenanceDate());

        return vehicleRepository.save(existingVehicle);
    }

    @Transactional
    public void deleteVehicle(UUID id, User currentUser) {
        Vehicle existingVehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Véhicule non trouvé."));

        if (!existingVehicle.getUser().getId().equals(currentUser.getId())) {  // ← getAlp().getUser() → getUser()
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Vous n'êtes pas autorisé à supprimer ce véhicule.");
        }

        vehicleRepository.delete(existingVehicle);
    }

    public Vehicle getVehicleById(UUID id) {
        return vehicleRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Véhicule non trouvé."));
    }

    public Page<Vehicle> getAvailableVehicles(int page, int size) {
        int pageSize = (size > 0 && size <= DEFAULT_PAGE_SIZE) ? size : DEFAULT_PAGE_SIZE;
        Sort sort = Sort.by("listingDate").descending();
        Pageable pageable = PageRequest.of(page, pageSize, sort);
        return vehicleRepository.findByStatus(AVAILABLE_STATUS, pageable);
    }

    public Page<Vehicle> getVehiclesByUserId(UUID userId, int page, int size) {
        return vehicleRepository.findByUserId(userId, PageRequest.of(page, size));
    }

    @Transactional
    public Vehicle addImages(UUID id, List<String> imageUrls) {
        Vehicle vehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Véhicule non trouvé."));
        vehicle.getImages().addAll(imageUrls);
        return vehicleRepository.save(vehicle);
    }

    // ─── Admin ────────────────────────────────────────────────────────────────

    public Page<Vehicle> getPendingVehicles(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("listingDate").descending());
        return vehicleRepository.findByStatus(PENDING_STATUS, pageable);
    }

    @Transactional
    public Vehicle approveVehicle(UUID id) {
        Vehicle vehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Véhicule non trouvé."));
        vehicle.setStatus(AVAILABLE_STATUS);
        Vehicle saved = vehicleRepository.save(vehicle);
        try {
            emailService.sendVehicleApprovedEmail(saved.getUser(), saved.getBrand(), saved.getModel(), saved.getPlateNumber());
        } catch (Exception e) {
            System.err.println("Email véhicule approuvé : " + e.getMessage());
        }
        try {
            notificationService.sendVehicleApprovedNotification(saved.getUser(), saved.getBrand(), saved.getModel(), saved.getPlateNumber());
        } catch (Exception e) {
            System.err.println("Notif véhicule approuvé : " + e.getMessage());
        }
        return saved;
    }

    @Transactional
    public Vehicle rejectVehicle(UUID id, String reason) {
        Vehicle vehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Véhicule non trouvé."));
        vehicle.setStatus("rejete");
        vehicle.setRejectionReason(reason);
        Vehicle saved = vehicleRepository.save(vehicle);
        try {
            emailService.sendVehicleRejectedEmail(saved.getUser(), saved.getBrand(), saved.getModel(), saved.getPlateNumber(), reason);
        } catch (Exception e) {
            System.err.println("Email véhicule rejeté : " + e.getMessage());
        }
        try {
            notificationService.sendVehicleRejectedNotification(saved.getUser(), saved.getBrand(), saved.getModel(), saved.getPlateNumber(), reason);
        } catch (Exception e) {
            System.err.println("Notif véhicule rejeté : " + e.getMessage());
        }
        return saved;
    }

    public Page<Vehicle> getAllVehicles(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("listingDate").descending());
        return vehicleRepository.findAll(pageable);
    }

    /** Véhicules réservables : disponible + déjà réservé (pas bloqué ni en attente d'approbation) */
    public Page<Vehicle> getBookableVehicles(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("listingDate").descending());
        return vehicleRepository.findByStatusIn(List.of("disponible", "reserve"), pageable);
    }

    /** Plages de dates des réservations actives d'un véhicule (pour le calendrier) */
    public List<ReservedDateRangeDto> getReservedDates(UUID vehicleId) {
        return reservationRepository.findActiveByVehicleId(vehicleId, OffsetDateTime.now())
                .stream()
                .map(r -> new ReservedDateRangeDto(
                        r.getStartDate().toLocalDate().toString(),
                        r.getEndDate().toLocalDate().toString(),
                        r.getStatus()
                ))
                .collect(Collectors.toList());
    }
}