// frontend/src/services/auth/profile.js
import api from "./client";

export const getProfile = () => {
    return api.get("/api/auth/profile").then((res) => res.data);
};

export const uploadProfilePhoto = (file) => {
    const form = new FormData();
    form.append("file", file);
    return api.post("/api/profile/photo", form).then((res) => res.data);
};
