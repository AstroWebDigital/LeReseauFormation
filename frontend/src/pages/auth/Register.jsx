// Register.jsx
import React, { useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { Card, CardBody, Button, Checkbox, Divider } from "@heroui/react";
import { AuthAPI } from "../../services/auth";
import FormInput from "../../components/FormInput";

const Register = () => {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        firstname: "",
        lastname: "",
        email: "",
        password: "",
        confirmPassword: "",
    });

    const [acceptedTerms, setAcceptedTerms] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (form.password !== form.confirmPassword) {
            setError("Les mots de passe ne correspondent pas.");
            return;
        }

        if (!acceptedTerms) {
            setError("Tu dois accepter les conditions d'utilisation.");
            return;
        }

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

            setError(msg);
        }
    };

    const inputStyles = {
        variant: "bordered",
        radius: "lg",
        classNames: {
            base: "w-full",
            inputWrapper:
                "bg-transparent border border-slate-600 rounded-xl hover:border-slate-400 focus-within:border-orange-400",
            input: "text-slate-100 text-sm placeholder:text-slate-500",
            label: "text-[0.7rem] text-slate-200",
        },
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#050721] px-4 py-8">
            <Card className="w-full max-w-5xl rounded-[28px] bg-gradient-to-br from-[#171c42] via-[#111632] to-[#090d23] border border-white/10 text-white">
                <CardBody className="p-0">
                    <div className="grid md:grid-cols-[1.15fr,0.85fr] h-full">
                        {/* Colonne gauche : formulaire */}
                        <div className="flex flex-col justify-between p-6 md:p-8 lg:p-10">
                            <div className="space-y-7">
                                <div>
                                    <p className="text-[0.7rem] uppercase tracking-[0.18em] text-orange-400 font-semibold mb-2">
                                        Création de compte
                                    </p>
                                    <h1 className="text-2xl md:text-3xl font-semibold mb-1">
                                        Rejoindre Le Réseau
                                    </h1>
                                    <p className="text-xs md:text-sm text-slate-300">
                                        Crée ton espace pour suivre tes véhicules, tes réservations
                                        et tes performances au quotidien.
                                    </p>
                                </div>

                                <div className="space-y-3">
                                    <Button
                                        fullWidth
                                        variant="bordered"
                                        type="button"
                                        className="border-slate-600 text-xs text-slate-200"
                                    >
                                        Continuer avec Google
                                    </Button>
                                    <Button
                                        fullWidth
                                        variant="bordered"
                                        type="button"
                                        className="border-slate-600 text-xs text-slate-200"
                                    >
                                        Continuer avec Github
                                    </Button>
                                </div>

                                <div className="flex items-center gap-4">
                                    <Divider className="flex-1 bg-slate-700" />
                                    <span className="text-[0.65rem] uppercase tracking-[0.15em] text-slate-400">
                    ou par e-mail
                  </span>
                                    <Divider className="flex-1 bg-slate-700" />
                                </div>

                                {/* Formulaire */}
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <FormInput
                                            label="Prénom"
                                            name="firstname"
                                            value={form.firstname}
                                            onChange={handleChange}
                                            required
                                            placeholder="Jean"
                                            {...inputStyles}
                                        />
                                        <FormInput
                                            label="Nom"
                                            name="lastname"
                                            value={form.lastname}
                                            onChange={handleChange}
                                            required
                                            placeholder="Durand"
                                            {...inputStyles}
                                        />
                                    </div>

                                    <FormInput
                                        label="Adresse e-mail"
                                        type="email"
                                        name="email"
                                        value={form.email}
                                        onChange={handleChange}
                                        required
                                        placeholder="vous@exemple.fr"
                                        {...inputStyles}
                                    />

                                    <FormInput
                                        label="Mot de passe"
                                        type="password"
                                        name="password"
                                        value={form.password}
                                        onChange={handleChange}
                                        required
                                        placeholder="Créer un mot de passe"
                                        {...inputStyles}
                                    />

                                    <FormInput
                                        label="Confirmer le mot de passe"
                                        type="password"
                                        name="confirmPassword"
                                        value={form.confirmPassword}
                                        onChange={handleChange}
                                        required
                                        placeholder="Répéter le mot de passe"
                                        {...inputStyles}
                                    />

                                    <Checkbox
                                        isSelected={acceptedTerms}
                                        onValueChange={setAcceptedTerms}
                                        size="sm"
                                        classNames={{
                                            base: "items-start mt-2",
                                            label: "text-[0.7rem] leading-relaxed text-slate-200",
                                        }}
                                    >
                                        J'accepte les{" "}
                                        <button type="button" className="underline underline-offset-2 text-orange-300">
                                            Conditions d’utilisation
                                        </button>{" "}
                                        et la{" "}
                                        <button type="button" className="underline underline-offset-2 text-orange-300">
                                            Politique de confidentialité
                                        </button>
                                        .
                                    </Checkbox>



                                    {error && (
                                        <p className="text-[0.7rem] text-red-400 mt-1">{error}</p>
                                    )}

                                    <Button
                                        type="submit"
                                        fullWidth
                                        className="mt-2 bg-[#ff922b] text-slate-900 text-sm font-semibold rounded-full hover:bg-[#ffa94d] transition-colors"
                                    >
                                        Créer mon compte
                                    </Button>
                                </form>
                            </div>

                            <div className="mt-8 text-[0.7rem] text-center text-slate-400">
                                Déjà un compte ?{" "}
                                <RouterLink
                                    to="/login"
                                    className="underline underline-offset-2 text-orange-300"
                                >
                                    Se connecter
                                </RouterLink>
                            </div>
                        </div>

                        {/* Colonne droite : panneau visuel */}
                        <div className="relative hidden md:flex flex-col justify-between bg-gradient-to-br from-[#191f46] via-[#141937] to-[#090d23] border-l border-white/5 rounded-r-[28px] p-8">
                            <div>
                                <p className="text-[0.7rem] uppercase tracking-[0.18em] text-orange-400 font-semibold mb-2">
                                    Vue d’ensemble
                                </p>
                                <h2 className="text-lg font-semibold mb-3">
                                    Un cockpit pour ta flotte
                                </h2>
                                <p className="text-xs text-slate-300 mb-3">
                                    Visualise ton chiffre d’affaires, les alertes importantes et
                                    les tâches du jour pour ne rien laisser passer.
                                </p>
                                <p className="text-[0.7rem] text-slate-400">
                                    L’interface est pensée pour les loueurs : claire, rapide, et
                                    prête pour la croissance de ton activité.
                                </p>
                            </div>

                            <div className="mt-6 border-t border-white/5 pt-4">
                                <p className="text-[0.7rem] italic text-slate-400">
                                    “Depuis que j’utilise la plateforme, j’ai une vision précise
                                    de mes réservations et je ne rate plus les échéances
                                    d’assurance ou d’entretien.”
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
