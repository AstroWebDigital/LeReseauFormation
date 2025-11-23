// src/main/java/com/example/backend/repository/PasswordResetTokenRepository.java
package com.example.backend.repository;

import com.example.backend.entity.PasswordResetToken;
import com.example.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, UUID> {

    Optional<PasswordResetToken> findByToken(String token);

    void deleteAllByUser(User user);
}
