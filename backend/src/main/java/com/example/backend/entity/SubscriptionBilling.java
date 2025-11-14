package com.example.backend.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "subscription_billing")
public class SubscriptionBilling {

    //TODO [Reverse Engineering] generate columns from DB
}