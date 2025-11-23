// com/example/backend/service/AuthService.java
package com.example.backend.service;

import com.example.backend.dto.AuthResponse;
import com.example.backend.dto.ForgotPasswordRequest;
import com.example.backend.dto.LoginRequest;
import com.example.backend.dto.RegisterRequest;
import com.example.backend.dto.ResetPasswordRequest;
import com.example.backend.dto.UserDto;
import com.example.backend.entity.PasswordResetToken;
import com.example.backend.entity.User;
import com.example.backend.entity.VerificationToken;
import com.example.backend.exception.EmailAlreadyUsedException;
import com.example.backend.mapper.UserMapper;
import com.example.backend.repository.PasswordResetTokenRepository;
import com.example.backend.repository.UserRepository;
import com.example.backend.repository.VerificationTokenRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.UUID;

@RequiredArgsConstructor
@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager; // actuellement non utilisé mais laissé pour évolution
    private final UserMapper userMapper;
    private final EmailService emailService;
    private final PasswordResetTokenRepository tokenRepository;
    private final VerificationTokenRepository verificationTokenRepository;

    private static final long EXPIRATION_TIME_MINUTES = 15; // 15 minutes

    /**
     * Inscription avec envoi d’un email de vérification.
     */
    public User register(RegisterRequest request) {
        String email = request.getEmail();
        String rawPassword = request.getPassword();

        // Vérification de l’unicité de l’email
        if (userRepository.findByEmail(email).isPresent()) {
            // Utilise l’exception métier pour être interceptée par EmailAlreadyUsedException handler
            throw new EmailAlreadyUsedException("Email déjà utilisé.");
        }

        User u = new User();
        u.setEmail(email);
        u.setPassword(passwordEncoder.encode(rawPassword));
        u.setStatus(User.Status.valueOf("EN_CREATION"));
        u.setProvider("LOCAL");

        try { u.setFirstname(request.getFirstname()); } catch (Exception ignored) {}
        try { u.setLastname(request.getLastname()); } catch (Exception ignored) {}
        try { u.setPhone(request.getPhone()); } catch (Exception ignored) {}
        try { u.setSector(request.getSector()); } catch (Exception ignored) {}

        User savedUser = userRepository.save(u);

        // 1. Génération et enregistrement du token de vérification
        String otpCode = UUID.randomUUID().toString();
        Instant expiryDate = Instant.now().plus(EXPIRATION_TIME_MINUTES, ChronoUnit.MINUTES);

        VerificationToken token = new VerificationToken();
        token.setToken(otpCode);
        token.setExpiryDate(expiryDate);
        token.setUser(savedUser);

        // Suppression des anciens tokens pour cet utilisateur
        verificationTokenRepository.deleteByUser(savedUser);
        verificationTokenRepository.save(token);

        // 2. Envoi de l'email de vérification
        emailService.sendVerificationEmail(savedUser.getEmail(), otpCode);

        return savedUser;
    }

    /**
     * Login classique : email + mot de passe + vérification du statut.
     * En cas de problème :
     *  - IllegalArgumentException("Email ou mot de passe incorrect.")
     *  - IllegalStateException("Votre compte n'est pas encore vérifié.")
     * Ces exceptions sont interceptées par GlobalExceptionHandler.
     */
    public AuthResponse login(LoginRequest request) {
        String email = request.getEmail();
        String rawPassword = request.getPassword();

        // 1. On récupère l'utilisateur
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Email ou mot de passe incorrect."));

        // 🧪 LOG DEBUG : email + status + provider
        System.out.println("[LOGIN] Tentative de connexion pour " + email
                + " | status=" + user.getStatus()
                + " | provider=" + user.getProvider());

        // 2. On vérifie le mot de passe avec le PasswordEncoder
        if (!passwordEncoder.matches(rawPassword, user.getPassword())) {
            // 🧪 LOG DEBUG
            System.out.println("[LOGIN] Mot de passe invalide pour " + email);
            throw new IllegalArgumentException("Email ou mot de passe incorrect.");
        }

        // 3. On vérifie le statut (vérification e-mail)
        if (user.getStatus() == User.Status.SUPPRIME || user.getStatus() == User.Status.SUSPENDU) {
            String msg = "Votre compte est " + user.getStatus() + " et ne peut pas se connecter.";
            System.out.println("[LOGIN] Refus connexion: " + msg + " pour " + email);
            throw new IllegalStateException(msg);
        }

        // 4. Tout est bon → on génère le JWT
        String token = jwtService.generateToken(user.getEmail());
        return AuthResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .user(userMapper.toDto(user))
                .build();
    }


    /**
     * Génère un jeton de réinitialisation et l'enregistre dans la table dédiée.
     * (Actuellement non appelée par le contrôleur, remplacée par PasswordResetService,
     * mais on la laisse fonctionnelle pour future réutilisation ou tests.)
     */
    public void forgotPassword(ForgotPasswordRequest request) {
        User user = userRepository.findByEmail(request.getEmail()).orElse(null);

        if (user != null) {
            tokenRepository.deleteAllByUser(user);

            String tokenValue = UUID.randomUUID().toString();
            Instant expiresAt = Instant.now().plus(EXPIRATION_TIME_MINUTES, ChronoUnit.MINUTES);

            PasswordResetToken resetToken = new PasswordResetToken();
            resetToken.setToken(tokenValue);
            resetToken.setExpiresAt(expiresAt);   // ✅
            resetToken.setUser(user);

            tokenRepository.save(resetToken);

            emailService.sendPasswordResetEmail(user.getEmail(), tokenValue); // ✅
        }
    }


    /**
     * Vérifie le jeton et met à jour le mot de passe de l'utilisateur.
     * (Idem, doublon logique avec PasswordResetService, mais rendu cohérent.)
     */
    public void resetPassword(ResetPasswordRequest request) {
        PasswordResetToken resetToken = tokenRepository.findByToken(request.getToken())
                .orElseThrow(() -> new IllegalArgumentException("Jeton invalide ou non trouvé."));

        if (resetToken.getExpiresAt().isBefore(Instant.now())) { // ✅
            tokenRepository.delete(resetToken);
            throw new IllegalArgumentException("Le jeton a expiré.");
        }

        User user = resetToken.getUser();
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        tokenRepository.delete(resetToken);
    }


    /**
     * Retourne le UserDto correspondant à l’utilisateur actuellement authentifié.
     */
    public UserDto currentUserDto() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getName() == null) {
            throw new IllegalStateException("Utilisateur non authentifié");
        }
        String email = auth.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Utilisateur introuvable"));

        return userMapper.toDto(user);
    }

    public UserDto toDto(User u) {
        return userMapper.toDto(u);
    }

    /**
     * Vérifie le token de vérification et active le compte.
     */
    public void verifyEmail(String tokenValue) {
        // 1. Récupérer le token
        VerificationToken token = verificationTokenRepository.findByToken(tokenValue)
                .orElseThrow(() -> new IllegalArgumentException("Token de vérification invalide."));

        // 2. Vérifier l'expiration
        if (token.getExpiryDate().isBefore(Instant.now())) {
            verificationTokenRepository.delete(token);
            throw new IllegalArgumentException("Le lien de vérification a expiré.");
        }

        // 3. Marquer l'utilisateur comme "ACTIF"
        User user = token.getUser();
        user.setStatus(User.Status.ACTIF);
        userRepository.save(user);

        // 4. Nettoyer le token
        verificationTokenRepository.delete(token);
    }

    public void resendVerificationEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Utilisateur introuvable."));

        // Si déjà actif, on ne renvoie pas
        if (user.getStatus() == User.Status.ACTIF) {
            throw new IllegalStateException("Votre compte est déjà vérifié.");
        }

        // Génération du token (même logique que dans register)
        String otpCode = UUID.randomUUID().toString();
        Instant expiryDate = Instant.now().plus(EXPIRATION_TIME_MINUTES, ChronoUnit.MINUTES);

        VerificationToken token = new VerificationToken();
        token.setToken(otpCode);
        token.setExpiryDate(expiryDate);
        token.setUser(user);

        // Nettoyage des anciens tokens
        verificationTokenRepository.deleteByUser(user);
        verificationTokenRepository.save(token);

        // Envoi de l'email
        emailService.sendVerificationEmail(user.getEmail(), otpCode);
    }


}