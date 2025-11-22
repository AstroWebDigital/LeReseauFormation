package com.example.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    // Injecter la base URL pour construire les liens
    @Value("${APP_PUBLIC_BASE_URL}")
    private String publicBaseUrl;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    /**
     * Envoie l'email de réinitialisation de mot de passe.
     * @param toEmail L'adresse email du destinataire.
     * @param token Le jeton de réinitialisation généré.
     */
    public void sendPasswordResetEmail(String toEmail, String token) {
        SimpleMailMessage message = new SimpleMailMessage();

        message.setTo(toEmail);
        message.setSubject("Réinitialisation de votre mot de passe");

        // Assurez-vous que ce chemin correspond à votre frontend si vous utilisez un lien direct
        String resetLink = publicBaseUrl + "/reset-password?token=" + token;

        String emailBody = "Pour réinitialiser votre mot de passe, veuillez cliquer sur le lien ci-dessous :\n\n"
                + resetLink + "\n\n"
                + "Ce lien expirera dans 15 minutes (si vous utilisez la valeur par défaut du AuthService). Si vous n'avez pas demandé de réinitialisation, ignorez cet e-mail.";

        message.setText(emailBody);

        mailSender.send(message);

        System.out.println("E-mail de réinitialisation envoyé à : " + toEmail);
    }

    /**
     * Envoie l'email de vérification du compte (OTP).
     * @param toEmail L'adresse email du destinataire.
     * @param token Le jeton/code OTP de vérification.
     */
    public void sendVerificationEmail(String toEmail, String token) {
        SimpleMailMessage message = new SimpleMailMessage();

        message.setTo(toEmail);
        message.setSubject("Vérification de votre compte");

        // Le lien doit pointer vers le point de terminaison de vérification de votre backend,
        // ou vers une page de votre frontend qui appelle le backend avec le jeton.
        String verificationLink = publicBaseUrl + "/api/auth/verify?token=" + token;

        String emailBody = "Bienvenue ! Veuillez cliquer sur le lien ci-dessous pour vérifier et activer votre compte :\n\n"
                + verificationLink + "\n\n"
                + "Ce lien de vérification expirera dans 15 minutes (si vous utilisez la valeur par défaut du AuthService).";

        message.setText(emailBody);

        mailSender.send(message);

        System.out.println("E-mail de vérification envoyé à : " + toEmail);
    }
}