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
@Table(name = "\"user\"")
public class User {

    public enum Status {
        ACTIF,
        SUSPENDU,
        SUPPRIME,
        EN_CREATION
    }

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(columnDefinition = "uuid default gen_random_uuid()")
    private UUID id;

    @Column(nullable = false, unique = true)
    private String email;

    // Nullable pour comptes SSO si besoin
    @Column
    private String password;

    // LOCAL / KEYCLOAK / GOOGLE ...
    @Column(nullable = false)
    private String provider;

    @Column(name = "provider_id")
    private String providerId;

    @Column(nullable = false)
    private String roles;

    // ---- Nouveaux champs ----

    @Column
    private String firstname;

    @Column
    private String lastname;

    @Column
    private String phone;

    @Column(name = "profil_photo")
    private String profilPhoto;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private Status status = Status.ACTIF;

    @Column
    private String sector;

    // ---- Métadonnées ----

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at")
    private Instant updatedAt;

    // ---- Lifecycle ----

    @PrePersist
    public void prePersist() {
        Instant now = Instant.now();
        if (createdAt == null) {
            createdAt = now;
        }
        updatedAt = now;

        if (roles == null) {
            roles = "ROLE_USER";
        }
        if (provider == null) {
            provider = "LOCAL";
        }
        if (status == null) {
            status = Status.ACTIF;
        }
    }

    @PreUpdate
    public void preUpdate() {
        updatedAt = Instant.now();
        if (status == null) {
            status = Status.ACTIF;
        }
    }
}
