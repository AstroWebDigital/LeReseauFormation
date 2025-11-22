package com.example.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    // Injecter la base URL pour construire le lien de réinitialisation
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

        String resetLink = publicBaseUrl + "/reset-password?token=" + token;

        String emailBody = "Pour réinitialiser votre mot de passe, veuillez cliquer sur le lien ci-dessous :\n\n"
                + resetLink + "\n\n"
                + "Ce lien expirera dans 60 minutes. Si vous n'avez pas demandé de réinitialisation, ignorez cet e-mail.";

        message.setText(emailBody);

        mailSender.send(message);

        System.out.println("E-mail de réinitialisation envoyé à : " + toEmail);
    }
}