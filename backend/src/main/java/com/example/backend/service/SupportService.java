package com.example.backend.service;

import com.example.backend.dto.SupportChannelDto;
import com.example.backend.entity.SupportChannel;
import com.example.backend.entity.SupportMessage;
import com.example.backend.entity.User;
import com.example.backend.repository.SupportChannelRepository;
import com.example.backend.repository.SupportMessageRepository;
import com.example.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SupportService {

    private final SupportChannelRepository channelRepo;
    private final SupportMessageRepository messageRepo;
    private final UserRepository userRepo;
    private final AuthService authService;

    /** Récupère ou crée le canal de support pour l'utilisateur courant */
    @Transactional
    public SupportChannelDto getOrCreateMyChannel() {
        User user = authService.getCurrentUser();
        SupportChannel channel = channelRepo.findByUserId(user.getId()).orElseGet(() -> {
            User admin = userRepo.findAll().stream()
                    .filter(u -> "ADMIN".equals(u.getRoles()))
                    .findFirst().orElse(null);
            SupportChannel c = new SupportChannel();
            c.setUser(user);
            c.setAdmin(admin);
            c.setCreatedAt(OffsetDateTime.now());
            return channelRepo.save(c);
        });
        return toDto(channel, true);
    }

    /** Envoie un message dans un canal (user ou admin) */
    @Transactional
    public SupportChannelDto.SupportMessageDto sendMessage(UUID channelId, String content) {
        User sender = authService.getCurrentUser();
        SupportChannel channel = channelRepo.findById(channelId)
                .orElseThrow(() -> new IllegalArgumentException("Canal introuvable."));

        // Vérifier que l'expéditeur participe au canal
        boolean isParticipant = sender.getId().equals(channel.getUser().getId()) ||
                (channel.getAdmin() != null && sender.getId().equals(channel.getAdmin().getId())) ||
                "ADMIN".equals(sender.getRoles());
        if (!isParticipant) throw new IllegalArgumentException("Accès non autorisé.");

        // Si admin répond, l'associer au canal
        if ("ADMIN".equals(sender.getRoles()) && channel.getAdmin() == null) {
            channel.setAdmin(sender);
        }

        SupportMessage msg = new SupportMessage();
        msg.setChannel(channel);
        msg.setSender(sender);
        msg.setContent(content);
        msg.setSentAt(OffsetDateTime.now());
        msg.setRead(false);
        messageRepo.save(msg);

        channel.setUpdatedAt(OffsetDateTime.now());
        channelRepo.save(channel);

        boolean isAdmin = "ADMIN".equals(sender.getRoles());
        return SupportChannelDto.SupportMessageDto.builder()
                .id(msg.getId().toString())
                .senderId(sender.getId().toString())
                .senderFirstname(sender.getFirstname())
                .senderLastname(sender.getLastname())
                .content(msg.getContent())
                .sentAt(msg.getSentAt().toString())
                .isRead(false)
                .isAdmin(isAdmin)
                .build();
    }

    /** Récupère les messages du canal de l'utilisateur courant et marque comme lus */
    @Transactional
    public List<SupportChannelDto.SupportMessageDto> getMyMessages(UUID channelId) {
        User user = authService.getCurrentUser();
        messageRepo.markAllReadInChannel(channelId, user.getId());
        return messageRepo.findByChannelIdOrderBySentAtAsc(channelId).stream()
                .map(m -> toMsgDto(m, user.getId()))
                .collect(Collectors.toList());
    }

    /** Admin : liste tous les canaux de support */
    @Transactional(readOnly = true)
    public List<SupportChannelDto> adminListChannels() {
        return channelRepo.findAllByOrderByUpdatedAtDescCreatedAtDesc().stream()
                .map(c -> toDto(c, false))
                .collect(Collectors.toList());
    }

    /** Admin : récupère les messages d'un canal et marque comme lus */
    @Transactional
    public List<SupportChannelDto.SupportMessageDto> adminGetMessages(UUID channelId) {
        User admin = authService.getCurrentUser();
        messageRepo.markAllReadInChannel(channelId, admin.getId());
        return messageRepo.findByChannelIdOrderBySentAtAsc(channelId).stream()
                .map(m -> toMsgDto(m, admin.getId()))
                .collect(Collectors.toList());
    }

    private SupportChannelDto toDto(SupportChannel c, boolean includeMessages) {
        User cu = c.getUser();
        User ca = c.getAdmin();

        SupportMessage last = messageRepo.findTopByChannelIdOrderBySentAtDesc(c.getId()).orElse(null);
        long unread = messageRepo.countByChannelIdAndIsReadFalseAndSenderIdNot(c.getId(), cu.getId());

        SupportChannelDto.SupportChannelDtoBuilder b = SupportChannelDto.builder()
                .id(c.getId().toString())
                .userId(cu.getId().toString())
                .userFirstname(cu.getFirstname())
                .userLastname(cu.getLastname())
                .userEmail(cu.getEmail())
                .adminId(ca != null ? ca.getId().toString() : null)
                .adminFirstname(ca != null ? ca.getFirstname() : "Admin")
                .adminLastname(ca != null ? ca.getLastname() : "")
                .lastMessage(last != null ? last.getContent() : null)
                .updatedAt(c.getUpdatedAt() != null ? c.getUpdatedAt().toString() : c.getCreatedAt().toString())
                .unreadCount(unread);

        if (includeMessages) {
            b.messages(messageRepo.findByChannelIdOrderBySentAtAsc(c.getId()).stream()
                    .map(m -> toMsgDto(m, cu.getId()))
                    .collect(Collectors.toList()));
        }
        return b.build();
    }

    private SupportChannelDto.SupportMessageDto toMsgDto(SupportMessage m, UUID viewerId) {
        boolean isAdmin = "ADMIN".equals(m.getSender().getRoles());
        return SupportChannelDto.SupportMessageDto.builder()
                .id(m.getId().toString())
                .senderId(m.getSender().getId().toString())
                .senderFirstname(m.getSender().getFirstname())
                .senderLastname(m.getSender().getLastname())
                .content(m.getContent())
                .sentAt(m.getSentAt().toString())
                .isRead(m.isRead())
                .isAdmin(isAdmin)
                .build();
    }
}
