// Login.jsx
import React, { useState } from "react";
import { Button, Input, Card, CardBody } from "@heroui/react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import { useAuth } from "@/auth/AuthContext";

const Login = () => {
    const { login } = useAuth();
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [accountNotFound, setAccountNotFound] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setAccountNotFound(false);
        setLoading(true);

        try {
            await login(email, password);
            navigate("/profile");
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

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#050721] px-4 py-8">
            <Card className="w-full max-w-4xl rounded-[28px] bg-gradient-to-br from-[#171c42] via-[#111632] to-[#090d23] border border-white/10 text-white">
                <CardBody className="grid grid-cols-1 md:grid-cols-[1.1fr,0.9fr] gap-8 p-6 md:p-8 lg:p-10">
                    {/* Colonne gauche : formulaire */}
                    <div className="flex flex-col justify-center">
                        <div className="mb-6">
                            <p className="text-[0.7rem] uppercase tracking-[0.18em] text-orange-400 font-semibold mb-2">
                                Espace membre
                            </p>
                            <h1 className="text-2xl md:text-3xl font-semibold mb-1">
                                Connexion à votre compte
                            </h1>
                            <p className="text-xs md:text-sm text-slate-300">
                                Retrouvez vos véhicules, réservations et statistiques au même
                                endroit.
                            </p>
                        </div>

                        <form className="space-y-4" onSubmit={handleSubmit}>
                            <div>
                                <label className="block text-[0.7rem] font-medium text-slate-200 mb-1.5">
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
                                        inputWrapper:
                                            "bg-transparent border border-slate-600 rounded-xl hover:border-slate-400 focus-within:border-orange-400",
                                        input:
                                            "text-slate-100 text-sm placeholder:text-slate-500",
                                    }}
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    isDisabled={loading}
                                />
                            </div>

                            <div>
                                <label className="block text-[0.7rem] font-medium text-slate-200 mb-1.5">
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
                                        inputWrapper:
                                            "bg-transparent border border-slate-600 rounded-xl hover:border-slate-400 focus-within:border-orange-400",
                                        input:
                                            "text-slate-100 text-sm placeholder:text-slate-500",
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
                                                className="underline underline-offset-2 text-orange-300"
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
                                className="mt-2 bg-[#ff922b] text-slate-900 text-sm font-semibold hover:bg-[#ffa94d] transition-colors"
                                isDisabled={loading}
                                isLoading={loading}
                            >
                                Se connecter
                            </Button>

                            <div className="pt-2 text-[0.7rem] text-slate-400">
                                Pas encore de compte ?{" "}
                                <RouterLink
                                    to="/register"
                                    className="text-orange-300 underline underline-offset-2"
                                >
                                    Créer un compte
                                </RouterLink>
                            </div>
                        </form>
                    </div>

                    {/* Colonne droite : panneau visuel */}
                    <div className="hidden md:flex flex-col justify-between rounded-2xl bg-gradient-to-br from-[#191f46] via-[#141937] to-[#090d23] border border-white/5 px-6 py-6">
                        <div>
                            <p className="text-[0.7rem] uppercase tracking-[0.18em] text-orange-400 font-semibold mb-2">
                                Le Réseau Formation
                            </p>
                            <h2 className="text-lg font-semibold mb-3">
                                Gérez votre flotte en toute sérénité
                            </h2>
                            <p className="text-xs text-slate-300 mb-3">
                                Suivi du chiffre d’affaires, taux d’occupation, alertes
                                importantes, tâches du jour… tout est centralisé dans votre
                                tableau de bord.
                            </p>
                            <p className="text-[0.7rem] text-slate-400">
                                Accédez à vos véhicules, contrats, clients et indicateurs de
                                performance en un coup d’œil.
                            </p>
                        </div>

                        <div className="mt-6 border-t border-white/5 pt-4">
                            <p className="text-[0.7rem] italic text-slate-400">
                                “Une interface claire pour garder le contrôle sur ses
                                locations, même avec une flotte en pleine croissance.”
                            </p>
                        </div>
                    </div>
                </CardBody>
            </Card>
        </div>
    );
};

export default Login;
