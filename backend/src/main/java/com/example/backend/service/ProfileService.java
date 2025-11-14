package com.example.backend.service;

import com.example.backend.entity.User;
import com.example.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
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

    public User uploadProfilePhoto(User current, MultipartFile file) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Fichier manquant");
        }

        Files.createDirectories(PROFILE_DIR);

        // extension "propre"
        String original = file.getOriginalFilename();
        String ext = "";
        if (original != null && original.contains(".")) {
            ext = original.substring(original.lastIndexOf('.') + 1).toLowerCase(Locale.ROOT);
        }
        if (ext.isBlank()) ext = "jpg"; // par défaut

        String filename = UUID.randomUUID() + "." + ext;
        Path target = PROFILE_DIR.resolve(filename);

        // copie atomique
        Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);

        // Chemin stocké en BDD (toujours relatif à /files)
        String publicPath = "/files/profiles/" + filename;
        current.setProfilPhoto(publicPath);

        return userRepository.save(current);
    }

    public User deleteProfilePhoto(User current) throws IOException {
        if (current.getProfilPhoto() != null) {
            // on tente de supprimer le fichier disque (best effort)
            String path = current.getProfilPhoto().replaceFirst("^/files/", "");
            Path target = UPLOAD_ROOT.resolve(path);
            try { Files.deleteIfExists(target); } catch (Exception ignored) {}
            current.setProfilPhoto(null);
            return userRepository.save(current);
        }
        return current;
    }
}
