// Login.jsx
import React, { useState } from "react";
import { Button, Input, Card, CardBody } from "@heroui/react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import { useAuth } from "@/auth/AuthContext";
import { useTheme } from "@/theme/ThemeProvider";
import { Sun, Moon, Loader2 } from "lucide-react";
import api from "@/services/auth/client";

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

const GoogleIcon = () => (
    <svg width="18" height="18" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
        <path fill="#EA4335" d="M24 9.5c3.14 0 5.95 1.08 8.17 2.84l6.09-6.09C34.46 3.09 29.49 1 24 1 14.82 1 7.07 6.5 3.65 14.27l7.1 5.51C12.43 13.58 17.77 9.5 24 9.5z"/>
        <path fill="#4285F4" d="M46.1 24.55c0-1.64-.15-3.22-.42-4.74H24v8.97h12.43c-.54 2.9-2.17 5.36-4.63 7.01l7.1 5.51C43.26 37.24 46.1 31.35 46.1 24.55z"/>
        <path fill="#FBBC05" d="M10.75 28.22A14.54 14.54 0 0 1 9.5 24c0-1.47.25-2.89.69-4.22l-7.1-5.51A23.93 23.93 0 0 0 0 24c0 3.84.92 7.47 2.54 10.68l8.21-6.46z"/>
        <path fill="#34A853" d="M24 47c5.49 0 10.1-1.82 13.47-4.93l-7.1-5.51C28.57 38.25 26.42 39 24 39c-6.23 0-11.57-4.08-13.25-9.78l-8.21 6.46C6.07 43.5 14.47 47 24 47z"/>
    </svg>
);

// Composant séparé pour le bouton Google (n'est rendu que si le provider existe)
const GoogleLoginButton = ({ onSuccess, onError, isDark, disabled }) => {
    const { useGoogleLogin } = require("@react-oauth/google");
    const [googleLoading, setGoogleLoading] = useState(false);

    const googleLogin = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            setGoogleLoading(true);
            try {
                await onSuccess(tokenResponse);
            } finally {
                setGoogleLoading(false);
            }
        },
        onError: onError,
    });

    return (
        <Button
            fullWidth
            variant="bordered"
            type="button"
            startContent={googleLoading ? <Loader2 size={18} className="animate-spin" /> : <GoogleIcon />}
            isDisabled={googleLoading || disabled}
            onPress={() => googleLogin()}
            className={`rounded-xl text-sm font-medium mb-4 transition-all ${isDark
                ? "border-slate-600 text-slate-200 hover:border-slate-400 hover:bg-white/5"
                : "border-slate-300 text-slate-700 hover:border-slate-400 hover:bg-slate-50"
            }`}
        >
            {googleLoading ? "Connexion en cours..." : "Continuer avec Google"}
        </Button>
    );
};

const Login = () => {
    const { login, loginWithToken } = useAuth();
    const navigate = useNavigate();
    const { isDark, toggle } = useTheme();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [accountNotFound, setAccountNotFound] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleGoogleSuccess = async (tokenResponse) => {
        setError("");
        try {
            const { data } = await api.post("/api/auth/google", {
                accessToken: tokenResponse.access_token,
            });
            loginWithToken(data.token, data.user);
            navigate("/");
        } catch (err) {
            setError(err?.response?.data?.message || "Connexion Google échouée. Réessayez.");
        }
    };

    const handleGoogleError = () => {
        setError("Connexion Google annulée ou échouée.");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setAccountNotFound(false);
        setLoading(true);

        try {
            await login(email, password);
            navigate("/");
        } catch (err) {
            console.error(err);

            const status = err?.response?.status;
            let apiMessage =
                err?.response?.data?.message ||
                err?.response?.data ||
                err?.message ||
                "";

            if (status >= 500) {
                apiMessage = "Une erreur est survenue. Merci de réessayer plus tard.";
            }
            if (!apiMessage) {
                apiMessage = "Identifiant incorrect.";
            }

            if (
                typeof apiMessage === "string" &&
                apiMessage.startsWith("Aucun compte n'est associé")
            ) {
                setAccountNotFound(true);
                setError("Aucun compte n'est associé à cette adresse e-mail.");
            } else {
                setError(apiMessage);
            }
        } finally {
            setLoading(false);
        }
    };

    // ── styles dynamiques ──────────────────────────────────────────────────────
    const inputWrapperClass = isDark
        ? "bg-transparent border border-slate-600 rounded-xl hover:border-slate-400 focus-within:border-orange-400"
        : "bg-white border border-slate-300 rounded-xl hover:border-slate-400 focus-within:border-orange-400";

    const inputTextClass = isDark
        ? "text-slate-100 text-sm placeholder:text-slate-500"
        : "text-slate-800 text-sm placeholder:text-slate-400";

    return (
        <div className={`min-h-screen flex items-center justify-center px-4 py-8 relative transition-colors duration-300 ${isDark ? "bg-[#050721]" : "bg-slate-100"}`}>

            {/* Toggle thème */}
            <button
                onClick={toggle}
                className={`absolute top-5 right-5 p-2.5 rounded-xl border transition-all
                    ${isDark
                        ? "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:text-white"
                        : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-800 shadow-sm"
                    }`}
                title={isDark ? "Passer en mode clair" : "Passer en mode sombre"}
            >
                {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            <Card className={`w-full max-w-4xl rounded-[28px] border transition-colors duration-300 ${isDark
                ? "bg-gradient-to-br from-[#171c42] via-[#111632] to-[#090d23] border-white/10 text-white"
                : "bg-white border-slate-200 text-slate-800 shadow-lg"
            }`}>
                <CardBody className="grid grid-cols-1 md:grid-cols-[1.1fr,0.9fr] gap-8 p-6 md:p-8 lg:p-10">

                    {/* Colonne gauche : formulaire */}
                    <div className="flex flex-col justify-center">
                        <div className="mb-6">
                            <p className="text-[0.7rem] uppercase tracking-[0.18em] text-orange-400 font-semibold mb-2">
                                Espace membre
                            </p>
                            <h1 className={`text-2xl md:text-3xl font-semibold mb-1 ${isDark ? "text-white" : "text-slate-800"}`}>
                                Connexion à votre compte
                            </h1>
                            <p className={`text-xs md:text-sm ${isDark ? "text-slate-300" : "text-slate-500"}`}>
                                Retrouvez vos véhicules, réservations et statistiques au même endroit.
                            </p>
                        </div>

                        {/* Bouton Google - affiché seulement si configuré */}
                        {googleClientId && (
                            <GoogleLoginButton
                                onSuccess={handleGoogleSuccess}
                                onError={handleGoogleError}
                                isDark={isDark}
                                disabled={loading}
                            />
                        )}

                        {googleClientId && (
                            <div className="flex items-center gap-4 mb-4">
                                <div className={`flex-1 h-px ${isDark ? "bg-slate-700" : "bg-slate-200"}`} />
                                <span className={`text-[0.65rem] uppercase tracking-[0.15em] whitespace-nowrap ${isDark ? "text-slate-400" : "text-slate-400"}`}>
                                    ou par e-mail
                                </span>
                                <div className={`flex-1 h-px ${isDark ? "bg-slate-700" : "bg-slate-200"}`} />
                            </div>
                        )}

                        <form className="space-y-4" onSubmit={handleSubmit}>
                            <div>
                                <label className={`block text-[0.7rem] font-medium mb-1.5 ${isDark ? "text-slate-200" : "text-slate-600"}`}>
                                    Adresse e-mail
                                </label>
                                <Input
                                    type="email"
                                    variant="bordered"
                                    radius="lg"
                                    fullWidth
                                    size="sm"
                                    classNames={{
                                        base: "w-full",
                                        inputWrapper: inputWrapperClass,
                                        input: inputTextClass,
                                    }}
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    isDisabled={loading}
                                />
                            </div>

                            <div>
                                <div className="flex justify-end">
                                    <RouterLink
                                        to="/forgot-password"
                                        className="text-[0.7rem] text-orange-400 underline underline-offset-2"
                                    >
                                        Mot de passe oublié ?
                                    </RouterLink>
                                </div>

                                <label className={`block text-[0.7rem] font-medium mb-1.5 ${isDark ? "text-slate-200" : "text-slate-600"}`}>
                                    Mot de passe
                                </label>
                                <Input
                                    type="password"
                                    variant="bordered"
                                    radius="lg"
                                    fullWidth
                                    size="sm"
                                    classNames={{
                                        base: "w-full",
                                        inputWrapper: inputWrapperClass,
                                        input: inputTextClass,
                                    }}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    isDisabled={loading}
                                />
                            </div>

                            {error && (
                                <p className="text-[0.7rem] text-red-400">
                                    {error}{" "}
                                    {accountNotFound && (
                                        <>
                                            {" "}
                                            Vous pouvez{" "}
                                            <RouterLink
                                                to="/register"
                                                className="underline underline-offset-2 text-orange-400"
                                            >
                                                créer un compte
                                            </RouterLink>
                                            .
                                        </>
                                    )}
                                </p>
                            )}

                            <Button
                                type="submit"
                                fullWidth
                                radius="full"
                                className="mt-2 bg-[#ff922b] text-white text-sm font-semibold hover:bg-[#ffa94d] transition-colors"
                                isDisabled={loading}
                                isLoading={loading}
                            >
                                Se connecter
                            </Button>

                            <div className={`pt-2 text-[0.7rem] ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                                Pas encore de compte ?{" "}
                                <RouterLink
                                    to="/register"
                                    className="text-orange-400 underline underline-offset-2"
                                >
                                    Créer un compte
                                </RouterLink>
                            </div>
                        </form>
                    </div>

                    {/* Colonne droite : panneau visuel */}
                    <div className={`hidden md:flex flex-col justify-between rounded-2xl px-6 py-6 border transition-colors duration-300 ${isDark
                        ? "bg-gradient-to-br from-[#191f46] via-[#141937] to-[#090d23] border-white/5"
                        : "bg-gradient-to-br from-orange-50 via-slate-50 to-white border-slate-200"
                    }`}>
                        <div>
                            <p className="text-[0.7rem] uppercase tracking-[0.18em] text-orange-400 font-semibold mb-2">
                                Le Réseau Formation
                            </p>
                            <h2 className={`text-lg font-semibold mb-3 ${isDark ? "text-white" : "text-slate-800"}`}>
                                Gérez votre flotte en toute sérénité
                            </h2>
                            <p className={`text-xs mb-3 ${isDark ? "text-slate-300" : "text-slate-500"}`}>
                                Suivi du chiffre d'affaires, taux d'occupation, alertes
                                importantes, tâches du jour… tout est centralisé dans votre
                                tableau de bord.
                            </p>
                            <p className={`text-[0.7rem] ${isDark ? "text-slate-400" : "text-slate-400"}`}>
                                Accédez à vos véhicules, contrats, clients et indicateurs de
                                performance en un coup d'œil.
                            </p>
                        </div>

                        <div className={`mt-6 border-t pt-4 ${isDark ? "border-white/5" : "border-slate-200"}`}>
                            <p className={`text-[0.7rem] italic ${isDark ? "text-slate-400" : "text-slate-400"}`}>
                                "Une interface claire pour garder le contrôle sur ses
                                locations, même avec une flotte en pleine croissance."
                            </p>
                        </div>
                    </div>

                </CardBody>
            </Card>
        </div>
    );
};

export default Login;
