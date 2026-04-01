// frontend/src/services/auth/client.js
import axios from "axios";

export const TOKEN_KEY = "lr_token";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

const api = axios.create({
    baseURL: BASE_URL,
    timeout: 10000, // 10 secondes max
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;
