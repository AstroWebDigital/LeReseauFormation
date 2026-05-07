package com.example.backend.controller;

import com.example.backend.dto.CreateAlpRequest;
import com.example.backend.dto.UserDto;
import com.example.backend.service.AdminUserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
public class AdminUserController {

    private final AdminUserService adminUserService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createUser(@Valid @RequestBody CreateAlpRequest request) {
        try {
            UserDto dto = adminUserService.createUser(request);
            return ResponseEntity.status(201).body(dto);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /** Retourne tous les ALP et ARC */
    @GetMapping("/alp")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UserDto>> listAlpAndArc() {
        return ResponseEntity.ok(adminUserService.listAlpAndArcUsers());
    }

    /** Retourne uniquement les ALP (pour le select ARC) */
    @GetMapping("/alp-only")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UserDto>> listAlpOnly() {
        return ResponseEntity.ok(adminUserService.listAlpOnly());
    }

    /** Bloquer un ALP ou ARC */
    @PutMapping("/{id}/block")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> blockUser(@PathVariable UUID id, @RequestBody Map<String, String> body) {
        try {
            String reason = body.getOrDefault("reason", "");
            UserDto dto = adminUserService.blockUser(id, reason);
            return ResponseEntity.ok(dto);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /** Débloquer un ALP ou ARC */
    @PutMapping("/{id}/unblock")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> unblockUser(@PathVariable UUID id) {
        try {
            UserDto dto = adminUserService.unblockUser(id);
            return ResponseEntity.ok(dto);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /** Transférer un ARC vers un autre ALP */
    @PutMapping("/{arcId}/transfer")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> transferArc(@PathVariable UUID arcId, @RequestBody Map<String, String> body) {
        try {
            UUID newAlpId = UUID.fromString(body.get("newAlpId"));
            UserDto dto = adminUserService.transferArc(arcId, newAlpId);
            return ResponseEntity.ok(dto);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
