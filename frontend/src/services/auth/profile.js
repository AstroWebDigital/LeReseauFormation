// frontend/src/services/auth/profile.js
import api from "./client";

// Récupérer le profil
export const getProfile = () => {
    return api.get("/api/profile").then((res) => res.data);
    // Si ton ancien endpoint était /api/auth/profile, tu peux revenir dessus :
    // return api.get("/api/auth/profile").then((res) => res.data);
};

// Upload de la photo de profil
export const uploadProfilePhoto = (file) => {
    const form = new FormData();
    form.append("file", file);
    return api.post("/api/profile/photo", form).then((res) => res.data);
};

// 🔥 Nouveau : mise à jour des infos profil
export const updateProfile = (payload) => {
    // payload = { firstname, lastname, phone, sector }
    return api.put("/api/profile", payload).then((res) => res.data);
};
