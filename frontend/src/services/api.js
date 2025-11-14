import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

const api = axios.create({
    baseURL: BASE_URL,
    headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem("auth_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

export const AuthAPI = {
    register: ({ email, password, firstname, lastname, phone, sector }) =>
        api.post("/api/auth/register", { email, password, firstname, lastname, phone, sector }),

    login: ({ email, password }) =>
        api.post("/api/auth/login", { email, password }),

    me: () => api.get("/api/auth/me"),

    uploadProfilePhoto: (file) => {
        const form = new FormData();
        form.append("file", file);
        return api.post("/api/profile/photo", form, {
            headers: { "Content-Type": "multipart/form-data" },
        });
    },
};

export default api;
