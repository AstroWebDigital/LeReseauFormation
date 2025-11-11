// src/pages/Register.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthAPI } from "../services/api";
import FormInput from "../components/FormInput";

const Register = () => {
    const navigate = useNavigate();
    const [form, setForm] = useState({
        email: "",
        password: "",
        confirmPassword: "",
    });
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

        try {
            // On n'envoie QUE email + password au backend
            await AuthAPI.register({
                email: form.email,
                password: form.password,
            });

            // Deux stratégies possibles :
            // - soit le backend renvoie déjà un token -> on pourrait auto-login
            // - soit il renvoie juste 201 / un message -> on redirige vers /login
            // Ici : redirection vers la page de connexion
            navigate("/login");
        } catch (err) {
            console.error(err);
            setError("Erreur lors de l'inscription.");
        }
    };

    return (
        <div className="page-wrapper">
            <h1>Inscription</h1>

            <form onSubmit={handleSubmit} className="form">
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

                <FormInput
                    label="Confirmer le mot de passe"
                    type="password"
                    name="confirmPassword"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    required
                />

                {error && <p className="form-error">{error}</p>}

                <button type="submit" className="btn-primary">
                    Créer mon compte
                </button>
            </form>

            <p className="text-muted">
                Déjà un compte ? <Link to="/login">Se connecter</Link>
            </p>
        </div>
    );
};

export default Register;
