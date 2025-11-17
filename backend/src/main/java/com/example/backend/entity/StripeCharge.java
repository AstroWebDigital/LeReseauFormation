package com.example.backend.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.ColumnDefault;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Getter
@Setter
@Entity
@Table(name = "stripe_charge")
public class StripeCharge {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "id", nullable = false)
    private UUID id;

    @Size(max = 50)
    @NotNull
    @Column(name = "capture_status", nullable = false, length = 50)
    private String captureStatus;

    @Column(name = "amount_authorized", precision = 10, scale = 2)
    private BigDecimal amountAuthorized;

    @Column(name = "amount_captured", precision = 10, scale = 2)
    private BigDecimal amountCaptured;

    @Column(name = "amount_refunded", precision = 10, scale = 2)
    private BigDecimal amountRefunded;

    @NotNull
    @ColumnDefault("false")
    @Column(name = "is_security", nullable = false)
    private Boolean isSecurity = false;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "reservation_id", nullable = false)
    private Reservation reservation;

    @NotNull
    @ColumnDefault("now()")
    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;

}