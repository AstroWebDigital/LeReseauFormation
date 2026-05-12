package com.example.backend.service;

import com.example.backend.dto.UpdateProfileRequest;
import com.example.backend.entity.Document;
import com.example.backend.entity.User;
import com.example.backend.repository.DocumentRepository;
import com.example.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

@RequiredArgsConstructor
@Service
public class ProfileService {

    private static final Path UPLOAD_ROOT  = Path.of("/data/uploads");
    private static final Path PROFILE_DIR  = UPLOAD_ROOT.resolve("profiles");
    private static final Path LICENSE_DIR  = UPLOAD_ROOT.resolve("licenses");

    private final UserRepository userRepository;
    private final DocumentRepository documentRepository;
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

    /* ─────────── Permis de conduire ─────────── */

    public User saveLicense(User current, String licenseNumber, String expiryDate,
                            MultipartFile front, MultipartFile back) throws IOException {
        if (licenseNumber == null || licenseNumber.isBlank()) {
            throw new IllegalArgumentException("Numéro de permis requis");
        }
        current.setLicenseNumber(licenseNumber.trim());
        if (expiryDate != null && !expiryDate.isBlank()) {
            current.setLicenseExpiryDate(expiryDate.trim());
        }
        if (front != null && !front.isEmpty()) {
            current.setLicensePhotoFront(saveLicensePhoto(front));
        }
        if (back != null && !back.isEmpty()) {
            current.setLicensePhotoBack(saveLicensePhoto(back));
        }
        User saved = userRepository.save(current);
        createLicenseDocuments(saved);
        return saved;
    }

    private void createLicenseDocuments(User user) {
        // Supprimer les anciens documents de permis
        List<Document> old = documentRepository.findByUserIdAndTypeIn(
                user.getId(), List.of("permis_conduire_recto", "permis_conduire_verso"));
        documentRepository.deleteAll(old);

        OffsetDateTime now = OffsetDateTime.now();
        if (user.getLicensePhotoFront() != null) {
            Document recto = new Document();
            recto.setId(UUID.randomUUID());
            recto.setScope("utilisateur");
            recto.setType("permis_conduire_recto");
            recto.setFileUrl(user.getLicensePhotoFront());
            recto.setStatus("en_attente");
            recto.setUser(user);
            recto.setCreatedAt(now);
            recto.setUpdatedAt(now);
            documentRepository.save(recto);
        }
        if (user.getLicensePhotoBack() != null) {
            Document verso = new Document();
            verso.setId(UUID.randomUUID());
            verso.setScope("utilisateur");
            verso.setType("permis_conduire_verso");
            verso.setFileUrl(user.getLicensePhotoBack());
            verso.setStatus("en_attente");
            verso.setUser(user);
            verso.setCreatedAt(now);
            verso.setUpdatedAt(now);
            documentRepository.save(verso);
        }
    }

    private String saveLicensePhoto(MultipartFile file) throws IOException {
        Files.createDirectories(LICENSE_DIR);
        String ext = "jpg";
        String original = file.getOriginalFilename();
        if (original != null && original.contains(".")) {
            ext = original.substring(original.lastIndexOf('.') + 1).toLowerCase(Locale.ROOT);
        }
        String filename = UUID.randomUUID() + "." + ext;
        Files.copy(file.getInputStream(), LICENSE_DIR.resolve(filename), StandardCopyOption.REPLACE_EXISTING);
        return "/files/licenses/" + filename;
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
