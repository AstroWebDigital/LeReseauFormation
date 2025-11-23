package com.example.backend.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    // URL publique de ton frontend (ex: https://app.lereseauformation.fr)
    @Value("${APP_PUBLIC_BASE_URL}")
    private String publicBaseUrl;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    /**
     * Envoie l'email de réinitialisation de mot de passe (version HTML).
     */
    public void sendPasswordResetEmail(String toEmail, String token) {
        String resetLink = publicBaseUrl + "/reset-password?token=" + token;

        String subject = "Réinitialisation de votre mot de passe - Le Réseau Formation";

        String html = """
                <html>
                  <body style="margin:0;padding:0;background-color:#050721;font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
                    <table width="100%%" cellpadding="0" cellspacing="0" role="presentation">
                      <tr>
                        <td align="center" style="padding:24px 16px;">
                          <table width="100%%" cellpadding="0" cellspacing="0" role="presentation"
                                 style="max-width:560px;background:linear-gradient(145deg,#171c42,#111632,#090d23);border-radius:24px;overflow:hidden;border:1px solid rgba(148,163,184,0.25);">
                            
                            <!-- En-tête -->
                            <tr>
                              <td style="padding:20px 24px 12px 24px;border-bottom:1px solid rgba(148,163,184,0.25);">
                                <div style="display:flex;align-items:center;gap:10px;">
                                  <div style="width:28px;height:28px;border-radius:999px;background-color:#ff922b;display:flex;align-items:center;justify-content:center;font-size:14px;color:#111827;">
                                    R
                                  </div>
                                  <div>
                                    <div style="font-size:12px;font-weight:600;color:#e5e7eb;text-transform:uppercase;letter-spacing:0.08em;">
                                      Le Réseau
                                    </div>
                                    <div style="font-size:11px;color:#9ca3af;">
                                      Plateforme de location & formation
                                    </div>
                                  </div>
                                </div>
                              </td>
                            </tr>

                            <!-- Titre + texte -->
                            <tr>
                              <td style="padding:20px 24px 4px 24px;">
                                <h1 style="margin:0 0 8px 0;font-size:19px;color:#f9fafb;">
                                  Réinitialisation de votre mot de passe
                                </h1>
                                <p style="margin:0;font-size:13px;line-height:1.6;color:#cbd5f5;">
                                  Vous avez demandé la réinitialisation de votre mot de passe pour votre compte
                                  <strong style="color:#ffffff;">Le Réseau Formation</strong>.
                                </p>
                              </td>
                            </tr>

                            <!-- Bouton -->
                            <tr>
                              <td align="center" style="padding:20px 24px 12px 24px;">
                                <a href="%s"
                                   style="display:inline-block;padding:12px 26px;border-radius:999px;background-color:#ff922b;color:#111827;text-decoration:none;font-size:14px;font-weight:600;">
                                  Réinitialiser mon mot de passe
                                </a>
                              </td>
                            </tr>

                            <!-- Infos lien / expiration -->
                            <tr>
                              <td style="padding:0 24px 14px 24px;">
                                <p style="margin:0;font-size:12px;line-height:1.6;color:#9ca3af;">
                                  Ce lien est valable pendant <strong style="color:#e5e7eb;">15 minutes</strong>. Si vous n'êtes pas à l'origine de cette demande,
                                  vous pouvez ignorer cet e-mail, votre mot de passe ne sera pas modifié.
                                </p>
                              </td>
                            </tr>

                            <!-- Lien brut -->
                            <tr>
                              <td style="padding:0 24px 22px 24px;">
                                <p style="margin:0;font-size:11px;line-height:1.6;color:#6b7280;">
                                  Si le bouton ne fonctionne pas, copiez-collez ce lien dans votre navigateur :<br/>
                                  <span style="word-break:break-all;color:#e5e7eb;">%s</span>
                                </p>
                              </td>
                            </tr>

                            <!-- Bas de carte -->
                            <tr>
                              <td style="padding:14px 24px 18px 24px;border-top:1px solid rgba(148,163,184,0.25);">
                                <p style="margin:0;font-size:11px;color:#6b7280;">
                                  © %d Le Réseau Formation • Plateforme de mise en relation et de formation.
                                </p>
                              </td>
                            </tr>

                          </table>
                        </td>
                      </tr>
                    </table>
                  </body>
                </html>
                """.formatted(resetLink, resetLink, java.time.Year.now().getValue());

        sendHtmlEmail(toEmail, subject, html);

        System.out.println("E-mail de réinitialisation envoyé à : " + toEmail);
    }

    /**
     * Envoie l'email de vérification du compte (version HTML, avec bouton "Vérifier mon compte").
     */
    public void sendVerificationEmail(String toEmail, String token) {
        // Tu peux garder le lien backend ou pointer vers une page frontend (ex: /verify-email?token=...)
        String verificationLink = publicBaseUrl + "/api/auth/verify?token=" + token;

        String subject = "Vérification de votre compte - Le Réseau Formation";

        String html = """
                <html>
                  <body style="margin:0;padding:0;background-color:#050721;font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
                    <table width="100%%" cellpadding="0" cellspacing="0" role="presentation">
                      <tr>
                        <td align="center" style="padding:24px 16px;">
                          <table width="100%%" cellpadding="0" cellspacing="0" role="presentation"
                                 style="max-width:560px;background:linear-gradient(145deg,#171c42,#111632,#090d23);border-radius:24px;overflow:hidden;border:1px solid rgba(148,163,184,0.25);">
                            
                            <!-- En-tête -->
                            <tr>
                              <td style="padding:20px 24px 12px 24px;border-bottom:1px solid rgba(148,163,184,0.25);">
                                <div style="display:flex;align-items:center;gap:10px;">
                                  <div>
                                    <div style="font-size:12px;font-weight:600;color:#e5e7eb;text-transform:uppercase;letter-spacing:0.08em;">
                                      Le Réseau Formation
                                    </div>
                                    <div style="font-size:11px;color:#9ca3af;">
                                      Plateforme de location & formation
                                    </div>
                                  </div>
                                </div>
                              </td>
                            </tr>

                            <!-- Titre + texte -->
                            <tr>
                              <td style="padding:20px 24px 4px 24px;">
                                <h1 style="margin:0 0 8px 0;font-size:19px;color:#f9fafb;">
                                  Bienvenue sur Le Réseau Formation 👋
                                </h1>
                                <p style="margin:0;font-size:13px;line-height:1.6;color:#cbd5f5;">
                                  Merci de votre inscription ! Pour finaliser la création de votre compte et accéder à l'ensemble
                                  des fonctionnalités de la plateforme, merci de vérifier votre adresse e-mail.
                                </p>
                              </td>
                            </tr>

                            <!-- Bouton -->
                            <tr>
                              <td align="center" style="padding:20px 24px 12px 24px;">
                                <a href="%s"
                                   style="display:inline-block;padding:12px 28px;border-radius:999px;background-color:#ff922b;color:#111827;text-decoration:none;font-size:14px;font-weight:600;">
                                  Vérifier mon compte
                                </a>
                              </td>
                            </tr>

                            <!-- Infos lien / expiration -->
                            <tr>
                              <td style="padding:0 24px 14px 24px;">
                                <p style="margin:0;font-size:12px;line-height:1.6;color:#9ca3af;">
                                  Ce lien de vérification expirera dans <strong style="color:#e5e7eb;">15 minutes</strong>.<br/>
                                  Si vous n'êtes pas à l'origine de cette inscription, vous pouvez ignorer cet e-mail.
                                </p>
                              </td>
                            </tr>

                            <!-- Lien brut -->
                            <tr>
                              <td style="padding:0 24px 22px 24px;">
                                <p style="margin:0;font-size:11px;line-height:1.6;color:#6b7280;">
                                  Si le bouton ne fonctionne pas, copiez-collez ce lien dans votre navigateur :<br/>
                                  <span style="word-break:break-all;color:#e5e7eb;">%s</span>
                                </p>
                              </td>
                            </tr>

                            <!-- Bas de carte -->
                            <tr>
                              <td style="padding:14px 24px 18px 24px;border-top:1px solid rgba(148,163,184,0.25);">
                                <p style="margin:0;font-size:11px;color:#6b7280;">
                                  © %d Le Réseau Formation • Merci de votre confiance.
                                </p>
                              </td>
                            </tr>

                          </table>
                        </td>
                      </tr>
                    </table>
                  </body>
                </html>
                """.formatted(verificationLink, verificationLink, java.time.Year.now().getValue());

        sendHtmlEmail(toEmail, subject, html);

        System.out.println("E-mail de vérification envoyé à : " + toEmail);
    }

    /**
     * Méthode utilitaire pour envoyer un e-mail HTML.
     */
    private void sendHtmlEmail(String toEmail, String subject, String htmlContent) {
        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, "UTF-8");
            helper.setTo(toEmail);
            helper.setSubject(subject);
            helper.setText(htmlContent, true); // true => HTML

            mailSender.send(mimeMessage);
        } catch (MessagingException e) {
            throw new RuntimeException("Erreur lors de l'envoi de l'e-mail", e);
        }
    }
}
