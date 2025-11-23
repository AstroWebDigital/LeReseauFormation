// backend/src/main/java/com/example/backend/dto/ForgotPasswordRequest.java
package com.example.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ForgotPasswordRequest {

    @NotBlank
    @Email
    private String email;
}
