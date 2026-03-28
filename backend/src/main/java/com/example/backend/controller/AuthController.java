package com.example.backend.controller;

import com.example.backend.dto.AuthResponse;
import com.example.backend.dto.ForgotPasswordRequest;
import com.example.backend.dto.LoginRequest;
import com.example.backend.dto.RegisterRequest;
import com.example.backend.dto.ResetPasswordRequest;
import com.example.backend.service.PasswordResetService;
import com.example.backend.dto.UserDto;
import com.example.backend.entity.User;
import com.example.backend.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AuthController {

    private final AuthService authService;
    private final PasswordResetService passwordResetService;

    // URL publique du FRONTEND (ex: http://localhost:3000)
    @Value("${APP_FRONTEND_BASE_URL}")
    private String frontendBaseUrl;

    @PostMapping("/register")
    public ResponseEntity<UserDto> register(@RequestBody RegisterRequest request) {
        User user = authService.register(request);
        return ResponseEntity.status(201).body(authService.toDto(user));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request) {
        AuthResponse resp = authService.login(request);
        return ResponseEntity.ok(resp);
    }

    @PostMapping("/google")
    public ResponseEntity<AuthResponse> googleAuth(@RequestBody Map<String, String> body) {
        String accessToken = body.get("accessToken");
        AuthResponse resp = authService.loginOrRegisterWithGoogle(accessToken);
        return ResponseEntity.ok(resp);
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        try {
            // ✅ plus besoin de passer frontendBaseUrl
            passwordResetService.sendResetLink(request);
            // Réponse neutre (pour ne pas leak l'existence ou non de l'email)
            return ResponseEntity.ok(
                    "Si un compte existe avec cet email, un lien de réinitialisation a été envoyé."
            );
        } catch (IllegalStateException ex) {
            // cas : compte non vérifié
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        passwordResetService.resetPassword(request);
        return ResponseEntity.ok("Votre mot de passe a été réinitialisé avec succès.");
    }


    // 👉 Alias plus "parlant" pour le frontend : /profile
    @GetMapping("/")
    public ResponseEntity<UserDto> profile() {
        UserDto dto = authService.currentUserDto();
        return ResponseEntity.ok(dto);
    }

    /**
     * Supprime logiquement l'utilisateur actuellement authentifié (statut: SUPPRIME).
     * Requiert un token JWT valide.
     */
    @DeleteMapping("/delete")
    public ResponseEntity<Void> deleteUser() {
        authService.deleteCurrentUser();
        // 204 No Content est la réponse standard pour une suppression réussie.
        return ResponseEntity.noContent().build();
    }

    // Stateless: pas de vraie déconnexion serveur. Fourni pour compat :
    @PostMapping("/logout")
    public ResponseEntity<Void> logout() {
        return ResponseEntity.noContent().build(); // côté front: remove token
    }

    @GetMapping("/verify")
    public ResponseEntity<String> verify(@RequestParam("token") String token) {
        try {
            authService.verifyEmail(token);

            String homeUrl = frontendBaseUrl != null ? frontendBaseUrl : "/";

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
                              <td style="padding:18px 24px 12px 24px;border-bottom:1px solid rgba(148,163,184,0.25);">
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

                            <!-- Icône + titre -->
                            <tr>
                              <td align="center" style="padding:24px 24px 8px 24px;">
                                <div style="width:56px;height:56px;border-radius:999px;background-color:#16a34a1a;display:flex;align-items:center;justify-content:center;margin:0 auto 14px auto;">
                                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <circle cx="12" cy="12" r="10" fill="#22c55e"/>
                                    <path d="M9.5 12.5L11 14l3.5-4.5" stroke="white" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>
                                  </svg>
                                </div>
                                <h1 style="margin:0 0 8px 0;font-size:20px;color:#f9fafb;">
                                  Votre compte a été vérifié avec succès
                                </h1>
                                <p style="margin:0;font-size:13px;line-height:1.6;color:#cbd5f5;max-width:420px;">
                                  Merci d'avoir confirmé votre adresse e-mail. Vous pouvez maintenant vous connecter
                                  et profiter pleinement de <strong style="color:#ffffff;">Le Réseau Formation</strong>.
                                </p>
                              </td>
                            </tr>

                            <!-- Bouton -->
                            <tr>
                              <td align="center" style="padding:24px 24px 12px 24px;">
                                <a href="%s"
                                   style="display:inline-block;padding:12px 28px;border-radius:999px;background-color:#ff922b;color:#111827;text-decoration:none;font-size:14px;font-weight:600;">
                                  Retourner à l'accueil
                                </a>
                              </td>
                            </tr>

                            <!-- Texte secondaire -->
                            <tr>
                              <td style="padding:0 24px 24px 24px;">
                                <p style="margin:0;font-size:12px;line-height:1.6;color:#9ca3af;text-align:center;">
                                  Vous pouvez maintenant fermer cette page et vous connecter depuis l'application.
                                </p>
                              </td>
                            </tr>

                            <!-- Footer -->
                            <tr>
                              <td style="padding:14px 24px 18px 24px;border-top:1px solid rgba(148,163,184,0.25);">
                                <p style="margin:0;font-size:11px;color:#6b7280;text-align:center;">
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
                """.formatted(homeUrl);

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_TYPE, "text/html; charset=UTF-8")
                    .body(html);

        } catch (IllegalArgumentException e) {
            // Page d'erreur stylée
            String homeUrl = frontendBaseUrl != null ? frontendBaseUrl : "/";

            String htmlError = """
                <html>
                  <body style="margin:0;padding:0;background-color:#050721;font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
                    <table width="100%%" cellpadding="0" cellspacing="0" role="presentation">
                      <tr>
                        <td align="center" style="padding:24px 16px;">
                          <table width="100%%" cellpadding="0" cellspacing="0" role="presentation"
                                 style="max-width:560px;background:linear-gradient(145deg,#171c42,#111632,#090d23);border-radius:24px;overflow:hidden;border:1px solid rgba(248,113,113,0.5);">
                            
                            <!-- En-tête -->
                            <tr>
                              <td style="padding:18px 24px 12px 24px;border-bottom:1px solid rgba(248,113,113,0.4);">
                                <div style="display:flex;align-items:center;gap:10px;">
                                  <div style="width:28px;height:28px;border-radius:999px;background-color:#f97373;display:flex;align-items:center;justify-content:center;font-size:14px;color:#111827;">
                                    !
                                  </div>
                                  <div>
                                    <div style="font-size:12px;font-weight:600;color:#fecaca;text-transform:uppercase;letter-spacing:0.08em;">
                                      Vérification échouée
                                    </div>
                                    <div style="font-size:11px;color:#fecaca99;">
                                      Le lien n'est plus valide ou a déjà été utilisé
                                    </div>
                                  </div>
                                </div>
                              </td>
                            </tr>

                            <!-- Icône + titre -->
                            <tr>
                              <td align="center" style="padding:24px 24px 8px 24px;">
                                <div style="width:56px;height:56px;border-radius:999px;background-color:#fee2e2;display:flex;align-items:center;justify-content:center;margin:0 auto 14px auto;">
                                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <circle cx="12" cy="12" r="10" fill="#ef4444"/>
                                    <path d="M9.5 9.5L14.5 14.5M14.5 9.5L9.5 14.5" stroke="white" stroke-width="1.7" stroke-linecap="round"/>
                                  </svg>
                                </div>
                                <h1 style="margin:0 0 8px 0;font-size:20px;color:#f9fafb;">
                                  Impossible de vérifier votre compte
                                </h1>
                                <p style="margin:0;font-size:13px;line-height:1.6;color:#fecaca;max-width:420px;">
                                  %s
                                </p>
                              </td>
                            </tr>

                            <!-- Bouton -->
                            <tr>
                              <td align="center" style="padding:24px 24px 12px 24px;">
                                <a href="%s"
                                   style="display:inline-block;padding:12px 28px;border-radius:999px;background-color:#111827;color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;">
                                  Retourner à l'accueil
                                </a>
                              </td>
                            </tr>

                            <!-- Footer -->
                            <tr>
                              <td style="padding:14px 24px 18px 24px;border-top:1px solid rgba(248,113,113,0.4);">
                                <p style="margin:0;font-size:11px;color:#9ca3af;text-align:center;">
                                  Le Réseau Formation • Si le problème persiste, contactez le support.
                                </p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </body>
                </html>
                """.formatted(e.getMessage(), homeUrl);

            return ResponseEntity.badRequest()
                    .header(HttpHeaders.CONTENT_TYPE, "text/html; charset=UTF-8")
                    .body(htmlError);
        }
    }

}