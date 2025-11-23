// frontend/src/services/auth/index.js
import api, { TOKEN_KEY } from "./client";
import { register } from "./register";
import { login } from "./login";
import {
    getProfile,
    uploadProfilePhoto,
    updateProfile, // 👈 récupéré depuis profile.js
} from "./profile";
import { verifyEmail, resendVerificationEmail } from "./verifyEmail";
import { changePassword } from "./changePassword";
import { forgotPassword, resetPassword } from "./password";

export { TOKEN_KEY, api };

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
};

export default api;
