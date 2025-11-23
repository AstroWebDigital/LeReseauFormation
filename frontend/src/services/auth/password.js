// frontend/src/services/auth/password.js
import api from "./client";

/**
 * Demande un email de réinitialisation de mot de passe.
 * Nécessite un compte existant et vérifié côté backend.
 */
export const forgotPassword = (email) => {
    return api
        .post("/api/auth/forgot-password", { email })
        .then((res) => res.data);
};

/**
 * Envoie un nouveau mot de passe avec le token reçu par email.
 */
export const resetPassword = (token, newPassword) => {
    return api
        .post("/api/auth/reset-password", { token, newPassword })
        .then((res) => res.data);
};
