package com.example.backend.controller;

import com.example.backend.dto.ChangePasswordRequest;
import com.example.backend.dto.UpdateProfileRequest;
import com.example.backend.dto.UserDto;
import com.example.backend.entity.User;
import com.example.backend.mapper.UserMapper;
import com.example.backend.repository.UserRepository;
import com.example.backend.service.ProfileService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/profile")
public class ProfileController {

    private final ProfileService profileService;
    private final UserRepository userRepository;
    private final UserMapper userMapper;

    private User getCurrentUser(Authentication auth) {
        String email = auth.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Utilisateur introuvable"));
    }

    private void ensureVerified(User user) {
        if (user.getStatus() != User.Status.ACTIF) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Votre compte n'est pas encore vérifié. Veuillez valider votre adresse e-mail."
            );
        }
    }

    @GetMapping
    public ResponseEntity<UserDto> me(Authentication auth) {
        User u = getCurrentUser(auth);
        return ResponseEntity.ok(userMapper.toDto(u));
    }

    /* ─────────────── Mise à jour des infos de profil ─────────────── */

    @PutMapping
    public ResponseEntity<UserDto> updateProfile(
            Authentication auth,
            @Valid @RequestBody UpdateProfileRequest request
    ) {
        User u = getCurrentUser(auth);
        ensureVerified(u);

        User saved = profileService.updateProfile(u, request);
        return ResponseEntity.ok(userMapper.toDto(saved));
    }

    /* ─────────────── Changement de mot de passe ─────────────── */

    @PostMapping("/password")
    public ResponseEntity<Void> changePassword(
            Authentication auth,
            @Valid @RequestBody ChangePasswordRequest request
    ) {
        User u = getCurrentUser(auth);
        ensureVerified(u);

        profileService.changePassword(u, request.getCurrentPassword(), request.getNewPassword());
        return ResponseEntity.noContent().build();
    }

    /* ─────────────── Photo de profil ─────────────── */

    @PostMapping(value = "/photo", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<UserDto> upload(
            Authentication auth,
            @RequestParam("file") MultipartFile file
    ) throws Exception {
        User u = getCurrentUser(auth);
        ensureVerified(u);

        User saved = profileService.uploadProfilePhoto(u, file);
        return ResponseEntity.ok(userMapper.toDto(saved));
    }

    @DeleteMapping("/photo")
    public ResponseEntity<UserDto> delete(Authentication auth) throws Exception {
        User u = getCurrentUser(auth);
        ensureVerified(u);

        User saved = profileService.deleteProfilePhoto(u);
        return ResponseEntity.ok(userMapper.toDto(saved));
    }
}
