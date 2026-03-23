package com.example.backend.entity;

import com.example.backend.validation.OnCreate;
import com.example.backend.validation.OnUpdate;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Null;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.ColumnDefault;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.LinkedHashSet;
import java.util.Set;
import java.util.UUID;

@Getter
@Setter
@Entity
@Table(name = "vehicle")
public class Vehicle extends Auditable {

    @Id
    @ColumnDefault("gen_random_uuid()")
    @Column(name = "id", nullable = false)
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private UUID id;

    @Size(max = 255)
    @NotNull
    @Column(name = "brand", nullable = false)
    private String brand;

    @Size(max = 255)
    @NotNull
    @Column(name = "model", nullable = false)
    private String model;

    @Size(max = 255)
    @NotNull
    @Column(name = "license_plate", nullable = false)
    private String plateNumber;

    @Size(max = 50)
    @NotNull
    @Column(name = "type", nullable = false, length = 50)
    private String type;

    @Size(max = 50)
    @NotNull
    @Column(name = "fuel", nullable = false, length = 50)
    private String fuel;

    @Size(max = 50)
    @NotNull
    @Column(name = "transmission", nullable = false, length = 50)
    private String transmission;

    @Size(max = 50)
    @NotNull
    @Column(name = "status", nullable = false, length = 50)
    private String status;

    @NotNull
    @Column(name = "base_daily_price", nullable = false, precision = 10, scale = 2)
    private BigDecimal baseDailyPrice;

    @NotNull
    @Column(name = "listing_date", nullable = false)
    private LocalDate listingDate;

    @NotNull
    @Column(name = "mileage", nullable = false)
    private Integer mileage;

    @Column(name = "last_maintenance_date")
    private LocalDate lastMaintenanceDate;

    @Size(max = 255)
    @Column(name = "default_parking_location")
    private String defaultParkingLocation;

    @JsonIgnore
    @NotNull(groups = OnUpdate.class)
    @Null(groups = OnCreate.class)
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)  // ← alp_id → user_id
    private User user;  // ← Alp → User

    @JsonIgnore
    @OneToMany(mappedBy = "vehicle")
    private Set<ComplianceBlock> complianceBlocks = new LinkedHashSet<>();

    @JsonIgnore
    @OneToMany(mappedBy = "vehicle")
    private Set<Document> documents = new LinkedHashSet<>();

    @JsonIgnore
    @OneToMany(mappedBy = "vehicle")
    private Set<Maintenance> maintenances = new LinkedHashSet<>();

    @JsonIgnore
    @OneToMany(mappedBy = "vehicle")
    private Set<PricingRule> pricingRules = new LinkedHashSet<>();

    @JsonIgnore
    @OneToMany(mappedBy = "vehicle")
    private Set<Unavailability> unavailabilities = new LinkedHashSet<>();
}