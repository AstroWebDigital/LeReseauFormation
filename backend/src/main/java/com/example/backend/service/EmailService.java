package com.example.backend.service;

import com.example.backend.entity.Reservation;
import com.example.backend.entity.User;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;
import java.util.UUID;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${APP_PUBLIC_BASE_URL}")
    private String publicBaseUrl;

    @Value("${APP_FRONTEND_BASE_URL}")
    private String frontendBaseUrl;

    // 💡 MODIFICATION 1 : Le format inclut maintenant l'heure (HH:mm) et la date (dd/MM/yyyy)
    private static final DateTimeFormatter DATETIME_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy à HH:mm");

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    // -----------------------------------------------------------
    // 1. MÉTHODE GÉNÉRIQUE
    // -----------------------------------------------------------

    /**
     * Implémentation générique utilisant la méthode utilitaire sendHtmlEmail.
     */
    public void sendEmail(String toEmail, String subject, String body) {
        sendHtmlEmail(toEmail, subject, body);
    }

    // -----------------------------------------------------------
    // 2. NOUVELLES MÉTHODES POUR LA RÉSERVATION
    // -----------------------------------------------------------

    /**
     * Envoie l'email de confirmation de réservation au Client (Customer).
     */
    public void sendReservationConfirmationEmail(Reservation reservation) {

        String toEmail = reservation.getUser().getEmail();
        String customerFirstName = reservation.getUser().getFirstname();
        // Utilisation d'une référence courte
        String reservationRef = reservation.getId().toString().substring(0, 8).toUpperCase();

        // 💡 MODIFICATION 2 : Utilisation du DATETIME_FORMATTER pour inclure l'heure
        String pickUpDateTime = reservation.getStartDate().format(DATETIME_FORMATTER);
        String dropOffDateTime = reservation.getEndDate().format(DATETIME_FORMATTER);

        // CORRECTION : Utilisation de getBrand() et getModel() au lieu de getName()
        String vehicleName = reservation.getVehicle().getBrand() + " " + reservation.getVehicle().getModel();

        // 🔥 Lien vers la page de détails de la réservation sur le FRONT
        String reservationLink = frontendBaseUrl + "/reservations/" + reservation.getId();

        String subject = "Confirmation de votre réservation n° " + reservationRef + " - Le Réseau Formation";

        String html = """
            <html>
              <body style="margin:0;padding:0;background-color:#050721;font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
                <table width="100%%" cellpadding="0" cellspacing="0" role="presentation">
                  <tr>
                    <td align="center" style="padding:24px 16px;">
                      <table width="100%%" cellpadding="0" cellspacing="0" role="presentation"
                             style="max-width:560px;background:linear-gradient(145deg,#171c42,#111632,#090d23);border-radius:24px;overflow:hidden;border:1px solid rgba(148,163,184,0.25);">
                        
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

                        <tr>
                          <td style="padding:20px 24px 4px 24px;">
                            <h1 style="margin:0 0 8px 0;font-size:19px;color:#f9fafb;">
                              Votre réservation est confirmée ! 🎉
                            </h1>
                            <p style="margin:0;font-size:13px;line-height:1.6;color:#cbd5f5;">
                              Bonjour <strong style="color:#ffffff;">%s</strong>, votre demande de réservation
                              n° <strong style="color:#ff922b;">%s</strong> a été acceptée et confirmée.
                            </p>
                          </td>
                        </tr>
                        
                        <tr>
                          <td style="padding:20px 24px 12px 24px;">
                            <h2 style="margin:0 0 10px 0;font-size:16px;color:#f9fafb;">Détails</h2>
                            <ul style="margin:0;padding:0;list-style:none;font-size:13px;color:#cbd5f5;">
                              <li style="margin-bottom:8px;">
                                <strong style="color:#e5e7eb;">Véhicule :</strong> %s
                              </li>
                              <li style="margin-bottom:8px;">
                                <strong style="color:#e5e7eb;">Prise en charge :</strong> %s
                              </li>
                              <li style="margin-bottom:8px;">
                                <strong style="color:#e5e7eb;">Retour :</strong> %s
                              </li>
                            </ul>
                          </td>
                        </tr>

                        <tr>
                          <td align="center" style="padding:20px 24px 12px 24px;">
                            <a href="%s"
                               style="display:inline-block;padding:12px 26px;border-radius:999px;background-color:#ff922b;color:#111827;text-decoration:none;font-size:14px;font-weight:600;">
                              Voir ma réservation
                            </a>
                          </td>
                        </tr>

                        <tr>
                          <td style="padding:0 24px 14px 24px;">
                            <p style="margin:0;font-size:12px;line-height:1.6;color:#9ca3af;">
                              Veuillez vérifier tous les documents requis sur la plateforme avant la date de prise en charge.
                            </p>
                          </td>
                        </tr>

                        <tr>
                          <td style="padding:0 24px 22px 24px;">
                            <p style="margin:0;font-size:11px;line-height:1.6;color:#6b7280;">
                              Lien direct vers la réservation :<br/>
                              <span style="word-break:break-all;color:#e5e7eb;">%s</span>
                            </p>
                          </td>
                        </tr>

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
            """.formatted(
                customerFirstName,
                reservationRef,
                vehicleName,
                pickUpDateTime, // Variable mise à jour
                dropOffDateTime, // Variable mise à jour
                reservationLink,
                reservationLink,
                java.time.Year.now().getValue()
        );

        sendHtmlEmail(toEmail, subject, html);
        System.out.println("E-mail de confirmation de réservation envoyé à : " + toEmail);
    }

    /**
     * Envoie l'email de notification de nouvelle réservation à l'ALP.
     */
    public void sendReservationNotificationToAlpEmail(User alpUser, Reservation reservation) {

        String toEmail = alpUser.getEmail();
        String alpName = alpUser.getFirstname();
        String reservationRef = reservation.getId().toString().substring(0, 8).toUpperCase();

        // 💡 MODIFICATION 3 : Utilisation du DATETIME_FORMATTER pour inclure l'heure
        String pickUpDateTime = reservation.getStartDate().format(DATETIME_FORMATTER);

        // CORRECTION : Utilisation de getBrand() et getModel() au lieu de getName()
        String vehicleName = reservation.getVehicle().getBrand() + " " + reservation.getVehicle().getModel();

        // 🔥 Lien vers la page ADMIN de la réservation sur le FRONT
        String reservationLink = frontendBaseUrl + "/admin/reservations/" + reservation.getId();

        String subject = "Nouvelle Réservation à Confirmer n° " + reservationRef + " - Le Réseau Formation";

        String html = """
            <html>
              <body style="margin:0;padding:0;background-color:#050721;font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
                <table width="100%%" cellpadding="0" cellspacing="0" role="presentation">
                  <tr>
                    <td align="center" style="padding:24px 16px;">
                      <table width="100%%" cellpadding="0" cellspacing="0" role="presentation"
                             style="max-width:560px;background:linear-gradient(145deg,#171c42,#111632,#090d23);border-radius:24px;overflow:hidden;border:1px solid rgba(148,163,184,0.25);">
                        
                        <tr>
                          <td style="padding:20px 24px 12px 24px;border-bottom:1px solid rgba(148,163,184,0.25);">
                            <div style="display:flex;align-items:center;gap:10px;">
                              <div style="width:28px;height:28px;border-radius:999px;background-color:#ff922b;display:flex;align-items:center;justify-content:center;font-size:14px;color:#111827;">
                                R
                              </div>
                              <div>
                                <div style="font-size:12px;font-weight:600;color:#e5e7eb;text-transform:uppercase;letter-spacing:0.08em;">
                                  Le Réseau (Admin)
                                </div>
                                <div style="font-size:11px;color:#9ca3af;">
                                  Plateforme de location & formation
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>

                        <tr>
                          <td style="padding:20px 24px 4px 24px;">
                            <h1 style="margin:0 0 8px 0;font-size:19px;color:#f9fafb;">
                              Nouvelle Réservation à traiter ! 🚨
                            </h1>
                            <p style="margin:0;font-size:13px;line-height:1.6;color:#cbd5f5;">
                              Bonjour <strong style="color:#ffffff;">%s</strong>, une nouvelle réservation
                              n° <strong style="color:#ff922b;">%s</strong> est en attente de traitement.
                            </p>
                          </td>
                        </tr>
                        
                        <tr>
                          <td style="padding:20px 24px 12px 24px;">
                            <h2 style="margin:0 0 10px 0;font-size:16px;color:#f9fafb;">Détails de la tâche</h2>
                            <ul style="margin:0;padding:0;list-style:none;font-size:13px;color:#cbd5f5;">
                              <li style="margin-bottom:8px;">
                                <strong style="color:#e5e7eb;">Véhicule :</strong> %s
                              </li>
                              <li style="margin-bottom:8px;">
                                <strong style="color:#e5e7eb;">Début :</strong> %s
                              </li>
                              <li style="margin-bottom:8px;">
                                <strong style="color:#e5e7eb;">Client :</strong> %s %s
                              </li>
                            </ul>
                          </td>
                        </tr>

                        <tr>
                          <td align="center" style="padding:20px 24px 12px 24px;">
                            <a href="%s"
                               style="display:inline-block;padding:12px 26px;border-radius:999px;background-color:#ff922b;color:#111827;text-decoration:none;font-size:14px;font-weight:600;">
                              Voir la Réservation (Admin)
                            </a>
                          </td>
                        </tr>

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
            """.formatted(
                alpName,
                reservationRef,
                vehicleName,
                pickUpDateTime, // Variable mise à jour
                reservation.getUser().getFirstname(),
                reservation.getUser().getLastname(),
                reservationLink,
                java.time.Year.now().getValue()
        );

        sendHtmlEmail(toEmail, subject, html);
        System.out.println("E-mail de notification ALP envoyé à : " + toEmail);
    }

    // -----------------------------------------------------------
    // AUTRES MÉTHODES EXISTANTES (INCHANGÉES)
    // -----------------------------------------------------------

    public void sendPasswordResetEmail(String toEmail, String token) {
        // ... (Code existant pour le reset password) ...
        String resetLink = frontendBaseUrl + "/reset-password?token=" + token;
        String subject = "Réinitialisation de votre mot de passe - Le Réseau Formation";
        String html = """
                <html>
                  <body style="margin:0;padding:0;background-color:#050721;font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
                    <table width="100%%" cellpadding="0" cellspacing="0" role="presentation">
                      <tr>
                        <td align="center" style="padding:24px 16px;">
                          <table width="100%%" cellpadding="0" cellspacing="0" role="presentation"
                                 style="max-width:560px;background:linear-gradient(145deg,#171c42,#111632,#090d23);border-radius:24px;overflow:hidden;border:1px solid rgba(148,163,184,0.25);">
                            
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

                            <tr>
                              <td align="center" style="padding:20px 24px 12px 24px;">
                                <a href="%s"
                                   style="display:inline-block;padding:12px 26px;border-radius:999px;background-color:#ff922b;color:#111827;text-decoration:none;font-size:14px;font-weight:600;">
                                  Réinitialiser mon mot de passe
                                </a>
                              </td>
                            </tr>

                            <tr>
                              <td style="padding:0 24px 14px 24px;">
                                <p style="margin:0;font-size:12px;line-height:1.6;color:#9ca3af;">
                                  Ce lien est valable pendant <strong style="color:#e5e7eb;">15 minutes</strong>. Si vous n'êtes pas à l'origine de cette demande,
                                  vous pouvez ignorer cet e-mail, votre mot de passe ne sera pas modifié.
                                </p>
                              </td>
                            </tr>

                            <tr>
                              <td style="padding:0 24px 22px 24px;">
                                <p style="margin:0;font-size:11px;line-height:1.6;color:#6b7280;">
                                  Si le bouton ne fonctionne pas, copiez-collez ce lien dans votre navigateur :<br/>
                                  <span style="word-break:break-all;color:#e5e7eb;">%s</span>
                                </p>
                              </td>
                            </tr>

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

    public void sendVerificationEmail(String toEmail, String token) {
        // ... (Code existant pour la vérification email) ...
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

                            <tr>
                              <td align="center" style="padding:20px 24px 12px 24px;">
                                <a href="%s"
                                   style="display:inline-block;padding:12px 28px;border-radius:999px;background-color:#ff922b;color:#111827;text-decoration:none;font-size:14px;font-weight:600;">
                                  Vérifier mon compte
                                </a>
                              </td>
                            </tr>

                            <tr>
                              <td style="padding:0 24px 14px 24px;">
                                <p style="margin:0;font-size:12px;line-height:1.6;color:#9ca3af;">
                                  Ce lien de vérification expirera dans <strong style="color:#e5e7eb;">15 minutes</strong>.<br/>
                                  Si vous n'êtes pas à l'origine de cette inscription, vous pouvez ignorer cet e-mail.
                                </p>
                              </td>
                            </tr>

                            <tr>
                              <td style="padding:0 24px 22px 24px;">
                                <p style="margin:0;font-size:11px;line-height:1.6;color:#6b7280;">
                                  Si le bouton ne fonctionne pas, copiez-collez ce lien dans votre navigateur :<br/>
                                  <span style="word-break:break-all;color:#e5e7eb;">%s</span>
                                </p>
                              </td>
                            </tr>

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

    // -----------------------------------------------------------
    // MÉTHODE UTILITAIRE PRIVÉE
    // -----------------------------------------------------------

    /**
     * Méthode utilitaire pour envoyer un e-mail HTML.
     */
    public void sendAlpWelcomeEmail(User user, String tempPassword) {
        sendAlpWelcomeEmail(user, tempPassword, "ALP", null);
    }

    public void sendAlpWelcomeEmail(User user, String tempPassword, String role, User alpReferent) {
        String roleLabel = "ARC".equalsIgnoreCase(role) ? "Apprenant ARC" : "Apprenant ALP";
        String subject = "Bienvenue sur Le Réseau Formation — Vos accès " + role.toUpperCase();
        String loginUrl = frontendBaseUrl + "/login";
        String html = """
            <html>
              <body style="margin:0;padding:0;background-color:#050721;font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
                <table width="100%%" cellpadding="0" cellspacing="0" role="presentation">
                  <tr>
                    <td align="center" style="padding:24px 16px;">
                      <table width="100%%" cellpadding="0" cellspacing="0" role="presentation"
                             style="max-width:560px;background:linear-gradient(145deg,#171c42,#111632,#090d23);border-radius:24px;overflow:hidden;border:1px solid rgba(148,163,184,0.2);">

                        <!-- Header -->
                        <tr>
                          <td style="padding:20px 24px 12px;border-bottom:1px solid rgba(148,163,184,0.2);">
                            <div style="display:flex;align-items:center;gap:10px;">
                              <div style="width:32px;height:32px;border-radius:50%%;background:#ff922b;display:flex;align-items:center;justify-content:center;font-size:15px;font-weight:700;color:#fff;">R</div>
                              <div>
                                <div style="font-size:12px;font-weight:700;color:#e5e7eb;text-transform:uppercase;letter-spacing:.08em;">Le Réseau Formation</div>
                                <div style="font-size:11px;color:#9ca3af;">Plateforme de formation & location</div>
                              </div>
                            </div>
                          </td>
                        </tr>

                        <!-- Titre -->
                        <tr>
                          <td align="center" style="padding:28px 24px 8px;">
                            <div style="width:60px;height:60px;border-radius:50%%;background:linear-gradient(135deg,#ff922b,#f59e0b);display:flex;align-items:center;justify-content:center;margin:0 auto 16px;">
                              <svg width="28" height="28" viewBox="0 0 24 24" fill="none"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" fill="white"/></svg>
                            </div>
                            <h1 style="margin:0 0 8px;font-size:22px;color:#f9fafb;font-weight:800;">Bienvenue, %s !</h1>
                            <p style="margin:0;font-size:13px;color:#94a3b8;line-height:1.6;max-width:440px;">
                              Votre compte <strong style="color:#ff922b;">%s</strong> a été créé par l'équipe Le Réseau Formation.
                              Vous pouvez dès maintenant vous connecter avec les identifiants ci-dessous.
                            </p>
                          </td>
                        </tr>

                        <!-- Identifiants -->
                        <tr>
                          <td style="padding:20px 24px;">
                            <div style="background:rgba(255,146,43,0.08);border:1px solid rgba(255,146,43,0.25);border-radius:16px;padding:20px;">
                              <p style="margin:0 0 14px;font-size:11px;font-weight:700;color:#ff922b;text-transform:uppercase;letter-spacing:.08em;">Vos identifiants de connexion</p>
                              <div style="margin-bottom:12px;">
                                <p style="margin:0 0 4px;font-size:11px;color:#6b7280;font-weight:600;text-transform:uppercase;letter-spacing:.06em;">Email</p>
                                <div style="background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);border-radius:10px;padding:10px 14px;">
                                  <span style="font-size:14px;color:#f9fafb;font-weight:600;">%s</span>
                                </div>
                              </div>
                              <div>
                                <p style="margin:0 0 4px;font-size:11px;color:#6b7280;font-weight:600;text-transform:uppercase;letter-spacing:.06em;">Mot de passe temporaire</p>
                                <div style="background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);border-radius:10px;padding:10px 14px;">
                                  <span style="font-size:14px;color:#f9fafb;font-family:monospace;font-weight:700;letter-spacing:.05em;">%s</span>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>

                        <!-- Avertissement -->
                        <tr>
                          <td style="padding:0 24px 20px;">
                            <div style="background:rgba(234,179,8,0.08);border:1px solid rgba(234,179,8,0.2);border-radius:12px;padding:12px 16px;display:flex;align-items:center;gap:10px;">
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style="flex-shrink:0;"><path d="M12 2L1 21h22L12 2zm0 3.5L20.5 19h-17L12 5.5zM11 10v4h2v-4h-2zm0 6v2h2v-2h-2z" fill="#eab308"/></svg>
                              <p style="margin:0;font-size:12px;color:#fde68a;line-height:1.5;">
                                <strong>Important :</strong> Modifiez votre mot de passe dès votre première connexion dans <em>Paramètres → Sécurité</em>.
                              </p>
                            </div>
                          </td>
                        </tr>

                        <!-- Bouton CTA -->
                        <tr>
                          <td align="center" style="padding:0 24px 28px;">
                            <a href="%s" style="display:inline-block;padding:14px 36px;border-radius:999px;background:linear-gradient(135deg,#ff922b,#f59e0b);color:#fff;text-decoration:none;font-size:15px;font-weight:700;box-shadow:0 4px 20px rgba(255,146,43,0.35);">
                              Accéder à la plateforme →
                            </a>
                          </td>
                        </tr>

                        <!-- Footer -->
                        <tr>
                          <td style="padding:14px 24px;border-top:1px solid rgba(148,163,184,0.15);">
                            <p style="margin:0;font-size:11px;color:#6b7280;text-align:center;">
                              Le Réseau Formation · Si vous n'êtes pas à l'origine de cette inscription, ignorez cet email.
                            </p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </body>
            </html>
            """.formatted(
                user.getFirstname() != null ? user.getFirstname() : "Apprenant",
                roleLabel,
                user.getEmail(),
                tempPassword,
                loginUrl
        );
        sendHtmlEmail(user.getEmail(), subject, html);
    }

    public void sendReservationRejectedEmail(User customer, String vehicleName,
                                              String startDate, String endDate, String reason) {
        if (customer.getEmail() == null || customer.getEmail().isEmpty()) return;

        String reasonBlock = (reason != null && !reason.isBlank())
                ? "<tr><td style=\"padding:0 24px 12px 24px;\"><div style=\"background:rgba(239,68,68,0.12);border:1px solid rgba(239,68,68,0.25);border-radius:12px;padding:12px 16px;\">"
                  + "<p style=\"margin:0;font-size:12px;color:#fca5a5;\"><strong style=\"color:#f87171;\">Motif :</strong> " + reason + "</p></div></td></tr>"
                : "";

        String subject = "Demande de réservation refusée — Le Réseau Formation";
        String html = """
            <html>
              <body style="margin:0;padding:0;background-color:#050721;font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
                <table width="100%%" cellpadding="0" cellspacing="0">
                  <tr><td align="center" style="padding:24px 16px;">
                    <table width="100%%" cellpadding="0" cellspacing="0"
                           style="max-width:560px;background:linear-gradient(145deg,#171c42,#111632,#090d23);border-radius:24px;overflow:hidden;border:1px solid rgba(148,163,184,0.25);">
                      <tr>
                        <td style="padding:20px 24px 12px 24px;border-bottom:1px solid rgba(148,163,184,0.25);">
                          <div style="font-size:12px;font-weight:600;color:#e5e7eb;text-transform:uppercase;letter-spacing:0.08em;">Le Réseau Formation</div>
                          <div style="font-size:11px;color:#9ca3af;">Plateforme de location &amp; formation</div>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:20px 24px 4px 24px;">
                          <h1 style="margin:0 0 8px 0;font-size:19px;color:#f9fafb;">Réservation refusée</h1>
                          <p style="margin:0;font-size:13px;line-height:1.6;color:#cbd5f5;">
                            Bonjour <strong style="color:#ffffff;">%s</strong>, votre demande de réservation
                            pour le véhicule <strong style="color:#ff922b;">%s</strong> du <strong style="color:#e5e7eb;">%s</strong>
                            au <strong style="color:#e5e7eb;">%s</strong> a malheureusement été refusée.
                          </p>
                        </td>
                      </tr>
                      %s
                      <tr>
                        <td style="padding:12px 24px 20px 24px;">
                          <p style="margin:0;font-size:12px;line-height:1.6;color:#9ca3af;">
                            Vous pouvez effectuer une nouvelle demande de réservation pour d'autres dates ou un autre véhicule depuis la plateforme.
                          </p>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:14px 24px 18px 24px;border-top:1px solid rgba(148,163,184,0.25);">
                          <p style="margin:0;font-size:11px;color:#6b7280;">© %d Le Réseau Formation</p>
                        </td>
                      </tr>
                    </table>
                  </td></tr>
                </table>
              </body>
            </html>
            """.formatted(
                customer.getFirstname() != null ? customer.getFirstname() : "Client",
                vehicleName, startDate, endDate,
                reasonBlock,
                java.time.Year.now().getValue()
        );
        sendHtmlEmail(customer.getEmail(), subject, html);
    }

    // ─── Gabarit commun ──────────────────────────────────────────────────────────

    private String emailWrapper(String accentColor, String iconEmoji, String bodyHtml) {
        return """
            <html>
              <body style="margin:0;padding:0;background:#050721;font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
                <table width="100%%" cellpadding="0" cellspacing="0">
                  <tr><td align="center" style="padding:28px 16px;">
                    <table width="100%%" cellpadding="0" cellspacing="0"
                           style="max-width:560px;background:linear-gradient(150deg,#181e48 0%%,#0e1330 60%%,#07091f 100%%);border-radius:24px;overflow:hidden;border:1px solid rgba(148,163,184,0.18);">

                      <!-- Header -->
                      <tr>
                        <td style="padding:18px 24px 14px 24px;border-bottom:1px solid rgba(148,163,184,0.12);">
                          <table cellpadding="0" cellspacing="0"><tr>
                            <td style="vertical-align:middle;padding-right:10px;">
                              <div style="width:36px;height:36px;border-radius:10px;background:%s;display:flex;align-items:center;justify-content:center;font-size:18px;line-height:36px;text-align:center;">%s</div>
                            </td>
                            <td style="vertical-align:middle;">
                              <div style="font-size:13px;font-weight:700;color:#f1f5f9;letter-spacing:0.04em;">Le Réseau Formation</div>
                              <div style="font-size:11px;color:#94a3b8;margin-top:1px;">Plateforme de location &amp; formation</div>
                            </td>
                          </tr></table>
                        </td>
                      </tr>

                      <!-- Corps -->
                      %s

                      <!-- Footer -->
                      <tr>
                        <td style="padding:14px 24px 18px 24px;border-top:1px solid rgba(148,163,184,0.10);">
                          <p style="margin:0;font-size:11px;color:#475569;">© %d Le Réseau Formation · Plateforme de mise en relation et de formation</p>
                        </td>
                      </tr>

                    </table>
                  </td></tr>
                </table>
              </body>
            </html>
            """.formatted(accentColor, iconEmoji, bodyHtml, java.time.Year.now().getValue());
    }

    private String reasonBlock(String reason, boolean danger) {
        if (reason == null || reason.isBlank()) return "";
        String bg    = danger ? "rgba(239,68,68,0.10)" : "rgba(251,146,60,0.10)";
        String border= danger ? "rgba(239,68,68,0.22)" : "rgba(251,146,60,0.22)";
        String label = danger ? "#f87171" : "#fb923c";
        String text  = danger ? "#fca5a5" : "#fdba74";
        return "<tr><td style=\"padding:0 24px 16px 24px;\">"
             + "<div style=\"background:" + bg + ";border:1px solid " + border + ";border-radius:12px;padding:12px 16px;\">"
             + "<p style=\"margin:0;font-size:12px;color:" + text + ";\"><strong style=\"color:" + label + ";\">Motif :</strong> " + reason + "</p>"
             + "</div></td></tr>";
    }

    private String ctaButton(String href, String label, String color) {
        return "<tr><td align=\"center\" style=\"padding:6px 24px 18px 24px;\">"
             + "<a href=\"" + href + "\" style=\"display:inline-block;padding:12px 28px;border-radius:999px;"
             + "background:" + color + ";color:#fff;text-decoration:none;font-size:14px;font-weight:700;letter-spacing:0.01em;\">"
             + label + "</a></td></tr>";
    }

    // ─── Véhicule approuvé ────────────────────────────────────────────────────────

    public void sendVehicleApprovedEmail(User owner, String brand, String model, String plateNumber) {
        if (owner.getEmail() == null || owner.getEmail().isEmpty()) return;
        String name = owner.getFirstname() != null ? owner.getFirstname() : "Propriétaire";
        String body = """
            <tr><td style="padding:22px 24px 6px 24px;">
              <h1 style="margin:0 0 10px 0;font-size:20px;color:#f1f5f9;">Véhicule approuvé !</h1>
              <p style="margin:0;font-size:13px;line-height:1.7;color:#94a3b8;">
                Bonjour <strong style="color:#fff;">%s</strong>, votre véhicule a été <strong style="color:#34d399;">validé</strong>
                par l'équipe Le Réseau Formation et est désormais visible sur la plateforme.
              </p>
            </td></tr>
            <tr><td style="padding:14px 24px 6px 24px;">
              <div style="background:rgba(52,211,153,0.08);border:1px solid rgba(52,211,153,0.2);border-radius:14px;padding:14px 18px;">
                <p style="margin:0 0 4px 0;font-size:15px;font-weight:700;color:#f1f5f9;">%s %s</p>
                <p style="margin:0;font-size:12px;color:#94a3b8;font-family:monospace;">%s</p>
              </div>
            </td></tr>
            <tr><td style="padding:14px 24px 4px 24px;">
              <p style="margin:0;font-size:12px;line-height:1.6;color:#64748b;">
                Les locataires peuvent désormais effectuer des demandes de réservation pour votre véhicule.
                Vous recevrez une notification dès qu'une demande sera soumise.
              </p>
            </td></tr>
            %s
            """.formatted(name, brand, model, plateNumber,
                ctaButton(frontendBaseUrl + "/vehicles", "Voir mes véhicules", "#34d399"));
        sendHtmlEmail(owner.getEmail(), "Votre véhicule " + brand + " " + model + " est approuvé — Le Réseau Formation",
                emailWrapper("#34d399", "✅", body));
    }

    // ─── Véhicule rejeté ──────────────────────────────────────────────────────────

    public void sendVehicleRejectedEmail(User owner, String brand, String model, String plateNumber, String reason) {
        if (owner.getEmail() == null || owner.getEmail().isEmpty()) return;
        String name = owner.getFirstname() != null ? owner.getFirstname() : "Propriétaire";
        String body = """
            <tr><td style="padding:22px 24px 6px 24px;">
              <h1 style="margin:0 0 10px 0;font-size:20px;color:#f1f5f9;">Véhicule non validé</h1>
              <p style="margin:0;font-size:13px;line-height:1.7;color:#94a3b8;">
                Bonjour <strong style="color:#fff;">%s</strong>, votre demande d'ajout de véhicule a été
                <strong style="color:#f87171;">refusée</strong> par l'équipe Le Réseau Formation.
              </p>
            </td></tr>
            <tr><td style="padding:14px 24px 6px 24px;">
              <div style="background:rgba(248,113,113,0.08);border:1px solid rgba(248,113,113,0.2);border-radius:14px;padding:14px 18px;">
                <p style="margin:0 0 4px 0;font-size:15px;font-weight:700;color:#f1f5f9;">%s %s</p>
                <p style="margin:0;font-size:12px;color:#94a3b8;font-family:monospace;">%s</p>
              </div>
            </td></tr>
            %s
            <tr><td style="padding:4px 24px 4px 24px;">
              <p style="margin:0;font-size:12px;line-height:1.6;color:#64748b;">
                Vous pouvez corriger les informations manquantes et soumettre à nouveau votre véhicule depuis la plateforme.
              </p>
            </td></tr>
            %s
            """.formatted(name, brand, model, plateNumber,
                reasonBlock(reason, true),
                ctaButton(frontendBaseUrl + "/vehicles", "Modifier et resoumettre", "#f87171"));
        sendHtmlEmail(owner.getEmail(), "Votre véhicule " + brand + " " + model + " n'a pas été validé — Le Réseau Formation",
                emailWrapper("#f87171", "❌", body));
    }

    // ─── Document approuvé ────────────────────────────────────────────────────────

    public void sendDocumentApprovedEmail(User owner, String docType, String scope) {
        if (owner.getEmail() == null || owner.getEmail().isEmpty()) return;
        String name  = owner.getFirstname() != null ? owner.getFirstname() : "Utilisateur";
        String label = docType.replace("_", " ");
        String body = """
            <tr><td style="padding:22px 24px 6px 24px;">
              <h1 style="margin:0 0 10px 0;font-size:20px;color:#f1f5f9;">Document validé !</h1>
              <p style="margin:0;font-size:13px;line-height:1.7;color:#94a3b8;">
                Bonjour <strong style="color:#fff;">%s</strong>, votre document a été
                <strong style="color:#34d399;">validé</strong> par l'équipe Le Réseau Formation.
              </p>
            </td></tr>
            <tr><td style="padding:14px 24px 6px 24px;">
              <div style="background:rgba(52,211,153,0.08);border:1px solid rgba(52,211,153,0.2);border-radius:14px;padding:14px 18px;">
                <p style="margin:0 0 2px 0;font-size:14px;font-weight:700;color:#f1f5f9;text-transform:capitalize;">%s</p>
                <p style="margin:0;font-size:12px;color:#94a3b8;">%s</p>
              </div>
            </td></tr>
            <tr><td style="padding:14px 24px 4px 24px;">
              <p style="margin:0;font-size:12px;line-height:1.6;color:#64748b;">
                Votre espace documentaire est à jour. Retrouvez tous vos documents validés dans votre espace personnel.
              </p>
            </td></tr>
            %s
            """.formatted(name, label, scope != null ? scope : "",
                ctaButton(frontendBaseUrl + "/documents", "Voir mes documents", "#34d399"));
        sendHtmlEmail(owner.getEmail(), "Document validé — Le Réseau Formation",
                emailWrapper("#34d399", "📄", body));
    }

    // ─── Document rejeté ──────────────────────────────────────────────────────────

    public void sendDocumentRejectedEmail(User owner, String docType, String scope, String reason) {
        if (owner.getEmail() == null || owner.getEmail().isEmpty()) return;
        String name  = owner.getFirstname() != null ? owner.getFirstname() : "Utilisateur";
        String label = docType.replace("_", " ");
        String body = """
            <tr><td style="padding:22px 24px 6px 24px;">
              <h1 style="margin:0 0 10px 0;font-size:20px;color:#f1f5f9;">Document refusé</h1>
              <p style="margin:0;font-size:13px;line-height:1.7;color:#94a3b8;">
                Bonjour <strong style="color:#fff;">%s</strong>, votre document a été
                <strong style="color:#f87171;">refusé</strong> par l'équipe Le Réseau Formation.
              </p>
            </td></tr>
            <tr><td style="padding:14px 24px 6px 24px;">
              <div style="background:rgba(248,113,113,0.08);border:1px solid rgba(248,113,113,0.2);border-radius:14px;padding:14px 18px;">
                <p style="margin:0 0 2px 0;font-size:14px;font-weight:700;color:#f1f5f9;text-transform:capitalize;">%s</p>
                <p style="margin:0;font-size:12px;color:#94a3b8;">%s</p>
              </div>
            </td></tr>
            %s
            <tr><td style="padding:4px 24px 4px 24px;">
              <p style="margin:0;font-size:12px;line-height:1.6;color:#64748b;">
                Veuillez soumettre à nouveau un document conforme depuis votre espace personnel.
              </p>
            </td></tr>
            %s
            """.formatted(name, label, scope != null ? scope : "",
                reasonBlock(reason, true),
                ctaButton(frontendBaseUrl + "/documents", "Gérer mes documents", "#f87171"));
        sendHtmlEmail(owner.getEmail(), "Document refusé — Le Réseau Formation",
                emailWrapper("#f87171", "📋", body));
    }

    // ─── Réservation confirmée (par loueur ou admin) ──────────────────────────────

    public void sendReservationApprovedEmail(Reservation reservation) {
        User customer = reservation.getUser();
        if (customer.getEmail() == null || customer.getEmail().isEmpty()) return;
        String name    = customer.getFirstname() != null ? customer.getFirstname() : "Client";
        String ref     = reservation.getId().toString().substring(0, 8).toUpperCase();
        String vehicle = reservation.getVehicle().getBrand() + " " + reservation.getVehicle().getModel();
        String start   = reservation.getStartDate().format(DateTimeFormatter.ofPattern("dd/MM/yyyy"));
        String end     = reservation.getEndDate().format(DateTimeFormatter.ofPattern("dd/MM/yyyy"));
        long nights    = java.time.Duration.between(reservation.getStartDate(), reservation.getEndDate()).toDays();
        String total   = reservation.getTotalAmount() != null
                ? String.format("%.0f €", reservation.getTotalAmount()) : "";
        String body = """
            <tr><td style="padding:22px 24px 6px 24px;">
              <h1 style="margin:0 0 10px 0;font-size:20px;color:#f1f5f9;">Réservation confirmée ! 🎉</h1>
              <p style="margin:0;font-size:13px;line-height:1.7;color:#94a3b8;">
                Bonjour <strong style="color:#fff;">%s</strong>, votre réservation
                n°&nbsp;<strong style="color:#fb923c;">%s</strong> a été
                <strong style="color:#34d399;">confirmée</strong> par le loueur.
              </p>
            </td></tr>
            <tr><td style="padding:14px 24px 6px 24px;">
              <div style="background:rgba(251,146,60,0.08);border:1px solid rgba(251,146,60,0.2);border-radius:14px;padding:16px 18px;">
                <p style="margin:0 0 10px 0;font-size:15px;font-weight:700;color:#f1f5f9;">%s</p>
                <table cellpadding="0" cellspacing="0" style="width:100%%;font-size:12px;color:#94a3b8;">
                  <tr>
                    <td style="padding-bottom:6px;"><span style="color:#64748b;">📅 Début</span></td>
                    <td style="text-align:right;color:#f1f5f9;font-weight:600;">%s</td>
                  </tr>
                  <tr>
                    <td style="padding-bottom:6px;"><span style="color:#64748b;">🏁 Fin</span></td>
                    <td style="text-align:right;color:#f1f5f9;font-weight:600;">%s</td>
                  </tr>
                  <tr>
                    <td style="padding-bottom:6px;"><span style="color:#64748b;">🌙 Durée</span></td>
                    <td style="text-align:right;color:#f1f5f9;font-weight:600;">%d nuit%s</td>
                  </tr>
                  %s
                </table>
              </div>
            </td></tr>
            <tr><td style="padding:14px 24px 4px 24px;">
              <p style="margin:0;font-size:12px;line-height:1.6;color:#64748b;">
                Préparez vos documents avant la date de prise en charge. En cas de question, contactez-nous via la messagerie de la plateforme.
              </p>
            </td></tr>
            %s
            """.formatted(name, ref, vehicle, start, end, nights, nights > 1 ? "s" : "",
                total.isEmpty() ? "" : "<tr><td><span style=\"color:#64748b;\">💰 Total</span></td><td style=\"text-align:right;color:#fb923c;font-weight:700;\">" + total + "</td></tr>",
                ctaButton(frontendBaseUrl + "/reservations", "Voir ma réservation", "#fb923c"));
        sendHtmlEmail(customer.getEmail(), "Réservation confirmée n° " + ref + " — Le Réseau Formation",
                emailWrapper("#fb923c", "🚗", body));
    }

    private void sendHtmlEmail(String toEmail, String subject, String htmlContent) {
        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            // Le "true" dans MimeMessageHelper indique que le contenu peut être multipart (HTML, images, etc.)
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");

            // NOTE : L'adresse d'envoi (setFrom) est gérée par spring.mail.properties.mail.smtp.from

            helper.setTo(toEmail);
            helper.setSubject(subject);
            helper.setText(htmlContent, true); // true => HTML

            mailSender.send(mimeMessage);
        } catch (MessagingException e) {
            throw new RuntimeException("Erreur lors de l'envoi de l'e-mail", e);
        }
    }
}