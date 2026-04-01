package com.example.backend.controller;

import com.example.backend.dto.UserDto;
import com.example.backend.service.AlpTeamService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/alp/team")
@RequiredArgsConstructor
public class AlpTeamController {

    private final AlpTeamService alpTeamService;

    @GetMapping
    @PreAuthorize("hasRole('ALP')")
    public ResponseEntity<List<UserDto>> getMyArcs() {
        return ResponseEntity.ok(alpTeamService.getMyArcs());
    }

    @PutMapping("/{arcId}/block")
    @PreAuthorize("hasRole('ALP')")
    public ResponseEntity<?> blockArc(@PathVariable UUID arcId, @RequestBody Map<String, String> body) {
        try {
            String reason = body.getOrDefault("reason", "");
            return ResponseEntity.ok(alpTeamService.blockArc(arcId, reason));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{arcId}/unblock")
    @PreAuthorize("hasRole('ALP')")
    public ResponseEntity<?> unblockArc(@PathVariable UUID arcId) {
        try {
            return ResponseEntity.ok(alpTeamService.unblockArc(arcId));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
