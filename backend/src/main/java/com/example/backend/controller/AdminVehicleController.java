package com.example.backend.controller;

import com.example.backend.dto.AdminOverviewDTO;
import com.example.backend.entity.Document;
import com.example.backend.entity.User;
import com.example.backend.entity.Vehicle;
import com.example.backend.repository.DocumentRepository;
import com.example.backend.repository.UserRepository;
import com.example.backend.repository.VehicleRepository;
import com.example.backend.service.VehicleService;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
public class AdminVehicleController {

    private final VehicleService vehicleService;
    private final VehicleRepository vehicleRepository;
    private final DocumentRepository documentRepository;
    private final UserRepository userRepository;

    public AdminVehicleController(VehicleService vehicleService,
                                  VehicleRepository vehicleRepository,
                                  DocumentRepository documentRepository,
                                  UserRepository userRepository) {
        this.vehicleService = vehicleService;
        this.vehicleRepository = vehicleRepository;
        this.documentRepository = documentRepository;
        this.userRepository = userRepository;
    }

    // ─── Compteur en attente ─────────────────────────────────────────────────

    /**
     * GET /api/admin/pending-count — nb total de véhicules + documents en attente
     */
    @GetMapping("/pending-count")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<java.util.Map<String, Long>> getPendingCount() {
        long vehicles  = vehicleRepository.findByStatus("en_attente", org.springframework.data.domain.Pageable.unpaged()).getTotalElements();
        long documents = documentRepository.findByStatus("en_attente").size();
        return ResponseEntity.ok(java.util.Map.of(
                "vehicles",  vehicles,
                "documents", documents,
                "total",     vehicles + documents
        ));
    }

    // ─── Vue d'ensemble par utilisateur ──────────────────────────────────────

    /**
     * GET /api/admin/overview — tous les users avec leurs véhicules et documents
     */
    @GetMapping("/overview")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<List<AdminOverviewDTO>> getOverview() {
        List<User> users = userRepository.findAll();

        List<AdminOverviewDTO> overview = users.stream()
                .filter(u -> u.getRoles() == null || !u.getRoles().contains("ADMIN"))
                .map(user -> {
                    AdminOverviewDTO dto = new AdminOverviewDTO();
                    dto.setId(user.getId());
                    dto.setEmail(user.getEmail());
                    dto.setFirstname(user.getFirstname());
                    dto.setLastname(user.getLastname());
                    dto.setRoles(user.getRoles());
                    dto.setStatus(user.getStatus() != null ? user.getStatus().name() : null);

                    // Véhicules
                    List<Vehicle> vehicles = vehicleRepository.findAllByUserId(user.getId());
                    dto.setVehicles(vehicles.stream().map(v -> {
                        AdminOverviewDTO.VehicleSummary vs = new AdminOverviewDTO.VehicleSummary();
                        vs.setId(v.getId());
                        vs.setBrand(v.getBrand());
                        vs.setModel(v.getModel());
                        vs.setPlateNumber(v.getPlateNumber());
                        vs.setType(v.getType());
                        vs.setFuel(v.getFuel());
                        vs.setTransmission(v.getTransmission());
                        vs.setStatus(v.getStatus());
                        vs.setBaseDailyPrice(v.getBaseDailyPrice());
                        vs.setMileage(v.getMileage());
                        vs.setDefaultParkingLocation(v.getDefaultParkingLocation());
                        vs.setImages(v.getImages());
                        vs.setRejectionReason(v.getRejectionReason());
                        return vs;
                    }).collect(Collectors.toList()));

                    // Documents
                    List<Document> documents = documentRepository.findByUserId(user.getId());
                    dto.setDocuments(documents.stream().map(d -> {
                        AdminOverviewDTO.DocumentSummary ds = new AdminOverviewDTO.DocumentSummary();
                        ds.setId(d.getId());
                        ds.setScope(d.getScope());
                        ds.setType(d.getType());
                        ds.setFileUrl(d.getFileUrl());
                        ds.setStatus(d.getStatus());
                        ds.setIssueDate(d.getIssueDate());
                        ds.setExpirationDate(d.getExpirationDate());
                        ds.setCreatedAt(d.getCreatedAt());
                        ds.setVehicleId(d.getVehicle() != null ? d.getVehicle().getId() : null);
                        ds.setRejectionReason(d.getRejectionReason());
                        return ds;
                    }).collect(Collectors.toList()));

                    return dto;
                })
                .filter(dto -> !dto.getVehicles().isEmpty() || !dto.getDocuments().isEmpty())
                .collect(Collectors.toList());

        return ResponseEntity.ok(overview);
    }

    // ─── Véhicules ───────────────────────────────────────────────────────────

    @GetMapping("/vehicles")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Page<Vehicle>> getAllVehicles(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(vehicleService.getAllVehicles(page, size));
    }

    @GetMapping("/vehicles/pending")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Page<Vehicle>> getPendingVehicles(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(vehicleService.getPendingVehicles(page, size));
    }

    @PutMapping("/vehicles/{id}/approve")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Vehicle> approveVehicle(@PathVariable UUID id) {
        return ResponseEntity.ok(vehicleService.approveVehicle(id));
    }

    @PutMapping("/vehicles/{id}/reject")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Vehicle> rejectVehicle(
            @PathVariable UUID id,
            @RequestBody(required = false) java.util.Map<String, String> body) {
        String reason = body != null ? body.get("reason") : null;
        return ResponseEntity.ok(vehicleService.rejectVehicle(id, reason));
    }

    // ─── Documents ───────────────────────────────────────────────────────────

    @PutMapping("/documents/{id}/approve")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Void> approveDocument(@PathVariable UUID id) {
        Document doc = documentRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Document non trouvé."));
        doc.setStatus("valide");
        doc.setUpdatedAt(OffsetDateTime.now());
        documentRepository.save(doc);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/documents/{id}/reject")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Void> rejectDocument(
            @PathVariable UUID id,
            @RequestBody(required = false) java.util.Map<String, String> body) {
        Document doc = documentRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Document non trouvé."));
        doc.setStatus("rejete");
        doc.setRejectionReason(body != null ? body.get("reason") : null);
        doc.setUpdatedAt(OffsetDateTime.now());
        documentRepository.save(doc);
        return ResponseEntity.ok().build();
    }
}
