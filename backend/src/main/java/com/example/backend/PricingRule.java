package com.example.backend;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.ColumnDefault;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

@Getter
@Setter
@Entity
@Table(name = "pricing_rule")
public class PricingRule {
    @Id
    @ColumnDefault("gen_random_uuid()")
    @Column(name = "id", nullable = false)
    private UUID id;

    @NotNull
    @Column(name = "start_period", nullable = false)
    private LocalDate startPeriod;

    @NotNull
    @Column(name = "end_period", nullable = false)
    private LocalDate endPeriod;

    @Size(max = 50)
    @NotNull
    @Column(name = "rule_type", nullable = false, length = 50)
    private String ruleType;

    @NotNull
    @Column(name = "daily_price", nullable = false, precision = 10, scale = 2)
    private BigDecimal dailyPrice;

    @NotNull
    @Column(name = "min_days", nullable = false)
    private Integer minDays;

    @ColumnDefault("0.0")
    @Column(name = "discount_percent", precision = 5, scale = 2)
    private BigDecimal discountPercent;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "vehicle_id", nullable = false)
    private Vehicle vehicle;

    @NotNull
    @ColumnDefault("now()")
    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;

}