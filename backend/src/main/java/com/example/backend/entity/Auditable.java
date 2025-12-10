package com.example.backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime; // ⬅️ CHANGEMENT ICI

@MappedSuperclass
@Getter
@Setter
public abstract class Auditable {

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt; // ⬅️ CHANGEMENT ICI

    @Column(name = "updated_at")
    private LocalDateTime updatedAt; // ⬅️ CHANGEMENT ICI

    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now(); // ⬅️ CHANGEMENT ICI
        this.createdAt = now;
        this.updatedAt = now;
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now(); // ⬅️ CHANGEMENT ICI
    }
}