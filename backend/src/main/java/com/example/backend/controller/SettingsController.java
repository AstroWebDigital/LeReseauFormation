package com.example.backend.controller;

import com.example.backend.entity.User;
import com.example.backend.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/settings")
@RequiredArgsConstructor
@CrossOrigin(origins = "*") // À restreindre en production (ex: "http://localhost:3000")
public class SettingsController {

    private final UserService userService;
    private final PasswordEncoder passwordEncoder;

    /**
     * Récupère les informations de l'utilisateur actuellement connecté.
     */
    @GetMapping("/me")
    public ResponseEntity<User> getCurrentSettings() {
        User currentUser = userService.getCurrentUserEntity();
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.ok(currentUser);
    }

    /**
     * Met à jour les informations de profil (Prénom, Nom, Téléphone, Secteur).
     */
    @PatchMapping("/me/profile")
    public ResponseEntity<User> updateProfile(@RequestBody Map<String, String> updates) {
        User user = userService.getCurrentUserEntity();
        if (user == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        if (updates.containsKey("firstname")) user.setFirstname(updates.get("firstname"));
        if (updates.containsKey("lastname")) user.setLastname(updates.get("lastname"));
        if (updates.containsKey("phone")) user.setPhone(updates.get("phone"));
        if (updates.containsKey("sector")) user.setSector(updates.get("sector"));

        return ResponseEntity.ok(userService.save(user));
    }

    /**
     * Modifie le mot de passe de l'utilisateur.
     * Attend un JSON : { "oldPassword": "...", "newPassword": "..." }
     */
    @PutMapping("/me/password")
    public ResponseEntity<?> updatePassword(@RequestBody Map<String, String> passwords) {
        User user = userService.getCurrentUserEntity();
        if (user == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        String oldPassword = passwords.get("oldPassword");
        String newPassword = passwords.get("newPassword");

        // Vérification de l'ancien mot de passe
        if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "L'ancien mot de passe est incorrect."));
        }

        // Hachage et sauvegarde du nouveau mot de passe
        user.setPassword(passwordEncoder.encode(newPassword));
        userService.save(user);

        return ResponseEntity.ok(Map.of("message", "Mot de passe mis à jour avec succès."));
    }

    /**
     * Met à jour l'URL de la photo de profil.
     */
    @PatchMapping("/me/photo")
    public ResponseEntity<User> updatePhoto(@RequestBody Map<String, String> body) {
        User user = userService.getCurrentUserEntity();
        if (user == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        String photoUrl = body.get("url");
        user.setProfilPhoto(photoUrl);

        return ResponseEntity.ok(userService.save(user));
    }
}