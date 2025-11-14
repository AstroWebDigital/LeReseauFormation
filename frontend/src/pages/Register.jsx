// src/pages/Register.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
            navigate("/login"); // le back renvoie 201 + userDto → on redirige vers login
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
        <div className="page-wrapper">
            <h1>Inscription</h1>

            <form onSubmit={handleSubmit} className="form">
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

                <button type="submit" className="btn-primary">Créer mon compte</button>
            </form>

            <p className="text-muted">
                Déjà un compte ? <Link to="/login">Se connecter</Link>
            </p>
        </div>
    );
};

export default Register;
