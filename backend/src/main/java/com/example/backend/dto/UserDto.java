package com.example.backend.dto;

import lombok.Builder;
import lombok.Data;

import java.util.UUID;

@Data
@Builder
public class UserDto {

    private UUID id;
    private String email;
    private String roles;

    private String firstname;
    private String lastname;
    private String phone;
    private String profilPhoto;
    private String sector;
    private String status; // String pour rester simple côté front
}
