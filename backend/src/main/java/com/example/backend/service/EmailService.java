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

        // TODO : adapte l’URL du logo si besoin (par ex. mettre un APP_LOGO_URL dans les props)
        String logoUrl = publicBaseUrl + "/Logo-Reseau-Formation.png";

        String html = """
                <html>
                  <body style="margin:0;padding:0;background-color:#f5f5f7;font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
                    <table width="100%%" cellpadding="0" cellspacing="0" role="presentation">
                      <tr>
                        <td align="center" style="padding:24px 16px;">
                          <table width="100%%" cellpadding="0" cellspacing="0" role="presentation" style="max-width:560px;background-color:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e5e7eb;">
                            <tr>
                              <td align="center" style="padding:24px 24px 8px 24px;background:linear-gradient(135deg,#f400b4,#5c1fd4);">
                                <img src="%s" alt="Le Réseau Formation" style="max-width:180px;height:auto;display:block;margin:0 auto 8px auto;" />
                              </td>
                            </tr>
                            <tr>
                              <td style="padding:24px 24px 8px 24px;">
                                <h1 style="margin:0 0 8px 0;font-size:20px;color:#111827;">Réinitialisation de votre mot de passe</h1>
                                <p style="margin:0;font-size:14px;line-height:1.6;color:#4b5563;">
                                  Vous avez demandé la réinitialisation de votre mot de passe pour votre compte
                                  <strong>Le Réseau Formation</strong>.
                                </p>
                              </td>
                            </tr>
                            <tr>
                              <td align="center" style="padding:24px;">
                                <a href="%s"
                                   style="display:inline-block;padding:12px 24px;border-radius:999px;background-color:#5c1fd4;color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;">
                                  Réinitialiser mon mot de passe
                                </a>
                              </td>
                            </tr>
                            <tr>
                              <td style="padding:0 24px 16px 24px;">
                                <p style="margin:0;font-size:12px;line-height:1.6;color:#6b7280;">
                                  Ce lien est valable pendant <strong>15 minutes</strong>. Si vous n'êtes pas à l'origine de cette demande,
                                  vous pouvez ignorer cet e-mail, votre mot de passe ne sera pas modifié.
                                </p>
                              </td>
                            </tr>
                            <tr>
                              <td style="padding:0 24px 24px 24px;">
                                <p style="margin:0;font-size:11px;line-height:1.6;color:#9ca3af;">
                                  Si le bouton ne fonctionne pas, copiez-collez ce lien dans votre navigateur :<br/>
                                  <span style="word-break:break-all;color:#6b7280;">%s</span>
                                </p>
                              </td>
                            </tr>
                            <tr>
                              <td style="padding:16px 24px 24px 24px;border-top:1px solid #e5e7eb;">
                                <p style="margin:0;font-size:11px;color:#9ca3af;">
                                  Le Réseau Formation • Plateforme de mise en relation et de formation.
                                </p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </body>
                </html>
                """.formatted(logoUrl, resetLink, resetLink);

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

        // TODO : adapte l’URL du logo si besoin (variable dédiée, ressource statique, CDN…)
        String logoUrl = publicBaseUrl + "/Logo-Reseau-Formation.png";

        String html = """
                <html>
                  <body style="margin:0;padding:0;background-color:#f5f5f7;font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
                    <table width="100%%" cellpadding="0" cellspacing="0" role="presentation">
                      <tr>
                        <td align="center" style="padding:24px 16px;">
                          <table width="100%%" cellpadding="0" cellspacing="0" role="presentation" style="max-width:560px;background-color:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e5e7eb;">
                            <tr>
                              <td align="center" style="padding:24px 24px 8px 24px;background:linear-gradient(135deg,#f400b4,#5c1fd4);">
                                <img src="%s" alt="Le Réseau Formation" style="max-width:180px;height:auto;display:block;margin:0 auto 8px auto;" />
                              </td>
                            </tr>
                            <tr>
                              <td style="padding:24px 24px 8px 24px;">
                                <h1 style="margin:0 0 8px 0;font-size:20px;color:#111827;">Bienvenue sur Le Réseau Formation 👋</h1>
                                <p style="margin:0;font-size:14px;line-height:1.6;color:#4b5563;">
                                  Merci de votre inscription ! Pour finaliser la création de votre compte et accéder à l'ensemble
                                  des fonctionnalités de la plateforme, merci de vérifier votre adresse e-mail.
                                </p>
                              </td>
                            </tr>
                            <tr>
                              <td align="center" style="padding:24px;">
                                <a href="%s"
                                   style="display:inline-block;padding:12px 28px;border-radius:999px;background-color:#5c1fd4;color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;">
                                  Vérifier mon compte
                                </a>
                              </td>
                            </tr>
                            <tr>
                              <td style="padding:0 24px 16px 24px;">
                                <p style="margin:0;font-size:12px;line-height:1.6;color:#6b7280;">
                                  Ce lien de vérification expirera dans <strong>15 minutes</strong>.  
                                  Si vous n'êtes pas à l'origine de cette inscription, vous pouvez ignorer cet e-mail.
                                </p>
                              </td>
                            </tr>
                            <tr>
                              <td style="padding:0 24px 24px 24px;">
                                <p style="margin:0;font-size:11px;line-height:1.6;color:#9ca3af;">
                                  Si le bouton ne fonctionne pas, copiez-collez ce lien dans votre navigateur :<br/>
                                  <span style="word-break:break-all;color:#6b7280;">%s</span>
                                </p>
                              </td>
                            </tr>
                            <tr>
                              <td style="padding:16px 24px 24px 24px;border-top:1px solid #e5e7eb;">
                                <p style="margin:0;font-size:11px;color:#9ca3af;">
                                  Le Réseau Formation • Merci de votre confiance.
                                </p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </body>
                </html>
                """.formatted(logoUrl, verificationLink, verificationLink);

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
