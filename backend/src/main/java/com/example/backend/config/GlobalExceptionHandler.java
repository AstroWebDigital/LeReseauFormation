// com/example/backend/config/GlobalExceptionHandler.java
package com.example.backend.config;

import com.example.backend.dto.ApiError;
import com.example.backend.exception.EmailAlreadyUsedException;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.Instant;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(EmailAlreadyUsedException.class)
    public ResponseEntity<ApiError> handleEmailAlreadyUsed(
            EmailAlreadyUsedException ex, HttpServletRequest req) {
        ApiError body = ApiError.builder()
                .timestamp(Instant.now())
                .status(HttpStatus.CONFLICT.value())
                .error(HttpStatus.CONFLICT.getReasonPhrase())
                .message(ex.getMessage())
                .path(req.getRequestURI())
                .build();
        return ResponseEntity.status(HttpStatus.CONFLICT).body(body);
    }

    // Filet de sécurité: si l’unique DB remonte quand même
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ApiError> handleDataIntegrity(
            DataIntegrityViolationException ex, HttpServletRequest req) {
        String msg = ex.getMostSpecificCause() != null
                ? ex.getMostSpecificCause().getMessage()
                : ex.getMessage();

        // Si c’est le unique key sur email → 409
        if (msg != null && msg.contains("user_email_key")) {
            ApiError body = ApiError.builder()
                    .timestamp(Instant.now())
                    .status(HttpStatus.CONFLICT.value())
                    .error(HttpStatus.CONFLICT.getReasonPhrase())
                    .message("Email already in use.")
                    .path(req.getRequestURI())
                    .build();
            return ResponseEntity.status(HttpStatus.CONFLICT).body(body);
        }

        // Sinon 400 générique
        ApiError body = ApiError.builder()
                .timestamp(Instant.now())
                .status(HttpStatus.BAD_REQUEST.value())
                .error(HttpStatus.BAD_REQUEST.getReasonPhrase())
                .message("Data integrity violation")
                .path(req.getRequestURI())
                .build();
        return ResponseEntity.badRequest().body(body);
    }
}
