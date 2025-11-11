// src/pages/Login.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import FormInput from "../components/FormInput";

const Login = () => {
    const { login } = useAuth();
    const navigate = useNavigate();

    const [form, setForm] = useState({
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
            const { data } = await AuthAPI.login({
                email: form.email,
                password: form.password,
            });

            // On essaye de récupérer le token peu importe le nom utilisé par le backend
            const token =
                data?.token ||
                data?.accessToken ||
                data?.jwt ||
                data?.bearer ||
                null;

            const user =
                data?.user ||
                data?.utilisateur ||
                null;

            if (!token) {
                console.error("Réponse login sans token", data);
                setError("Identifiants invalides ou erreur serveur.");
                return;
            }

            login(token, user);
            navigate("/dashboard");
        } catch (err) {
            console.error(err);
            setError("Identifiants invalides ou erreur serveur.");
        }
    };

    return (
        <div className="page-wrapper">
            <h1>Connexion</h1>

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

                {error && <p className="form-error">{error}</p>}

                <button type="submit" className="btn-primary">
                    Se connecter
                </button>
            </form>

            <p className="text-muted">
                Pas de compte ? <Link to="/register">Inscription</Link>
            </p>
        </div>
    );
};

export default Login;
