package com.example.backend.service;

import com.example.backend.entity.Customer;
import com.example.backend.entity.Document;
import com.example.backend.entity.User;
import com.example.backend.repository.CustomerRepository;
import com.example.backend.repository.DocumentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.time.OffsetDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DocumentService {

    private final DocumentRepository documentRepository;
    private final CustomerRepository customerRepository;
    private final AuthService authService;

    // Dossier racine pour le stockage
    private final String UPLOAD_DIR = "uploads/documents/";

    @Transactional
    public Document createDocument(Document document, MultipartFile file) throws IOException {
        // 1. Récupérer l'utilisateur connecté
        User currentUser = authService.getCurrentUser();
        Customer customer = customerRepository.findByUserId(currentUser.getId())
                .orElseThrow(() -> new RuntimeException("Profil client introuvable"));

        // 2. Gestion physique du fichier PDF
        if (file != null && !file.isEmpty()) {
            // Créer le dossier s'il n'existe pas
            Path uploadPath = Paths.get(UPLOAD_DIR);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            // Générer un nom unique pour éviter les doublons (ex: uuid_nom-original.pdf)
            String fileName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
            Path filePath = uploadPath.resolve(fileName);

            // Copier le fichier sur le disque
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            // On stocke le chemin relatif dans l'entité
            document.setFileUrl("/uploads/documents/" + fileName);
        }

        // 3. Préparer l'entité
        if (document.getId() == null) document.setId(UUID.randomUUID());
        document.setCustomer(customer);

        OffsetDateTime now = OffsetDateTime.now();
        document.setCreatedAt(now);
        document.setUpdatedAt(now);

        return documentRepository.save(document);
    }
}