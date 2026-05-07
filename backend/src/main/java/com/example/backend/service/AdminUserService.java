package com.example.backend.service;

import com.example.backend.dto.CreateAlpRequest;
import com.example.backend.dto.UserDto;
import com.example.backend.entity.User;
import com.example.backend.exception.EmailAlreadyUsedException;
import com.example.backend.mapper.UserMapper;
import com.example.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminUserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private final UserMapper userMapper;

    private static final String CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789@#$!";
    private static final SecureRandom RANDOM = new SecureRandom();

    @Transactional
    public UserDto createUser(CreateAlpRequest req) {
        if (userRepository.findByEmail(req.getEmail()).isPresent()) {
            throw new EmailAlreadyUsedException("Un compte existe déjà avec cet email.");
        }

        String role = req.getRole() != null ? req.getRole().toUpperCase() : "ALP";
        if (!"ALP".equals(role) && !"ARC".equals(role)) {
            throw new IllegalArgumentException("Rôle invalide : " + role);
        }

        UUID alpId = null;
        User alpUser = null;
        if ("ARC".equals(role)) {
            if (req.getAlpId() == null || req.getAlpId().isBlank()) {
                throw new IllegalArgumentException("Un ARC doit être rattaché à un ALP.");
            }
            alpUser = userRepository.findById(UUID.fromString(req.getAlpId()))
                    .orElseThrow(() -> new IllegalArgumentException("ALP introuvable."));
            if (!"ALP".equals(alpUser.getRoles())) {
                throw new IllegalArgumentException("L'utilisateur sélectionné n'est pas un ALP.");
            }
            alpId = alpUser.getId();
        }

        String tempPassword = generateTempPassword();

        User user = new User();
        user.setEmail(req.getEmail());
        user.setFirstname(req.getFirstname());
        user.setLastname(req.getLastname());
        user.setPhone(req.getPhone());
        user.setSector(req.getSector());
        user.setPassword(passwordEncoder.encode(tempPassword));
        user.setRoles(role);
        user.setStatus(User.Status.ACTIF);
        user.setProvider("LOCAL");
        user.setMustChangePassword(true);
        user.setAlpId(alpId);
        user.setCreatedAt(java.time.LocalDateTime.now());
        user.setUpdatedAt(java.time.LocalDateTime.now());

        User saved = userRepository.save(user);

        try {
            emailService.sendAlpWelcomeEmail(saved, tempPassword, role, alpUser);
        } catch (Exception e) {
            System.err.println("Failed to send welcome email to " + saved.getEmail() + ": " + e.getMessage());
        }

        return userMapper.toDto(saved);
    }

    @Transactional(readOnly = true)
    public List<UserDto> listAlpAndArcUsers() {
        return userRepository.findAll().stream()
                .filter(u -> u.getRoles() != null &&
                        (u.getRoles().contains("ALP") || u.getRoles().contains("ARC")))
                .map(userMapper::toDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<UserDto> listAlpOnly() {
        return userRepository.findAll().stream()
                .filter(u -> "ALP".equals(u.getRoles()))
                .map(userMapper::toDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public UserDto transferArc(UUID arcId, UUID newAlpId) {
        User arc = userRepository.findById(arcId)
                .orElseThrow(() -> new IllegalArgumentException("ARC introuvable."));
        if (!"ARC".equals(arc.getRoles())) {
            throw new IllegalArgumentException("Cet utilisateur n'est pas un ARC.");
        }
        User newAlp = userRepository.findById(newAlpId)
                .orElseThrow(() -> new IllegalArgumentException("ALP introuvable."));
        if (!"ALP".equals(newAlp.getRoles())) {
            throw new IllegalArgumentException("L'utilisateur cible n'est pas un ALP.");
        }
        arc.setAlpId(newAlpId);
        arc.setUpdatedAt(java.time.LocalDateTime.now());
        return userMapper.toDto(userRepository.save(arc));
    }

    @Transactional
    public UserDto blockUser(UUID userId, String reason) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Utilisateur introuvable."));
        if ("ADMIN".equals(user.getRoles())) {
            throw new IllegalArgumentException("Impossible de bloquer un administrateur.");
        }
        user.setStatus(User.Status.SUSPENDU);
        user.setBlockReason(reason);
        user.setUpdatedAt(java.time.LocalDateTime.now());
        return userMapper.toDto(userRepository.save(user));
    }

    @Transactional
    public UserDto unblockUser(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Utilisateur introuvable."));
        user.setStatus(User.Status.ACTIF);
        user.setBlockReason(null);
        user.setUpdatedAt(java.time.LocalDateTime.now());
        return userMapper.toDto(userRepository.save(user));
    }

    private String generateTempPassword() {
        StringBuilder sb = new StringBuilder(12);
        for (int i = 0; i < 12; i++) {
            sb.append(CHARS.charAt(RANDOM.nextInt(CHARS.length())));
        }
        return sb.toString();
    }
}
