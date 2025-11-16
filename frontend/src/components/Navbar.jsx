import React from "react";
import {
    Navbar,
    NavbarBrand,
    NavbarContent,
    NavbarItem,
    NavbarMenu,
    NavbarMenuItem,
    NavbarMenuToggle,
    Button,
} from "@heroui/react";
import { Link as RouterLink, useLocation } from "react-router-dom";

import LogoReseau from "@/assets/Logo-Reseau-Formation.png";

const AppNavbar = () => {
    const { pathname, hash } = useLocation();
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);

    const menuItems = [
        { label: "Accueil", path: "/" },
        { label: "Formations", path: "/#formations" },
        { label: "Communauté", path: "/#communaute" },
        { label: "Experts", path: "/#experts" },
        { label: "Outils", path: "/#outils" },
        { label: "À propos", path: "/#apropos" },
    ];

    const isActive = (path) => {
        if (path === "/") return pathname === "/";
        const targetHash = path.replace("/#", "#");
        return hash === targetHash;
    };

    return (
        <Navbar
            maxWidth="xl"
            isBordered
            onMenuOpenChange={setIsMenuOpen}
            className="bg-[#f5f7fb]/95"
        >
            {/* Burger menu (mobile) */}
            <NavbarContent className="sm:hidden" justify="start">
                <NavbarMenuToggle
                    aria-label={isMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
                />
            </NavbarContent>

            {/* Logo à gauche */}
            <NavbarContent justify="start" className="w-auto">
                <NavbarBrand className="mr-4">
                    <RouterLink to="/" className="flex items-center">
                        <img
                            src={LogoReseau}
                            alt="Le Réseau Formation"
                            className="h-12 w-auto"
                        />
                    </RouterLink>
                </NavbarBrand>
            </NavbarContent>

            {/* Liens centraux (desktop) */}
            <NavbarContent
                className="hidden sm:flex gap-8"
                justify="center"
            >
                {menuItems.map((item) => (
                    <NavbarItem key={item.label} isActive={isActive(item.path)}>
                        <RouterLink
                            to={item.path}
                            className={
                                isActive(item.path)
                                    ? "text-[#172260]"
                                    : "text-[#4b5563] hover:text-[#172260] transition-colors"
                            }
                        >
                            {item.label}
                        </RouterLink>
                    </NavbarItem>
                ))}
            </NavbarContent>

            {/* Bouton Consultation à droite */}
            <NavbarContent justify="end">
                <NavbarItem>
                    <Button
                        as={RouterLink}
                        to="/#consultation"
                        color="primary"
                        variant="solid"
                        radius="lg" // moins arrondi que full
                        className="bg-[#1f2a68] px-7 py-3 text-sm font-semibold text-white shadow-[0_12px_25px_rgba(7,22,59,0.35)] hover:bg-[#111850]"
                    >
                        Consultation Gratuite
                    </Button>
                </NavbarItem>
            </NavbarContent>

            {/* Menu déroulant (mobile) */}
            <NavbarMenu>
                {menuItems.map((item) => (
                    <NavbarMenuItem key={item.label}>
                        <RouterLink
                            to={item.path}
                            className={
                                isActive(item.path)
                                    ? "w-full text-[#172260] font-semibold"
                                    : "w-full text-[#4b5563]"
                            }
                            onClick={() => setIsMenuOpen(false)}
                        >
                            {item.label}
                        </RouterLink>
                    </NavbarMenuItem>
                ))}
                <NavbarMenuItem>
                    <Button
                        as={RouterLink}
                        to="/#consultation"
                        color="primary"
                        variant="solid"
                        radius="sm"
                        className="mt-2 w-full bg-[#1f2a68] text-white"
                        onClick={() => setIsMenuOpen(false)}
                    >
                        Consultation Gratuite
                    </Button>
                </NavbarMenuItem>
            </NavbarMenu>
        </Navbar>
    );
};

export default AppNavbar;
