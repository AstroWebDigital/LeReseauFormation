package com.example.backend.repository;

import com.example.backend.entity.SupportChannel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SupportChannelRepository extends JpaRepository<SupportChannel, UUID> {
    Optional<SupportChannel> findByUserId(UUID userId);
    List<SupportChannel> findAllByOrderByUpdatedAtDescCreatedAtDesc();
}
