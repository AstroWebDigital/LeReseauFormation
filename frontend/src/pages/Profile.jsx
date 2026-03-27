import React, { useEffect, useState } from "react";
import {
    Card, CardBody, Button, Avatar, Spinner, Skeleton, Chip, Input,
} from "@heroui/react";
import { AuthAPI } from "../services/auth";
import { useAuth } from "../auth/AuthContext";
import { useTheme } from "@/theme/ThemeProvider";
import { CheckBadgeIcon } from "@heroicons/react/24/solid";
import { useNavigate } from "react-router-dom";
import { Shield, User, Mail, Phone, Briefcase, LogOut, Edit2, X, Save, RefreshCw, Send } from "lucide-react";

const Profile = () => {
    const { user: ctxUser, token, logout, setUser } = useAuth();
    const { isDark } = useTheme();
    const navigate = useNavigate();
    const [profile, setProfile] = useState(ctxUser);

    const [loading, setLoading] = useState(!ctxUser && !!token);
    const [error, setError] = useState("");
    const [uploading, setUploading] = useState(false);

    const [verifyLoading, setVerifyLoading] = useState(false);
    const [verifyMessage, setVerifyMessage] = useState("");
    const [verifyError, setVerifyError] = useState("");
    const [refreshingStatus, setRefreshingStatus] = useState(false);

    const [editMode, setEditMode] = useState(false);
    const [profileForm, setProfileForm] = useState({ firstname: "", lastname: "", phone: "", sector: "" });
    const [profileSaving, setProfileSaving] = useState(false);
    const [profileUpdateMessage, setProfileUpdateMessage] = useState("");
    const [profileUpdateError, setProfileUpdateError] = useState("");

    const [showPasswordForm, setShowPasswordForm] = useState(false);
    const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
    const [passwordLoading, setPasswordLoading] = useState(false);
    const [passwordError, setPasswordError] = useState("");
    const [passwordSuccess, setPasswordSuccess] = useState("");

    const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

    const resolvePhotoUrl = (url) => {
        if (!url) return null;
        if (url.startsWith("http://") || url.startsWith("https://")) return url;
        if (url.startsWith("/")) return `${API_BASE_URL}${url}`;
        return `${API_BASE_URL}/${url}`;
    };

    const isVerified = profile?.status === "ACTIF";
    const canEdit = isVerified;

    const passwordPolicyText = "Au moins 8 caractères, une majuscule, une minuscule et un chiffre.";
    const isPasswordCompliant = (pwd) => {
        if (!pwd) return false;
        return pwd.length >= 8 && /[A-Z]/.test(pwd) && /[a-z]/.test(pwd) && /\d/.test(pwd);
    };

    const onResendVerification = async () => {
        setVerifyLoading(true); setVerifyMessage(""); setVerifyError("");
        try { const msg = await AuthAPI.resendVerificationEmail(); setVerifyMessage(msg || "Email envoyé."); }
        catch (err) { setVerifyError(err?.response?.data || err?.message || "Erreur."); }
        finally { setVerifyLoading(false); }
    };

    const onRefreshStatus = async () => {
        setRefreshingStatus(true); setVerifyError("");
        try {
            const data = await AuthAPI.profile(); setProfile(data); setUser?.(data);
            if (data.status === "ACTIF") setVerifyMessage("Compte vérifié 🎉");
        } catch { setVerifyError("Impossible de rafraîchir."); }
        finally { setRefreshingStatus(false); }
    };

    useEffect(() => {
        let cancelled = false;
        const fetchProfile = async () => {
            if (!token) return;
            try { const data = await AuthAPI.profile(); if (!cancelled) { setProfile(data); setUser?.(data); } }
            catch { if (!cancelled) setError("Impossible de charger le profil."); }
            finally { if (!cancelled) setLoading(false); }
        };
        if (!ctxUser && token) fetchProfile();
        return () => { cancelled = true; };
    }, [token, ctxUser, setUser]);

    useEffect(() => {
        if (profile) setProfileForm({ firstname: profile.firstname || "", lastname: profile.lastname || "", phone: profile.phone || "", sector: profile.sector || "" });
    }, [profile]);

    const onUpload = async (e) => {
        const file = e.target.files?.[0]; if (!file) return;
        setUploading(true); setError("");
        try { await AuthAPI.uploadProfilePhoto(file); const data = await AuthAPI.profile(); setProfile(data); setUser?.(data); }
        catch (err) { setError(err?.response?.data || err?.message || "Upload impossible."); }
        finally { setUploading(false); e.target.value = ""; }
    };

    const handleSaveProfile = async () => {
        if (!canEdit) { setProfileUpdateError("Compte non vérifié."); return; }
        setProfileSaving(true); setProfileUpdateError(""); setProfileUpdateMessage("");
        try { const updated = await AuthAPI.updateProfile(profileForm); setProfile(updated); setUser?.(updated); setProfileUpdateMessage("Profil mis à jour."); setEditMode(false); }
        catch (err) { setProfileUpdateError(err?.response?.data?.message || err?.message || "Erreur."); }
        finally { setProfileSaving(false); }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault(); setPasswordError(""); setPasswordSuccess("");
        if (!canEdit) { setPasswordError("Compte non vérifié."); return; }
        if (!passwordForm.currentPassword || !passwordForm.newPassword) { setPasswordError("Remplissez tous les champs."); return; }
        if (passwordForm.newPassword !== passwordForm.confirmPassword) { setPasswordError("Les mots de passe ne correspondent pas."); return; }
        if (!isPasswordCompliant(passwordForm.newPassword)) { setPasswordError(passwordPolicyText); return; }
        setPasswordLoading(true);
        try {
            await AuthAPI.changePassword({ currentPassword: passwordForm.currentPassword, newPassword: passwordForm.newPassword });
            setPasswordSuccess("Mot de passe mis à jour."); setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" }); setShowPasswordForm(false);
        } catch (err) {
            setPasswordError(err?.response?.status === 400 ? passwordPolicyText : err?.response?.data?.message || "Erreur.");
        } finally { setPasswordLoading(false); }
    };

    // ── Thème ──
    const isLight = !isDark;
    const pageBg = isLight ? "bg-slate-50" : "bg-[#05071a]";
    const cardBg = isLight ? "bg-white border-slate-200 shadow-xl" : "bg-slate-900 border-slate-800 shadow-xl";
    const sectionBg = isLight ? "bg-slate-50 border-slate-200" : "bg-slate-800/50 border-slate-700/50";
    const textPrimary = isLight ? "text-slate-800" : "text-slate-100";
    const textSecondary = isLight ? "text-slate-500" : "text-slate-400";
    const textMuted = isLight ? "text-slate-400" : "text-slate-500";
    const divider = isLight ? "border-slate-200" : "border-slate-700";

    const inputClasses = {
        label: isLight ? "!text-slate-700 !opacity-100 text-xs font-semibold" : "!text-slate-300 !opacity-100 text-xs font-semibold",
        input: isLight ? "!text-slate-900" : "!text-slate-100",
        inputWrapper: isLight
            ? "border-slate-300 bg-white group-data-[focus=true]:border-orange-500 transition-all rounded-xl"
            : "border-slate-600 bg-slate-800/60 group-data-[focus=true]:border-orange-500 transition-all rounded-xl",
    };

    const InfoRow = ({ icon: Icon, label, value, highlight }) => (
        <div className={`flex items-center justify-between py-3 border-b ${divider} last:border-0`}>
            <div className="flex items-center gap-2">
                <Icon size={14} className="text-orange-500" />
                <span className={`text-xs ${textSecondary}`}>{label}</span>
            </div>
            <span className={`text-xs font-medium ${highlight || textPrimary}`}>{value || "—"}</span>
        </div>
    );

    if (!token) return (
        <div className={`min-h-screen flex items-center justify-center ${pageBg} px-4`}>
            <Card className={`max-w-md w-full rounded-2xl ${cardBg}`}>
                <CardBody className="p-6 text-center">
                    <p className={`font-semibold ${textPrimary}`}>Vous n'êtes pas connecté.</p>
                </CardBody>
            </Card>
        </div>
    );

    return (
        <div className={`min-h-screen ${pageBg} px-4 md:px-8 py-8`}>
            <div className="max-w-5xl mx-auto space-y-6">

                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <p className="text-xs uppercase tracking-widest text-orange-500 font-semibold mb-1">Espace membre</p>
                        <h1 className={`text-2xl font-bold ${textPrimary}`}>Mon Profil</h1>
                        <p className={`text-sm mt-1 ${textSecondary}`}>Gérez vos informations personnelles et la sécurité de votre compte.</p>
                    </div>
                    <Button
                        variant="flat" color="danger"
                        className="font-bold rounded-full self-start sm:self-auto"
                        startContent={<LogOut size={16} />}
                        onPress={() => { logout(); navigate("/"); }}
                    >
                        Déconnexion
                    </Button>
                </div>

                {loading ? (
                    <div className="grid md:grid-cols-[320px,1fr] gap-6">
                        <Card className={`rounded-2xl ${cardBg}`}><CardBody className="p-6 space-y-4"><Skeleton className="w-24 h-24 rounded-full mx-auto" /><Skeleton className="h-4 w-32 rounded mx-auto" /><Skeleton className="h-3 w-24 rounded mx-auto" /></CardBody></Card>
                        <Card className={`rounded-2xl ${cardBg}`}><CardBody className="p-6 space-y-3">{[1,2,3,4].map(i => <Skeleton key={i} className="h-12 w-full rounded-xl" />)}</CardBody></Card>
                    </div>
                ) : error ? (
                    <Card className={`rounded-2xl ${cardBg}`}><CardBody className="p-6"><p className="text-red-400 text-sm">{error}</p></CardBody></Card>
                ) : profile ? (
                    <div className="grid md:grid-cols-[320px,1fr] gap-6">

                        {/* Colonne gauche */}
                        <div className="space-y-4">
                            {/* Carte identité */}
                            <Card className={`rounded-2xl ${cardBg}`}>
                                <CardBody className="p-6">
                                    <div className="flex flex-col items-center gap-4">
                                        <div className="relative">
                                            <div className="h-20 w-full absolute -top-6 -left-0 rounded-t-2xl bg-gradient-to-r from-orange-500/20 to-orange-400/10" />
                                            <Avatar
                                                src={resolvePhotoUrl(profile.profilPhoto)}
                                                name={[profile.firstname, profile.lastname].filter(Boolean).join(" ") || profile.email || "U"}
                                                className="w-24 h-24 ring-4 ring-orange-500/20 shadow-xl mt-4 relative z-10"
                                            />
                                        </div>
                                        <div className="text-center mt-2">
                                            <p className={`font-bold text-lg flex items-center justify-center gap-1 ${textPrimary}`}>
                                                {[profile.firstname, profile.lastname].filter(Boolean).join(" ") || "Utilisateur"}
                                                {isVerified && <CheckBadgeIcon className="w-5 h-5 text-emerald-400" />}
                                            </p>
                                            <p className={`text-xs ${textMuted}`}>@{profile.username || profile.email?.split("@")[0] || "user"}</p>
                                        </div>

                                        <div className="flex flex-wrap justify-center gap-2">
                                            {profile.sector && (
                                                <Chip size="sm" variant="flat" className={`text-[0.7rem] ${isLight ? "bg-slate-100 text-slate-600" : "bg-slate-800 text-slate-400"}`}>
                                                    {profile.sector}
                                                </Chip>
                                            )}
                                            <Chip size="sm" variant="flat" className={`text-[0.7rem] ${isVerified ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30" : "bg-amber-500/10 text-amber-400 border border-amber-500/30"}`}>
                                                {profile.status || "Non défini"}
                                            </Chip>
                                        </div>

                                        <Button
                                            as="label" size="sm"
                                            className={`rounded-full text-xs font-medium cursor-pointer ${isLight ? "bg-slate-100 text-slate-700 hover:bg-slate-200" : "bg-slate-800 text-slate-300 hover:bg-slate-700"} border ${divider}`}
                                            isDisabled={uploading || !canEdit}
                                        >
                                            {uploading ? "Upload en cours..." : canEdit ? "Changer la photo" : "Compte non vérifié"}
                                            {canEdit && <input type="file" accept="image/*" hidden onChange={onUpload} />}
                                        </Button>

                                        {uploading && (
                                            <div className="flex items-center gap-2 text-xs text-slate-400">
                                                <Spinner size="sm" color="warning" /><span>Upload en cours…</span>
                                            </div>
                                        )}
                                    </div>
                                </CardBody>
                            </Card>

                            {/* Alerte vérification */}
                            {!isVerified && (
                                <Card className="rounded-2xl bg-amber-500/10 border border-amber-500/30">
                                    <CardBody className="p-4 space-y-3">
                                        <p className="text-xs font-bold text-amber-400 flex items-center gap-2">
                                            <span className="w-5 h-5 bg-amber-500 text-slate-900 rounded-full flex items-center justify-center text-[10px] font-bold">!</span>
                                            Vérification en attente
                                        </p>
                                        <p className="text-[11px] text-amber-200/80">Vérifiez votre adresse e-mail pour accéder à toutes les fonctionnalités.</p>
                                        {verifyMessage && <p className="text-[11px] text-emerald-400">{verifyMessage}</p>}
                                        {verifyError && <p className="text-[11px] text-red-400">{verifyError}</p>}
                                        <div className="flex flex-wrap gap-2">
                                            <Button size="sm" className="rounded-full bg-[#ff922b] text-white text-xs font-bold shadow-lg shadow-orange-500/20" startContent={<Send size={12} />} onPress={onResendVerification} isLoading={verifyLoading}>
                                                Renvoyer l'email
                                            </Button>
                                            <Button size="sm" variant="bordered" className="rounded-full text-xs border-amber-400/40 text-amber-300" startContent={<RefreshCw size={12} />} onPress={onRefreshStatus} isLoading={refreshingStatus}>
                                                Actualiser
                                            </Button>
                                        </div>
                                    </CardBody>
                                </Card>
                            )}
                        </div>

                        {/* Colonne droite */}
                        <div className="space-y-4">

                            {/* Infos compte */}
                            <Card className={`rounded-2xl ${cardBg}`}>
                                <CardBody className="p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <h2 className={`font-bold text-sm ${textPrimary}`}>Informations du compte</h2>
                                        {canEdit && (
                                            <Button size="sm" variant="flat"
                                                    className={`rounded-full text-xs ${isLight ? "bg-slate-100 text-slate-700" : "bg-slate-800 text-slate-300"}`}
                                                    startContent={editMode ? <X size={13} /> : <Edit2 size={13} />}
                                                    onPress={() => { setEditMode(p => !p); setProfileUpdateError(""); }}>
                                                {editMode ? "Annuler" : "Modifier"}
                                            </Button>
                                        )}
                                    </div>

                                    {!canEdit && (
                                        <p className="text-[11px] text-amber-400 mb-3">Disponible après vérification de votre compte.</p>
                                    )}

                                    {!editMode ? (
                                        <div>
                                            <InfoRow icon={User} label="Nom complet" value={[profile.firstname, profile.lastname].filter(Boolean).join(" ") || "—"} />
                                            <InfoRow icon={Mail} label="Adresse e-mail" value={profile.email} />
                                            <InfoRow icon={Phone} label="Téléphone" value={profile.phone || "Non renseigné"} />
                                            <InfoRow icon={Briefcase} label="Secteur" value={profile.sector || "Non renseigné"} />
                                            <InfoRow icon={Shield} label="Statut" value={profile.status} highlight={isVerified ? "text-emerald-400" : "text-amber-400"} />
                                            {profileUpdateMessage && <p className="text-xs text-emerald-400 mt-3">{profileUpdateMessage}</p>}
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <Input label="Prénom" size="sm" variant="bordered" classNames={inputClasses} value={profileForm.firstname} onChange={e => setProfileForm(p => ({...p, firstname: e.target.value}))} />
                                                <Input label="Nom" size="sm" variant="bordered" classNames={inputClasses} value={profileForm.lastname} onChange={e => setProfileForm(p => ({...p, lastname: e.target.value}))} />
                                                <Input label="Téléphone" size="sm" variant="bordered" classNames={inputClasses} value={profileForm.phone} onChange={e => setProfileForm(p => ({...p, phone: e.target.value}))} />
                                                <Input label="Secteur" size="sm" variant="bordered" classNames={inputClasses} value={profileForm.sector} onChange={e => setProfileForm(p => ({...p, sector: e.target.value}))} />
                                            </div>
                                            {profileUpdateError && <p className="text-xs text-red-400">{profileUpdateError}</p>}
                                            <div className="flex gap-2">
                                                <Button size="sm" className="rounded-full bg-[#ff922b] text-white font-bold shadow-lg shadow-orange-500/20" startContent={<Save size={13} />} onPress={handleSaveProfile} isLoading={profileSaving}>
                                                    Sauvegarder
                                                </Button>
                                                <Button size="sm" variant="flat" className={`rounded-full ${isLight ? "bg-slate-100 text-slate-700" : "bg-slate-800 text-slate-300"}`} onPress={() => { setEditMode(false); setProfileUpdateError(""); }}>
                                                    Annuler
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </CardBody>
                            </Card>

                            {/* Sécurité */}
                            <Card className={`rounded-2xl ${cardBg}`}>
                                <CardBody className="p-6 space-y-4">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Shield size={16} className="text-orange-500" />
                                        <h2 className={`font-bold text-sm ${textPrimary}`}>Sécurité & connexion</h2>
                                    </div>
                                    <p className={`text-xs ${textSecondary}`}>Modifiez votre mot de passe. Les options avancées (2FA) arriveront prochainement.</p>

                                    {!canEdit && <p className="text-[11px] text-amber-400">Disponible après vérification de votre compte.</p>}

                                    <Button size="sm"
                                            className={`rounded-full text-xs ${isLight ? "bg-slate-100 text-slate-700 border border-slate-200" : "bg-slate-800 text-slate-300 border border-slate-700"}`}
                                            isDisabled={!canEdit}
                                            startContent={showPasswordForm ? <X size={13} /> : <Shield size={13} />}
                                            onPress={() => setShowPasswordForm(p => !p)}>
                                        {showPasswordForm ? "Annuler" : "Modifier le mot de passe"}
                                    </Button>

                                    {showPasswordForm && (
                                        <form onSubmit={handleChangePassword} className="space-y-3">
                                            <Input label="Mot de passe actuel" type="password" size="sm" variant="bordered" classNames={inputClasses} value={passwordForm.currentPassword} onChange={e => setPasswordForm(p => ({...p, currentPassword: e.target.value}))} />
                                            <div>
                                                <Input label="Nouveau mot de passe" type="password" size="sm" variant="bordered" classNames={inputClasses} value={passwordForm.newPassword} onChange={e => { setPasswordForm(p => ({...p, newPassword: e.target.value})); setPasswordError(""); setPasswordSuccess(""); }} />
                                                <p className={`text-[11px] mt-1 ${passwordForm.newPassword && !isPasswordCompliant(passwordForm.newPassword) ? "text-amber-400" : textMuted}`}>{passwordPolicyText}</p>
                                            </div>
                                            <Input label="Confirmer le mot de passe" type="password" size="sm" variant="bordered" classNames={inputClasses} value={passwordForm.confirmPassword} onChange={e => setPasswordForm(p => ({...p, confirmPassword: e.target.value}))} />
                                            {passwordError && <p className="text-xs text-red-400">{passwordError}</p>}
                                            {passwordSuccess && <p className="text-xs text-emerald-400">{passwordSuccess}</p>}
                                            <Button type="submit" size="sm" className="rounded-full bg-[#ff922b] text-white font-bold shadow-lg shadow-orange-500/20" isLoading={passwordLoading}>
                                                Mettre à jour
                                            </Button>
                                        </form>
                                    )}
                                </CardBody>
                            </Card>

                            {/* Activité */}
                            <Card className={`rounded-2xl ${cardBg}`}>
                                <CardBody className="p-6">
                                    <h2 className={`font-bold text-sm mb-2 ${textPrimary}`}>Activité & espace formation</h2>
                                    <p className={`text-xs ${textSecondary}`}>Bientôt disponible : résumé de vos sessions, réservations et statistiques.</p>
                                </CardBody>
                            </Card>
                        </div>
                    </div>
                ) : (
                    <Card className={`rounded-2xl ${cardBg}`}><CardBody className="p-6"><p className={`text-sm ${textSecondary}`}>Profil introuvable.</p></CardBody></Card>
                )}
            </div>
        </div>
    );
};

export default Profile;