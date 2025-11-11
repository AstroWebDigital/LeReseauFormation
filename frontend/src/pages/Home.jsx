// frontend/src/pages/Home.jsx
import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Home = () => {
    const { user } = useAuth();

    return (
        <div className="home-page">
            <header className="hero">
                <h1>PROJET TEST ARTHUR</h1>
                <p>Frontend React connecté au backend Spring Boot (JWT) et PostgreSQL.</p>
            </header>

            <section className="home-actions">
                {!user && (
                    <>
                        <Link to="/register" className="btn btn-primary">
                            Créer un compte
                        </Link>
                        <Link to="/login" className="btn btn-secondary">
                            Se connecter
                        </Link>
                    </>
                )}

                {user && (
                    <>
                        <p>
                            Connecté en tant que <strong>{user.email}</strong>
                        </p>
                        <Link to="/dashboard" className="btn btn-primary">
                            Accéder au dashboard
                        </Link>
                    </>
                )}
            </section>
        </div>
    );
};

export default Home;
