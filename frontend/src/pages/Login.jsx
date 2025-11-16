// src/pages/Login.jsx
import React, { useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import {
    Card,
    CardHeader,
    CardBody,
    CardFooter,
    Button,
} from "@heroui/react";
import { AuthAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import FormInput from "../components/FormInput";

const Login = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({ email: "", password: "" });
    const [error, setError] = useState("");

    const handleChange = (e) =>
        setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        try {
            const { data } = await AuthAPI.login({
                email: form.email,
                password: form.password,
            });

            if (!data?.token) {
                setError("Identifiants invalides");
                return;
            }

            login(data.token, data.user || null);
            navigate("/dashboard");
        } catch (err) {
            console.error(err);
            setError("Identifiants invalides ou erreur serveur.");
        }
    };

    return (
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
            <Card className="max-w-md w-full">
                <CardHeader className="flex flex-col items-start gap-1">
                    <h1 className="text-xl font-semibold">Connexion</h1>
                    <p className="text-xs text-default-500">
                        Connecte-toi pour accéder à ton tableau de bord.
                    </p>
                </CardHeader>

                <CardBody>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <FormInput
                            label="Email"
                            type="email"
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                            autoComplete="email"
                            required
                        />

                        <FormInput
                            label="Mot de passe"
                            type="password"
                            name="password"
                            value={form.password}
                            onChange={handleChange}
                            autoComplete="current-password"
                            required
                        />

                        {error && (
                            <p className="text-xs text-danger-500 mt-1 text-left">{error}</p>
                        )}

                        <Button type="submit" color="primary" fullWidth>
                            Se connecter
                        </Button>
                    </form>
                </CardBody>

                <CardFooter className="flex flex-col items-start gap-1 text-xs text-default-500">
          <span>
            Pas de compte ?{" "}
              <RouterLink
                  to="/register"
                  className="text-primary hover:underline"
              >
              Inscription
            </RouterLink>
          </span>
                </CardFooter>
            </Card>
        </div>
    );
};

export default Login;
