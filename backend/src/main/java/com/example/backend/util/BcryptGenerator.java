package com.example.backend.util;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

// Classe utilitaire pour générer des mots de passe Bcrypt dans un environnement non-Spring.
public class BcryptGenerator {

    public static void main(String[] args) {
        String rawPassword = "user";
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        String encodedPassword = encoder.encode(rawPassword);
        System.out.println("Mot de passe brut : " + rawPassword);
        System.out.println("Mot de passe Bcrypt (hash) : " + encodedPassword);
        boolean matches = encoder.matches(rawPassword, encodedPassword);
        System.out.println("Le mot de passe correspond-il ? " + matches);
    }
}