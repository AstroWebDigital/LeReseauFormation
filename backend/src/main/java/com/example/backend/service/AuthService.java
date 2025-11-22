package com.example.backend.service;

import com.example.backend.dto.AuthResponse;
import com.example.backend.dto.LoginRequest;
import com.example.backend.dto.RegisterRequest;
import com.example.backend.dto.UserDto;
import com.example.backend.dto.ForgotPasswordRequest;
import com.example.backend.dto.ResetPasswordRequest;
import com.example.backend.entity.PasswordResetToken; // NOUVEAU IMPORT
import com.example.backend.entity.User;
import com.example.backend.entity.VerificationToken;
import com.example.backend.mapper.UserMapper;
import com.example.backend.repository.PasswordResetTokenRepository; // NOUVEAU IMPORT
import com.example.backend.repository.UserRepository;
import com.example.backend.repository.VerificationTokenRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
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
    private final AuthenticationManager authenticationManager;
    private final UserMapper userMapper;
    private final EmailService emailService;
    private final PasswordResetTokenRepository tokenRepository;
    private final VerificationTokenRepository verificationTokenRepository;


    private static final long EXPIRATION_TIME_MINUTES = 15; // 15 minutes

    public User register(RegisterRequest request) {
        String email = request.getEmail();
        String rawPassword = request.getPassword();

        if (userRepository.findByEmail(email).isPresent()) {
            throw new IllegalArgumentException("Email déjà utilisé");
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

        // 1. Génération et enregistrement de l'OTP
        String otpCode = UUID.randomUUID().toString();
        Instant expiryDate = Instant.now().plus(EXPIRATION_TIME_MINUTES, ChronoUnit.MINUTES);

        VerificationToken token = new VerificationToken();
        token.setToken(otpCode);
        token.setExpiryDate(expiryDate);
        token.setUser(savedUser);

        // Suppression de tout ancien jeton de vérification pour cet utilisateur
        verificationTokenRepository.deleteByUser(savedUser);
        verificationTokenRepository.save(token);

        // 2. Envoi de l'email de vérification
        emailService.sendVerificationEmail(savedUser.getEmail(), otpCode);

        return savedUser;
    }

    public AuthResponse login(LoginRequest request) {
        String email = request.getEmail();
        String rawPassword = request.getPassword();

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(email, rawPassword)
        );

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Utilisateur introuvable"));

        String token = jwtService.generateToken(user.getEmail());
        return AuthResponse.builder()
                .token(token)
                .build();
    }

    /**
     * Génère un jeton de réinitialisation et l'enregistre dans la table dédiée.
     */
    public void forgotPassword(ForgotPasswordRequest request) {
        User user = userRepository.findByEmail(request.getEmail()).orElse(null);

        if (user != null) {
            tokenRepository.deleteAllByUser(user);

            String tokenValue = UUID.randomUUID().toString();
            Instant expiryDate = Instant.now().plus(EXPIRATION_TIME_MINUTES, ChronoUnit.MINUTES);

            PasswordResetToken resetToken = new PasswordResetToken();
            resetToken.setToken(tokenValue);
            resetToken.setExpiryDate(expiryDate);
            resetToken.setUser(user);

            tokenRepository.save(resetToken);

            emailService.sendPasswordResetEmail(user.getEmail(), tokenValue);
        }
    }

    /**
     * Vérifie le jeton et met à jour le mot de passe de l'utilisateur.
     */
    public void resetPassword(ResetPasswordRequest request) {

        // 1. Recherche du jeton dans la table dédiée
        PasswordResetToken resetToken = tokenRepository.findByToken(request.getToken())
                .orElseThrow(() -> new IllegalArgumentException("Jeton invalide ou non trouvé."));

        // 2. Vérification de l'expiration du jeton
        if (resetToken.getExpiryDate().isBefore(Instant.now())) {
            // Nettoyage et erreur
            tokenRepository.delete(resetToken);
            throw new IllegalArgumentException("Le jeton a expiré.");
        }

        // 3. Mise à jour du mot de passe de l'utilisateur
        User user = resetToken.getUser();
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        // 4. Suppression du jeton après utilisation réussie
        tokenRepository.delete(resetToken);
    }

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
}