package com.example.backend.repository;

import com.example.backend.entity.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, UUID> {

    // Pour la création de documents (ce qu'on a fait avant)
    Optional<Customer> findByUserId(UUID userId);

    // Pour la suppression du compte (ce qui fait planter le build ici)
    void deleteByUserId(UUID userId);
}