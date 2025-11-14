import React, { useEffect, useState } from "react";
import { AuthAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";

const Dashboard = () => {
    const { user: ctxUser, token, logout, setUser } = useAuth();
    const [me, setMe] = useState(ctxUser);
    const [loading, setLoading] = useState(!ctxUser && !!token);
    const [error, setError] = useState("");
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        let cancelled = false;
        const fetchMe = async () => {
            if (!token) return;
            try {
                const { data } = await AuthAPI.me();
                if (!cancelled) {
                    setMe(data);
                    setUser?.(data);
                }
            } catch {
                if (!cancelled) setError("Impossible de charger le profil.");
            } finally {
                if (!cancelled) setLoading(false);
            }
        };
        if (!ctxUser && token) fetchMe();
        return () => { cancelled = true; };
    }, [token, ctxUser, setUser]);

    const onUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);
        setError("");
        try {
            await AuthAPI.uploadProfilePhoto(file);
            const { data } = await AuthAPI.me();
            setMe(data);
            setUser?.(data);
        } catch {
            setError("Upload impossible.");
        } finally {
            setUploading(false);
            e.target.value = "";
        }
    };

    if (!token) {
        return (
            <div className="page-wrapper">
                <h1>Tableau de bord</h1>
                <p>Vous n’êtes pas connecté.</p>
            </div>
        );
    }

    return (
        <div className="page-wrapper">
            <div className="card">
                <div className="card-header">
                    <h1>Mon compte</h1>
                </div>

                <div className="card-body">
                    {loading ? (
                        <div className="profile-skeleton">
                            <div className="avatar-skel" />
                            <div className="lines">
                                <div className="line" />
                                <div className="line short" />
                            </div>
                        </div>
                    ) : error ? (
                        <p className="form-error">{error}</p>
                    ) : me ? (
                        <div className="profile profile-grid">
                            <div className="profile-left">
                                <div className="avatar-wrap">
                                    <div className="avatar-ring">
                                        {me.profilPhoto ? (
                                            <img className="avatar-img" src={me.profilPhoto} alt="Photo de profil"/>

                                        ) : (
                                            <div className="avatar-initials" aria-hidden="true">
                                                {(me.firstname?.[0] ?? me.email?.[0] ?? "U").toUpperCase()}
                                            </div>
                                        )}
                                    </div>

                                    {/* Overlay d’action */}
                                    <label className="avatar-edit" title="Changer la photo" aria-label="Changer la photo">
                                        <input type="file" accept="image/*" onChange={onUpload} hidden />
                                        {uploading ? (
                                            <span className="avatar-edit-text">Téléversement…</span>
                                        ) : (
                                            <span className="avatar-edit-text">Changer</span>
                                        )}
                                    </label>
                                </div>

                                <button onClick={logout} className="btn-secondary mt-2">Se déconnecter</button>
                            </div>

                            <div className="profile-right">
                                <h2 className="username">
                                    {[me.firstname, me.lastname].filter(Boolean).join(" ") || "Utilisateur"}
                                </h2>
                                <p className="muted">{me.email}</p>

                                <div className="kv">
                                    {me.phone && (
                                        <div><span>📞</span><b>Téléphone</b><i>{me.phone}</i></div>
                                    )}
                                    {me.sector && (
                                        <div><span>🏷️</span><b>Secteur</b><i>{me.sector}</i></div>
                                    )}
                                    {me.status && (
                                        <div><span>✅</span><b>Statut</b><i>{me.status}</i></div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <p>Profil introuvable.</p>
                    )}
                </div>
            </div>
        </div>
    );

};

export default Dashboard;
