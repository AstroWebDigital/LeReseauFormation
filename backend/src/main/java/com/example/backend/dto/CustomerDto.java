package com.example.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor // Nécessaire pour @Builder
public class CustomerDto {
    private String id;
    // Ajoute ici les autres champs nécessaires (ex: companyName, address...)
}