// frontend/src/services/auth/password.js
import api from "./client";

// 🔒 Changer le mot de passe
// body attendu : { currentPassword, newPassword }
export const changePassword = (payload) => {
    return api.post("/api/profile/password", payload).then((res) => res.data);
};
