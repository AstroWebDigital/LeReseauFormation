package com.example.backend.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class UserDto {
    private String id;
    private String email;
    private String roles;
    private String firstname;
    private String lastname;
    private String phone;
    private String profilPhoto;
    private String status;          // ACTIF / SUSPENDU / SUPPRIME
    private String sector;
    private String provider;        // LOCAL / GOOGLE / KEYCLOAK...
    private String providerId;
    private String createdAt;
    private String updatedAt;
    private CustomerDto customer;
    private boolean mustChangePassword;
    private String alpId;
    private String blockReason;
}
