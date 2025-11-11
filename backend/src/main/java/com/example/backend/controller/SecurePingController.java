package com.example.backend.controller;

import com.example.backend.dto.UserDto;
import com.example.backend.entity.User;
import com.example.backend.mapper.UserMapper;
import com.example.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/secure")
@RequiredArgsConstructor
public class SecurePingController {

    private final UserRepository userRepository;
    private final UserMapper userMapper;

    @GetMapping("/ping")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> ping(@AuthenticationPrincipal UserDetails principal) {
        if (principal == null) {
            return ResponseEntity.status(401).build();
        }

        User user = userRepository.findByEmail(principal.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        UserDto dto = userMapper.toDto(user);

        return ResponseEntity.ok(
                String.format("Hello %s (%s), secure endpoint OK ✅", dto.getEmail(), dto.getId())
        );
    }
}
