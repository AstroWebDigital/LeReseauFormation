package com.example.backend.controller;

import com.example.backend.dto.MessageResponse;
import com.example.backend.entity.User;
import com.example.backend.service.AuthService;
import com.example.backend.service.MessageService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/channels")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class MessageController {

    private final MessageService messageService;
    private final AuthService authService;

    public MessageController(MessageService messageService, AuthService authService) {
        this.messageService = messageService;
        this.authService = authService;
    }

    @GetMapping("/{channelId}/messages")
    public ResponseEntity<List<MessageResponse>> getMessages(@PathVariable UUID channelId) {
        User currentUser = authService.getCurrentUser();
        if (currentUser != null) {
            messageService.markAsRead(channelId, currentUser.getId());
        }
        return ResponseEntity.ok(
                messageService.getMessagesByChannel(channelId)
                        .stream()
                        .map(MessageResponse::from)
                        .toList()
        );
    }

    @PostMapping("/{channelId}/messages")
    public ResponseEntity<MessageResponse> sendMessage(
            @PathVariable UUID channelId,
            @RequestBody MessageRequest request
    ) {
        User currentUser = authService.getCurrentUser();
        return ResponseEntity.ok(
                MessageResponse.from(
                        messageService.sendMessage(channelId, currentUser.getId(), request.content())
                )
        );
    }

    public record MessageRequest(String content) {}
}