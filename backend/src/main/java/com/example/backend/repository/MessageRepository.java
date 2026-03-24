package com.example.backend.repository;

import com.example.backend.entity.Message;
import com.example.backend.entity.Reservation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface MessageRepository extends JpaRepository<Message, UUID> {
    List<Message> findByReservationOrderBySentAtAsc(Reservation reservation);
}