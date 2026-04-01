// frontend/src/services/auth/index.js
import api, { TOKEN_KEY } from "./client";
import { register } from "./register";
import { login } from "./login";
import {
    getProfile,
    uploadProfilePhoto,
    updateProfile,
} from "./profile";
import { verifyEmail, resendVerificationEmail } from "./verifyEmail";
import { changePassword } from "./changePassword";
import { forgotPassword, resetPassword } from "./password";

export { TOKEN_KEY, api };

const deleteAccount = () => api.delete("/api/profile");
const getMyReservations = () => api.get("/api/reservations/my");

export const AuthAPI = {
    register,
    login,
    profile: getProfile,
    uploadProfilePhoto,
    verifyEmail,
    resendVerificationEmail,
    updateProfile,
    changePassword,
    forgotPassword,
    resetPassword,
    deleteAccount,
    getMyReservations,
};

export default api;
