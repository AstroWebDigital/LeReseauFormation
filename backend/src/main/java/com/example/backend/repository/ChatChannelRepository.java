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

    /**
     * Trouve tous les channels où l'utilisateur est soit customer, soit ALP
     * Triés par date de mise à jour décroissante (les plus récents en premier)
     */
    @Query("SELECT c FROM ChatChannel c " +
            "WHERE c.customer.user.id = :userId OR c.alp.user.id = :userId " +
            "ORDER BY c.updatedAt DESC NULLS LAST")
    List<ChatChannel> findByCustomerIdOrAlpId(@Param("userId") UUID userId);
}