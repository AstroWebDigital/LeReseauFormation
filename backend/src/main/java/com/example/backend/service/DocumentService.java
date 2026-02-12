package com.example.backend.service;

import com.example.backend.entity.Customer;
import com.example.backend.entity.Document;
import com.example.backend.entity.User;
import com.example.backend.repository.CustomerRepository;
import com.example.backend.repository.DocumentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DocumentService {

    private final DocumentRepository documentRepository;
    private final CustomerRepository customerRepository;
    private final AuthService authService;

    @Transactional
    public Document createDocument(Document document) {
        // 1. Récupérer l'utilisateur connecté via le token JWT
        User currentUser = authService.getCurrentUser();

        // 2. Trouver le profil "Customer" correspondant à cet utilisateur
        // Cela garantit que le document est lié au bon compte en base
        Customer customer = customerRepository.findByUserId(currentUser.getId())
                .orElseThrow(() -> new RuntimeException("Profil client introuvable pour cet utilisateur"));

        // 3. Préparer l'identifiant unique si absent
        if (document.getId() == null) {
            document.setId(UUID.randomUUID());
        }

        // 4. Forcer les données de sécurité et de traçabilité
        document.setCustomer(customer);

        // On initialise ou on écrase les dates pour utiliser l'heure du serveur
        OffsetDateTime now = OffsetDateTime.now();
        document.setCreatedAt(now);
        document.setUpdatedAt(now);

        // 5. Sauvegarde finale
        return documentRepository.save(document);
    }
}