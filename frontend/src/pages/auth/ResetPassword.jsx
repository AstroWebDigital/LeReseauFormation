// frontend/src/pages/ResetPassword.jsx
import React, { useState, useEffect, useMemo } from "react";
import { Card, CardBody, Input, Button } from "@heroui/react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { AuthAPI } from "../../services/auth";

const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_MAX_LENGTH = 72;

const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const [form, setForm] = useState({
        newPassword: "",
        confirmPassword: "",
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    const token = searchParams.get("token");

    useEffect(() => {
        if (!token) {
            setError("Lien de réinitialisation invalide.");
        }
    }, [token]);

    const handleChange = (e) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
        setError("");
        setMessage("");
    };

    // ✅ État de validation du mot de passe
    const passwordChecks = useMemo(() => {
        const pwd = form.newPassword || "";

        const hasMinLength = pwd.length >= PASSWORD_MIN_LENGTH;
        const hasMaxLength = pwd.length <= PASSWORD_MAX_LENGTH;
        const hasLower = /[a-z]/.test(pwd);
        const hasUpper = /[A-Z]/.test(pwd);
        const hasDigit = /\d/.test(pwd);
        const hasSpecial = /[^A-Za-z0-9]/.test(pwd); // facultatif

        return {
            hasMinLength,
            hasMaxLength,
            hasLower,
            hasUpper,
            hasDigit,
            hasSpecial,
            isValid:
                hasMinLength &&
                hasMaxLength &&
                hasLower &&
                hasUpper &&
                hasDigit, // on ne rend pas le spécial obligatoire
        };
    }, [form.newPassword]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setMessage("");

        if (!token) {
            setError("Lien de réinitialisation invalide.");
            return;
        }

        if (!form.newPassword || !form.confirmPassword) {
            setError("Merci de remplir tous les champs.");
            return;
        }

        if (!passwordChecks.isValid) {
            setError(
                `Le mot de passe doit respecter les critères indiqués ci-dessous.`
            );
            return;
        }

        if (form.newPassword !== form.confirmPassword) {
            setError("Les mots de passe ne correspondent pas.");
            return;
        }

        setLoading(true);
        try {
            // ✅ Bon appel : (token, newPassword) et pas un objet
            const resp = await AuthAPI.resetPassword(token, form.newPassword);
            setMessage(resp || "Mot de passe réinitialisé avec succès.");
            setTimeout(() => navigate("/login"), 1500);
        } catch (err) {
            const msg =
                err?.response?.data?.message ||
                err?.response?.data ||
                err?.message ||
                "Impossible de réinitialiser le mot de passe.";
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    const inputClassNames = {
        base: "w-full",
        inputWrapper:
            "bg-transparent border border-slate-600 rounded-xl hover:border-slate-400 focus-within:border-orange-400",
        input: "text-slate-100 text-sm placeholder:text-slate-500",
        label: "text-[0.7rem] text-slate-300",
    };

    const getCheckClass = (ok) =>
        `text-[0.7rem] flex items-center gap-1 ${
            ok ? "text-emerald-300" : "text-slate-400"
        }`;

    const CheckBullet = ({ ok, children }) => (
        <li className={getCheckClass(ok)}>
            <span
                className={`inline-block w-1.5 h-1.5 rounded-full ${
                    ok ? "bg-emerald-300" : "bg-slate-500"
                }`}
            />
            <span>{children}</span>
        </li>
    );

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#050721] px-4">
            <Card className="w-full max-w-md rounded-[24px] bg-gradient-to-br from-[#171c42] via-[#111632] to-[#090d23] border border-white/10 text-white">
                <CardBody className="p-6 space-y-4">
                    <h1 className="text-xl font-semibold">
                        Réinitialiser le mot de passe
                    </h1>
                    <p className="text-xs text-slate-300">
                        Choisissez un nouveau mot de passe pour votre compte.
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-3">
                        <Input
                            type="password"
                            label="Nouveau mot de passe"
                            name="newPassword"
                            variant="bordered"
                            radius="lg"
                            size="sm"
                            classNames={inputClassNames}
                            value={form.newPassword}
                            onChange={handleChange}
                            isDisabled={loading}
                        />

                        <Input
                            type="password"
                            label="Confirmer le mot de passe"
                            name="confirmPassword"
                            variant="bordered"
                            radius="lg"
                            size="sm"
                            classNames={inputClassNames}
                            value={form.confirmPassword}
                            onChange={handleChange}
                            isDisabled={loading}
                        />

                        {/* ✅ Règles de mot de passe sous les inputs */}
                        <div className="mt-1">
                            <p className="text-[0.65rem] text-slate-400 mb-1">
                                Le mot de passe doit contenir au minimum :
                            </p>
                            <ul className="space-y-0.5">
                                <CheckBullet ok={passwordChecks.hasMinLength}>
                                    Au moins {PASSWORD_MIN_LENGTH} caractères
                                </CheckBullet>
                                <CheckBullet ok={passwordChecks.hasLower}>
                                    Une lettre minuscule
                                </CheckBullet>
                                <CheckBullet ok={passwordChecks.hasUpper}>
                                    Une lettre majuscule
                                </CheckBullet>
                                <CheckBullet ok={passwordChecks.hasDigit}>
                                    Un chiffre
                                </CheckBullet>
                                <CheckBullet ok={passwordChecks.hasSpecial}>
                                    (Optionnel) Un caractère spécial
                                    (&amp;,$,%,!,...)
                                </CheckBullet>
                            </ul>
                        </div>

                        {error && (
                            <p className="text-[0.7rem] text-red-300">{error}</p>
                        )}
                        {message && (
                            <p className="text-[0.7rem] text-emerald-300">
                                {message}
                            </p>
                        )}

                        <Button
                            type="submit"
                            fullWidth
                            className="mt-1 rounded-full bg-[#ff922b] text-slate-900 text-sm font-semibold hover:bg-[#ffa94d]"
                            isDisabled={loading || !token}
                            isLoading={loading}
                        >
                            Mettre à jour le mot de passe
                        </Button>
                    </form>
                </CardBody>
            </Card>
        </div>
    );
};

export default ResetPassword;
