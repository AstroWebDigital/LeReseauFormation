package com.example.backend.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.time.OffsetDateTime;
import java.util.UUID;

@Getter
@Setter
@Entity
@Table(name = "journal_action")
public class JournalAction {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "id", nullable = false)
    private UUID id;

    @Size(max = 50)
    @NotNull
    @Column(name = "entite", nullable = false, length = 50)
    private String entite;

    @NotNull
    @Column(name = "entite_id", nullable = false)
    private UUID entiteId;

    @NotNull
    @Column(name = "action", nullable = false, length = Integer.MAX_VALUE)
    private String action;

    @NotNull
    @Column(name = "date_action", nullable = false)
    private OffsetDateTime dateAction;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @NotNull
    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;

}