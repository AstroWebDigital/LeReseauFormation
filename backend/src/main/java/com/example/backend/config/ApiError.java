package com.example.backend.config;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ApiError {
    private int status;
    private String error;
    private String message;
    private String path;
    private String timestamp; // ISO8601 en string, ou Instant si tu préfères
}
