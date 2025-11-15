package com.example.backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "subscription_billing")
public class SubscriptionBilling {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(name = "plan_name", nullable = false, length = 100)
  private String planName;

  @Column(name = "price_ht", nullable = false)
  private Double priceHt;

  @Column(name = "billing_period", nullable = false, length = 20)
  private String billingPeriod; // MONTHLY, YEARLY...

  // etc.
}