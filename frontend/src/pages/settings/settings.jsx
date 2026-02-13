import React, { useState, useEffect } from "react";
import {
    Card, CardHeader, CardBody,
    Input, Button, Tabs, Tab,
    Avatar, Divider, Switch, Spinner
} from "@heroui/react";
import {
    User, Lock, Bell, Camera, Save,
    Mail, Phone, Shield, LogOut, AlertCircle, CheckCircle2
} from "lucide-react";

// Utilisation des alias @ pour éviter les erreurs de chemins relatifs
import { useAuth } from "@/auth/AuthContext";
import { AuthAPI } from "@/services/auth";
import { useNavigate } from "react-router-dom";

export default function SettingsPage() {
    const { user, token, logout, setUser } = useAuth();
    const navigate = useNavigate();

    const [isLoading, setIsLoading] = useState(!user && !!token);
    const [profileSaving, setProfileSaving] = useState(false);
    const [profileUpdateMessage, setProfileUpdateMessage] = useState("");
    const [profileUpdateError, setProfileUpdateError] = useState("");

    const [formData, setFormData] = useState({
        firstname: "",
        lastname: "",
        email: "",
        phone: "",
        sector: ""
    });

    // Gestion Mot de passe
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
    });
    const [passwordLoading, setPasswordLoading] = useState(false);
    const [passwordError, setPasswordError] = useState("");
    const [passwordSuccess, setPasswordSuccess] = useState("");

    const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

    // Initialisation des données du formulaire
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

    const sharedInputClass = {
        label: "!text-white !opacity-100 font-bold text-sm",
        input: "!text-white",
        inputWrapper: "border-slate-700 bg-transparent group-data-[focus=true]:border-white transition-all",
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

    if (isLoading) return <div className="h-full flex items-center justify-center min-h-[400px]"><Spinner color="warning" /></div>;

    return (
        <div className="p-6 lg:p-10 max-w-6xl mx-auto">
            <header className="flex justify-between items-center mb-10">
                <div>
                    <h1 className="text-2xl font-bold text-slate-100">Paramètres</h1>
                    <p className="text-default-500 text-sm">Gérez votre compte et vos préférences</p>
                </div>
                <Button
                    variant="flat"
                    color="danger"
                    className="font-bold rounded-full"
                    startContent={<LogOut size={18} />}
                    onPress={logout}
                >
                    Déconnexion
                </Button>
            </header>

            <Tabs
                aria-label="Settings"
                variant="underlined"
                classNames={{
                    tabList: "gap-8 border-b border-slate-800",
                    cursor: "bg-[#ff922b]",
                    tab: "max-w-fit px-0 h-12",
                    tabContent: "group-data-[selected=true]:text-[#ff922b] font-bold"
                }}
            >
                <Tab key="profile" title="Mon Profil">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-6">
                        <div className="lg:col-span-4">
                            <Card className="bg-slate-900 border-slate-800 shadow-xl overflow-hidden">
                                <div className="h-24 bg-gradient-to-r from-orange-600/20 to-orange-400/10" />
                                <CardBody className="flex flex-col items-center -mt-12">
                                    <Avatar
                                        src={resolvePhotoUrl(user?.profilPhoto)}
                                        className="w-24 h-24 ring-4 ring-slate-900 shadow-xl"
                                        name={user?.firstname}
                                    />
                                    <h3 className="mt-4 text-xl font-bold text-white">{formData.firstname} {formData.lastname}</h3>
                                    <p className="text-orange-500 text-xs font-bold uppercase mt-1">{formData.sector || "Membre"}</p>
                                    <div className="w-full mt-6 space-y-3">
                                        <div className="flex items-center gap-3 text-slate-400 text-sm p-3 bg-slate-950/40 rounded-xl">
                                            <Mail size={16} className="text-orange-500" />
                                            <span className="truncate">{formData.email}</span>
                                        </div>
                                    </div>
                                </CardBody>
                            </Card>
                        </div>

                        <div className="lg:col-span-8">
                            <Card className="bg-slate-900 border-slate-800 shadow-xl">
                                <CardHeader className="p-6 pb-0 flex flex-col items-start">
                                    <h3 className="text-white font-bold">Informations Personnelles</h3>
                                    {profileUpdateMessage && <p className="text-emerald-400 text-xs mt-2 flex items-center gap-1"><CheckCircle2 size={14}/> {profileUpdateMessage}</p>}
                                    {profileUpdateError && <p className="text-red-400 text-xs mt-2">{profileUpdateError}</p>}
                                </CardHeader>
                                <CardBody className="p-6 gap-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <Input
                                            label="Prénom"
                                            value={formData.firstname}
                                            onChange={(e) => setFormData({...formData, firstname: e.target.value})}
                                            variant="bordered"
                                            classNames={sharedInputClass}
                                        />
                                        <Input
                                            label="Nom"
                                            value={formData.lastname}
                                            onChange={(e) => setFormData({...formData, lastname: e.target.value})}
                                            variant="bordered"
                                            classNames={sharedInputClass}
                                        />
                                        <Input
                                            label="Téléphone"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                            variant="bordered"
                                            classNames={sharedInputClass}
                                        />
                                        <Input
                                            label="Secteur / Agence"
                                            value={formData.sector}
                                            onChange={(e) => setFormData({...formData, sector: e.target.value})}
                                            variant="bordered"
                                            classNames={sharedInputClass}
                                        />
                                    </div>
                                    <div className="flex justify-end">
                                        <Button
                                            className="bg-[#ff922b] text-white font-bold px-8 shadow-lg shadow-orange-500/20"
                                            startContent={<Save size={18} />}
                                            isLoading={profileSaving}
                                            onPress={handleUpdateProfile}
                                        >
                                            Sauvegarder
                                        </Button>
                                    </div>
                                </CardBody>
                            </Card>
                        </div>
                    </div>
                </Tab>

                <Tab key="security" title="Sécurité">
                    <div className="mt-6 max-w-2xl">
                        <Card className="bg-slate-900 border-slate-800 shadow-xl">
                            <CardHeader className="p-6">
                                <h3 className="text-white font-bold flex items-center gap-2">
                                    <Shield size={20} className="text-orange-500" /> Modifier le mot de passe
                                </h3>
                            </CardHeader>
                            <Divider className="bg-slate-800" />
                            <CardBody className="p-6 gap-5">
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

                                    {passwordError && <p className="text-red-400 text-xs">{passwordError}</p>}
                                    {passwordSuccess && <p className="text-emerald-400 text-xs">{passwordSuccess}</p>}

                                    <Button
                                        type="submit"
                                        className="w-full bg-slate-800 text-white font-bold mt-2"
                                        isLoading={passwordLoading}
                                    >
                                        Mettre à jour la sécurité
                                    </Button>
                                </form>
                            </CardBody>
                        </Card>
                    </div>
                </Tab>

                <Tab key="notifications" title="Notifications">
                    <div className="mt-6 max-w-2xl">
                        <Card className="bg-slate-900 border-slate-800 shadow-xl">
                            <CardBody className="p-0">
                                {[
                                    { title: "Alertes par email", desc: "Recevoir les notifications importantes par courriel." },
                                    { title: "Documents expirés", desc: "Alerte 30 jours avant la fin d'un document." },
                                    { title: "Accès système", desc: "Être prévenu lors d'une nouvelle connexion." }
                                ].map((item, i) => (
                                    <div key={i}>
                                        <div className="flex items-center justify-between p-6">
                                            <div>
                                                <p className="text-white font-bold text-sm">{item.title}</p>
                                                <p className="text-slate-500 text-xs">{item.desc}</p>
                                            </div>
                                            <Switch color="warning" defaultSelected size="sm" />
                                        </div>
                                        {i < 2 && <Divider className="bg-slate-800" />}
                                    </div>
                                ))}
                            </CardBody>
                        </Card>
                    </div>
                </Tab>
            </Tabs>
        </div>
    );
}