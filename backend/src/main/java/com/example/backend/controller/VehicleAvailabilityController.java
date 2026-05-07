package com.example.backend.controller;

import com.example.backend.dto.VehicleAvailabilityRequest;
import com.example.backend.dto.VehicleAvailabilityResponse;
import com.example.backend.entity.User;
import com.example.backend.entity.Vehicle;
import com.example.backend.entity.VehicleAvailability;
import com.example.backend.repository.VehicleAvailabilityRepository;
import com.example.backend.repository.VehicleRepository;
import com.example.backend.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/vehicles/{vehicleId}/availability")
@RequiredArgsConstructor
public class VehicleAvailabilityController {

    private final VehicleAvailabilityRepository availabilityRepo;
    private final VehicleRepository vehicleRepo;
    private final UserService userService;

    /** GET /api/vehicles/{vehicleId}/availability — public, accessible aux locataires */
    @GetMapping
    public ResponseEntity<List<VehicleAvailabilityResponse>> getSlots(@PathVariable UUID vehicleId) {
        List<VehicleAvailabilityResponse> slots = availabilityRepo
                .findByVehicleIdOrderByStartDateAsc(vehicleId)
                .stream()
                .map(VehicleAvailabilityResponse::from)
                .toList();
        return ResponseEntity.ok(slots);
    }

    /** POST /api/vehicles/{vehicleId}/availability — propriétaire seulement */
    @PostMapping
    public ResponseEntity<VehicleAvailabilityResponse> addSlot(
            @PathVariable UUID vehicleId,
            @RequestBody VehicleAvailabilityRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {

        Vehicle vehicle = vehicleRepo.findById(vehicleId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Véhicule introuvable."));

        User currentUser = loadUser(userDetails);
        if (!vehicle.getUser().getId().equals(currentUser.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Accès refusé.");
        }

        if (request.getStartDate() == null || request.getEndDate() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Les dates de début et de fin sont requises.");
        }
        if (!request.getEndDate().isAfter(request.getStartDate())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "La date de fin doit être après la date de début.");
        }

        VehicleAvailability slot = new VehicleAvailability();
        slot.setVehicle(vehicle);
        slot.setStartDate(request.getStartDate());
        slot.setEndDate(request.getEndDate());
        slot.setCreatedAt(OffsetDateTime.now());

        return ResponseEntity.ok(VehicleAvailabilityResponse.from(availabilityRepo.save(slot)));
    }

    /** DELETE /api/vehicles/{vehicleId}/availability/{slotId} — propriétaire seulement */
    @DeleteMapping("/{slotId}")
    public ResponseEntity<Void> deleteSlot(
            @PathVariable UUID vehicleId,
            @PathVariable UUID slotId,
            @AuthenticationPrincipal UserDetails userDetails) {

        VehicleAvailability slot = availabilityRepo.findById(slotId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Plage introuvable."));

        User currentUser = loadUser(userDetails);
        if (!slot.getVehicle().getUser().getId().equals(currentUser.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Accès refusé.");
        }

        availabilityRepo.delete(slot);
        return ResponseEntity.noContent().build();
    }

    private User loadUser(UserDetails userDetails) {
        return userService.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Utilisateur non trouvé."));
    }
}
