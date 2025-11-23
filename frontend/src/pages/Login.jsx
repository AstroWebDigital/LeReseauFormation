// frontend/src/pages/Login.jsx
import React, { useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { Card, CardBody, Button, Divider } from "@heroui/react";
import { useAuth } from "@/auth/AuthContext";
import FormInput from "../components/FormInput";

const Login = () => {
    const { login } = useAuth();
    const navigate = useNavigate();

    const [form, setForm] = useState({
        email: "",
        password: "",
    });
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const handleChange = (name, value) => {
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSubmitting(true);

        try {
            await login(form.email, form.password);
            navigate("/profile");
        } catch (err) {
            // console.error(err);
            setError(err.message || "Échec de la connexion.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <Card className="w-full max-w-4xl shadow-xl">
                <CardBody className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Colonne Formulaire */}
                    <div>
                        <h1 className="text-2xl font-bold mb-2">
                            Connexion
                        </h1>
                        <p className="text-gray-500 mb-6">
                            Connectez-vous pour accéder à votre espace.
                        </p>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <FormInput
                                label="Adresse email"
                                type="email"
                                name="email"
                                value={form.email}
                                onChange={(e) => handleChange("email", e.target.value)}
                                required
                            />

                            <FormInput
                                label="Mot de passe"
                                type="password"
                                name="password"
                                value={form.password}
                                onChange={(e) => handleChange("password", e.target.value)}
                                required
                            />

                            {error && (
                                <p className="text-sm text-red-500">
                                    {error}
                                </p>
                            )}

                            <Button
                                type="submit"
                                fullWidth
                                isLoading={submitting}
                                disabled={submitting}
                                className="mt-2"
                            >
                                Se connecter
                            </Button>
                        </form>

                        <Divider className="my-6" />

                        <p className="text-sm text-gray-500">
                            Pas encore de compte ?{" "}
                            <RouterLink
                                to="/register"
                                className="text-primary-600 hover:underline"
                            >
                                Créer un compte
                            </RouterLink>
                        </p>
                    </div>

                    {/* Colonne droite (texte / image / marketing) */}
                    <div className="hidden md:flex flex-col justify-center border-l pl-8">
                        <h2 className="text-xl font-semibold mb-4">
                            Le Réseau Formation
                        </h2>
                        <p className="text-gray-600 mb-4">
                            Accédez à vos sessions, suivis, documents et
                            ressources spécialisées via votre espace personnel.
                        </p>
                        <p className="text-sm italic text-right text-gray-400">
                            “Lorem ipsum dolor sit amet, consectetur adipiscing
                            elit. Nunc eget augue nec massa volutpat aliquet.”
                        </p>
                    </div>
                </CardBody>
            </Card>
        </div>
    );
};

export default Login;
