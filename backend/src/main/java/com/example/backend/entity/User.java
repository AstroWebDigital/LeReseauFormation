package com.example.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "\"user\"") // nom exact: user
public class User {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(nullable = false, unique = true, length = 255)
    private String email;

    @Column(length = 255)
    private String password; // BCrypt, peut être null pour SSO

    @Column(nullable = false, length = 50)
    private String provider; // LOCAL, KEYCLOAK, GOOGLE, etc.

    @Column(name = "provider_id", length = 255)
    private String providerId;

    @Column(nullable = false, length = 255)
    private String roles; // ex: "ROLE_USER", "ROLE_ADMIN"

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "updated_at")
    private Instant updatedAt;

    @PrePersist
    public void prePersist() {
        Instant now = Instant.now();
        createdAt = now;
        updatedAt = now;
        if (roles == null) {
            roles = "ROLE_USER";
        }
        if (provider == null) {
            provider = "LOCAL";
        }
    }

    @PreUpdate
    public void preUpdate() {
        updatedAt = Instant.now();
    }
}
