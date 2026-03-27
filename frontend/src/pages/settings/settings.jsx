import React, { useState, useEffect } from "react";
import {
    Card, CardHeader, CardBody,
    Input, Button, Tabs, Tab,
    Avatar, Divider, Switch, Spinner
} from "@heroui/react";
import {
    User, Save, Mail, Shield, LogOut,
    AlertCircle, CheckCircle2, Sun, Moon, Palette
} from "lucide-react";

import { useAuth } from "@/auth/AuthContext";
import { AuthAPI } from "@/services/auth";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@/theme/ThemeProvider"; // ← context global

export default function SettingsPage() {
    const { user, token, logout, setUser } = useAuth();
    const navigate = useNavigate();

    // ✅ Plus de useState/useEffect local pour le thème — on branche le global
    const { theme, setTheme, isDark } = useTheme();
    const isLight = !isDark;

    const [isLoading, setIsLoading] = useState(!user && !!token);
    const [profileSaving, setProfileSaving] = useState(false);
    const [profileUpdateMessage, setProfileUpdateMessage] = useState("");
    const [profileUpdateError, setProfileUpdateError] = useState("");

    const [formData, setFormData] = useState({
        firstname: "", lastname: "", email: "", phone: "", sector: ""
    });

    const [passwordForm, setPasswordForm] = useState({
        currentPassword: "", newPassword: "", confirmPassword: ""
    });
    const [passwordLoading, setPasswordLoading] = useState(false);
    const [passwordError, setPasswordError] = useState("");
    const [passwordSuccess, setPasswordSuccess] = useState("");

    const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

    useEffect(() => {
        if (user) {
            setFormData({
                firstname: user.firstname || "",
                lastname: user.lastname || "",
                email: user.email || "",
                phone: user.phone || "",
                sector: user.sector || ""
            });
            setIsLoading(false);
        }
    }, [user]);

    const handleUpdateProfile = async () => {
        setProfileSaving(true);
        setProfileUpdateError("");
        setProfileUpdateMessage("");
        try {
            const updated = await AuthAPI.updateProfile(formData);
            if (setUser) setUser(updated);
            setProfileUpdateMessage("Profil mis à jour avec succès.");
        } catch (err) {
            setProfileUpdateError(err?.response?.data?.message || "Erreur de mise à jour.");
        } finally {
            setProfileSaving(false);
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            setPasswordError("Les mots de passe ne correspondent pas.");
            return;
        }
        setPasswordLoading(true);
        setPasswordError("");
        setPasswordSuccess("");
        try {
            await AuthAPI.changePassword({
                currentPassword: passwordForm.currentPassword,
                newPassword: passwordForm.newPassword
            });
            setPasswordSuccess("Mot de passe mis à jour !");
            setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
        } catch (err) {
            setPasswordError(err?.response?.data?.message || "Ancien mot de passe incorrect.");
        } finally {
            setPasswordLoading(false);
        }
    };

    const resolvePhotoUrl = (url) => {
        if (!url) return null;
        if (url.startsWith("http")) return url;
        return `${API_BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
    };

    // ── Classes dynamiques selon le thème global ──
    const sharedInputClass = {
        label: isLight ? "!text-slate-700 !opacity-100 font-bold text-sm" : "!text-white !opacity-100 font-bold text-sm",
        input: isLight ? "!text-slate-800" : "!text-white",
        inputWrapper: isLight
            ? "border-slate-300 bg-transparent group-data-[focus=true]:border-orange-500 transition-all"
            : "border-slate-700 bg-transparent group-data-[focus=true]:border-white transition-all",
    };
    const cardClass     = isLight ? "bg-white border-slate-200 shadow-xl"  : "bg-slate-900 border-slate-800 shadow-xl";
    const textPrimary   = isLight ? "text-slate-800"  : "text-slate-100";
    const textSecondary = isLight ? "text-slate-500"  : "text-default-500";
    const textBody      = isLight ? "text-slate-700"  : "text-white";
    const textMuted     = isLight ? "text-slate-500"  : "text-slate-500";
    const dividerClass  = isLight ? "bg-slate-200"    : "bg-slate-800";

    const ThemeCard = ({ value, label, icon: Icon }) => {
        const selected = theme === value;
        return (
            <button
                onClick={() => setTheme(value)}
                className={`flex flex-col items-center gap-3 p-5 rounded-2xl border-2 transition-all duration-200 w-full cursor-pointer
                    ${selected
                    ? "border-orange-500 bg-orange-500/10 shadow-md shadow-orange-500/20"
                    : isLight
                        ? "border-slate-200 bg-white hover:border-slate-300"
                        : "border-slate-700 bg-slate-800/50 hover:border-slate-600"
                }`}
            >
                <div className={`p-3 rounded-xl ${selected ? "bg-orange-500/20" : isLight ? "bg-slate-100" : "bg-slate-700"}`}>
                    <Icon size={22} className={selected ? "text-orange-500" : isLight ? "text-slate-600" : "text-slate-400"} />
                </div>
                <span className={`text-sm font-bold ${selected ? "text-orange-500" : isLight ? "text-slate-700" : "text-slate-300"}`}>
                    {label}
                </span>
                {selected && (
                    <span className="text-xs text-orange-400 font-medium flex items-center gap-1">
                        <CheckCircle2 size={12} /> Actif
                    </span>
                )}
            </button>
        );
    };

    if (!token) {
        return (
            <div className="h-screen flex items-center justify-center bg-[#050721]">
                <Card className="bg-slate-900 border-slate-800 p-6 text-center">
                    <AlertCircle className="mx-auto text-orange-500 mb-4" size={40} />
                    <p className="text-white font-bold">Session expirée</p>
                    <Button className="mt-4 bg-[#ff922b]" onPress={() => navigate("/")}>Retourner à l'accueil</Button>
                </Card>
            </div>
        );
    }

    if (isLoading) return (
        <div className="h-full flex items-center justify-center min-h-[400px]">
            <Spinner color="warning" />
        </div>
    );

    return (
        <div className="p-6 lg:p-10 max-w-6xl mx-auto">
            <header className="flex justify-between items-center mb-10">
                <div>
                    <h1 className={`text-2xl font-bold ${textPrimary}`}>Paramètres</h1>
                    <p className={`${textSecondary} text-sm`}>Gérez votre compte et vos préférences</p>
                </div>
                <Button variant="flat" color="danger" className="font-bold rounded-full" startContent={<LogOut size={18} />} onPress={logout}>
                    Déconnexion
                </Button>
            </header>

            <Tabs
                aria-label="Settings"
                variant="underlined"
                classNames={{
                    tabList: `gap-8 border-b ${isLight ? "border-slate-200" : "border-slate-800"}`,
                    cursor: "bg-[#ff922b]",
                    tab: "max-w-fit px-0 h-12",
                    tabContent: "group-data-[selected=true]:text-[#ff922b] font-bold"
                }}
            >
                {/* ── Profil ── */}
                <Tab key="profile" title="Mon Profil">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-6">
                        <div className="lg:col-span-4">
                            <Card className={`${cardClass} overflow-hidden`}>
                                <div className="h-24 bg-gradient-to-r from-orange-600/20 to-orange-400/10" />
                                <CardBody className="flex flex-col items-center -mt-12">
                                    <Avatar src={resolvePhotoUrl(user?.profilPhoto)} className="w-24 h-24 ring-4 ring-slate-900 shadow-xl" name={user?.firstname} />
                                    <h3 className={`mt-4 text-xl font-bold ${textBody}`}>{formData.firstname} {formData.lastname}</h3>
                                    <p className="text-orange-500 text-xs font-bold uppercase mt-1">{formData.sector || "Membre"}</p>
                                    <div className="w-full mt-6 space-y-3">
                                        <div className={`flex items-center gap-3 text-sm p-3 rounded-xl ${isLight ? "text-slate-600 bg-slate-100" : "text-slate-400 bg-slate-950/40"}`}>
                                            <Mail size={16} className="text-orange-500" />
                                            <span className="truncate">{formData.email}</span>
                                        </div>
                                    </div>
                                </CardBody>
                            </Card>
                        </div>

                        <div className="lg:col-span-8">
                            <Card className={cardClass}>
                                <CardHeader className="p-6 pb-0 flex flex-col items-start">
                                    <h3 className={`${textBody} font-bold`}>Informations Personnelles</h3>
                                    {profileUpdateMessage && <p className="text-emerald-400 text-xs mt-2 flex items-center gap-1"><CheckCircle2 size={14}/> {profileUpdateMessage}</p>}
                                    {profileUpdateError && <p className="text-red-400 text-xs mt-2">{profileUpdateError}</p>}
                                </CardHeader>
                                <CardBody className="p-6 gap-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <Input label="Prénom" value={formData.firstname} onChange={(e) => setFormData({...formData, firstname: e.target.value})} variant="bordered" classNames={sharedInputClass} />
                                        <Input label="Nom" value={formData.lastname} onChange={(e) => setFormData({...formData, lastname: e.target.value})} variant="bordered" classNames={sharedInputClass} />
                                        <Input label="Téléphone" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} variant="bordered" classNames={sharedInputClass} />
                                        <Input label="Secteur / Agence" value={formData.sector} onChange={(e) => setFormData({...formData, sector: e.target.value})} variant="bordered" classNames={sharedInputClass} />
                                    </div>
                                    <div className="flex justify-end">
                                        <Button className="bg-[#ff922b] text-white font-bold px-8 shadow-lg shadow-orange-500/20" startContent={<Save size={18} />} isLoading={profileSaving} onPress={handleUpdateProfile}>
                                            Sauvegarder
                                        </Button>
                                    </div>
                                </CardBody>
                            </Card>
                        </div>
                    </div>
                </Tab>

                {/* ── Sécurité ── */}
                {/* ── Sécurité ── */}
                <Tab key="security" title="Sécurité">
                    <div className="mt-6 max-w-2xl space-y-4">

                        {/* Carte mot de passe */}
                        <Card className={cardClass}>
                            <CardHeader className="p-6 pb-0">
                                <h3 className={`${textBody} font-bold flex items-center gap-2`}>
                                    <Shield size={20} className="text-orange-500" /> Modifier le mot de passe
                                </h3>
                            </CardHeader>
                            <Divider className={`mt-4 ${dividerClass}`} />
                            <CardBody className="p-6">
                                <form onSubmit={handleChangePassword} className="space-y-5">
                                    <Input
                                        label="Mot de passe actuel"
                                        type="password"
                                        value={passwordForm.currentPassword}
                                        onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                                        variant="bordered"
                                        classNames={sharedInputClass}
                                    />
                                    <Input
                                        label="Nouveau mot de passe"
                                        type="password"
                                        value={passwordForm.newPassword}
                                        onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                                        variant="bordered"
                                        classNames={sharedInputClass}
                                    />
                                    <Input
                                        label="Confirmer le nouveau mot de passe"
                                        type="password"
                                        value={passwordForm.confirmPassword}
                                        onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                                        variant="bordered"
                                        classNames={sharedInputClass}
                                    />

                                    {passwordError && (
                                        <div className={`flex items-center gap-2 p-3 rounded-xl text-xs ${isLight ? "bg-red-50 border border-red-200 text-red-600" : "bg-red-500/10 border border-red-500/20 text-red-400"}`}>
                                            <AlertCircle size={14} /> {passwordError}
                                        </div>
                                    )}
                                    {passwordSuccess && (
                                        <div className={`flex items-center gap-2 p-3 rounded-xl text-xs ${isLight ? "bg-emerald-50 border border-emerald-200 text-emerald-600" : "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"}`}>
                                            <CheckCircle2 size={14} /> {passwordSuccess}
                                        </div>
                                    )}

                                    <Button
                                        type="submit"
                                        className="w-full font-bold bg-[#ff922b] text-white shadow-lg shadow-orange-500/20"
                                        isLoading={passwordLoading}
                                        startContent={!passwordLoading && <Shield size={16} />}
                                    >
                                        Mettre à jour le mot de passe
                                    </Button>
                                </form>
                            </CardBody>
                        </Card>

                        {/* Carte infos sécurité */}
                        <Card className={cardClass}>
                            <CardBody className="p-6">
                                <h3 className={`${textBody} font-bold text-sm mb-4 flex items-center gap-2`}>
                                    <Shield size={16} className="text-orange-500" /> Conseils de sécurité
                                </h3>
                                <div className="space-y-3">
                                    {[
                                        { label: "Longueur minimale", desc: "Au moins 8 caractères", ok: passwordForm.newPassword.length >= 8 },
                                        { label: "Majuscule", desc: "Au moins une lettre majuscule", ok: /[A-Z]/.test(passwordForm.newPassword) },
                                        { label: "Minuscule", desc: "Au moins une lettre minuscule", ok: /[a-z]/.test(passwordForm.newPassword) },
                                        { label: "Chiffre", desc: "Au moins un chiffre", ok: /\d/.test(passwordForm.newPassword) },
                                    ].map((rule, i) => (
                                        <div key={i} className={`flex items-center justify-between p-3 rounded-xl border ${
                                            passwordForm.newPassword
                                                ? rule.ok
                                                    ? isLight ? "bg-emerald-50 border-emerald-200" : "bg-emerald-500/10 border-emerald-500/20"
                                                    : isLight ? "bg-red-50 border-red-200" : "bg-red-500/10 border-red-500/20"
                                                : isLight ? "bg-slate-50 border-slate-200" : "bg-slate-800/40 border-slate-700"
                                        }`}>
                                            <div>
                                                <p className={`text-xs font-bold ${
                                                    passwordForm.newPassword
                                                        ? rule.ok
                                                            ? "text-emerald-500"
                                                            : "text-red-400"
                                                        : textBody
                                                }`}>{rule.label}</p>
                                                <p className={`text-[11px] ${textMuted}`}>{rule.desc}</p>
                                            </div>
                                            {passwordForm.newPassword && (
                                                rule.ok
                                                    ? <CheckCircle2 size={16} className="text-emerald-500 flex-shrink-0" />
                                                    : <AlertCircle size={16} className="text-red-400 flex-shrink-0" />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </CardBody>
                        </Card>

                    </div>
                </Tab>

                {/* ── Notifications ── */}
                <Tab key="notifications" title="Notifications">
                    <div className="mt-6 max-w-2xl">
                        <Card className={cardClass}>
                            <CardBody className="p-0">
                                {[
                                    { title: "Alertes par email", desc: "Recevoir les notifications importantes par courriel." },
                                    { title: "Documents expirés", desc: "Alerte 30 jours avant la fin d'un document." },
                                    { title: "Accès système", desc: "Être prévenu lors d'une nouvelle connexion." }
                                ].map((item, i) => (
                                    <div key={i}>
                                        <div className="flex items-center justify-between p-6">
                                            <div>
                                                <p className={`${textBody} font-bold text-sm`}>{item.title}</p>
                                                <p className={`${textMuted} text-xs`}>{item.desc}</p>
                                            </div>
                                            <Switch color="warning" defaultSelected size="sm" />
                                        </div>
                                        {i < 2 && <Divider className={dividerClass} />}
                                    </div>
                                ))}
                            </CardBody>
                        </Card>
                    </div>
                </Tab>

                {/* ── Apparence ── */}
                <Tab key="appearance" title={<span className="flex items-center gap-2"><Palette size={15} />Apparence</span>}>
                    <div className="mt-6 max-w-2xl space-y-6">
                        <Card className={cardClass}>
                            <CardHeader className="p-6 pb-2">
                                <div>
                                    <h3 className={`${textBody} font-bold flex items-center gap-2`}>
                                        <Palette size={20} className="text-orange-500" /> Thème de l'interface
                                    </h3>
                                    <p className={`${textMuted} text-xs mt-1`}>Choisissez l'apparence qui vous convient le mieux.</p>
                                </div>
                            </CardHeader>
                            <Divider className={dividerClass} />
                            <CardBody className="p-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <ThemeCard value="dark" label="Sombre" icon={Moon} />
                                    <ThemeCard value="light" label="Clair" icon={Sun} />
                                </div>
                                <div className={`mt-6 p-4 rounded-xl border ${isLight ? "border-slate-200 bg-slate-50" : "border-slate-700 bg-slate-800/40"}`}>
                                    <p className={`text-xs font-bold uppercase tracking-widest mb-3 ${isLight ? "text-slate-400" : "text-slate-500"}`}>Aperçu</p>
                                    <div className={`rounded-lg p-4 ${isLight ? "bg-white border border-slate-200 shadow-sm" : "bg-slate-900 border border-slate-700"}`}>
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center">
                                                <User size={14} className="text-orange-500" />
                                            </div>
                                            <div>
                                                <div className={`text-xs font-bold ${textBody}`}>Jean Dupont</div>
                                                <div className={`text-xs ${textMuted}`}>jean@exemple.fr</div>
                                            </div>
                                        </div>
                                        <div className={`h-2 rounded-full w-3/4 ${isLight ? "bg-slate-100" : "bg-slate-700"}`} />
                                        <div className={`h-2 rounded-full w-1/2 mt-2 ${isLight ? "bg-slate-100" : "bg-slate-700"}`} />
                                    </div>
                                    <p className={`text-xs mt-3 text-center ${isLight ? "text-slate-400" : "text-slate-500"}`}>
                                        Thème actuel : <span className="text-orange-500 font-bold">{isLight ? "Clair ☀️" : "Sombre 🌙"}</span>
                                    </p>
                                </div>
                            </CardBody>
                        </Card>
                    </div>
                </Tab>
            </Tabs>
        </div>
    );
}
