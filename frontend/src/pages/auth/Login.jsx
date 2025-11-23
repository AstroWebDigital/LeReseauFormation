import React, { useState } from "react";
import { Button, Input, Card, CardBody } from "@heroui/react";
import { AuthAPI } from "../../services/auth";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import { useAuth } from "@/auth/AuthContext";

const Login = () => {
    const { setUser, setToken } = useAuth();
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
            const resp = await AuthAPI.login({ email, password });

            setToken(resp.token);
            setUser?.(resp.user);

            navigate("/profile");
        } catch (err) {
            console.error(err);

            const status = err?.response?.status;

            let apiMessage =
                err?.response?.data?.message ||
                err?.response?.data ||
                "";

            // Erreurs serveur (500, 502, etc.) → message générique
            if (status >= 500) {
                apiMessage = "Une erreur est survenue. Merci de réessayer plus tard.";
            }

            // Rien de compréhensible côté backend → fallback
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
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-8">
            <Card className="w-full max-w-4xl shadow-lg rounded-3xl">
                <CardBody className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8">
                    {/* Colonne gauche : formulaire */}
                    <div>
                        <h1 className="text-2xl font-semibold mb-1">Connexion</h1>
                        <p className="text-sm text-default-500 mb-6">
                            Connectez-vous pour accéder à votre espace.
                        </p>

                        <form className="space-y-4" onSubmit={handleSubmit}>
                            <div>
                                <label className="block text-xs font-medium text-default-600 mb-1">
                                    Adresse email
                                </label>
                                <Input
                                    type="email"
                                    variant="bordered"
                                    radius="lg"
                                    fullWidth
                                    size="sm"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    isDisabled={loading}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-default-600 mb-1">
                                    Mot de passe
                                </label>
                                <Input
                                    type="password"
                                    variant="bordered"
                                    radius="lg"
                                    fullWidth
                                    size="sm"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    isDisabled={loading}
                                />
                            </div>

                            {error && (
                                <p className="text-xs text-danger-500">
                                    {error}{" "}
                                    {accountNotFound && (
                                        <>
                                            {" "}
                                            Vous pouvez{" "}
                                            <RouterLink
                                                to="/register"
                                                className="underline underline-offset-2"
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
                                radius="lg"
                                color="primary"
                                className="mt-2"
                                isDisabled={loading}
                                isLoading={loading}
                            >
                                Se connecter
                            </Button>
                        </form>

                        <p className="mt-4 text-xs text-default-500">
                            Pas encore de compte ?{" "}
                            <RouterLink to="/register" className="text-primary underline">
                                Créer un compte
                            </RouterLink>
                        </p>
                    </div>

                    {/* Colonne droite : texte / marketing */}
                    <div className="hidden md:flex flex-col justify-center border-l pl-8">
                        <h2 className="text-lg font-semibold mb-2">
                            Le Réseau Formation
                        </h2>
                        <p className="text-sm text-default-500 mb-4">
                            Accédez à vos sessions, suivis, documents et
                            ressources spécialisées via votre espace personnel.
                        </p>
                        <p className="text-xs italic text-default-400">
                            “Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                            Nunc eget augue nec massa volutpat aliquet.”
                        </p>
                    </div>
                </CardBody>
            </Card>
        </div>
    );
};

export default Login;
