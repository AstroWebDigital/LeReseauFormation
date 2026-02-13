import React, { useState, useEffect } from "react";
import {
    Card, CardHeader, CardBody,
    Input, Button, Tabs, Tab,
    Avatar, Divider, Switch
} from "@heroui/react";
import { User, Lock, Bell, Camera, Save } from "lucide-react";
import axios from "axios";

export default function SettingsPage() {
    const [loading, setLoading] = useState(false);
    const [userData, setUserData] = useState({
        firstname: "Jean",
        lastname: "Admin",
        email: "jean.admin@le-reseau.fr",
        phone: "06 00 00 00 00",
        sector: "Location",
        profilPhoto: "https://i.pravatar.cc/150?u=a042581f4e29026704d"
    });

    // Fonction pour sauvegarder les infos (lie au SettingsController)
    const handleUpdateProfile = async () => {
        setLoading(true);
        try {
            // await axios.patch("/api/settings/me/profile", userData);
            console.log("Profil mis à jour !", userData);
        } catch (error) {
            console.error("Erreur de mise à jour", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#070b1d] p-6 lg:p-10 text-white">
            <div className="max-w-5xl mx-auto">
                <header className="mb-8">
                    <h1 className="text-3xl font-bold">Paramètres</h1>
                    <p className="text-slate-400">Gérez votre compte et vos préférences système.</p>
                </header>

                <Tabs
                    aria-label="Options"
                    color="warning"
                    variant="underlined"
                    classNames={{
                        tabList: "gap-6 w-full relative rounded-none p-0 border-b border-white/10",
                        cursor: "w-full bg-[#f5a524]",
                        tab: "max-w-fit px-0 h-12",
                        tabContent: "group-data-[selected=true]:text-[#f5a524]"
                    }}
                >
                    {/* --- ONGLET PROFIL --- */}
                    <Tab
                        key="profile"
                        title={
                            <div className="flex items-center space-x-2">
                                <User size={18} />
                                <span>Mon Profil</span>
                            </div>
                        }
                    >
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                            {/* Carte Photo */}
                            <Card className="bg-[#111729] border border-white/5 shadow-2xl">
                                <CardBody className="flex flex-col items-center py-10">
                                    <div className="relative">
                                        <Avatar
                                            src={userData.profilPhoto}
                                            className="w-32 h-32 text-large ring-2 ring-orange-500/50"
                                        />
                                        <Button
                                            isIconOnly
                                            size="sm"
                                            radius="full"
                                            className="absolute bottom-0 right-0 bg-orange-500 text-white shadow-lg"
                                        >
                                            <Camera size={16} />
                                        </Button>
                                    </div>
                                    <h3 className="mt-4 text-xl font-bold">{userData.firstname} {userData.lastname}</h3>
                                    <p className="text-slate-400 text-sm">Agent Loueur</p>
                                </CardBody>
                            </Card>

                            {/* Formulaire */}
                            <Card className="md:col-span-2 bg-[#111729] border border-white/5 shadow-2xl">
                                <CardHeader className="text-lg font-semibold">Informations personnelles</CardHeader>
                                <Divider className="bg-white/5" />
                                <CardBody className="gap-6 py-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <Input
                                            label="Prénom"
                                            variant="bordered"
                                            value={userData.firstname}
                                            onChange={(e) => setUserData({...userData, firstname: e.target.value})}
                                            classNames={{ inputWrapper: "border-white/10" }}
                                        />
                                        <Input
                                            label="Nom"
                                            variant="bordered"
                                            value={userData.lastname}
                                            onChange={(e) => setUserData({...userData, lastname: e.target.value})}
                                            classNames={{ inputWrapper: "border-white/10" }}
                                        />
                                        <Input
                                            label="Email"
                                            variant="flat"
                                            disabled
                                            value={userData.email}
                                            classNames={{ inputWrapper: "opacity-50" }}
                                        />
                                        <Input
                                            label="Téléphone"
                                            variant="bordered"
                                            value={userData.phone}
                                            onChange={(e) => setUserData({...userData, phone: e.target.value})}
                                            classNames={{ inputWrapper: "border-white/10" }}
                                        />
                                    </div>
                                    <Button
                                        className="bg-gradient-to-r from-orange-500 to-yellow-500 font-bold text-white mt-4"
                                        onClick={handleUpdateProfile}
                                        isLoading={loading}
                                        startContent={<Save size={18} />}
                                    >
                                        Enregistrer les modifications
                                    </Button>
                                </CardBody>
                            </Card>
                        </div>
                    </Tab>

                    {/* --- ONGLET SECURITE --- */}
                    <Tab
                        key="security"
                        title={
                            <div className="flex items-center space-x-2">
                                <Lock size={18} />
                                <span>Sécurité</span>
                            </div>
                        }
                    >
                        <Card className="mt-6 bg-[#111729] border border-white/5 max-w-2xl">
                            <CardBody className="gap-4">
                                <h3 className="text-lg font-semibold">Changer le mot de passe</h3>
                                <Input label="Mot de passe actuel" type="password" variant="bordered" classNames={{ inputWrapper: "border-white/10" }} />
                                <Input label="Nouveau mot de passe" type="password" variant="bordered" classNames={{ inputWrapper: "border-white/10" }} />
                                <Button color="warning" variant="flat" className="font-bold">Mettre à jour le mot de passe</Button>
                            </CardBody>
                        </Card>
                    </Tab>

                    {/* --- ONGLET NOTIFICATIONS --- */}
                    <Tab
                        key="notifications"
                        title={
                            <div className="flex items-center space-x-2">
                                <Bell size={18} />
                                <span>Notifications</span>
                            </div>
                        }
                    >
                        <Card className="mt-6 bg-[#111729] border border-white/5 max-w-2xl">
                            <CardBody className="gap-6">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="font-medium text-white">Alertes de réservation</p>
                                        <p className="text-xs text-slate-400">Recevoir un email à chaque nouvelle location.</p>
                                    </div>
                                    <Switch color="warning" defaultSelected />
                                </div>
                                <Divider className="bg-white/5" />
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="font-medium text-white">Maintenance véhicules</p>
                                        <p className="text-xs text-slate-400">Alertes quand une révision est dépassée.</p>
                                    </div>
                                    <Switch color="warning" defaultSelected />
                                </div>
                            </CardBody>
                        </Card>
                    </Tab>
                </Tabs>
            </div>
        </div>
    );
}