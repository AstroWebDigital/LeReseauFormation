package com.example.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CreateAlpRequest {

    @NotBlank(message = "Le prénom est obligatoire")
    private String firstname;

    @NotBlank(message = "Le nom est obligatoire")
    private String lastname;

    @NotBlank(message = "L'email est obligatoire")
    @Email(message = "Email invalide")
    private String email;

    private String phone;
    private String sector;

    /** "ALP" ou "ARC" — défaut ALP */
    private String role = "ALP";

    /** Requis si role = ARC : UUID de l'ALP référent */
    private String alpId;
}
