// src/main/java/com/example/backend/service/PasswordResetService.java
package com.example.backend.service;

import com.example.backend.dto.ForgotPasswordRequest;
import com.example.backend.dto.ResetPasswordRequest;
import com.example.backend.entity.PasswordResetToken;
import com.example.backend.entity.User;
import com.example.backend.repository.PasswordResetTokenRepository;
import com.example.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PasswordResetService {

    private final UserRepository userRepository;
    private final PasswordResetTokenRepository tokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    private static final long EXPIRATION_TIME_MINUTES = 15;

    /**
     * Envoie un lien de reset si :
     *  - l'email existe
     *  - le compte est ACTIF (donc vérifié)
     */
    public void sendResetLink(ForgotPasswordRequest request) {
        userRepository.findByEmail(request.getEmail()).ifPresent(user -> {
            if (user.getStatus() != User.Status.ACTIF) {
                // ⚠ utilisé dans AuthController pour renvoyer un 400 lisible
                throw new IllegalStateException(
                        "Votre compte doit être vérifié avant de réinitialiser le mot de passe."
                );
            }

            // Nettoyage des anciens tokens
            tokenRepository.deleteAllByUser(user);

            String tokenValue = UUID.randomUUID().toString();
            Instant expiresAt = Instant.now()
                    .plus(EXPIRATION_TIME_MINUTES, ChronoUnit.MINUTES);

            PasswordResetToken token = PasswordResetToken.builder()
                    .token(tokenValue)
                    .user(user)
                    .expiresAt(expiresAt)
                    .used(false)
                    .build();

            tokenRepository.save(token);

            // ✅ EmailService construit lui-même le lien avec APP_PUBLIC_BASE_URL
            emailService.sendPasswordResetEmail(user.getEmail(), tokenValue);
        });
    }

    /**
     * Vérifie le token et met à jour le mot de passe.
     */
    public void resetPassword(ResetPasswordRequest request) {
        PasswordResetToken token = tokenRepository.findByToken(request.getToken())
                .orElseThrow(() ->
                        new IllegalArgumentException("Lien de réinitialisation invalide ou expiré.")
                );

        if (token.isExpired() || token.isUsed()) {
            throw new IllegalArgumentException("Lien de réinitialisation invalide ou expiré.");
        }

        User user = token.getUser();
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        token.setUsed(true);
        tokenRepository.save(token);
    }
}
