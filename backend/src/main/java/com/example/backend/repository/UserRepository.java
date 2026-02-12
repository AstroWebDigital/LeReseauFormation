package com.example.backend.repository;

import com.example.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<User, UUID> {

    // On remplace "u.customer" par "u.alp" pour correspondre à ton entité User
    @Query("SELECT u FROM User u LEFT JOIN FETCH u.alp WHERE u.email = :email")
    Optional<User> findByEmail(@Param("email") String email);

    boolean existsByEmailIgnoreCase(String email);
}