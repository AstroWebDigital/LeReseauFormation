package com.example.backend.service;

import com.example.backend.dto.AuthResponse;
import com.example.backend.dto.LoginRequest;
import com.example.backend.dto.RegisterRequest;
import com.example.backend.dto.UserDto;
import com.example.backend.entity.User;
import com.example.backend.mapper.UserMapper;          // ⬅️ IMPORT IMPORTANT
import com.example.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@RequiredArgsConstructor
@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final UserMapper userMapper;              // ⬅️ INJECTÉ PAR LOMBOK

    /** ========= Register ========= */
    public User register(RegisterRequest request) {
        String email = request.getEmail();
        String rawPassword = request.getPassword();

        if (userRepository.findByEmail(email).isPresent()) {
            throw new IllegalArgumentException("Email déjà utilisé");
        }

        User u = new User();
        u.setEmail(email);
        u.setPassword(passwordEncoder.encode(rawPassword));
        u.setProvider("LOCAL");
        try { u.setFirstname(request.getFirstname()); } catch (Exception ignored) {}
        try { u.setLastname(request.getLastname()); } catch (Exception ignored) {}
        try { u.setPhone(request.getPhone()); } catch (Exception ignored) {}
        try { u.setSector(request.getSector()); } catch (Exception ignored) {}

        return userRepository.save(u);
    }

    /** ========= Login ========= */
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

    /** ========= Current user (DTO) ========= */
    public UserDto currentUserDto() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getName() == null) {
            throw new IllegalStateException("Utilisateur non authentifié");
        }
        String email = auth.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Utilisateur introuvable"));

        // ⬇️ On utilise maintenant le UserMapper, qui met l’URL de profilPhoto en absolu
        return userMapper.toDto(user);
    }

    /** ========= Mapping Entity -> DTO (via UserMapper) ========= */
    public UserDto toDto(User u) {
        return userMapper.toDto(u);
    }
}
