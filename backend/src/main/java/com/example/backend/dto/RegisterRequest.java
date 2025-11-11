package com.example.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class RegisterRequest {

    @Email
    @NotBlank
    private String email;

    @NotBlank
    private String password;

    private String firstname;
    private String lastname;
    private String phone;
    private String sector;
    private String profilPhoto;
}
