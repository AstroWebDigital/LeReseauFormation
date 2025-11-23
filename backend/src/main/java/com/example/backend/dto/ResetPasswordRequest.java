// backend/src/main/java/com/example/backend/dto/ResetPasswordRequest.java
package com.example.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ResetPasswordRequest {

    @NotBlank
    private String token;

    @NotBlank
    @Size(min = 8, max = 100, message = "Le mot de passe doit contenir entre 8 et 100 caractères.")
    @Pattern(
            regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).*$",
            message = "Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre."
    )
    private String newPassword;
}
