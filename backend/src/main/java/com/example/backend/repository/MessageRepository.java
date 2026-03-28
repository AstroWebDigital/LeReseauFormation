package com.example.backend.repository;

import com.example.backend.entity.Message;
import com.example.backend.entity.Reservation;
import com.example.backend.entity.ChatChannel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface MessageRepository extends JpaRepository<Message, UUID> {
    List<Message> findByReservationOrderBySentAtAsc(Reservation reservation);

    @Query("SELECT COUNT(m) FROM Message m " +
           "JOIN ChatChannel c ON c.reservation = m.reservation " +
           "WHERE (c.renterUser.id = :userId OR c.ownerUser.id = :userId) " +
           "AND m.senderUser.id <> :userId " +
           "AND m.isRead = false")
    long countUnreadForUser(@Param("userId") UUID userId);
}