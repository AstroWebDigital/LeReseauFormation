package com.example.backend.mapper;

import com.example.backend.dto.UserDto;
import com.example.backend.entity.User;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class UserMapper {

    @Value("${app.public-base-url}")
    private String publicBaseUrl;

    // ← CustomerMapper supprimé

    public UserDto toDto(User u) {
        if (u == null) return null;

        return UserDto.builder()
                .id(u.getId() != null ? u.getId().toString() : null)
                .email(u.getEmail())
                .roles(u.getRoles())
                .firstname(u.getFirstname())
                .lastname(u.getLastname())
                .phone(u.getPhone())
                .sector(u.getSector())
                .profilPhoto(toAbsolute(u.getProfilPhoto()))
                .status(u.getStatus() != null ? u.getStatus().name() : null)
                .provider(u.getProvider())
                .providerId(u.getProviderId())
                .createdAt(u.getCreatedAt() != null ? u.getCreatedAt().toString() : null)
                .updatedAt(u.getUpdatedAt() != null ? u.getUpdatedAt().toString() : null)
                .build();
    }

    private String toAbsolute(String path) {
        if (path == null || path.isBlank()) return null;
        if (path.startsWith("http://") || path.startsWith("https://")) return path;
        String base = publicBaseUrl != null ? publicBaseUrl.replaceAll("/+$", "") : "";
        String rel  = path.startsWith("/") ? path : ("/" + path);
        return base + rel;
    }
}