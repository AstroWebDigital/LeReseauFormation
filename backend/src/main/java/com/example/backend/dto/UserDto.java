package com.example.backend.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class UserDto {
    private String id;          // adapte le type si UUID/Long
    private String email;
    private String roles;       // ou List<String> selon ton modèle
    private String firstname;
    private String lastname;
    private String phone;
    private String sector;
    private String profilPhoto;
    private String status;      // on met une String (enum->String via toDto)
}
