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
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "@/theme/ThemeProvider";

const AppNavbar = () => {
    const { user, logout } = useAuth();
    const { theme, toggle } = useTheme();
    const isDark = theme === "dark";
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate("/");
    };

    const isActive = (path) => location.pathname === path;

    return (
        <Navbar maxWidth="xl" isBordered>
            {/* Marque / Logo */}
            <NavbarBrand>
                <RouterLink to="/" className="flex items-center gap-2">
          <span className="font-bold text-lg tracking-tight">
            PROJET TEST ARTHUR
          </span>
                </RouterLink>
            </NavbarBrand>

            {/* Liens centraux */}
            <NavbarContent justify="center" className="hidden sm:flex gap-4">
                <NavbarItem isActive={isActive("/")}>
                    <RouterLink to="/" className="text-sm">
                        Accueil
                    </RouterLink>
                </NavbarItem>

                {user && (
                    <NavbarItem isActive={location.pathname.startsWith("/dashboard")}>
                        <RouterLink to="/dashboard" className="text-sm">
                            Dashboard
                        </RouterLink>
                    </NavbarItem>
                )}
            </NavbarContent>

            {/* Actions à droite */}
            <NavbarContent justify="end" className="items-center gap-3">
                {/* Toggle thème */}
                <NavbarItem>
                    <div className="flex items-center gap-2">
                        <Sun className="w-3 h-3 text-yellow-500" />
                        <Switch
                            size="sm"
                            isSelected={isDark}
                            onValueChange={toggle}
                            aria-label="Basculer le thème"
                            thumbIcon={({ isSelected }) =>
                                isSelected ? (
                                    <Moon className="w-3 h-3" />
                                ) : (
                                    <Sun className="w-3 h-3" />
                                )
                            }
                        />
                        <Moon className="w-3 h-3 text-indigo-400" />
                    </div>
                </NavbarItem>

                {/* Utilisateur non connecté */}
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
                                as={RouterLink}
                                to="/register"
                                color="primary"
                                size="sm"
                            >
                                Inscription
                            </Button>
                        </NavbarItem>
                    </>
                )}

                {/* Utilisateur connecté */}
                {user && (
                    <NavbarItem>
                        <Dropdown placement="bottom-end">
                            <DropdownTrigger>
                                <Avatar
                                    as="button"
                                    size="sm"
                                    className="cursor-pointer"
                                    name={user.email}
                                    // si plus tard tu as une photo: src={...}
                                />
                            </DropdownTrigger>
                            <DropdownMenu aria-label="Menu utilisateur" variant="flat">
                                <DropdownItem key="profile" className="h-14 gap-2">
                                    <p className="text-xs text-default-500">Connecté en tant que :</p>
                                    <p className="text-sm font-semibold truncate">{user.email}</p>
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
