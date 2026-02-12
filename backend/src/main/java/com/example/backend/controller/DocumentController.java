package com.example.backend.controller;

import com.example.backend.dto.DocumentResponseDTO;
import com.example.backend.entity.Customer;
import com.example.backend.entity.Document;
import com.example.backend.entity.User;
import com.example.backend.repository.CustomerRepository;
import com.example.backend.repository.DocumentRepository;
import com.example.backend.service.AuthService;
import com.example.backend.service.DocumentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/documents")
@Tag(name = "Document", description = "Gestion du CRUD pour les documents")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class DocumentController {

    private final DocumentRepository documentRepository;
    private final DocumentService documentService;
    private final CustomerRepository customerRepository;
    private final AuthService authService;

    @GetMapping
    @Operation(summary = "Récupérer les documents de l'utilisateur connecté")
    public List<DocumentResponseDTO> getAllDocuments() {
        User currentUser = authService.getCurrentUser();

        Customer customer = customerRepository.findByUserId(currentUser.getId())
                .orElseThrow(() -> new RuntimeException("Profil client introuvable"));

        return documentRepository.findByCustomerId(customer.getId())
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Récupérer un document par son ID")
    public ResponseEntity<DocumentResponseDTO> getDocumentById(@PathVariable UUID id) {
        return documentRepository.findById(id)
                .map(doc -> ResponseEntity.ok(this.convertToDTO(doc)))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @Operation(summary = "Créer un nouveau document")
    public ResponseEntity<DocumentResponseDTO> createDocument(@Valid @RequestBody Document document) {
        Document savedDocument = documentService.createDocument(document);
        return ResponseEntity.ok(this.convertToDTO(savedDocument));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Mettre à jour un document existant")
    public ResponseEntity<DocumentResponseDTO> updateDocument(@PathVariable UUID id, @Valid @RequestBody Document details) {
        return documentRepository.findById(id).map(doc -> {
            doc.setScope(details.getScope());
            doc.setType(details.getType());
            doc.setFileUrl(details.getFileUrl());
            doc.setIssueDate(details.getIssueDate());
            doc.setExpirationDate(details.getExpirationDate());
            doc.setStatus(details.getStatus());
            doc.setUpdatedAt(OffsetDateTime.now());
            Document updated = documentRepository.save(doc);
            return ResponseEntity.ok(this.convertToDTO(updated));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Supprimer un document")
    public ResponseEntity<Void> deleteDocument(@PathVariable UUID id) {
        return documentRepository.findById(id).map(doc -> {
            documentRepository.delete(doc);
            return ResponseEntity.ok().<Void>build();
        }).orElse(ResponseEntity.notFound().build());
    }

    /**
     * Convertit une entité Document en DocumentResponseDTO pour éviter les erreurs de proxy Hibernate/Jackson
     */
    private DocumentResponseDTO convertToDTO(Document doc) {
        return DocumentResponseDTO.builder()
                .id(doc.getId())
                .scope(doc.getScope())
                .type(doc.getType())
                .fileUrl(doc.getFileUrl())
                .issueDate(doc.getIssueDate())
                .expirationDate(doc.getExpirationDate())
                .status(doc.getStatus())
                .customerId(doc.getCustomer() != null ? doc.getCustomer().getId() : null)
                .vehicleId(doc.getVehicle() != null ? doc.getVehicle().getId() : null)
                .createdAt(doc.getCreatedAt())
                .updatedAt(doc.getUpdatedAt())
                .build();
    }
}