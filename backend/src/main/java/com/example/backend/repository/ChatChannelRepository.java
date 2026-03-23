package com.example.backend.repository;

import com.example.backend.entity.ChatChannel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ChatChannelRepository extends JpaRepository<ChatChannel, UUID> {

    @Query("SELECT c FROM ChatChannel c " +
            "WHERE c.renterUser.id = :userId OR c.ownerUser.id = :userId " +
            "ORDER BY c.updatedAt DESC NULLS LAST")
    List<ChatChannel> findByRenterUserIdOrOwnerUserId(@Param("userId") UUID userId);
}