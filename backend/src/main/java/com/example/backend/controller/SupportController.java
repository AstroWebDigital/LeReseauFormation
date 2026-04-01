package com.example.backend.controller;

import com.example.backend.dto.SupportChannelDto;
import com.example.backend.service.SupportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
public class SupportController {

    private final SupportService supportService;

    /** Utilisateur : récupère ou crée son canal de support */
    @PostMapping("/api/support/channel")
    public ResponseEntity<SupportChannelDto> getOrCreate() {
        return ResponseEntity.ok(supportService.getOrCreateMyChannel());
    }

    /** Utilisateur : liste ses messages */
    @GetMapping("/api/support/channel/{channelId}/messages")
    public ResponseEntity<List<SupportChannelDto.SupportMessageDto>> getMessages(@PathVariable UUID channelId) {
        return ResponseEntity.ok(supportService.getMyMessages(channelId));
    }

    /** Utilisateur ou Admin : envoie un message */
    @PostMapping("/api/support/channel/{channelId}/messages")
    public ResponseEntity<SupportChannelDto.SupportMessageDto> send(
            @PathVariable UUID channelId,
            @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(supportService.sendMessage(channelId, body.get("content")));
    }

    /** Admin : liste tous les canaux de support */
    @GetMapping("/api/admin/support/channels")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<SupportChannelDto>> adminList() {
        return ResponseEntity.ok(supportService.adminListChannels());
    }

    /** Admin : lit les messages d'un canal */
    @GetMapping("/api/admin/support/channels/{channelId}/messages")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<SupportChannelDto.SupportMessageDto>> adminMessages(@PathVariable UUID channelId) {
        return ResponseEntity.ok(supportService.adminGetMessages(channelId));
    }
}
