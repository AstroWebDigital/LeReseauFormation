import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
    HomeIcon, TruckIcon, CalendarDaysIcon, ChatBubbleLeftRightIcon,
    DocumentTextIcon, ChartBarIcon, Cog6ToothIcon,
    ArrowRightOnRectangleIcon, ShieldCheckIcon, UserGroupIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "../auth/AuthContext";
import { useTheme } from "@/theme/ThemeProvider";
import { useNotifications } from "@/context/NotificationsContext";

const DashboardSidebar = () => {
    const { pathname } = useLocation();
    const navigate = useNavigate();
    const { user, token, logout } = useAuth();
    const { isDark } = useTheme();

    const isAuthenticated = !!token && !!user;
    const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

    // Gestion des rôles (peut être un tableau ou une string)
    const getUserRoles = () => {
        if (!user?.roles) return [];
        if (Array.isArray(user.roles)) return user.roles.map(r => r.toUpperCase());
        return String(user.roles).toUpperCase().split(",").map(r => r.trim());
    };
    const userRoles = getUserRoles();
    const isAdmin = userRoles.includes("ADMIN");
    const isAlp = userRoles.includes("ALP");
    const canManageVehicles = userRoles.some(role => ["ADMIN", "ALP", "PARTENAIRE"].includes(role));

    const { unreadMessages, pendingAdminCount, unreadSupport } = useNotifications();

    const resolvePhotoUrl = (url) => {
        if (!url) return null;
        if (url.startsWith("http://") || url.startsWith("https://")) return url;
        if (url.startsWith("/")) return `${API_BASE_URL}${url}`;
        return `${API_BASE_URL}/${url}`;
    };

    const userDisplayName =
        [user?.firstname, user?.lastname].filter(Boolean).join(" ") ||
        user?.email?.split("@")[0] || "Utilisateur";

    const initials = userDisplayName.split(" ").map((p) => p[0]).join("").toUpperCase().slice(0, 2);

    const authNavItems = [
        { label: "Tableau de bord", icon: HomeIcon, to: "/" },
        ...(canManageVehicles ? [{ label: "Mes véhicules", icon: TruckIcon, to: "/vehicles" }] : []),
        { label: "Réservations", icon: CalendarDaysIcon, to: "/reservations" },
        { label: "Messages", icon: ChatBubbleLeftRightIcon, to: "/messages", badge: unreadMessages },
        { label: "Documents", icon: DocumentTextIcon, to: "/documents" },
        ...(canManageVehicles ? [{ label: "Statistiques", icon: ChartBarIcon, to: "/statistiques" }] : []),
        { label: "Paramètres", icon: Cog6ToothIcon, to: "/settings" },
        ...(isAlp ? [{ label: "Mon équipe", icon: UserGroupIcon, to: "/equipe" }] : []),
        ...(isAdmin ? [{ label: "Administration", icon: ShieldCheckIcon, to: "/admin/vehicles", badge: (pendingAdminCount || 0) + (unreadSupport || 0) }] : []),
    ];

    const guestNavItems = [
        { label: "Accueil", icon: HomeIcon, to: "/" },
        { label: "Se connecter", icon: ArrowRightOnRectangleIcon, to: "/login" },
    ];

    const navItems = isAuthenticated ? authNavItems : guestNavItems;

    const isActive = (to) => {
        if (to === "/") return pathname === "/";
        return pathname === to || pathname.startsWith(to);
    };

    // ── Thème ──
    const sidebarBg = isDark
        ? "bg-gradient-to-b from-[#060d33] to-[#050718] border-white/5"
        : "bg-white border-slate-200";

    const headerBorder = isDark ? "border-white/10" : "border-slate-200";
    const logoText = isDark ? "text-white" : "text-slate-800";
    const logoSubText = isDark ? "text-orange-400" : "text-orange-500";

    const navItemBase = isDark
        ? "text-white/70 hover:bg-white/10 hover:text-white"
        : "text-slate-500 hover:bg-orange-50 hover:text-slate-800";

    const bottomCardBg = isDark
        ? "bg-white/5 border-white/10 backdrop-blur-sm"
        : "bg-slate-50 border-slate-200";

    const userNameText = isDark ? "text-white" : "text-slate-800";
    const userRoleText = isDark ? "text-white/70" : "text-slate-500";

    const logoutBtn = isDark
        ? "border-white/20 text-white/70 hover:bg-white/10 hover:text-white"
        : "border-slate-300 text-slate-500 hover:bg-slate-100 hover:text-slate-800";

    const footerText = isDark ? "text-white/30" : "text-slate-400";
    const statusRing = isDark ? "ring-[#050718]" : "ring-white";
    const guestText = isDark ? "text-white/80" : "text-slate-600";

    return (
        <aside className={`sticky top-0 h-screen w-64 shrink-0 flex flex-col justify-between border-r transition-colors duration-200 ${sidebarBg}`}>

            {/* Header logo */}
            <div className={`px-5 pt-6 pb-4 border-b ${headerBorder}`}>
                <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white shadow-lg shadow-black/20 overflow-hidden">
                        <img src="/Logo-Reseau-Formation.png" alt="Le Réseau Formation" className="h-9 w-9 object-contain" />
                    </div>
                    <div className="flex flex-col leading-tight">
                        <span className={`text-sm font-semibold tracking-wide ${logoText}`}>Le Réseau</span>
                        <span className={`text-[0.65rem] font-semibold uppercase tracking-[0.18em] ${logoSubText}`}>Formation</span>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <div className="px-5 pt-4 flex-1 overflow-y-auto">
                <nav className="mt-4 space-y-1">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const active = isActive(item.to);
                        return (
                            <Link key={item.to} to={item.to} className="block">
                                <div className={[
                                    "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all",
                                    active
                                        ? "bg-[#ff922b] text-white shadow-[0_12px_30px_rgba(255,146,43,0.35)]"
                                        : navItemBase,
                                ].join(" ")}>
                                    <Icon className="h-5 w-5 flex-shrink-0" />
                                    <span className="flex-1">{item.label}</span>
                                    {/* Pastille en attente */}
                                    {item.badge > 0 && (
                                        <span className={`text-[0.65rem] font-bold rounded-full px-1.5 py-0.5 min-w-[1.25rem] text-center leading-none ${
                                            active
                                                ? "bg-white/30 text-white"
                                                : "bg-orange-500 text-white"
                                        }`}>
                                            {item.badge > 99 ? "99+" : item.badge}
                                        </span>
                                    )}
                                </div>
                            </Link>
                        );
                    })}
                </nav>
            </div>

            {/* Bas sidebar */}
            <div className="px-5 pb-4">
                {isAuthenticated ? (
                    <div className={`rounded-2xl px-4 py-3 flex items-center gap-3 border ${bottomCardBg}`}>
                        <button type="button" onClick={() => navigate("/")} className="relative flex-shrink-0">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-tr from-orange-500 to-yellow-400 text-[0.85rem] font-semibold shadow-lg shadow-orange-500/30 overflow-hidden">
                                {user?.profilPhoto ? (
                                    <img src={resolvePhotoUrl(user.profilPhoto)} alt={userDisplayName} className="h-full w-full object-cover" />
                                ) : (
                                    <span className="text-white">{initials}</span>
                                )}
                            </div>
                            <span className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-400 ring-2 ${statusRing}`} />
                        </button>

                        <div className="flex-1 leading-tight min-w-0">
                            <p className={`text-sm font-semibold truncate ${userNameText}`}>{userDisplayName}</p>
                            <p className={`text-[0.7rem] ${userRoleText}`}>{user?.roleLabel || "Agent · Loueur"}</p>
                        </div>

                        <button
                            type="button" onClick={logout}
                            className={`flex h-8 w-8 items-center justify-center rounded-full border transition-colors flex-shrink-0 ${logoutBtn}`}
                            aria-label="Se déconnecter"
                        >
                            <ArrowRightOnRectangleIcon className="h-4 w-4" />
                        </button>
                    </div>
                ) : (
                    <div className={`rounded-2xl px-4 py-3 flex flex-col gap-2 border ${bottomCardBg}`}>
                        <p className={`text-xs ${guestText}`}>Connecte-toi pour accéder à ton tableau de bord.</p>
                        <Link to="/login" className="inline-flex items-center justify-center rounded-xl bg-[#ff922b] text-white text-xs font-semibold py-2 mt-1 shadow-[0_10px_25px_rgba(255,146,43,0.4)] hover:brightness-105 transition-all">
                            <ArrowRightOnRectangleIcon className="h-4 w-4 mr-1" />
                            Se connecter
                        </Link>
                    </div>
                )}

                <div className={`mt-3 text-[0.65rem] text-center ${footerText}`}>
                    © {new Date().getFullYear()} Le Réseau Formation — AstroWeb Digital
                </div>
            </div>
        </aside>
    );
};

export default DashboardSidebar;
