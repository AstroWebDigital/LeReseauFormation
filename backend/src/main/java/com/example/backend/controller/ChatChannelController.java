package com.example.backend.controller;

import com.example.backend.dto.ChatChannelResponse;
import com.example.backend.entity.User;
import com.example.backend.repository.MessageRepository;
import com.example.backend.service.AuthService;
import com.example.backend.service.ChatChannelService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/channels")
@CrossOrigin(
        origins = "http://localhost:3000",
        allowCredentials = "true"
)
public class ChatChannelController {

    private final ChatChannelService channelService;
    private final AuthService authService;
    private final MessageRepository messageRepository;

    public ChatChannelController(ChatChannelService channelService, AuthService authService, MessageRepository messageRepository) {
        this.channelService = channelService;
        this.authService = authService;
        this.messageRepository = messageRepository;
    }

    /**
     * GET /api/channels
     * Récupère tous les chat channels liés à l'utilisateur actuellement authentifié.
     * Utilise AuthService pour récupérer l'ID de manière sécurisée.
     */
    @GetMapping
    public ResponseEntity<List<ChatChannelResponse>> getChannelsForAuthenticatedUser() {

        // 1. Récupérer l'entité User actuellement connectée via l'AuthService
        User currentUser = authService.getCurrentUser();

        if (currentUser == null) {
            // Renvoie 404 si l'utilisateur n'est pas trouvé (ou 401 si non authentifié, géré par Spring Security)
            return ResponseEntity.status(404).build();
        }

        UUID userId = currentUser.getId();

        // 2. Appeler le service avec l'ID de l'utilisateur
        return ResponseEntity.ok(
                channelService.getChannelsForUser(userId)
        );
    }

    /**
     * GET /api/channels/unread-count
     * Retourne le nombre de messages non lus pour l'utilisateur connecté.
     */
    @GetMapping("/unread-count")
    public ResponseEntity<Map<String, Long>> getUnreadCount() {
        User currentUser = authService.getCurrentUser();
        if (currentUser == null) return ResponseEntity.status(401).build();
        long count = messageRepository.countUnreadForUser(currentUser.getId());
        return ResponseEntity.ok(Map.of("unread", count));
    }
}