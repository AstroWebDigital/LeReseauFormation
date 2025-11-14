package com.example.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class RegisterRequest {
    @NotBlank @Size(max = 100)
    private String firstname;

    @NotBlank @Size(max = 100)
    private String lastname;

    @Size(max = 30)
    private String phone;

    @Email @NotBlank @Size(max = 255)
    private String email;

    @NotBlank @Size(min = 8, max = 255)
    private String password;

    @Size(max = 100)
    private String sector; // optionnel
}
