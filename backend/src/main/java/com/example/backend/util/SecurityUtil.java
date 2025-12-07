package com.example.backend.util;

import java.util.Optional;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

/**
 * Utilitaires pour interagir avec le contexte de sécurité de Spring.
 */
public final class SecurityUtil {

    private SecurityUtil() {
        // Classe utilitaire
    }

    /**
     * Récupère l'ID (Long) de l'utilisateur actuellement authentifié à partir du contexte de sécurité.
     * Dans notre configuration JWT, le principal (getName()) est généralement l'ID de l'utilisateur en String.
     * @return Optional contenant l'ID de l'utilisateur si authentifié, sinon Optional.empty().
     */
    public static Optional<Long> getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        // 1. Vérification de l'authentification et de son état
        if (authentication == null || !authentication.isAuthenticated()) {
            return Optional.empty();
        }

        // 2. Extraction du principal (qui est l'email dans l'AuthService,
        // mais l'ID dans le contexte d'une structure Spring Security avec JWT où le JWT
        // est souvent configuré pour contenir l'ID comme 'sub').
        // Si le principal est l'email, il faudrait le chercher dans la BDD pour obtenir l'ID.
        // Pour rester cohérent avec l'implémentation de AuthService.currentUserDto(),
        // nous supposons que le Principal est l'Email ou l'ID sous forme de String.
        // Si la chaîne est un Long, on la renvoie.
        Object principal = authentication.getName();

        if (principal instanceof String principalString) {
            try {
                // Tentative de conversion de la chaîne en Long (si le JWT met l'ID dans le principal)
                return Optional.of(Long.parseLong(principalString));
            } catch (NumberFormatException e) {
                // Si la chaîne n'est pas un ID numérique (c'est probablement l'email),
                // on ne peut pas récupérer l'ID ici sans accès au UserRepository,
                // ce qui est le rôle de l'AuthService.
                // L'AuthService doit alors utiliser l'email (getName()) pour trouver l'utilisateur.
                // Pour deleteCurrentUser(), l'AuthService doit être modifié
                // pour utiliser l'email comme identifiant de recherche.
                return Optional.empty();
            }
        }

        return Optional.empty();
    }
}