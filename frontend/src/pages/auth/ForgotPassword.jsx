// frontend/src/pages/auth/ForgotPassword.jsx
import React, { useState } from "react";
import { Card, CardBody, Input, Button } from "@heroui/react";
import { AuthAPI } from "../../services/auth";

const ForgotPassword = () => {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage("");
        setError("");
        setLoading(true);

        try {
            const resp = await AuthAPI.forgotPassword(email);
            setMessage(
                resp || "Si un compte existe avec cet email, un lien a été envoyé."
            );
        } catch (err) {
            const msg =
                err?.response?.data?.message ||
                err?.response?.data ||
                err?.message ||
                "Impossible d'envoyer le lien de réinitialisation.";
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#050721] px-4">
            <Card className="w-full max-w-md rounded-[24px] bg-gradient-to-br from-[#171c42] via-[#111632] to-[#090d23] border border-white/10 text-white">
                <CardBody className="p-6 space-y-4">
                    <h1 className="text-xl font-semibold">Mot de passe oublié</h1>
                    <p className="text-xs text-slate-300">
                        Saisis ton adresse e-mail. Si un compte existe et est vérifié, tu
                        recevras un lien pour définir un nouveau mot de passe.
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-3">
                        <Input
                            type="email"
                            label="Adresse e-mail"
                            variant="bordered"
                            radius="lg"
                            size="sm"
                            classNames={{
                                base: "w-full",
                                inputWrapper:
                                    "bg-transparent border border-slate-600 rounded-xl hover:border-slate-400 focus-within:border-orange-400",
                                input: "text-slate-100 text-sm placeholder:text-slate-500",
                                label: "text-[0.7rem] text-slate-300",
                            }}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            isDisabled={loading}
                        />

                        {message && (
                            <p className="text-[0.7rem] text-emerald-300">{message}</p>
                        )}
                        {error && <p className="text-[0.7rem] text-red-300">{error}</p>}

                        <Button
                            type="submit"
                            fullWidth
                            className="mt-1 rounded-full bg-[#ff922b] text-slate-900 text-sm font-semibold hover:bg-[#ffa94d]"
                            isDisabled={loading}
                            isLoading={loading}
                        >
                            Envoyer le lien
                        </Button>
                    </form>
                </CardBody>
            </Card>
        </div>
    );
};

export default ForgotPassword;
