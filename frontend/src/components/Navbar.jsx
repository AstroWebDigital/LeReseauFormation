// src/components/Navbar.jsx
import React from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import {
    Avatar,
    Dropdown,
    DropdownTrigger,
    DropdownMenu,
    DropdownItem,
} from "@heroui/react";
import { useAuth } from "../auth/AuthContext";

const AppNavbar = ({
                       title = "Tableau de bord",
                       subtitle = "Agent Loueur Partenaire",
                   }) => {
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

    return (
        <header className="w-full bg-gradient-to-b from-[#060d33] to-[#050718] px-6 lg:px-10 py-3 shadow-sm">
            <div className="flex items-center gap-6">
                {/* Titre + sous-titre */}
                <div className="flex flex-col min-w-[170px]">
                    <h1 className="text-lg lg:text-xl font-semibold text-[#111b46]">
                        {title}
                    </h1>
                    <p className="text-[0.7rem] lg:text-xs text-[#7a849f]">
                        {subtitle}
                    </p>
                </div>

                {/* Barre de recherche centrée */}
                <div className="flex-1 flex justify-center">
                    <div className="w-full max-w-xl">
                        <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                {/* Icône loupe */}
                  <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                  >
                  <circle cx="11" cy="11" r="6" />
                  <line x1="16" y1="16" x2="21" y2="21" />
                </svg>
              </span>
                            <input
                                type="text"
                                placeholder="Rechercher..."
                                className="w-full rounded-full bg-white py-2.5 pl-10 pr-4 text-sm text-[#3a4560] placeholder:text-slate-400/80 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#ff922b]/70"
                            />
                        </div>
                    </div>
                </div>

                {/* Zone droite : notif + user */}
                <div className="flex items-center gap-6">
                    {/* Bouton notifications */}
                    <button
                        type="button"
                        className="relative flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-sm hover:bg-slate-50 transition"
                    >
                        {/* Icône cloche */}
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 text-[#111b46]"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.7"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
                            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                        </svg>
                        <span className="absolute -top-0.5 -right-0.5 h-3 w-3 rounded-full bg-orange-400 ring-2 ring-[#d7d9de]" />
                    </button>

                    {/* Séparateur vertical */}
                    <div className="hidden sm:block h-9 w-px bg-slate-300/70" />

                    {/* Utilisateur connecté ou bouton login */}
                    {isAuthenticated ? (
                        <Dropdown placement="bottom-end">
                            <DropdownTrigger>
                                <button className="flex items-center gap-3 cursor-pointer">
                                    <div className="hidden sm:block text-right leading-tight">
                                        <p className="text-sm font-medium text-[#111b46]">
                                            {userDisplayName}
                                        </p>
                                        <p className="text-[0.7rem] text-[#7a849f]">
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
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-4 w-4 text-[#7a849f]"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="1.7"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        >
                                            <polyline points="6 9 12 15 18 9" />
                                        </svg>
                                    </div>
                                </button>
                            </DropdownTrigger>
                            <DropdownMenu
                                aria-label="Menu utilisateur"
                                onAction={(key) => {
                                    if (key === "profile") {
                                        navigate("/profile");
                                    }
                                    if (key === "logout") {
                                        logout();
                                    }
                                }}
                            >
                                <DropdownItem key="profile">Mon profil</DropdownItem>
                                <DropdownItem key="logout" color="danger">
                                    Se déconnecter
                                </DropdownItem>
                            </DropdownMenu>
                        </Dropdown>
                    ) : (
                        <RouterLink
                            to="/login"
                            className="text-sm font-medium text-[#111b46] hover:underline"
                        >
                            Se connecter
                        </RouterLink>
                    )}
                </div>
            </div>
        </header>
    );
};

export default AppNavbar;
