import React from "react";
import {
    Navbar,
    NavbarBrand,
    NavbarContent,
    NavbarItem,
    Button,
    Switch,
    Dropdown,
    DropdownTrigger,
    DropdownMenu,
    DropdownItem,
    Avatar,
} from "@heroui/react";
import { Link as RouterLink, useLocation, useNavigate } from "react-router-dom";
import { Moon, Sun, LogOut } from "lucide-react";
import LogoReseau from "@/assets/Logo-Reseau-Formation.png";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/theme/ThemeProvider";

const scrollToId = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
};

const AppNavbar = () => {
    const { user, logout } = useAuth();
    const { isDark, toggle } = useTheme();
    const navigate = useNavigate();
    const location = useLocation();

    const isHome = location.pathname === "/";

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    const navLinks = [
        { label: "Accueil", id: "top" },
        { label: "Formations", id: "formations" },
        { label: "Communauté", id: "communaute" },
        { label: "Experts", id: "experts" }, // à remplir plus tard si tu veux
        { label: "Outils", id: "outils" },   // idem
        { label: "À propos", id: "apropos" },
    ];

    return (
        <Navbar
            maxWidth="xl"
            isBordered
            className="bg-background/80 backdrop-blur border-b border-default-100"
        >
            {/* Logo + nom */}
            <NavbarBrand className="gap-2 cursor-pointer">
                {isHome ? (
                    <button
                        type="button"
                        onClick={() => scrollToId("top")}
                        className="flex items-center gap-2"
                    >
                        <img
                            src={LogoReseau}
                            alt="Le Réseau Formation"
                            className="h-8 w-auto"
                        />
                        <span className="hidden sm:inline text-sm font-semibold tracking-[0.25em] uppercase">
            </span>
                    </button>
                ) : (
                    <RouterLink to="/" className="flex items-center gap-2">
                        <img
                            src={LogoReseau}
                            alt="Le Réseau Formation"
                            className="h-8 w-auto"
                        />
                        <span className="hidden sm:inline text-sm font-semibold tracking-[0.25em] uppercase">
              Le Réseau
            </span>
                    </RouterLink>
                )}
            </NavbarBrand>

            {/* Liens centraux */}
            <NavbarContent justify="center" className="hidden md:flex gap-4">
                {navLinks.map((link) => (
                    <NavbarItem key={link.id}>
                        {isHome ? (
                            <button
                                type="button"
                                onClick={() => scrollToId(link.id)}
                                className="text-sm text-default-600 hover:text-foreground transition-colors"
                            >
                                {link.label}
                            </button>
                        ) : (
                            <RouterLink
                                to="/"
                                className="text-sm text-default-600 hover:text-foreground transition-colors"
                            >
                                {link.label}
                            </RouterLink>
                        )}
                    </NavbarItem>
                ))}
            </NavbarContent>

            {/* Droite : Switch + CTA + User */}
            <NavbarContent justify="end" className="items-center gap-3">
                {/* Toggle thème */}
                <NavbarItem>
                    <div className="flex items-center gap-2 text-xs text-default-500">
                        <Sun className="w-3 h-3" />
                        <Switch
                            size="sm"
                            isSelected={isDark}
                            onValueChange={toggle}
                            aria-label="Basculer le thème"
                            classNames={{
                                wrapper: "group-data-[selected=true]:bg-default-800",
                            }}
                            thumbIcon={({ isSelected }) =>
                                isSelected ? (
                                    <Moon className="w-3 h-3" />
                                ) : (
                                    <Sun className="w-3 h-3" />
                                )
                            }
                        />
                        <Moon className="w-3 h-3" />
                    </div>
                </NavbarItem>

                {!user && (
                    <>
                        <NavbarItem className="hidden sm:flex">
                            <Button
                                as={RouterLink}
                                to="/login"
                                variant="light"
                                size="sm"
                            >
                                Connexion
                            </Button>
                        </NavbarItem>
                        <NavbarItem>
                            <Button
                                color="warning"
                                size="sm"
                                className="font-medium"
                                onPress={() =>
                                    isHome
                                        ? scrollToId("cta-consultation")
                                        : navigate("/register")
                                }
                            >
                                Consultation Gratuite
                            </Button>
                        </NavbarItem>
                    </>
                )}

                {user && (
                    <NavbarItem>
                        <Dropdown placement="bottom-end">
                            <DropdownTrigger>
                                <Avatar
                                    as="button"
                                    size="sm"
                                    className="cursor-pointer"
                                    name={user.email}
                                />
                            </DropdownTrigger>
                            <DropdownMenu aria-label="Menu utilisateur" variant="flat">
                                <DropdownItem key="profile" className="h-14 gap-2">
                                    <p className="text-xs text-default-500">Connecté en tant que :</p>
                                    <p className="text-sm font-semibold truncate">
                                        {user.email}
                                    </p>
                                </DropdownItem>
                                <DropdownItem
                                    key="dashboard"
                                    onPress={() => navigate("/dashboard")}
                                >
                                    Dashboard
                                </DropdownItem>
                                <DropdownItem
                                    key="logout"
                                    color="danger"
                                    startContent={<LogOut className="w-4 h-4" />}
                                    onPress={handleLogout}
                                >
                                    Déconnexion
                                </DropdownItem>
                            </DropdownMenu>
                        </Dropdown>
                    </NavbarItem>
                )}
            </NavbarContent>
        </Navbar>
    );
};

export default AppNavbar;
