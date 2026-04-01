package com.example.backend.repository;

import com.example.backend.entity.SupportMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SupportMessageRepository extends JpaRepository<SupportMessage, UUID> {
    List<SupportMessage> findByChannelIdOrderBySentAtAsc(UUID channelId);

    Optional<SupportMessage> findTopByChannelIdOrderBySentAtDesc(UUID channelId);

    long countByChannelIdAndIsReadFalseAndSenderIdNot(UUID channelId, UUID senderId);

    @Modifying
    @Transactional
    @Query("UPDATE SupportMessage m SET m.isRead = true WHERE m.channel.id = :channelId AND m.sender.id <> :userId AND m.isRead = false")
    void markAllReadInChannel(@Param("channelId") UUID channelId, @Param("userId") UUID userId);
}
