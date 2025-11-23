// src/components/Sidebar.jsx
import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
    HomeIcon,
    TruckIcon,
    CalendarDaysIcon,
    ChatBubbleLeftRightIcon,
    DocumentTextIcon,
    ChartBarIcon,
    Cog6ToothIcon,
    UserCircleIcon,
    ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "../auth/AuthContext";

const DashboardSidebar = () => {
    const { pathname } = useLocation();
    const navigate = useNavigate();
    const { user, token, logout } = useAuth();

    const isAuthenticated = !!token && !!user;

    const API_BASE_URL =
        import.meta.env.VITE_API_URL || "http://localhost:8080";

    const resolvePhotoUrl = (url) => {
        if (!url) return null;
        if (url.startsWith("http://") || url.startsWith("https://")) return url;
        if (url.startsWith("/")) return `${API_BASE_URL}${url}`;
        return `${API_BASE_URL}/${url}`;
    };

    const userDisplayName =
        [user?.firstname, user?.lastname].filter(Boolean).join(" ") ||
        user?.email?.split("@")[0] ||
        "Utilisateur";

    const initials = userDisplayName
        .split(" ")
        .map((p) => p[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);

    // Liens quand connecté
    const authNavItems = [
        { label: "Tableau de bord", icon: HomeIcon, to: "/" },
        { label: "Mes véhicules", icon: TruckIcon, to: "/vehicules" },
        { label: "Réservations", icon: CalendarDaysIcon, to: "/reservations" },
        { label: "Messages", icon: ChatBubbleLeftRightIcon, to: "/messages" },
        { label: "Documents", icon: DocumentTextIcon, to: "/documents" },
        { label: "Statistiques", icon: ChartBarIcon, to: "/statistiques" },
        { label: "Paramètres", icon: Cog6ToothIcon, to: "/parametres" },
        { label: "Mon profil", icon: UserCircleIcon, to: "/profile" },
    ];

    // Liens quand pas connecté
    const guestNavItems = [
        { label: "Accueil", icon: HomeIcon, to: "/" },
        { label: "Se connecter", icon: ArrowRightOnRectangleIcon, to: "/login" },
        { label: "Offre entreprise", icon: DocumentTextIcon, to: "/offre-entreprise" },
        { label: "Des questions ?", icon: ChatBubbleLeftRightIcon, to: "/faq" },
        { label: "Blog", icon: ChartBarIcon, to: "/blog" },
    ];

    const navItems = isAuthenticated ? authNavItems : guestNavItems;

    const isActive = (to) => {
        if (to === "/dashboard") return pathname === "/dashboard";
        return pathname === to || pathname.startsWith(to);
    };

    return (
        <aside
            className="sticky top-0 h-screen w-64 shrink-0 bg-gradient-to-b from-[#060d33] to-[#050718] text-white flex flex-col justify-between border-r border-white/5"
        >
            {/* Header : logo + texte (même rendu pour tous les cas) */}
            <div className="px-5 pt-6 pb-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                    <div
                        className="flex h-11 w-11 items-center justify-center rounded-xl bg-white shadow-lg shadow-black/30 overflow-hidden">
                        <img
                            src="/Logo-Reseau-Formation.png"
                            alt="Le Réseau Formation"
                            className="h-9 w-9 object-contain"
                        />
                    </div>
                    <div className="flex flex-col leading-tight">
                        <span className="text-sm font-semibold tracking-wide">
                            Le Réseau
                        </span>
                        <span className="text-[0.65rem] font-semibold text-orange-400 uppercase tracking-[0.18em]">
                            Formation
                        </span>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <div className="px-5 pt-4 flex-1 overflow-y-auto">
                <nav className="mt-4 space-y-2">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const active = isActive(item.to);

                        return (
                            <Link key={item.to} to={item.to} className="block">
                                <div
                                    className={[
                                        "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all",
                                        active
                                            ? "bg-[#ff922b] text-white shadow-[0_12px_30px_rgba(255,146,43,0.55)]"
                                            : "text-white/70 hover:bg-white/10 hover:text-white",
                                    ].join(" ")}
                                >
                                    <Icon className="h-5 w-5"/>
                                    <span>{item.label}</span>
                                </div>
                            </Link>
                        );
                    })}
                </nav>
            </div>

            {/* Bas de sidebar */}
            <div className="px-5 pb-4">
                {isAuthenticated ? (
                    <div
                        className="rounded-2xl bg-white/5 px-4 py-3 flex items-center gap-3 backdrop-blur-sm border border-white/10">
                        <button
                            type="button"
                            onClick={() => navigate("/profile")}
                            className="relative"
                        >
                            <div
                                className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-tr from-orange-500 to-yellow-400 text-[0.85rem] font-semibold shadow-lg shadow-orange-500/40 overflow-hidden">
                                {user?.profilPhoto ? (
                                    <img
                                        src={resolvePhotoUrl(user.profilPhoto)}
                                        alt={userDisplayName}
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <span>{initials}</span>
                                )}
                            </div>
                            <span
                                className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-400 ring-2 ring-[#050718]"/>
                        </button>

                        <div className="flex-1 leading-tight">
                            <p className="text-sm font-semibold">
                                {userDisplayName}
                            </p>
                            <p className="text-[0.7rem] text-white/70">
                                {user?.roleLabel || "Agent · Loueur"}
                            </p>
                            <p className="text-[0.7rem] text-white/50">
                                Partenaire
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={logout}
                            className="flex h-8 w-8 items-center justify-center rounded-full border border-white/20 text-white/70 hover:bg-white/10 hover:text-white transition-colors"
                            aria-label="Se déconnecter"
                        >
                            <ArrowRightOnRectangleIcon className="h-4 w-4"/>
                        </button>
                    </div>
                ) : (
                    <div
                        className="rounded-2xl bg-white/5 px-4 py-3 flex flex-col gap-2 backdrop-blur-sm border border-white/10">
                        <p className="text-xs text-white/80">
                            Connecte-toi pour accéder à ton tableau de bord,
                            tes véhicules et ton profil.
                        </p>
                        <Link
                            to="/login"
                            className="inline-flex items-center justify-center rounded-xl bg-[#ff922b] text-xs font-semibold py-2 mt-1 shadow-[0_10px_25px_rgba(255,146,43,0.6)] hover:brightness-105 transition-all"
                        >
                            <ArrowRightOnRectangleIcon className="h-4 w-4 mr-1"/>
                            Se connecter
                        </Link>
                    </div>
                )}

                {/* Copyright en bas */}
                <div className="mt-3 text-[0.65rem] text-white/30">
                    © {new Date().getFullYear()} Le Réseau Formation
                </div>
            </div>
        </aside>
    );
};

export default DashboardSidebar;
