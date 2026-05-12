package com.example.backend.repository;

import com.example.backend.entity.Document;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface DocumentRepository extends JpaRepository<Document, UUID> {
    List<Document> findByUserId(UUID userId);
    List<Document> findByStatus(String status);
    List<Document> findByUserIdAndTypeIn(UUID userId, java.util.List<String> types);
}