// src/pages/Profile.jsx
import React, { useEffect, useState } from "react";
import {
    Card,
    CardBody,
    Button,
    Avatar,
    Spinner,
    Skeleton,
    Chip,
    Input,
} from "@heroui/react";
import { AuthAPI } from "../services/auth";
import { useAuth } from "../auth/AuthContext";
import { CheckBadgeIcon } from "@heroicons/react/24/solid";
import { useNavigate } from "react-router-dom";

const Profile = () => {
    const { user: ctxUser, token, logout, setUser } = useAuth();
    const navigate = useNavigate();
    const [profile, setProfile] = useState(ctxUser);

    const [loading, setLoading] = useState(!ctxUser && !!token);
    const [error, setError] = useState("");
    const [uploading, setUploading] = useState(false);

    const [verifyLoading, setVerifyLoading] = useState(false);
    const [verifyMessage, setVerifyMessage] = useState("");
    const [verifyError, setVerifyError] = useState("");

    const [refreshingStatus, setRefreshingStatus] = useState(false);

    // édition profil
    const [editMode, setEditMode] = useState(false);
    const [profileForm, setProfileForm] = useState({
        firstname: "",
        lastname: "",
        phone: "",
        sector: "",
    });
    const [profileSaving, setProfileSaving] = useState(false);
    const [profileUpdateMessage, setProfileUpdateMessage] = useState("");
    const [profileUpdateError, setProfileUpdateError] = useState("");

    // changement mot de passe
    const [showPasswordForm, setShowPasswordForm] = useState(false);
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });
    const [passwordLoading, setPasswordLoading] = useState(false);
    const [passwordError, setPasswordError] = useState("");
    const [passwordSuccess, setPasswordSuccess] = useState("");

    const API_BASE_URL =
        import.meta.env.VITE_API_URL || "http://localhost:8080";

    const resolvePhotoUrl = (url) => {
        if (!url) return null;
        if (url.startsWith("http://") || url.startsWith("https://")) return url;
        if (url.startsWith("/")) return `${API_BASE_URL}${url}`;
        return `${API_BASE_URL}/${url}`;
    };

    const isVerified = profile?.status === "ACTIF";
    const canEdit = isVerified;

    // 🔐 règle affichée et utilisée partout
    const passwordPolicyText =
        "Votre mot de passe doit contenir au moins 8 caractères, avec au moins une majuscule, une minuscule et un chiffre.";

    const isPasswordCompliant = (pwd) => {
        if (!pwd) return false;
        const hasLength = pwd.length >= 8;
        const hasUpper = /[A-Z]/.test(pwd);
        const hasLower = /[a-z]/.test(pwd);
        const hasDigit = /\d/.test(pwd);
        return hasLength && hasUpper && hasLower && hasDigit;
    };

    const onResendVerification = async () => {
        setVerifyLoading(true);
        setVerifyMessage("");
        setVerifyError("");

        try {
            const msg = await AuthAPI.resendVerificationEmail();
            setVerifyMessage(msg || "Un email de vérification vous a été envoyé.");
        } catch (err) {
            const msg =
                err?.response?.data ||
                err?.message ||
                "Impossible d'envoyer l'email de vérification.";
            setVerifyError(msg);
        } finally {
            setVerifyLoading(false);
        }
    };

    const onRefreshStatus = async () => {
        setRefreshingStatus(true);
        setVerifyError("");
        try {
            const data = await AuthAPI.profile();
            setProfile(data);
            setUser?.(data);
            if (data.status === "ACTIF") {
                setVerifyMessage("Votre compte est maintenant vérifié 🎉");
            }
        } catch {
            setVerifyError("Impossible de rafraîchir le statut.");
        } finally {
            setRefreshingStatus(false);
        }
    };

    useEffect(() => {
        let cancelled = false;

        const fetchProfile = async () => {
            if (!token) return;
            try {
                const data = await AuthAPI.profile();
                if (!cancelled) {
                    setProfile(data);
                    setUser?.(data);
                }
            } catch {
                if (!cancelled) setError("Impossible de charger le profil.");
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        if (!ctxUser && token) {
            fetchProfile();
        }

        return () => {
            cancelled = true;
        };
    }, [token, ctxUser, setUser]);

    // Synchroniser le formulaire avec le profil quand il change
    useEffect(() => {
        if (profile) {
            setProfileForm({
                firstname: profile.firstname || "",
                lastname: profile.lastname || "",
                phone: profile.phone || "",
                sector: profile.sector || "",
            });
        }
    }, [profile]);

    const onUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);
        setError("");

        try {
            await AuthAPI.uploadProfilePhoto(file);
            const data = await AuthAPI.profile();
            setProfile(data);
            setUser?.(data);
        } catch (err) {
            const msg =
                err?.response?.data ||
                err?.message ||
                "Upload impossible.";
            setError(msg);
        } finally {
            setUploading(false);
            e.target.value = "";
        }
    };

    const handleProfileFieldChange = (field, value) => {
        setProfileForm((prev) => ({ ...prev, [field]: value }));
    };

    const handleSaveProfile = async () => {
        if (!canEdit) {
            setProfileUpdateError(
                "Votre compte doit être vérifié pour modifier vos informations."
            );
            return;
        }

        setProfileSaving(true);
        setProfileUpdateError("");
        setProfileUpdateMessage("");

        try {
            const updated = await AuthAPI.updateProfile(profileForm);
            setProfile(updated);
            setUser?.(updated);
            setProfileUpdateMessage("Profil mis à jour avec succès.");
            setEditMode(false);
        } catch (err) {
            const msg =
                err?.response?.data?.message ||
                err?.response?.data ||
                err?.message ||
                "Impossible de mettre à jour le profil.";
            setProfileUpdateError(msg);
        } finally {
            setProfileSaving(false);
        }
    };

    const handlePasswordFieldChange = (field, value) => {
        setPasswordForm((prev) => ({ ...prev, [field]: value }));
        // On reset les messages au changement pour éviter de garder des erreurs obsolètes
        setPasswordError("");
        setPasswordSuccess("");
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        setPasswordError("");
        setPasswordSuccess("");

        if (!canEdit) {
            setPasswordError(
                "Votre compte doit être vérifié pour modifier votre mot de passe."
            );
            return;
        }

        if (!passwordForm.currentPassword || !passwordForm.newPassword) {
            setPasswordError("Merci de remplir tous les champs.");
            return;
        }

        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            setPasswordError("Les nouveaux mots de passe ne correspondent pas.");
            return;
        }

        // ✅ Validation côté frontend avant l'appel API
        if (!isPasswordCompliant(passwordForm.newPassword)) {
            setPasswordError(passwordPolicyText);
            return;
        }

        setPasswordLoading(true);

        try {
            await AuthAPI.changePassword({
                currentPassword: passwordForm.currentPassword,
                newPassword: passwordForm.newPassword,
            });

            setPasswordSuccess("Mot de passe mis à jour avec succès.");
            setPasswordForm({
                currentPassword: "",
                newPassword: "",
                confirmPassword: "",
            });
            setShowPasswordForm(false);
        } catch (err) {
            const status = err?.response?.status;
            // Si le backend renvoie une erreur de validation (ex: @Size), on force notre message lisible
            if (status === 400) {
                setPasswordError(passwordPolicyText);
            } else {
                const msg =
                    err?.response?.data?.message ||
                    err?.response?.data ||
                    err?.message ||
                    "Impossible de modifier le mot de passe.";
                setPasswordError(msg);
            }
        } finally {
            setPasswordLoading(false);
        }
    };

    const handleLogout = () => {
        logout();        // vide le contexte + token
        navigate("/");   // redirection vers la home
    };

    const inputClassNames = {
        base: "w-full",
        inputWrapper:
            "bg-transparent border border-slate-600 rounded-xl hover:border-slate-400 focus-within:border-orange-400",
        input: "text-slate-100 text-sm placeholder:text-slate-500",
    };

    /* ─────────────────  ÉTAT : pas connecté ───────────────── */

    if (!token) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#050721] px-4">
                <Card className="max-w-md w-full rounded-[24px] bg-gradient-to-br from-[#171c42] via-[#111632] to-[#090d23] border border-white/10 text-white">
                    <CardBody className="p-6">
                        <h1 className="text-lg font-semibold mb-2">Profil inaccessible</h1>
                        <p className="text-sm text-slate-300">
                            Vous n’êtes pas connecté. Connectez-vous pour accéder à votre
                            espace membre.
                        </p>
                    </CardBody>
                </Card>
            </div>
        );
    }

    /* ─────────────────  RENDU PRINCIPAL ───────────────── */

    return (
        <div className="min-h-screen flex items-start justify-center bg-[#050721] px-4 md:px-8 py-8">
            <Card className="w-full max-w-5xl rounded-[28px] bg-gradient-to-br from-[#171c42] via-[#111632] to-[#090d23] border border-white/10 text-white">
                {loading ? (
                    <CardBody className="p-6 md:p-8 space-y-6">
                        <Skeleton className="h-8 w-40 rounded-md" />
                        <div className="grid md:grid-cols-[0.9fr,1.1fr] gap-6">
                            <div className="space-y-4">
                                <Skeleton className="w-28 h-28 rounded-full" />
                                <Skeleton className="h-4 w-32 rounded-md" />
                                <Skeleton className="h-3 w-24 rounded-md" />
                            </div>
                            <div className="space-y-3">
                                <Skeleton className="h-16 w-full rounded-2xl" />
                                <Skeleton className="h-16 w-full rounded-2xl" />
                                <Skeleton className="h-16 w-full rounded-2xl" />
                            </div>
                        </div>
                    </CardBody>
                ) : error ? (
                    <CardBody className="p-6 md:p-8">
                        <p className="text-sm text-red-400">{error}</p>
                    </CardBody>
                ) : profile ? (
                    <CardBody className="p-6 md:p-8 space-y-6">
                        {/* En-tête */}
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            <div>
                                <p className="text-[0.7rem] uppercase tracking-[0.18em] text-orange-400 font-semibold mb-1">
                                    Espace membre
                                </p>
                                <h1 className="text-2xl md:text-3xl font-semibold">
                                    Profil & compte
                                </h1>
                                <p className="text-xs md:text-sm text-slate-300 mt-1">
                                    Gérez vos informations personnelles, le statut de votre compte
                                    et vos préférences.
                                </p>
                                {!canEdit && (
                                    <p className="mt-2 text-[0.7rem] text-amber-300">
                                        La modification du profil et du mot de passe sera disponible
                                        une fois votre compte vérifié.
                                    </p>
                                )}
                            </div>

                            <div className="flex flex-wrap gap-2 justify-start md:justify-end">
                                <Button
                                    size="sm"
                                    className="rounded-full bg-white/5 border border-white/10 text-xs text-slate-100 hover:bg-white/10"
                                    isDisabled={!canEdit}
                                    onPress={() => setEditMode((prev) => !prev)}
                                >
                                    {editMode ? "Annuler" : "Modifier mon profil"}
                                </Button>
                                <Button
                                    size="sm"
                                    className="rounded-full border border-red-500/60 text-xs text-red-300 hover:bg-red-500/10"
                                    onPress={handleLogout}
                                >
                                    Se déconnecter
                                </Button>

                            </div>
                        </div>

                        {/* Corps : 2 colonnes */}
                        <div className="grid md:grid-cols-[0.9fr,1.1fr] gap-6">
                            {/* Colonne gauche : identité & statut */}
                            <div className="space-y-4">
                                {/* Carte identité */}
                                <div className="rounded-2xl bg-[#191f46]/80 border border-white/5 px-5 py-5 flex flex-col items-center gap-4">
                                    <div className="flex flex-col items-center gap-3">
                                        <Avatar
                                            src={resolvePhotoUrl(profile.profilPhoto)}
                                            name={
                                                [profile.firstname, profile.lastname]
                                                    .filter(Boolean)
                                                    .join(" ") ||
                                                profile.email ||
                                                "Utilisateur"
                                            }
                                            color="primary"
                                            className="w-24 h-24 border-4 border-[#050721] shadow-md"
                                        />
                                        <Button
                                            as="label"
                                            size="sm"
                                            className="cursor-pointer rounded-full bg-white/5 px-4 text-[0.7rem] text-slate-100 hover:bg-white/10 border border-white/10"
                                            isDisabled={uploading || !canEdit}
                                        >
                                            {uploading
                                                ? "Téléversement…"
                                                : canEdit
                                                    ? "Changer la photo"
                                                    : "Compte non vérifié"}
                                            {canEdit && (
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    hidden
                                                    onChange={onUpload}
                                                />
                                            )}
                                        </Button>
                                    </div>

                                    <div className="text-center space-y-1">
                                        <p className="text-base font-semibold flex items-center justify-center gap-1">
                                            {[profile.firstname, profile.lastname]
                                                .filter(Boolean)
                                                .join(" ") || "Utilisateur"}
                                            {isVerified && (
                                                <CheckBadgeIcon
                                                    className="w-4 h-4 text-emerald-400"
                                                    aria-hidden="true"
                                                />
                                            )}
                                        </p>
                                        <p className="text-[0.7rem] text-slate-400">
                                            @
                                            {profile.username ||
                                                (profile.email
                                                    ? profile.email.split("@")[0]
                                                    : "user")}
                                        </p>
                                    </div>

                                    <div className="flex flex-wrap justify-center gap-2 pt-2">
                                        {profile.sector && (
                                            <Chip
                                                size="sm"
                                                variant="flat"
                                                className="bg-white/5 border border-white/10 text-[0.7rem]"
                                            >
                                                {profile.sector}
                                            </Chip>
                                        )}
                                        {profile.status && (
                                            <Chip
                                                size="sm"
                                                variant="flat"
                                                className={`text-[0.7rem] ${
                                                    isVerified
                                                        ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/40"
                                                        : "bg-amber-500/10 text-amber-300 border border-amber-500/40"
                                                }`}
                                            >
                                                Statut&nbsp;: {profile.status}
                                            </Chip>
                                        )}
                                        <Chip
                                            size="sm"
                                            variant="flat"
                                            className="bg-white/5 border border-white/10 text-[0.7rem]"
                                        >
                                            Membre plateforme
                                        </Chip>
                                    </div>
                                </div>

                                {/* Alerte vérification email */}
                                {!isVerified && (
                                    <div className="rounded-2xl bg-[#2b1f11] border border-amber-500/40 px-4 py-4 text-xs text-amber-100 space-y-2">
                                        <p className="font-semibold text-[0.75rem] flex items-center gap-2">
                      <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-[0.7rem] text-slate-900">
                        !
                      </span>
                                            Vérification e-mail en attente
                                        </p>
                                        <p className="text-[0.7rem] text-amber-100/90">
                                            Votre adresse e-mail n&apos;est pas encore vérifiée.
                                            Certaines fonctionnalités pourront être limitées tant que
                                            votre compte n&apos;est pas validé.
                                        </p>

                                        {verifyMessage && (
                                            <p className="text-[0.7rem] text-emerald-300">
                                                {verifyMessage}
                                            </p>
                                        )}

                                        {verifyError && (
                                            <p className="text-[0.7rem] text-red-300">
                                                {verifyError}
                                            </p>
                                        )}

                                        <div className="flex flex-wrap gap-2 pt-1">
                                            <Button
                                                size="xs"
                                                className="rounded-full bg-[#ff922b] text-slate-900 text-[0.7rem] font-semibold hover:bg-[#ffa94d]"
                                                onPress={onResendVerification}
                                                isDisabled={verifyLoading}
                                            >
                                                {verifyLoading
                                                    ? "Envoi en cours..."
                                                    : "Renvoyer l'e-mail de vérification"}
                                            </Button>

                                            <Button
                                                size="xs"
                                                className="rounded-full border border-amber-400/60 bg-transparent text-[0.7rem] text-amber-100 hover:bg-amber-500/10"
                                                onPress={onRefreshStatus}
                                                isDisabled={refreshingStatus}
                                            >
                                                {refreshingStatus
                                                    ? "Mise à jour..."
                                                    : "Actualiser le statut"}
                                            </Button>
                                        </div>
                                    </div>
                                )}

                                {/* Bio (lecture seule) */}
                                <div className="rounded-2xl bg-[#191f46]/60 border border-white/5 px-4 py-4">
                                    <p className="text-[0.7rem] text-slate-300 leading-relaxed">
                                        {profile.bio ||
                                            "Créateur de projets. Passionné par le digital, les outils modernes et l'entrepreneuriat."}
                                    </p>
                                    {uploading && (
                                        <div className="flex items-center gap-2 text-[0.7rem] text-slate-300 mt-3">
                                            <Spinner size="sm" />
                                            <span>Upload de la photo en cours…</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Colonne droite : infos compte + sécurité */}
                            <div className="space-y-4">
                                {/* Infos principales / édition profil */}
                                <section className="rounded-2xl bg-[#191f46]/80 border border-white/5 px-5 py-4 space-y-3">
                                    <h2 className="text-sm font-semibold mb-1">
                                        Informations du compte
                                    </h2>

                                    {!editMode ? (
                                        <div className="space-y-2 text-[0.8rem]">
                                            <div className="flex justify-between gap-4">
                                                <span className="text-slate-400">Nom complet</span>
                                                <span className="text-slate-100">
                          {[profile.firstname, profile.lastname]
                              .filter(Boolean)
                              .join(" ") || "—"}
                        </span>
                                            </div>
                                            <div className="flex justify-between gap-4">
                                                <span className="text-slate-400">Adresse e-mail</span>
                                                <span className="text-slate-100 break-all">
                          {profile.email || "—"}
                        </span>
                                            </div>
                                            <div className="flex justify-between gap-4">
                                                <span className="text-slate-400">Téléphone</span>
                                                <span className="text-slate-100">
                          {profile.phone || "Non renseigné"}
                        </span>
                                            </div>
                                            <div className="flex justify-between gap-4">
                                                <span className="text-slate-400">Secteur</span>
                                                <span className="text-slate-100">
                          {profile.sector || "Non renseigné"}
                        </span>
                                            </div>
                                            <div className="flex justify-between gap-4">
                                                <span className="text-slate-400">Statut</span>
                                                <span
                                                    className={
                                                        isVerified ? "text-emerald-300" : "text-amber-300"
                                                    }
                                                >
                          {profile.status || "—"}
                        </span>
                                            </div>

                                            {profileUpdateMessage && (
                                                <p className="text-[0.7rem] text-emerald-300 mt-2">
                                                    {profileUpdateMessage}
                                                </p>
                                            )}
                                            {profileUpdateError && (
                                                <p className="text-[0.7rem] text-red-300 mt-1">
                                                    {profileUpdateError}
                                                </p>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="space-y-3 text-[0.8rem]">
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                <div>
                                                    <label className="block text-[0.7rem] text-slate-300 mb-1">
                                                        Prénom
                                                    </label>
                                                    <Input
                                                        size="sm"
                                                        variant="bordered"
                                                        radius="lg"
                                                        classNames={inputClassNames}
                                                        value={profileForm.firstname}
                                                        onChange={(e) =>
                                                            handleProfileFieldChange(
                                                                "firstname",
                                                                e.target.value
                                                            )
                                                        }
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-[0.7rem] text-slate-300 mb-1">
                                                        Nom
                                                    </label>
                                                    <Input
                                                        size="sm"
                                                        variant="bordered"
                                                        radius="lg"
                                                        classNames={inputClassNames}
                                                        value={profileForm.lastname}
                                                        onChange={(e) =>
                                                            handleProfileFieldChange(
                                                                "lastname",
                                                                e.target.value
                                                            )
                                                        }
                                                    />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                <div>
                                                    <label className="block text-[0.7rem] text-slate-300 mb-1">
                                                        Téléphone
                                                    </label>
                                                    <Input
                                                        size="sm"
                                                        variant="bordered"
                                                        radius="lg"
                                                        classNames={inputClassNames}
                                                        value={profileForm.phone}
                                                        onChange={(e) =>
                                                            handleProfileFieldChange(
                                                                "phone",
                                                                e.target.value
                                                            )
                                                        }
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-[0.7rem] text-slate-300 mb-1">
                                                        Secteur
                                                    </label>
                                                    <Input
                                                        size="sm"
                                                        variant="bordered"
                                                        radius="lg"
                                                        classNames={inputClassNames}
                                                        value={profileForm.sector}
                                                        onChange={(e) =>
                                                            handleProfileFieldChange(
                                                                "sector",
                                                                e.target.value
                                                            )
                                                        }
                                                    />
                                                </div>
                                            </div>

                                            {profileUpdateError && (
                                                <p className="text-[0.7rem] text-red-300">
                                                    {profileUpdateError}
                                                </p>
                                            )}

                                            <div className="flex flex-wrap gap-2 pt-1">
                                                <Button
                                                    size="sm"
                                                    className="rounded-full bg-[#ff922b] text-slate-900 text-[0.75rem] font-semibold hover:bg-[#ffa94d]"
                                                    onPress={handleSaveProfile}
                                                    isDisabled={profileSaving}
                                                >
                                                    {profileSaving
                                                        ? "Enregistrement..."
                                                        : "Enregistrer les modifications"}
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    className="rounded-full bg-white/5 border border-white/10 text-[0.75rem] text-slate-100 hover:bg-white/10"
                                                    onPress={() => {
                                                        setEditMode(false);
                                                        setProfileUpdateError("");
                                                    }}
                                                >
                                                    Annuler
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </section>

                                {/* Sécurité */}
                                <section className="rounded-2xl bg-[#191f46]/80 border border-white/5 px-5 py-4 space-y-3">
                                    <h2 className="text-sm font-semibold mb-1">
                                        Sécurité & connexion
                                    </h2>
                                    <p className="text-[0.75rem] text-slate-300">
                                        Gère ton mot de passe et la sécurité de ton compte. Les
                                        options avancées (2FA, connexions récentes) arriveront dans
                                        une prochaine version.
                                    </p>

                                    <Button
                                        size="sm"
                                        className="mt-1 rounded-full bg-white/5 border border-white/10 text-[0.75rem] text-slate-100 hover:bg-white/10"
                                        isDisabled={!canEdit}
                                        onPress={() => setShowPasswordForm((prev) => !prev)}
                                    >
                                        {showPasswordForm
                                            ? "Annuler"
                                            : "Modifier mon mot de passe"}
                                    </Button>

                                    {!canEdit && (
                                        <p className="text-[0.7rem] text-amber-300 mt-1">
                                            Disponible après vérification de votre compte.
                                        </p>
                                    )}

                                    {showPasswordForm && (
                                        <form
                                            className="mt-3 space-y-3 text-[0.75rem]"
                                            onSubmit={handleChangePassword}
                                        >
                                            <div>
                                                <label className="block text-[0.7rem] text-slate-300 mb-1">
                                                    Mot de passe actuel
                                                </label>
                                                <Input
                                                    type="password"
                                                    size="sm"
                                                    variant="bordered"
                                                    radius="lg"
                                                    classNames={inputClassNames}
                                                    value={passwordForm.currentPassword}
                                                    onChange={(e) =>
                                                        handlePasswordFieldChange(
                                                            "currentPassword",
                                                            e.target.value
                                                        )
                                                    }
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[0.7rem] text-slate-300 mb-1">
                                                    Nouveau mot de passe
                                                </label>
                                                <Input
                                                    type="password"
                                                    size="sm"
                                                    variant="bordered"
                                                    radius="lg"
                                                    classNames={inputClassNames}
                                                    value={passwordForm.newPassword}
                                                    onChange={(e) =>
                                                        handlePasswordFieldChange(
                                                            "newPassword",
                                                            e.target.value
                                                        )
                                                    }
                                                />
                                                {/* 🔍 Règle affichée juste sous l'input */}
                                                <p
                                                    className={`mt-1 text-[0.65rem] ${
                                                        passwordForm.newPassword &&
                                                        !isPasswordCompliant(passwordForm.newPassword)
                                                            ? "text-amber-300"
                                                            : "text-slate-500"
                                                    }`}
                                                >
                                                    {passwordPolicyText}
                                                </p>
                                            </div>
                                            <div>
                                                <label className="block text-[0.7rem] text-slate-300 mb-1">
                                                    Confirmer le nouveau mot de passe
                                                </label>
                                                <Input
                                                    type="password"
                                                    size="sm"
                                                    variant="bordered"
                                                    radius="lg"
                                                    classNames={inputClassNames}
                                                    value={passwordForm.confirmPassword}
                                                    onChange={(e) =>
                                                        handlePasswordFieldChange(
                                                            "confirmPassword",
                                                            e.target.value
                                                        )
                                                    }
                                                />
                                            </div>

                                            {passwordError && (
                                                <p className="text-[0.7rem] text-red-300">
                                                    {passwordError}
                                                </p>
                                            )}
                                            {passwordSuccess && (
                                                <p className="text-[0.7rem] text-emerald-300">
                                                    {passwordSuccess}
                                                </p>
                                            )}

                                            <Button
                                                type="submit"
                                                size="sm"
                                                className="rounded-full bg-[#ff922b] text-slate-900 text-[0.75rem] font-semibold hover:bg-[#ffa94d]"
                                                isDisabled={passwordLoading}
                                            >
                                                {passwordLoading
                                                    ? "Enregistrement..."
                                                    : "Mettre à jour mon mot de passe"}
                                            </Button>
                                        </form>
                                    )}
                                </section>

                                {/* Activité */}
                                <section className="rounded-2xl bg-[#191f46]/60 border border-white/5 px-5 py-4 space-y-2">
                                    <h2 className="text-sm font-semibold mb-1">
                                        Activité & espace formation
                                    </h2>
                                    <p className="text-[0.75rem] text-slate-300">
                                        Bientôt, vous retrouverez ici un résumé de vos sessions,
                                        réservations et statistiques clés liées à vos formations et
                                        locations.
                                    </p>
                                </section>
                            </div>
                        </div>
                    </CardBody>
                ) : (
                    <CardBody className="p-6 md:p-8">
                        <p className="text-sm text-slate-300">Profil introuvable.</p>
                    </CardBody>
                )}
            </Card>
        </div>
    );
};

export default Profile;
