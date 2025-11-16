// src/pages/Register.jsx
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
import FormInput from "../components/FormInput";

const Register = () => {
    const navigate = useNavigate();
    const [form, setForm] = useState({
        firstname: "",
        lastname: "",
        phone: "",
        sector: "",
        email: "",
        password: "",
        confirmPassword: "",
    });
    const [error, setError] = useState("");

    const handleChange = (e) =>
        setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (form.password !== form.confirmPassword) {
            setError("Les mots de passe ne correspondent pas.");
            return;
        }

        try {
            await AuthAPI.register({
                firstname: form.firstname,
                lastname: form.lastname,
                phone: form.phone || null,
                sector: form.sector || null,
                email: form.email,
                password: form.password,
            });

            navigate("/login");
        } catch (err) {
            console.error(err);
            if (err?.response?.status === 409) {
                setError("Cet email est déjà utilisé.");
            } else if (err?.response?.status === 400) {
                setError("Formulaire invalide. Vérifie les champs.");
            } else {
                setError("Erreur lors de l'inscription.");
            }
        }
    };

    return (
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
            <Card className="max-w-lg w-full">
                <CardHeader className="flex flex-col items-start gap-1">
                    <h1 className="text-xl font-semibold">Inscription</h1>
                    <p className="text-xs text-default-500">
                        Crée ton compte pour rejoindre le Réseau Formation.
                    </p>
                </CardHeader>

                <CardBody>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
                        </div>

                        <FormInput
                            label="Téléphone"
                            name="phone"
                            value={form.phone}
                            onChange={handleChange}
                            placeholder="Optionnel"
                        />

                        <FormInput
                            label="Secteur"
                            name="sector"
                            value={form.sector}
                            onChange={handleChange}
                            placeholder="Optionnel"
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
                            autoComplete="new-password"
                            required
                        />

                        <FormInput
                            label="Confirmer le mot de passe"
                            type="password"
                            name="confirmPassword"
                            value={form.confirmPassword}
                            onChange={handleChange}
                            autoComplete="new-password"
                            required
                        />

                        {error && (
                            <p className="text-xs text-danger-500 mt-1 text-left">{error}</p>
                        )}

                        <Button type="submit" color="primary" fullWidth>
                            Créer mon compte
                        </Button>
                    </form>
                </CardBody>

                <CardFooter className="flex flex-col items-start gap-1 text-xs text-default-500">
          <span>
            Déjà un compte ?{" "}
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
