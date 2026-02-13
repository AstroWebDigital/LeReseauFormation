package com.example.backend.controller;

import com.example.backend.dto.DocumentResponseDTO;
import com.example.backend.entity.Customer;
import com.example.backend.entity.Document;
import com.example.backend.entity.User;
import com.example.backend.repository.CustomerRepository;
import com.example.backend.repository.DocumentRepository;
import com.example.backend.service.AuthService;
import com.example.backend.service.DocumentService;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/documents")
@Tag(name = "Document", description = "Gestion du CRUD pour les documents avec stockage PDF")
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

    @GetMapping("/download/{filename}")
    @Operation(summary = "Télécharger le fichier physique")
    public ResponseEntity<Resource> downloadFile(@PathVariable String filename) {
        try {
            Path filePath = Paths.get("/app/uploads/documents").resolve(filename).normalize();
            Resource resource = new UrlResource(filePath.toUri());

            if (resource.exists() || resource.isReadable()) {
                return ResponseEntity.ok()
                        .contentType(MediaType.APPLICATION_PDF)
                        .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                        .body(resource);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/{id}")
    @Operation(summary = "Récupérer un document par son ID")
    public ResponseEntity<DocumentResponseDTO> getDocumentById(@PathVariable UUID id) {
        return documentRepository.findById(id)
                .map(doc -> ResponseEntity.ok(this.convertToDTO(doc)))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Créer un nouveau document (Upload PDF + JSON)")
    public ResponseEntity<DocumentResponseDTO> createDocument(
            @RequestPart("document") String documentJson,
            @RequestPart("file") MultipartFile file
    ) throws IOException {
        ObjectMapper mapper = new ObjectMapper();
        mapper.registerModule(new JavaTimeModule());
        Document document = mapper.readValue(documentJson, Document.class);

        Document savedDocument = documentService.createDocument(document, file);
        return ResponseEntity.ok(this.convertToDTO(savedDocument));
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Mettre à jour un document")
    public ResponseEntity<DocumentResponseDTO> updateDocument(
            @PathVariable UUID id,
            @RequestPart("document") String documentJson,
            @RequestPart(value = "file", required = false) MultipartFile file
    ) throws IOException {
        ObjectMapper mapper = new ObjectMapper();
        mapper.registerModule(new JavaTimeModule());
        Document details = mapper.readValue(documentJson, Document.class);

        return documentRepository.findById(id).map(doc -> {
            try {
                doc.setScope(details.getScope());
                doc.setType(details.getType());
                doc.setIssueDate(details.getIssueDate());
                doc.setExpirationDate(details.getExpirationDate());
                doc.setStatus(details.getStatus());
                doc.setUpdatedAt(OffsetDateTime.now());

                Document updated = documentService.createDocument(doc, file);
                return ResponseEntity.ok(this.convertToDTO(updated));
            } catch (IOException e) {
                throw new RuntimeException("Erreur mise à jour fichier");
            }
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