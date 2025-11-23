// frontend/src/services/auth/index.js
import api, { TOKEN_KEY } from "./client";
import { register } from "./register";
import { login } from "./login";
import { getProfile, uploadProfilePhoto } from "./profile";
import { verifyEmail, resendVerificationEmail } from "./verifyEmail";

export { TOKEN_KEY, api };

export const AuthAPI = {
    register,
    login,
    profile: getProfile,
    uploadProfilePhoto,
    verifyEmail,
    resendVerificationEmail, // 👈 nouveau
};

export default api;
