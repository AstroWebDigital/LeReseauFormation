// Register.jsx
import React, { useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { Card, CardBody, Button, Checkbox, Divider } from "@heroui/react";
import { Sun, Moon, Loader2 } from "lucide-react";
import { AuthAPI } from "../../services/auth";
import FormInput from "../../components/FormInput";
import { useTheme } from "@/theme/ThemeProvider";
import { useAuth } from "@/auth/AuthContext";
import api from "@/services/auth/client";
import { useGoogleLogin } from "@react-oauth/google";

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
            className={`rounded-xl text-sm font-medium transition-all ${isDark
                ? "border-slate-600 text-slate-200 hover:border-slate-400 hover:bg-white/5"
                : "border-slate-300 text-slate-700 hover:border-slate-400 hover:bg-slate-50"
            }`}
        >
            {googleLoading ? "Connexion en cours..." : "Continuer avec Google"}
        </Button>
    );
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const Register = () => {
    const navigate = useNavigate();
    const { isDark, toggle } = useTheme();
    const { loginWithToken } = useAuth();

    const [form, setForm] = useState({
        firstname: "",
        lastname: "",
        email: "",
        password: "",
        confirmPassword: "",
    });

    const [acceptedTerms, setAcceptedTerms] = useState(false);
    const [fieldErrors, setFieldErrors] = useState({});
    const [globalError, setGlobalError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
        if (fieldErrors[name]) {
            setFieldErrors(prev => ({ ...prev, [name]: undefined }));
        }
    };

    const validate = () => {
        const errors = {};
        if (!form.firstname.trim())
            errors.firstname = "Le prénom est requis.";
        if (!form.lastname.trim())
            errors.lastname = "Le nom est requis.";
        if (!form.email.trim())
            errors.email = "L'adresse e-mail est requise.";
        else if (!EMAIL_REGEX.test(form.email))
            errors.email = "L'adresse e-mail n'est pas valide.";
        if (!form.password)
            errors.password = "Le mot de passe est requis.";
        else if (form.password.length < 8)
            errors.password = "Le mot de passe doit contenir au moins 8 caractères.";
        if (!form.confirmPassword)
            errors.confirmPassword = "Veuillez confirmer votre mot de passe.";
        else if (form.password !== form.confirmPassword)
            errors.confirmPassword = "Les mots de passe ne correspondent pas.";
        if (!acceptedTerms)
            errors.terms = "Tu dois accepter les conditions d'utilisation.";
        return errors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setGlobalError("");
        const errors = validate();
        if (Object.keys(errors).length > 0) {
            setFieldErrors(errors);
            return;
        }
        setLoading(true);
        try {
            await AuthAPI.register({
                firstname: form.firstname,
                lastname: form.lastname,
                email: form.email,
                password: form.password,
            });
            navigate("/login");
        } catch (err) {
            const backendData = err?.response?.data;
            const msg =
                (backendData && backendData.message) ||
                (typeof backendData === "string" && backendData) ||
                err?.message ||
                "Erreur lors de l'inscription ou email déjà utilisé.";
            setGlobalError(msg);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSuccess = async (tokenResponse) => {
        setGlobalError("");
        try {
            const { data } = await api.post("/api/auth/google", {
                accessToken: tokenResponse.access_token,
            });
            loginWithToken(data.token, data.user);
            navigate("/");
        } catch (err) {
            setGlobalError(
                err?.response?.data?.message || "Connexion Google échouée. Réessayez."
            );
        }
    };

    const handleGoogleError = () => {
        setGlobalError("Connexion Google annulée ou échouée.");
    };

    // ── styles dynamiques ──────────────────────────────────────────────────────
    const inputStyles = {
        variant: "bordered",
        radius: "lg",
        classNames: {
            base: "w-full",
            inputWrapper: isDark
                ? "bg-transparent border border-slate-600 rounded-xl hover:border-slate-400 focus-within:border-orange-400"
                : "bg-white border border-slate-300 rounded-xl hover:border-slate-400 focus-within:border-orange-400",
            input: isDark
                ? "text-slate-100 text-sm placeholder:text-slate-500"
                : "text-slate-800 text-sm placeholder:text-slate-400",
            label: isDark ? "text-[0.7rem] text-slate-200" : "text-[0.7rem] text-slate-600",
        },
    };

    return (
        <div className={`min-h-screen flex items-center justify-center px-4 py-8 relative transition-colors duration-300 ${isDark ? "bg-[#050721]" : "bg-slate-100"}`}>

            {/* Toggle thème */}
            <button
                onClick={toggle}
                className={`absolute top-5 right-5 p-2.5 rounded-xl border transition-all z-10
                    ${isDark
                        ? "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:text-white"
                        : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-800 shadow-sm"
                    }`}
                title={isDark ? "Passer en mode clair" : "Passer en mode sombre"}
            >
                {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            <Card className={`w-full max-w-5xl rounded-[28px] border transition-colors duration-300 ${isDark
                ? "bg-gradient-to-br from-[#171c42] via-[#111632] to-[#090d23] border-white/10 text-white"
                : "bg-white border-slate-200 text-slate-800 shadow-lg"
            }`}>
                <CardBody className="p-0">
                    <div className="grid md:grid-cols-[1.15fr,0.85fr] h-full">

                        {/* Colonne gauche : formulaire */}
                        <div className="flex flex-col justify-between p-6 md:p-8 lg:p-10">
                            <div className="space-y-5">

                                {/* Titre */}
                                <div>
                                    <p className="text-[0.7rem] uppercase tracking-[0.18em] text-orange-400 font-semibold mb-2">
                                        Création de compte
                                    </p>
                                    <h1 className={`text-2xl md:text-3xl font-semibold mb-1 ${isDark ? "text-white" : "text-slate-800"}`}>
                                        Rejoindre Le Réseau
                                    </h1>
                                    <p className={`text-xs md:text-sm ${isDark ? "text-slate-300" : "text-slate-500"}`}>
                                        Crée ton espace pour suivre tes véhicules, tes réservations et tes performances.
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

                                {/* Séparateur - affiché seulement si Google est configuré */}
                                {googleClientId && (
                                    <div className="flex items-center gap-4">
                                        <Divider className={isDark ? "flex-1 bg-slate-700" : "flex-1 bg-slate-200"} />
                                        <span className={`text-[0.65rem] uppercase tracking-[0.15em] whitespace-nowrap ${isDark ? "text-slate-400" : "text-slate-400"}`}>
                                            ou par e-mail
                                        </span>
                                        <Divider className={isDark ? "flex-1 bg-slate-700" : "flex-1 bg-slate-200"} />
                                    </div>
                                )}

                                {/* Formulaire */}
                                <form onSubmit={handleSubmit} className="space-y-3" noValidate>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <div>
                                            <FormInput
                                                label="Prénom"
                                                name="firstname"
                                                value={form.firstname}
                                                onChange={handleChange}
                                                placeholder="Jean"
                                                isDisabled={loading}
                                                {...inputStyles}
                                            />
                                            {fieldErrors.firstname && (
                                                <p className="text-red-400 text-[0.7rem] mt-1 ml-0.5">{fieldErrors.firstname}</p>
                                            )}
                                        </div>
                                        <div>
                                            <FormInput
                                                label="Nom"
                                                name="lastname"
                                                value={form.lastname}
                                                onChange={handleChange}
                                                placeholder="Durand"
                                                isDisabled={loading}
                                                {...inputStyles}
                                            />
                                            {fieldErrors.lastname && (
                                                <p className="text-red-400 text-[0.7rem] mt-1 ml-0.5">{fieldErrors.lastname}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div>
                                        <FormInput
                                            label="Adresse e-mail"
                                            type="email"
                                            name="email"
                                            value={form.email}
                                            onChange={handleChange}
                                            placeholder="vous@exemple.fr"
                                            isDisabled={loading}
                                            {...inputStyles}
                                        />
                                        {fieldErrors.email && (
                                            <p className="text-red-400 text-[0.7rem] mt-1 ml-0.5">{fieldErrors.email}</p>
                                        )}
                                    </div>

                                    <div>
                                        <FormInput
                                            label="Mot de passe"
                                            type="password"
                                            name="password"
                                            value={form.password}
                                            onChange={handleChange}
                                            placeholder="Minimum 8 caractères"
                                            isDisabled={loading}
                                            {...inputStyles}
                                        />
                                        {fieldErrors.password && (
                                            <p className="text-red-400 text-[0.7rem] mt-1 ml-0.5">{fieldErrors.password}</p>
                                        )}
                                    </div>

                                    <div>
                                        <FormInput
                                            label="Confirmer le mot de passe"
                                            type="password"
                                            name="confirmPassword"
                                            value={form.confirmPassword}
                                            onChange={handleChange}
                                            placeholder="Répéter le mot de passe"
                                            isDisabled={loading}
                                            {...inputStyles}
                                        />
                                        {fieldErrors.confirmPassword && (
                                            <p className="text-red-400 text-[0.7rem] mt-1 ml-0.5">{fieldErrors.confirmPassword}</p>
                                        )}
                                    </div>

                                    <div>
                                        <Checkbox
                                            isSelected={acceptedTerms}
                                            onValueChange={(v) => {
                                                setAcceptedTerms(v);
                                                if (v && fieldErrors.terms)
                                                    setFieldErrors(prev => ({ ...prev, terms: undefined }));
                                            }}
                                            size="sm"
                                            classNames={{
                                                base: "items-start mt-1",
                                                label: `text-[0.7rem] leading-relaxed ${isDark ? "text-slate-300" : "text-slate-500"}`,
                                            }}
                                        >
                                            J'accepte les{" "}
                                            <button type="button" className="underline underline-offset-2 text-orange-400">
                                                Conditions d'utilisation
                                            </button>{" "}
                                            et la{" "}
                                            <button type="button" className="underline underline-offset-2 text-orange-400">
                                                Politique de confidentialité
                                            </button>
                                            .
                                        </Checkbox>
                                        {fieldErrors.terms && (
                                            <p className="text-red-400 text-[0.7rem] mt-1 ml-0.5">{fieldErrors.terms}</p>
                                        )}
                                    </div>

                                    {globalError && (
                                        <p className="text-[0.7rem] text-red-400">{globalError}</p>
                                    )}

                                    <Button
                                        type="submit"
                                        fullWidth
                                        radius="full"
                                        isDisabled={loading}
                                        isLoading={loading}
                                        className="mt-1 bg-[#ff922b] text-white text-sm font-semibold hover:bg-[#ffa94d] transition-colors"
                                    >
                                        Créer mon compte
                                    </Button>
                                </form>
                            </div>

                            <div className={`mt-6 text-[0.7rem] text-center ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                                Déjà un compte ?{" "}
                                <RouterLink to="/login" className="underline underline-offset-2 text-orange-400">
                                    Se connecter
                                </RouterLink>
                            </div>
                        </div>

                        {/* Colonne droite : panneau visuel */}
                        <div className={`relative hidden md:flex flex-col justify-between rounded-r-[28px] border-l p-8 transition-colors duration-300 ${isDark
                            ? "bg-gradient-to-br from-[#191f46] via-[#141937] to-[#090d23] border-white/5"
                            : "bg-gradient-to-br from-orange-50 via-slate-50 to-white border-slate-200"
                        }`}>
                            <div>
                                <p className="text-[0.7rem] uppercase tracking-[0.18em] text-orange-400 font-semibold mb-2">
                                    Vue d'ensemble
                                </p>
                                <h2 className={`text-lg font-semibold mb-3 ${isDark ? "text-white" : "text-slate-800"}`}>
                                    Un cockpit pour ta flotte
                                </h2>
                                <p className={`text-xs mb-3 ${isDark ? "text-slate-300" : "text-slate-500"}`}>
                                    Visualise ton chiffre d'affaires, les alertes importantes et
                                    les tâches du jour pour ne rien laisser passer.
                                </p>
                                <p className={`text-[0.7rem] ${isDark ? "text-slate-400" : "text-slate-400"}`}>
                                    L'interface est pensée pour les loueurs : claire, rapide, et
                                    prête pour la croissance de ton activité.
                                </p>
                            </div>

                            <div className={`mt-6 border-t pt-4 ${isDark ? "border-white/5" : "border-slate-200"}`}>
                                <p className={`text-[0.7rem] italic ${isDark ? "text-slate-400" : "text-slate-400"}`}>
                                    "Depuis que j'utilise la plateforme, j'ai une vision précise
                                    de mes réservations et je ne rate plus les échéances
                                    d'assurance ou d'entretien."
                                </p>
                            </div>
                        </div>

                    </div>
                </CardBody>
            </Card>
        </div>
    );
};

export default Register;
