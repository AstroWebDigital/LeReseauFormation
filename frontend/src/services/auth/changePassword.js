// frontend/src/services/auth/changePassword.js
import api from "./client";

/**
 * Change le mot de passe de l'utilisateur connecté.
 * @param {{ currentPassword: string, newPassword: string }} payload
 */
export const changePassword = (payload) => {
    return api.post("/api/profile/password", payload).then((res) => res.data);
};
