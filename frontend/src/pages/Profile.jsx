import React, { useEffect, useState } from "react";
import {
    Card,
    CardBody,
    Button,
    Avatar,
    Spinner,
    Skeleton,
    Chip,
} from "@heroui/react";
import { AuthAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";

const Profile = () => {
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
        <div className="min-h-[calc(100vh-4rem)] flex w-full px-0 md:px-6 py-6">
            <Card className="w-full flex-1 p-0">
                {loading ? (
                    <CardBody className="p-6 space-y-4">
                        <Skeleton className="h-24 w-full rounded-t-2xl" />
                        <div className="-mt-10 flex flex-col items-center gap-3">
                            <Skeleton className="rounded-full w-24 h-24" />
                            <Skeleton className="h-4 w-2/3 rounded-md" />
                            <Skeleton className="h-3 w-1/3 rounded-md" />
                        </div>
                    </CardBody>
                ) : error ? (
                    <CardBody className="p-6">
                        <p className="text-sm text-danger-500">{error}</p>
                    </CardBody>
                ) : me ? (
                    <div className="relative h-full">
                        {/* Bandeau */}
                        <div className="h-24 w-full rounded-t-2xl bg-gradient-to-tr from-primary to-secondary" />

                        {/* Edit + Logout */}
                        <div className="absolute top-3 right-3 flex gap-2">
                            <Button size="sm" variant="flat">
                                Edit Profile
                            </Button>
                            <Button
                                size="sm"
                                variant="bordered"
                                color="danger"
                                onPress={logout}
                            >
                                Se déconnecter
                            </Button>
                        </div>

                        {/* Contenu */}
                        <CardBody className="-mt-10 flex flex-col items-center gap-4">
                            {/* Avatar + upload */}
                            <div className="flex flex-col items-center gap-2">
                                <Avatar
                                    src={resolvePhotoUrl(me.profilPhoto)}
                                    name={
                                        [me.firstname, me.lastname].filter(Boolean).join(" ") ||
                                        me.email ||
                                        "Utilisateur"
                                    }
                                    color="primary"
                                    className="w-24 h-24 border-4 border-background shadow-md"
                                />

                                <Button
                                    as="label"
                                    variant="light"
                                    size="xs"
                                    className="cursor-pointer text-tiny"
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

                            {/* Nom + handle */}
                            <div className="text-center space-y-1">
                                <p className="text-base font-semibold">
                                    {[me.firstname, me.lastname].filter(Boolean).join(" ") ||
                                        "Utilisateur"}
                                </p>
                                <p className="text-tiny text-default-500">
                                    @{me.username || (me.email ? me.email.split("@")[0] : "user")}
                                </p>
                            </div>

                            {/* Tags */}
                            <div className="flex flex-wrap justify-center gap-2">
                                {me.sector && (
                                    <Chip size="sm" variant="flat">
                                        {me.sector}
                                    </Chip>
                                )}
                                {me.status && (
                                    <Chip size="sm" variant="flat">
                                        {me.status}
                                    </Chip>
                                )}
                                <Chip size="sm" variant="flat">
                                    Membre
                                </Chip>
                            </div>

                            {/* Bio */}
                            <p className="text-tiny text-center text-default-500 px-2">
                                {me.bio ||
                                    "Créateur de projets. Passionné par le digital, les outils modernes et l'entrepreneuriat."}
                            </p>

                            {uploading && (
                                <div className="flex items-center gap-2 text-xs text-default-500 mt-2">
                                    <Spinner size="sm" />
                                    <span>Upload de la photo en cours…</span>
                                </div>
                            )}
                        </CardBody>
                    </div>
                ) : (
                    <CardBody className="p-6">
                        <p className="text-sm text-default-600">Profil introuvable.</p>
                    </CardBody>
                )}
            </Card>
        </div>
    );
};

export default Profile;
