// frontend/src/services/auth/verifyEmail.js
import api from "./client";

export const verifyEmail = (token) => {
    return api
        .get("/api/auth/verify", { params: { token } })
        .then((res) => res.data);
};

export const resendVerificationEmail = () => {
    return api
        .post("/api/auth/verify/resend")
        .then((res) => res.data); // message texte
};
