package com.example.backend.service;

import com.example.backend.entity.Document;
import com.example.backend.entity.User;
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
    private final AuthService authService;                  // ← CustomerRepository supprimé

    private final String UPLOAD_DIR = "uploads/documents/";

    @Transactional
    public Document createDocument(Document document, MultipartFile file) throws IOException {
        User currentUser = authService.getCurrentUser();    // ← plus de lookup Customer

        if (file != null && !file.isEmpty()) {
            Path uploadPath = Paths.get(UPLOAD_DIR);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }
            String fileName = UUID.randomUUID() + "_" + file.getOriginalFilename();
            Path filePath = uploadPath.resolve(fileName);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
            document.setFileUrl("/uploads/documents/" + fileName);
        }

        if (document.getId() == null) {
            document.setId(UUID.randomUUID());
        }
        boolean isAdmin = currentUser.getRoles() != null && currentUser.getRoles().contains("ADMIN");
        document.setStatus(isAdmin ? "valide" : "en_attente");
        document.setRejectionReason(null);
        document.setUser(currentUser);                      // ← setCustomer → setUser

        OffsetDateTime now = OffsetDateTime.now();
        document.setCreatedAt(now);
        document.setUpdatedAt(now);

        return documentRepository.save(document);
    }
}