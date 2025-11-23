// frontend/src/services/auth/login.js
import api from "./client";

export const login = ({ email, password }) => {
    return api
        .post("/api/auth/login", { email, password })
        .then((res) => res.data);
};
