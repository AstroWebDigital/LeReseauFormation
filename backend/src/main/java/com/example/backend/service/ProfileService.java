package com.example.backend.service;

import com.example.backend.dto.UpdateProfileRequest;
import com.example.backend.entity.User;
import com.example.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.Locale;
import java.util.UUID;

@RequiredArgsConstructor
@Service
public class ProfileService {

    private static final Path UPLOAD_ROOT = Path.of("/data/uploads");
    private static final Path PROFILE_DIR = UPLOAD_ROOT.resolve("profiles");

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    /* ─────────── Photo ─────────── */

    public User uploadProfilePhoto(User current, MultipartFile file) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Fichier manquant");
        }

        Files.createDirectories(PROFILE_DIR);

        String original = file.getOriginalFilename();
        String ext = "";
        if (original != null && original.contains(".")) {
            ext = original.substring(original.lastIndexOf('.') + 1).toLowerCase(Locale.ROOT);
        }
        if (ext.isBlank()) ext = "jpg";

        String filename = UUID.randomUUID() + "." + ext;
        Path target = PROFILE_DIR.resolve(filename);

        Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);

        String publicPath = "/files/profiles/" + filename;
        current.setProfilPhoto(publicPath);

        return userRepository.save(current);
    }

    public User deleteProfilePhoto(User current) throws IOException {
        if (current.getProfilPhoto() != null) {
            String path = current.getProfilPhoto().replaceFirst("^/files/", "");
            Path target = UPLOAD_ROOT.resolve(path);
            try {
                Files.deleteIfExists(target);
            } catch (Exception ignored) {}
            current.setProfilPhoto(null);
            return userRepository.save(current);
        }
        return current;
    }

    /* ─────────── Mise à jour profil ─────────── */

    public User updateProfile(User current, UpdateProfileRequest req) {
        if (req.getFirstname() != null) {
            current.setFirstname(req.getFirstname().trim());
        }
        if (req.getLastname() != null) {
            current.setLastname(req.getLastname().trim());
        }
        if (req.getPhone() != null) {
            current.setPhone(req.getPhone().trim());
        }
        if (req.getSector() != null) {
            current.setSector(req.getSector().trim());
        }

        return userRepository.save(current);
    }

    /* ─────────── Suppression de compte ─────────── */

    public void deleteAccount(User current) {
        userRepository.delete(current);
    }

    /* ─────────── Changement de mot de passe ─────────── */

    public void changePassword(User current, String currentPassword, String newPassword) {
        if (current.getPassword() == null) {
            throw new IllegalStateException("Ce compte ne dispose pas de mot de passe local.");
        }

        if (!passwordEncoder.matches(currentPassword, current.getPassword())) {
            throw new IllegalArgumentException("Mot de passe actuel incorrect.");
        }

        current.setPassword(passwordEncoder.encode(newPassword));
        current.setMustChangePassword(false);
        userRepository.save(current);
    }

    /* ─────────── Changement forcé (première connexion ALP) ─────────── */

    public void forceChangePassword(User current, String newPassword) {
        if (!current.isMustChangePassword()) {
            throw new IllegalStateException("Ce compte n'est pas en attente de changement de mot de passe.");
        }
        current.setPassword(passwordEncoder.encode(newPassword));
        current.setMustChangePassword(false);
        userRepository.save(current);
    }
}
