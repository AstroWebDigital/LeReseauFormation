import React, { useEffect, useState } from "react";
import {
    Card,
    CardHeader,
    CardBody,
    Button,
    Avatar,
    Spinner,
    Skeleton,
    Chip,
} from "@heroui/react";
import { AuthAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";

const Dashboard = () => {
    const { user: ctxUser, token, logout, setUser } = useAuth();
    const [me, setMe] = useState(ctxUser);
    const [loading, setLoading] = useState(!ctxUser && !!token);
    const [error, setError] = useState("");
    const [uploading, setUploading] = useState(false);

    const API_BASE_URL =
        import.meta.env.VITE_API_URL || "http://localhost:8080";

    const resolvePhotoUrl = (url) => {
        if (!url) return null;
        if (url.startsWith("http://") || url.startsWith("https://")) return url;
        if (url.startsWith("/")) return `${API_BASE_URL}${url}`;
        return `${API_BASE_URL}/${url}`;
    };

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
        return () => {
            cancelled = true;
        };
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
            <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
                <Card className="max-w-md w-full">
                    <CardHeader>
                        <h1 className="text-xl font-semibold">Tableau de bord</h1>
                    </CardHeader>
                    <CardBody>
                        <p className="text-sm text-default-600">
                            Vous n’êtes pas connecté.
                        </p>
                    </CardBody>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-[calc(100vh-4rem)] flex justify-center px-4 py-10">
            <Card className="max-w-3xl w-full">
                <CardHeader className="flex items-center justify-between gap-4">
                    <div>
                        <h1 className="text-xl font-semibold">Mon compte</h1>
                        <p className="text-xs text-default-500">
                            Gère tes informations personnelles et ta photo de profil.
                        </p>
                    </div>

                    <Button
                        size="sm"
                        variant="bordered"
                        color="danger"
                        onPress={logout}
                    >
                        Se déconnecter
                    </Button>
                </CardHeader>

                <CardBody className="space-y-6">
                    {loading ? (
                        <div className="flex gap-4 items-center">
                            <Skeleton className="rounded-full w-16 h-16" />
                            <div className="flex-1 space-y-2">
                                <Skeleton className="h-4 w-1/3 rounded-md" />
                                <Skeleton className="h-3 w-1/2 rounded-md" />
                            </div>
                        </div>
                    ) : error ? (
                        <p className="text-sm text-danger-500">{error}</p>
                    ) : me ? (
                        <div className="flex flex-col md:flex-row gap-6 items-start">
                            {/* Colonne gauche : avatar + upload */}
                            <div className="flex flex-col items-center gap-3 w-full md:w-auto">
                                <Avatar
                                    src={resolvePhotoUrl(me.profilPhoto)}
                                    name={
                                        [me.firstname, me.lastname].filter(Boolean).join(" ") ||
                                        me.email ||
                                        "Utilisateur"
                                    }
                                    color="primary"
                                    size="lg"
                                    className="text-lg"
                                />

                                <Button
                                    as="label"
                                    variant="flat"
                                    size="sm"
                                    className="cursor-pointer"
                                    isDisabled={uploading}
                                >
                                    {uploading ? "Téléversement…" : "Changer la photo"}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        hidden
                                        onChange={onUpload}
                                    />
                                </Button>
                            </div>

                            {/* Colonne droite : infos */}
                            <div className="flex-1 space-y-2">
                                <h2 className="text-lg font-semibold">
                                    {[me.firstname, me.lastname].filter(Boolean).join(" ") ||
                                        "Utilisateur"}
                                </h2>
                                <p className="text-sm text-default-500">{me.email}</p>

                                <div className="flex flex-wrap gap-2 mt-3 text-xs">
                                    {me.phone && (
                                        <Chip size="sm" variant="flat">
                                            📞 {me.phone}
                                        </Chip>
                                    )}
                                    {me.sector && (
                                        <Chip size="sm" variant="flat" color="primary">
                                            🏷️ {me.sector}
                                        </Chip>
                                    )}
                                    {me.status && (
                                        <Chip size="sm" variant="flat" color="success">
                                            ✅ {me.status}
                                        </Chip>
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <p className="text-sm text-default-600">Profil introuvable.</p>
                    )}

                    {uploading && (
                        <div className="flex items-center gap-2 text-xs text-default-500">
                            <Spinner size="sm" />
                            <span>Upload de la photo en cours…</span>
                        </div>
                    )}
                </CardBody>
            </Card>
        </div>
    );
};

export default Dashboard;
