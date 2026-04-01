package com.example.backend.service;

import com.example.backend.dto.UserDto;
import com.example.backend.entity.User;
import com.example.backend.mapper.UserMapper;
import com.example.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AlpTeamService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final AuthService authService;

    @Transactional(readOnly = true)
    public List<UserDto> getMyArcs() {
        User alp = authService.getCurrentUser();
        return userRepository.findAll().stream()
                .filter(u -> "ARC".equals(u.getRoles()) && alp.getId().equals(u.getAlpId()))
                .map(userMapper::toDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public UserDto blockArc(UUID arcId, String reason) {
        User alp = authService.getCurrentUser();
        User arc = userRepository.findById(arcId)
                .orElseThrow(() -> new IllegalArgumentException("ARC introuvable."));
        if (!"ARC".equals(arc.getRoles())) {
            throw new IllegalArgumentException("Cet utilisateur n'est pas un ARC.");
        }
        if (!alp.getId().equals(arc.getAlpId())) {
            throw new IllegalArgumentException("Vous n'êtes pas le référent de cet ARC.");
        }
        arc.setStatus(User.Status.SUSPENDU);
        arc.setBlockReason(reason);
        arc.setUpdatedAt(java.time.LocalDateTime.now());
        return userMapper.toDto(userRepository.save(arc));
    }

    @Transactional
    public UserDto unblockArc(UUID arcId) {
        User alp = authService.getCurrentUser();
        User arc = userRepository.findById(arcId)
                .orElseThrow(() -> new IllegalArgumentException("ARC introuvable."));
        if (!"ARC".equals(arc.getRoles())) {
            throw new IllegalArgumentException("Cet utilisateur n'est pas un ARC.");
        }
        if (!alp.getId().equals(arc.getAlpId())) {
            throw new IllegalArgumentException("Vous n'êtes pas le référent de cet ARC.");
        }
        arc.setStatus(User.Status.ACTIF);
        arc.setBlockReason(null);
        arc.setUpdatedAt(java.time.LocalDateTime.now());
        return userMapper.toDto(userRepository.save(arc));
    }
}
