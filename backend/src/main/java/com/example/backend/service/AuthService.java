package com.example.backend.service;

import com.example.backend.dto.AuthResponse;
import com.example.backend.repository.ReservationRepository;
import org.springframework.transaction.annotation.Transactional;
import com.example.backend.dto.ForgotPasswordRequest;
import com.example.backend.dto.LoginRequest;
import com.example.backend.dto.RegisterRequest;
import com.example.backend.dto.ResetPasswordRequest;
import com.example.backend.dto.UserDto;
import com.example.backend.entity.PasswordResetToken;
import com.example.backend.entity.User;
import com.example.backend.entity.VerificationToken;
import com.example.backend.exception.AccountSuspendedException;
import com.example.backend.exception.EmailAlreadyUsedException;
import com.example.backend.mapper.UserMapper;
import com.example.backend.repository.PasswordResetTokenRepository;
import com.example.backend.repository.UserRepository;
import com.example.backend.repository.VerificationTokenRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.Map;
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
    private final ReservationRepository reservationRepository;
    // ← CustomerRepository supprimé

    private static final long EXPIRATION_TIME_MINUTES = 15;

    public User register(RegisterRequest request) {
        String email = request.getEmail();
        String rawPassword = request.getPassword();

        if (userRepository.findByEmail(email).isPresent()) {
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

        String otpCode = UUID.randomUUID().toString();
        Instant expiryDate = Instant.now().plus(EXPIRATION_TIME_MINUTES, ChronoUnit.MINUTES);

        VerificationToken token = new VerificationToken();
        token.setToken(otpCode);
        token.setExpiryDate(expiryDate);
        token.setUser(savedUser);

        verificationTokenRepository.deleteByUser(savedUser);
        verificationTokenRepository.save(token);

        emailService.sendVerificationEmail(savedUser.getEmail(), otpCode);

        return savedUser;
    }

    public AuthResponse login(LoginRequest request) {
        String email = request.getEmail();
        String rawPassword = request.getPassword();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Email ou mot de passe incorrect."));

        if (!passwordEncoder.matches(rawPassword, user.getPassword())) {
            throw new IllegalArgumentException("Email ou mot de passe incorrect.");
        }

        if (user.getStatus() == User.Status.SUPPRIME || user.getStatus() == User.Status.EN_CREATION) {
            if (user.getStatus() == User.Status.EN_CREATION) {
                throw new IllegalStateException("Votre compte n'est pas encore vérifié.");
            }
            throw new IllegalStateException("Email ou mot de passe incorrect.");
        }
        // SUSPENDU : on laisse la connexion réussir, le frontend affiche le modal de blocage avec le chat

        String token = jwtService.generateToken(user.getEmail());
        return AuthResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .user(userMapper.toDto(user))
                .build();
    }

    public void forgotPassword(ForgotPasswordRequest request) {
        User user = userRepository.findByEmail(request.getEmail()).orElse(null);
        if (user != null) {
            tokenRepository.deleteAllByUser(user);
            String tokenValue = UUID.randomUUID().toString();
            Instant expiresAt = Instant.now().plus(EXPIRATION_TIME_MINUTES, ChronoUnit.MINUTES);
            PasswordResetToken resetToken = new PasswordResetToken();
            resetToken.setToken(tokenValue);
            resetToken.setExpiresAt(expiresAt);
            resetToken.setUser(user);
            tokenRepository.save(resetToken);
            emailService.sendPasswordResetEmail(user.getEmail(), tokenValue);
        }
    }

    public void resetPassword(ResetPasswordRequest request) {
        PasswordResetToken resetToken = tokenRepository.findByToken(request.getToken())
                .orElseThrow(() -> new IllegalArgumentException("Jeton invalide ou non trouvé."));
        if (resetToken.getExpiresAt().isBefore(Instant.now())) {
            tokenRepository.delete(resetToken);
            throw new IllegalArgumentException("Le jeton a expiré.");
        }
        User user = resetToken.getUser();
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
        tokenRepository.delete(resetToken);
    }

    public UserDto currentUserDto() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getName() == null) {
            throw new IllegalStateException("Utilisateur non authentifié");
        }
        User user = userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new IllegalArgumentException("Utilisateur introuvable"));
        return userMapper.toDto(user);
    }

    public UserDto toDto(User u) {
        return userMapper.toDto(u);
    }

    public void verifyEmail(String tokenValue) {
        VerificationToken token = verificationTokenRepository.findByToken(tokenValue)
                .orElseThrow(() -> new IllegalArgumentException("Token de vérification invalide."));
        if (token.getExpiryDate().isBefore(Instant.now())) {
            verificationTokenRepository.delete(token);
            throw new IllegalArgumentException("Le lien de vérification a expiré.");
        }
        User user = token.getUser();
        user.setStatus(User.Status.ACTIF);
        userRepository.save(user);
        verificationTokenRepository.delete(token);
    }

    public void resendVerificationEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Utilisateur introuvable."));
        if (user.getStatus() == User.Status.ACTIF) {
            throw new IllegalStateException("Votre compte est déjà vérifié.");
        }
        String otpCode = UUID.randomUUID().toString();
        Instant expiryDate = Instant.now().plus(EXPIRATION_TIME_MINUTES, ChronoUnit.MINUTES);
        VerificationToken token = new VerificationToken();
        token.setToken(otpCode);
        token.setExpiryDate(expiryDate);
        token.setUser(user);
        verificationTokenRepository.deleteByUser(user);
        verificationTokenRepository.save(token);
        emailService.sendVerificationEmail(user.getEmail(), otpCode);
    }

    @Transactional
    public void deleteCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getName() == null) {
            throw new IllegalStateException("Utilisateur non authentifié");
        }
        User user = userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new IllegalArgumentException("Utilisateur introuvable pour suppression"));

        // Vérification des réservations directement sur User
        boolean hasAnyReservation = reservationRepository.existsByUserId(user.getId()); // ← existsByCustomerId → existsByUserId

        if (hasAnyReservation) {
            throw new IllegalStateException("Le compte est lié à une ou plusieurs réservations. Supprimez-les d'abord.");
        }

        // Plus de customerRepository.deleteByUserId — suppression directe
        userRepository.delete(user);
    }

    public User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @Transactional
    public AuthResponse loginOrRegisterWithGoogle(String accessToken) {
        // 1. Récupérer les infos utilisateur depuis Google
        RestTemplate restTemplate = new RestTemplate();
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + accessToken);
        HttpEntity<Void> entity = new HttpEntity<>(headers);

        ResponseEntity<Map> response = restTemplate.exchange(
                "https://www.googleapis.com/oauth2/v3/userinfo",
                HttpMethod.GET, entity, Map.class
        );

        Map<String, Object> googleUser = response.getBody();
        if (googleUser == null || googleUser.containsKey("error")) {
            throw new IllegalArgumentException("Token Google invalide.");
        }

        String email    = (String) googleUser.get("email");
        String sub      = (String) googleUser.get("sub");
        String firstname = (String) googleUser.getOrDefault("given_name", "");
        String lastname  = (String) googleUser.getOrDefault("family_name", "");
        String picture   = (String) googleUser.get("picture");

        // 2. Trouver ou créer l'utilisateur
        User user = userRepository.findByEmail(email).orElse(null);

        if (user == null) {
            user = new User();
            user.setEmail(email);
            user.setPassword(passwordEncoder.encode(UUID.randomUUID().toString()));
            user.setStatus(User.Status.ACTIF);
            user.setProvider("GOOGLE");
            user.setProviderId(sub);
            user.setFirstname(firstname);
            user.setLastname(lastname);
            user.setProfilPhoto(picture);
            user.setRoles("USER");
            user.setCreatedAt(LocalDateTime.now());
            user = userRepository.save(user);
        } else {
            if (user.getStatus() == User.Status.SUPPRIME || user.getStatus() == User.Status.SUSPENDU) {
                throw new IllegalStateException("Compte suspendu ou supprimé.");
            }
            // Auto-vérifier si compte en attente de vérification
            if (user.getStatus() == User.Status.EN_CREATION) {
                user.setStatus(User.Status.ACTIF);
            }
            // Lier le compte Google si pas encore fait
            if (user.getProviderId() == null) {
                user.setProvider("GOOGLE");
                user.setProviderId(sub);
            }
            user = userRepository.save(user);
        }

        String token = jwtService.generateToken(user.getEmail());
        return AuthResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .user(userMapper.toDto(user))
                .build();
    }
}