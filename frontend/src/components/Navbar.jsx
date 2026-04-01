import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import {
    Avatar,
    Dropdown,
    DropdownTrigger,
    DropdownMenu,
    DropdownItem,
    Spinner,
} from "@heroui/react";
import { Car, FileText, Search, X, Bell, MessageSquare, CheckCircle, XCircle } from "lucide-react";
import { useAuth } from "../auth/AuthContext";
import { useTheme } from "@/theme/ThemeProvider";
import api from "@/services/auth/client";
import VehicleDetailModal from "./VehicleDetailModal";
import { useNotifications } from "@/context/NotificationsContext";

// ── Composant notification item ────────────────────────────────────────────────
const accentBg = {
    orange:  { light: "bg-orange-50",  dark: "bg-orange-500/10"  },
    blue:    { light: "bg-blue-50",    dark: "bg-blue-500/10"    },
    emerald: { light: "bg-emerald-50", dark: "bg-emerald-500/10" },
    red:     { light: "bg-red-50",     dark: "bg-red-500/10"     },
};
const badgeStyle = {
    orange:  "bg-orange-500/15 text-orange-500",
    blue:    "bg-blue-500/15 text-blue-500",
    emerald: "bg-emerald-500/15 text-emerald-600",
    red:     "bg-red-500/15 text-red-500",
};
const leftBar = {
    orange:  "bg-orange-400",
    blue:    "bg-blue-400",
    emerald: "bg-emerald-400",
    red:     "bg-red-400",
};

function NotifItem({ accentColor, icon, title, desc, badge, statusBadge, badgeColor, onClick, onDismiss, isLight }) {
    const bg = accentBg[accentColor] || accentBg.orange;
    return (
        <div className={`group mx-2 mb-1 rounded-xl flex items-stretch overflow-hidden transition-all duration-150
            ${isLight ? "hover:bg-slate-50" : "hover:bg-white/4"}`}>
            {/* Barre colorée gauche */}
            <div className={`w-0.5 shrink-0 rounded-l-xl ${leftBar[accentColor] || leftBar.orange}`} />
            {/* Zone cliquable */}
            <button onClick={onClick} className="flex-1 flex items-center gap-3 px-3 py-2.5 text-left min-w-0">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${isLight ? bg.light : bg.dark}`}>
                    {icon}
                </div>
                <div className="flex-1 min-w-0">
                    <p className={`text-[13px] font-semibold leading-tight truncate ${isLight ? "text-slate-800" : "text-white"}`}>{title}</p>
                    <p className={`text-[11px] mt-0.5 truncate ${isLight ? "text-slate-400" : "text-slate-500"}`}>{desc}</p>
                </div>
                {(badge != null || statusBadge) && (
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${badgeStyle[badgeColor] || badgeStyle.orange}`}>
                        {statusBadge ?? badge}
                    </span>
                )}
            </button>
            {/* Bouton supprimer */}
            <button
                onClick={(e) => { e.stopPropagation(); onDismiss(); }}
                className={`px-2 opacity-0 group-hover:opacity-100 transition-opacity ${isLight ? "text-slate-300 hover:text-slate-500" : "text-slate-600 hover:text-slate-400"}`}
            >
                <X size={13} />
            </button>
        </div>
    );
}

// ── Navbar principale ──────────────────────────────────────────────────────────
const AppNavbar = ({
                       title = "Tableau de bord",
                       subtitle = "Agent Loueur Partenaire",
                   }) => {
    const navigate = useNavigate();
    const { user, token, logout } = useAuth();
    const { isDark } = useTheme();
    const isLight = !isDark;
    const isAuthenticated = !!token && !!user;
    const { unreadMessages, pendingDocuments, unreadSupport } = useNotifications();

    const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

    // États pour la recherche
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState({ vehicles: [], documents: [] });
    const [isSearching, setIsSearching] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const searchRef = useRef(null);
    const debounceRef = useRef(null);

    // État pour le modal véhicule
    const [selectedVehicle, setSelectedVehicle] = useState(null);
    const [isVehicleModalOpen, setIsVehicleModalOpen] = useState(false);

    // État pour le panneau notifications
    const [showNotif, setShowNotif] = useState(false);
    const [docNotifs, setDocNotifs] = useState([]);
    const [dismissed, setDismissed] = useState(() => {
        try { return new Set(JSON.parse(localStorage.getItem("lr_dismissed_notifs") || "[]")); }
        catch { return new Set(); }
    });
    const notifRef = useRef(null);

    // Déterminer les rôles de l'utilisateur
    const getUserRoles = () => {
        if (!user?.roles) return [];
        if (Array.isArray(user.roles)) return user.roles.map(r => r.toUpperCase());
        return String(user.roles).toUpperCase().split(",").map(r => r.trim());
    };
    const userRoles = getUserRoles();
    const isAdmin = userRoles.includes("ADMIN");
    const canManageVehicles = userRoles.some(role => ["ADMIN", "ALP", "PARTENAIRE"].includes(role));

    const dismiss = (key, andNavigate) => {
        setDismissed(prev => {
            const next = new Set(prev);
            next.add(key);
            localStorage.setItem("lr_dismissed_notifs", JSON.stringify([...next]));
            return next;
        });
        if (andNavigate) { setShowNotif(false); navigate(andNavigate); }
    };

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

    // Fermer les résultats quand on clique en dehors
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setShowResults(false);
            }
            if (notifRef.current && !notifRef.current.contains(event.target)) {
                setShowNotif(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Charger les documents avec statut valide/rejeté pour les notifications
    useEffect(() => {
        if (!token) return;
        api.get("/api/documents").then(({ data }) => {
            const docs = Array.isArray(data) ? data : [];
            const relevant = docs
                .filter(d => d.status === "valide" || d.status === "rejete")
                .slice(0, 5);
            setDocNotifs(relevant);
        }).catch(() => {});
    }, [token]);

    // Recherche avec debounce
    useEffect(() => {
        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }

        if (searchQuery.trim().length < 2) {
            setSearchResults({ vehicles: [], documents: [] });
            setShowResults(false);
            return;
        }

        debounceRef.current = setTimeout(async () => {
            setIsSearching(true);
            setShowResults(true);

            try {
                const results = { vehicles: [], documents: [] };

                // Rechercher les véhicules
                try {
                    // Utiliser my-fleet pour les loueurs, available pour les autres
                    const endpoint = canManageVehicles ? "/api/vehicles/my-fleet" : "/api/vehicles/available";
                    const vehiclesRes = await api.get(endpoint);
                    const vehicles = vehiclesRes.data.content || vehiclesRes.data || [];
                    results.vehicles = vehicles.filter(v =>
                        `${v.brand} ${v.model} ${v.plateNumber || ""}`.toLowerCase().includes(searchQuery.toLowerCase())
                    ).slice(0, 5);
                } catch (e) {
                    console.error("Search vehicles error:", e);
                }

                // Rechercher les documents
                try {
                    const documentsRes = await api.get("/api/documents");
                    const documents = Array.isArray(documentsRes.data) ? documentsRes.data : [];
                    results.documents = documents.filter(d =>
                        `${d.type || ""} ${d.scope || ""}`.toLowerCase().includes(searchQuery.toLowerCase())
                    ).slice(0, 5);
                } catch (e) {
                    console.error("Search documents error:", e);
                }

                setSearchResults(results);
            } catch (err) {
                console.error("Search error:", err);
            } finally {
                setIsSearching(false);
            }
        }, 300);

        return () => {
            if (debounceRef.current) {
                clearTimeout(debounceRef.current);
            }
        };
    }, [searchQuery, canManageVehicles]);

    const handleVehicleClick = (vehicle) => {
        setSelectedVehicle(vehicle);
        setIsVehicleModalOpen(true);
        setShowResults(false);
        setSearchQuery("");
    };

    const handleDocumentClick = (document) => {
        setShowResults(false);
        setSearchQuery("");
        navigate("/documents");
    };

    const clearSearch = () => {
        setSearchQuery("");
        setShowResults(false);
        setSearchResults({ vehicles: [], documents: [] });
    };

    const totalResults = searchResults.vehicles.length + searchResults.documents.length;

    return (
        <>
            <header className={`w-full px-6 lg:px-10 py-3 shadow-sm transition-colors duration-200
                ${isLight
                ? "bg-white border-b border-slate-200"
                : "bg-gradient-to-b from-[#060d33] to-[#050718]"
            }`}>
                <div className="flex items-center gap-6">
                    {/* Titre + sous-titre */}
                    <div className="flex flex-col min-w-[170px]">
                        <h1 className={`text-lg lg:text-xl font-semibold ${isLight ? "text-slate-800" : "text-white"}`}>
                            {title}
                        </h1>
                        <p className={`text-[0.7rem] lg:text-xs ${isLight ? "text-slate-500" : "text-white"}`}>
                            {subtitle}
                        </p>
                    </div>

                    {/* Barre de recherche centrée */}
                    <div className="flex-1 flex justify-center">
                        <div className="w-full max-w-xl relative" ref={searchRef}>
                            <div className="relative">
                                <span className={`absolute left-4 top-1/2 -translate-y-1/2 ${isLight ? "text-slate-400" : "text-slate-400"}`}>
                                    {isSearching ? (
                                        <Spinner size="sm" color="warning" />
                                    ) : (
                                        <Search size={16} />
                                    )}
                                </span>
                                <input
                                    type="text"
                                    placeholder="Rechercher véhicules, documents..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onFocus={() => searchQuery.length >= 2 && setShowResults(true)}
                                    className={`w-full rounded-full py-2.5 pl-10 pr-10 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-[#ff922b]/70 transition-colors
                                        ${isLight
                                        ? "bg-slate-100 text-slate-700 placeholder:text-slate-400/80 border border-slate-200"
                                        : "bg-white text-[#3a4560] placeholder:text-slate-400/80"
                                    }`}
                                />
                                {searchQuery && (
                                    <button
                                        onClick={clearSearch}
                                        className={`absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-slate-200 transition-colors ${isLight ? "text-slate-400" : "text-slate-500"}`}
                                    >
                                        <X size={14} />
                                    </button>
                                )}
                            </div>

                            {/* Dropdown des résultats */}
                            {showResults && (
                                <div className={`absolute top-full left-0 right-0 mt-2 rounded-2xl shadow-xl border overflow-hidden z-50
                                    ${isLight ? "bg-white border-slate-200" : "bg-[#0d1533] border-white/10"}`}>

                                    {isSearching ? (
                                        <div className="p-6 flex items-center justify-center gap-3">
                                            <Spinner size="sm" color="warning" />
                                            <span className={`text-sm ${isLight ? "text-slate-500" : "text-slate-400"}`}>
                                                Recherche en cours...
                                            </span>
                                        </div>
                                    ) : totalResults === 0 ? (
                                        <div className="p-6 text-center">
                                            <Search size={32} className={`mx-auto mb-2 ${isLight ? "text-slate-300" : "text-slate-600"}`} />
                                            <p className={`text-sm font-medium ${isLight ? "text-slate-600" : "text-slate-300"}`}>
                                                Aucun résultat trouvé
                                            </p>
                                            <p className={`text-xs mt-1 ${isLight ? "text-slate-400" : "text-slate-500"}`}>
                                                Essayez avec d'autres termes
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="max-h-[400px] overflow-y-auto">
                                            {/* Véhicules */}
                                            {searchResults.vehicles.length > 0 && (
                                                <div>
                                                    <div className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider ${isLight ? "bg-slate-50 text-slate-500" : "bg-white/5 text-slate-400"}`}>
                                                        Véhicules ({searchResults.vehicles.length})
                                                    </div>
                                                    {searchResults.vehicles.map((v, i) => (
                                                        <button
                                                            key={`vehicle-${v.id || i}`}
                                                            onClick={() => handleVehicleClick(v)}
                                                            className={`w-full px-4 py-3 flex items-center gap-3 transition-colors text-left
                                                                ${isLight ? "hover:bg-slate-50" : "hover:bg-white/5"}`}
                                                        >
                                                            <div className={`p-2 rounded-lg ${isLight ? "bg-orange-50" : "bg-orange-500/10"}`}>
                                                                <Car size={18} className="text-orange-500" />
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className={`font-medium truncate ${isLight ? "text-slate-800" : "text-white"}`}>
                                                                    {v.brand} {v.model}
                                                                </p>
                                                                <p className={`text-xs truncate ${isLight ? "text-slate-400" : "text-slate-500"}`}>
                                                                    {v.plateNumber || v.licensePlate} · {v.type}
                                                                </p>
                                                            </div>
                                                            <span className={`text-xs px-2 py-1 rounded-lg ${isLight ? "bg-orange-50 text-orange-600" : "bg-orange-500/10 text-orange-400"}`}>
                                                                Voir
                                                            </span>
                                                        </button>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Documents */}
                                            {searchResults.documents.length > 0 && (
                                                <div>
                                                    <div className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider ${isLight ? "bg-slate-50 text-slate-500" : "bg-white/5 text-slate-400"}`}>
                                                        Documents ({searchResults.documents.length})
                                                    </div>
                                                    {searchResults.documents.map((d, i) => (
                                                        <button
                                                            key={`document-${d.id || i}`}
                                                            onClick={() => handleDocumentClick(d)}
                                                            className={`w-full px-4 py-3 flex items-center gap-3 transition-colors text-left
                                                                ${isLight ? "hover:bg-slate-50" : "hover:bg-white/5"}`}
                                                        >
                                                            <div className={`p-2 rounded-lg ${isLight ? "bg-violet-50" : "bg-violet-500/10"}`}>
                                                                <FileText size={18} className="text-violet-500" />
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className={`font-medium truncate capitalize ${isLight ? "text-slate-800" : "text-white"}`}>
                                                                    {d.type?.replace(/_/g, " ")}
                                                                </p>
                                                                <p className={`text-xs truncate capitalize ${isLight ? "text-slate-400" : "text-slate-500"}`}>
                                                                    {d.scope} · {d.status}
                                                                </p>
                                                            </div>
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Zone droite : notif + user */}
                    <div className="flex items-center gap-6">
                        {/* Bouton notifications */}
                        <div className="relative" ref={notifRef}>
                            {/* Calculs visibilité */}
                            {(() => {
                                const visibleDocs = docNotifs.filter(d => !dismissed.has(`doc_${d.id}`));
                                const showMsg = unreadMessages > 0 && !dismissed.has("messages");
                                const showAdmin = isAdmin && pendingDocuments > 0 && !dismissed.has("admin_docs");
                                const showSupport = isAdmin && unreadSupport > 0 && !dismissed.has("support");
                                const badge = (showMsg ? unreadMessages : 0) + visibleDocs.length + (showAdmin ? 1 : 0) + (showSupport ? unreadSupport : 0);
                                const hasAny = showMsg || visibleDocs.length > 0 || showAdmin || showSupport;

                                return (
                                    <>
                                        {/* Cloche */}
                                        <button
                                            type="button"
                                            onClick={() => setShowNotif(v => !v)}
                                            className={`relative flex h-9 w-9 items-center justify-center rounded-full transition-all duration-150
                                                ${isLight
                                                    ? "bg-slate-100 hover:bg-orange-50 hover:text-orange-500"
                                                    : "bg-white/10 hover:bg-orange-500/20"
                                                }
                                                ${showNotif ? (isLight ? "ring-2 ring-orange-400/40" : "ring-2 ring-orange-500/30") : ""}`}
                                        >
                                            <Bell size={17} className={
                                                showNotif
                                                    ? "text-orange-500"
                                                    : isLight ? "text-slate-500" : "text-white/70"
                                            } />
                                            {badge > 0 && (
                                                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-orange-500 text-white text-[10px] font-bold flex items-center justify-center shadow-md shadow-orange-500/40">
                                                    {Math.min(badge, 99)}
                                                </span>
                                            )}
                                        </button>

                                        {/* Panneau */}
                                        {showNotif && (
                                            <div className={`absolute right-0 top-full mt-2 w-[340px] rounded-2xl shadow-2xl border z-50 overflow-hidden
                                                ${isLight ? "bg-white border-slate-200/80" : "bg-[#0b1229] border-white/8"}`}
                                                style={{ boxShadow: isLight ? "0 20px 60px -10px rgba(0,0,0,.15)" : "0 20px 60px -10px rgba(0,0,0,.6)" }}
                                            >
                                                {/* ── Header ── */}
                                                <div className={`px-5 pt-4 pb-3 flex items-center justify-between`}>
                                                    <div className="flex items-center gap-2.5">
                                                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${isLight ? "bg-orange-50" : "bg-orange-500/10"}`}>
                                                            <Bell size={14} className="text-orange-500" />
                                                        </div>
                                                        <span className={`font-bold text-sm ${isLight ? "text-slate-800" : "text-white"}`}>Notifications</span>
                                                        {badge > 0 && (
                                                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-orange-500 text-white leading-none">
                                                                {badge}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <button
                                                        onClick={() => setShowNotif(false)}
                                                        className={`p-1.5 rounded-lg transition-colors ${isLight ? "hover:bg-slate-100 text-slate-400" : "hover:bg-white/10 text-slate-500"}`}
                                                    >
                                                        <X size={14} />
                                                    </button>
                                                </div>

                                                <div className={`h-px mx-4 mb-1 ${isLight ? "bg-slate-100" : "bg-white/5"}`} />

                                                {/* ── Liste ── */}
                                                <div className="max-h-[340px] overflow-y-auto py-1.5">

                                                    {/* Admin : docs à réviser */}
                                                    {showAdmin && (
                                                        <NotifItem
                                                            accentColor="orange"
                                                            icon={<FileText size={15} className="text-orange-500" />}
                                                            title="Documents à réviser"
                                                            desc={<><span className="font-semibold text-orange-500">{pendingDocuments}</span> en attente de validation</>}
                                                            badge={pendingDocuments}
                                                            badgeColor="orange"
                                                            onDismiss={() => dismiss("admin_docs")}
                                                            onClick={() => dismiss("admin_docs", "/admin/vehicles")}
                                                            isLight={isLight}
                                                        />
                                                    )}

                                                    {/* Support admin */}
                                                    {showSupport && (
                                                        <NotifItem
                                                            accentColor="red"
                                                            icon={<MessageSquare size={15} className="text-red-500" />}
                                                            title={`${unreadSupport} message${unreadSupport > 1 ? "s" : ""} de support`}
                                                            desc="Compte(s) suspendu(s) vous ont écrit"
                                                            badge={unreadSupport}
                                                            badgeColor="red"
                                                            onDismiss={() => dismiss("support")}
                                                            onClick={() => dismiss("support", "/admin/vehicles")}
                                                            isLight={isLight}
                                                        />
                                                    )}

                                                    {/* Messages non lus */}
                                                    {showMsg && (
                                                        <NotifItem
                                                            accentColor="blue"
                                                            icon={<MessageSquare size={15} className="text-blue-500" />}
                                                            title={`${unreadMessages} message${unreadMessages > 1 ? "s" : ""} non lu${unreadMessages > 1 ? "s" : ""}`}
                                                            desc="Cliquer pour accéder à la messagerie"
                                                            onDismiss={() => dismiss("messages")}
                                                            onClick={() => dismiss("messages", "/messages")}
                                                            isLight={isLight}
                                                        />
                                                    )}

                                                    {/* Documents acceptés / rejetés */}
                                                    {visibleDocs.map((doc, i) => {
                                                        const ok = doc.status === "valide";
                                                        const key = `doc_${doc.id || i}`;
                                                        return (
                                                            <NotifItem
                                                                key={key}
                                                                accentColor={ok ? "emerald" : "red"}
                                                                icon={ok
                                                                    ? <CheckCircle size={15} className="text-emerald-500" />
                                                                    : <XCircle size={15} className="text-red-500" />
                                                                }
                                                                title={`Document ${ok ? "accepté" : "rejeté"}`}
                                                                desc={<span className="capitalize">{doc.type?.replace(/_/g, " ")} — {doc.scope}</span>}
                                                                statusBadge={ok ? "Accepté" : "Rejeté"}
                                                                badgeColor={ok ? "emerald" : "red"}
                                                                onDismiss={() => dismiss(key)}
                                                                onClick={() => dismiss(key, "/documents")}
                                                                isLight={isLight}
                                                            />
                                                        );
                                                    })}

                                                    {/* Vide */}
                                                    {!hasAny && (
                                                        <div className="flex flex-col items-center justify-center gap-1.5 py-9 px-4">
                                                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-1 ${isLight ? "bg-slate-100" : "bg-white/5"}`}>
                                                                <Bell size={22} className={isLight ? "text-slate-300" : "text-slate-600"} />
                                                            </div>
                                                            <p className={`text-sm font-semibold ${isLight ? "text-slate-700" : "text-slate-200"}`}>Tout est à jour</p>
                                                            <p className={`text-xs ${isLight ? "text-slate-400" : "text-slate-500"}`}>Aucune notification</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </>
                                );
                            })()}
                        </div>

                        {/* Séparateur vertical */}
                        <div className={`hidden sm:block h-9 w-px ${isLight ? "bg-slate-200" : "bg-slate-300/70"}`} />

                        {/* Utilisateur */}
                        {isAuthenticated ? (
                            <Dropdown placement="bottom-end">
                                <DropdownTrigger>
                                    <button className="flex items-center gap-3 cursor-pointer">
                                        <div className="hidden sm:block text-right leading-tight">
                                            <p className={`text-sm font-medium ${isLight ? "text-slate-800" : "text-white"}`}>
                                                {userDisplayName}
                                            </p>
                                            <p className={`text-[0.7rem] ${isLight ? "text-slate-500" : "text-white"}`}>
                                                {user?.roleLabel || "Agent Loueur Partenaire"}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Avatar
                                                size="sm"
                                                radius="lg"
                                                className="bg-[#111b46] text-white font-semibold shadow-md"
                                                src={resolvePhotoUrl(user?.profilPhoto)}
                                                name={userDisplayName}
                                            >
                                                {initials}
                                            </Avatar>
                                            <svg xmlns="http://www.w3.org/2000/svg"
                                                 className={`h-4 w-4 ${isLight ? "text-slate-400" : "text-[#7a849f]"}`}
                                                 viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                                 strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                                                <polyline points="6 9 12 15 18 9" />
                                            </svg>
                                        </div>
                                    </button>
                                </DropdownTrigger>
                                <DropdownMenu
                                    aria-label="Menu utilisateur"
                                    onAction={(key) => {
                                        if (key === "profile") navigate("/settings");
                                        if (key === "logout") logout();
                                    }}
                                >
                                    <DropdownItem key="profile">Mon profil</DropdownItem>
                                    <DropdownItem key="logout" color="danger">Se déconnecter</DropdownItem>
                                </DropdownMenu>
                            </Dropdown>
                        ) : (
                            <RouterLink to="/login" className={`text-sm font-medium hover:underline ${isLight ? "text-slate-700" : "text-white"}`}>
                                Se connecter
                            </RouterLink>
                        )}
                    </div>
                </div>
            </header>

            {/* Modal détail véhicule */}
            <VehicleDetailModal
                isOpen={isVehicleModalOpen}
                onClose={() => setIsVehicleModalOpen(false)}
                vehicle={selectedVehicle}
                isDark={isDark}
            />
        </>
    );
};

export default AppNavbar;
