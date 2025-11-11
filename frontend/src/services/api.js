import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("auth_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const AuthAPI = {
  register: ({ email, password }) =>
      api.post("/api/auth/register", { email, password }),
  login: ({ email, password }) =>
      api.post("/api/auth/login", { email, password }),
  me: () => api.get("/api/auth/me"),
};

export default api;
