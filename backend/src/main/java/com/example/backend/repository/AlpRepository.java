package com.example.backend.repository;

import com.example.backend.entity.Alp;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

/**
 * Repository pour l'entité Alp.
 * Fournit des méthodes CRUD automatiques.
 */
public interface AlpRepository extends JpaRepository<Alp, UUID> {
    // Aucune méthode personnalisée nécessaire pour l'instant, JpaRepository fournit tout ce qu'il faut.
}