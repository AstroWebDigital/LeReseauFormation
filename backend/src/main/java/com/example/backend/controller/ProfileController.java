package com.example.backend.controller;

import com.example.backend.dto.UserDto;
import com.example.backend.entity.User;
import com.example.backend.mapper.UserMapper;
import com.example.backend.repository.UserRepository;
import com.example.backend.service.ProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequiredArgsConstructor
@RequestMapping("/profile")
public class ProfileController {

    private final ProfileService profileService;
    private final UserRepository userRepository;
    private final UserMapper userMapper;

    @PostMapping("/photo")
    public ResponseEntity<UserDto> upload(Authentication auth, @RequestParam("file") MultipartFile file) throws Exception {
        String email = auth.getName();
        User u = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Utilisateur introuvable"));

        User saved = profileService.uploadProfilePhoto(u, file);
        return ResponseEntity.ok(userMapper.toDto(saved));
    }

    @DeleteMapping("/photo")
    public ResponseEntity<UserDto> delete(Authentication auth) throws Exception {
        String email = auth.getName();
        User u = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Utilisateur introuvable"));

        User saved = profileService.deleteProfilePhoto(u);
        return ResponseEntity.ok(userMapper.toDto(saved));
    }
}
