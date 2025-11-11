// src/pages/Dashboard.jsx
import React from "react";
import { useAuth } from "../context/AuthContext";

const Dashboard = () => {
    const { user, token, logout } = useAuth();

    return (
        <div className="page-wrapper">
            <h1>Tableau de bord</h1>
            {user ? (
                <p>Connecté en tant que {user.email || user.username || "Utilisateur"}</p>
            ) : (
                <p>Token présent: {token ? "oui" : "non"} (user non chargé)</p>
            )}
            <button onClick={logout} className="btn-secondary">
                Se déconnecter
            </button>
        </div>
    );
};

export default Dashboard;
