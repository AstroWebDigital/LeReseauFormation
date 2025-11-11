package com.example.backend.service;

import com.example.backend.dto.RegisterRequest;
import com.example.backend.entity.User;
import com.example.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    /**
     * Méthode déjà utilisée par AuthService avant refacto.
     * On la garde pour compatibilité.
     */
    @Transactional
    public User registerLocalUser(RegisterRequest request) {
        return register(request); // on délègue à la nouvelle méthode générique
    }

    /**
     * Nouvelle méthode générique de création de user LOCAL.
     * Utilisable ailleurs si besoin.
     */
    @Transactional
    public User register(RegisterRequest request) {
        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .provider("LOCAL")
                .roles("ROLE_USER")
                .firstname(request.getFirstname())
                .lastname(request.getLastname())
                .phone(request.getPhone())
                .sector(request.getSector())
                .profilPhoto(request.getProfilPhoto())
                // status, createdAt, updatedAt gérés par @PrePersist dans User
                .build();

        return userRepository.save(user);
    }

    public User getByEmailOrThrow(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found with email: " + email));
    }
}
