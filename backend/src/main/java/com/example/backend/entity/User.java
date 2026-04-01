package com.example.backend.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@Entity
@Table(name = "\"user\"")
public class User {

    public enum Status {
        EN_CREATION, ACTIF, SUSPENDU, SUPPRIME
    }

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "id", nullable = false)
    private UUID id;

    @Column(name = "email", nullable = false, unique = true, length = 255)
    private String email;

    @Column(name = "password", length = 255)
    private String password;

    @Column(name = "provider", nullable = false, length = 255)
    private String provider;

    @Column(name = "provider_id", length = 255)
    private String providerId;

    @Column(name = "roles", nullable = false, length = 255)
    private String roles;

    @Column(name = "firstname", length = 255)
    private String firstname;

    @Column(name = "lastname", length = 255)
    private String lastname;

    @Column(name = "phone", length = 255)
    private String phone;

    @Column(name = "profil_photo", length = 255)
    private String profilPhoto;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 255)
    private Status status;

    @Column(name = "sector", length = 255)
    private String sector;

    @Column(name = "must_change_password", nullable = false)
    private boolean mustChangePassword = false;

    @Column(name = "alp_id")
    private java.util.UUID alpId;

    @Column(name = "block_reason", columnDefinition = "TEXT")
    private String blockReason;

    @NotNull
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}