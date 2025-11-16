// src/pages/Register.jsx
import React, { useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { Card, CardHeader, CardBody, CardFooter, Button } from "@heroui/react";
import { AuthAPI } from "../services/api";
import FormInput from "../components/FormInput";

const Register = () => {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        firstname: "",
        lastname: "",
        email: "",
        password: "",
    });

    const [error, setError] = useState("");

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        try {
            const { data } = await AuthAPI.register(form);

            if (!data?.id) {
                setError("Erreur lors de l'inscription.");
                return;
            }

            navigate("/login");
        } catch (err) {
            console.error(err);
            setError("Erreur lors de l'inscription ou email déjà utilisé.");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <Card className="max-w-md w-full">
                <CardHeader className="flex flex-col items-start gap-1">
                    <h1 className="text-xl font-semibold">Inscription</h1>
                    <p className="text-xs text-default-500">
                        Crée ton compte pour commencer.
                    </p>
                </CardHeader>

                <CardBody>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <FormInput
                            label="Prénom"
                            name="firstname"
                            value={form.firstname}
                            onChange={handleChange}
                            required
                        />

                        <FormInput
                            label="Nom"
                            name="lastname"
                            value={form.lastname}
                            onChange={handleChange}
                            required
                        />

                        <FormInput
                            label="Email"
                            type="email"
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                            required
                        />

                        <FormInput
                            label="Mot de passe"
                            type="password"
                            name="password"
                            value={form.password}
                            onChange={handleChange}
                            required
                        />

                        {error && (
                            <p className="text-xs text-danger-500">{error}</p>
                        )}

                        <Button type="submit" color="primary" fullWidth>
                            Créer un compte
                        </Button>
                    </form>
                </CardBody>

                <CardFooter className="text-xs text-default-500">
                    <span>
                        Déjà inscrit ?{" "}
                        <RouterLink
                            to="/login"
                            className="text-primary hover:underline"
                        >
                            Se connecter
                        </RouterLink>
                    </span>
                </CardFooter>
            </Card>
        </div>
    );
};

export default Register;
