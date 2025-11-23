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
    Avatar,
    Dropdown,
    DropdownTrigger,
    DropdownMenu,
    DropdownItem,
} from "@heroui/react";
import { Link as RouterLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

const AppNavbar = () => {
    const { pathname } = useLocation();
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);
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

    const guestLinks = [
        { label: "Se connecter", to: "/login" },
        { label: "Offre entreprise", to: "/offre-entreprise" },
        { label: "Des questions ?", to: "/faq" },
        { label: "Blog", to: "/blog" },
    ];

    const authLinks = [
        { label: "Offre entreprise", to: "/offre-entreprise" },
        { label: "Des questions ?", to: "/faq" },
        { label: "Blog", to: "/blog" },
    ];

    const links = isAuthenticated ? authLinks : guestLinks;

    const isActive = (to) => pathname === to;

    const userDisplayName =
        [user?.firstname, user?.lastname].filter(Boolean).join(" ") ||
        user?.email?.split("@")[0] ||
        "Utilisateur";

    return (
        <Navbar
            maxWidth="xl"
            isBordered
            className="bg-white/90 backdrop-blur-sm"
            onMenuOpenChange={setIsMenuOpen}
        >
            {/* Logo à gauche */}
            <NavbarContent justify="start">
                <NavbarBrand>
                    <RouterLink to="/" className="flex items-center gap-1">
                        <span className="text-2xl font-black tracking-tight leading-none">
                            <span className="text-[#f400b4]">get</span>
                            <span className="text-[#5c1fd4]">around</span>
                        </span>
                    </RouterLink>
                </NavbarBrand>
            </NavbarContent>

            {/* Liens + CTA + utilisateur (desktop) */}
            <NavbarContent
                justify="end"
                className="hidden md:flex items-center gap-6 text-sm font-medium"
            >
                {links.map((link) => (
                    <NavbarItem key={link.to} isActive={isActive(link.to)}>
                        <RouterLink
                            to={link.to}
                            className={
                                "transition-colors " +
                                (isActive(link.to)
                                    ? "text-[#241c4f]"
                                    : "text-[#241c4f]/80 hover:text-[#241c4f]")
                            }
                        >
                            {link.label}
                        </RouterLink>
                    </NavbarItem>
                ))}

                <NavbarItem>
                    <Button
                        as={RouterLink}
                        to="/"
                        radius="full"
                        variant="bordered"
                        className="border-[#f400b4] text-[#f400b4] font-semibold px-6 py-2 text-sm hover:bg-[#f400b4] hover:text-white"
                    >
                        Louer ma voiture
                    </Button>
                </NavbarItem>

                {/* Avatar + menu utilisateur quand connecté */}
                {isAuthenticated && (
                    <NavbarItem>
                        <Dropdown placement="bottom-end">
                            <DropdownTrigger>
                                <button className="flex items-center gap-2 cursor-pointer">
                                    <Avatar
                                        size="sm"
                                        className="border border-default-200"
                                        src={resolvePhotoUrl(user?.profilPhoto)}
                                        name={userDisplayName}
                                    />
                                    <span className="text-xs md:text-sm text-[#241c4f] font-medium hidden sm:inline">
                {userDisplayName}
            </span>
                                </button>
                            </DropdownTrigger>
                            <DropdownMenu
                                aria-label="Menu utilisateur"
                                onAction={(key) => {
                                    if (key === "profile") {
                                        navigate("/profile");      // 👈 navigation ici
                                    }
                                    if (key === "logout") {
                                        logout();
                                    }
                                }}
                            >
                                <DropdownItem key="profile">
                                    Mon profil
                                </DropdownItem>
                                <DropdownItem key="logout" color="danger">
                                    Se déconnecter
                                </DropdownItem>
                            </DropdownMenu>
                        </Dropdown>

                    </NavbarItem>
                )}
            </NavbarContent>

            {/* Toggle menu mobile */}
            <NavbarContent className="md:hidden" justify="end">
                {isAuthenticated && (
                    <Avatar
                        size="sm"
                        className="border border-default-200 mr-2"
                        src={resolvePhotoUrl(user?.profilPhoto)}
                        name={userDisplayName}
                        as={RouterLink}
                        to="/profile"
                    />
                )}
                <NavbarMenuToggle
                    aria-label={isMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
                />
            </NavbarContent>

            {/* Menu mobile */}
            <NavbarMenu className="pt-4">
                {links.map((link) => (
                    <NavbarMenuItem key={link.to}>
                        <RouterLink
                            to={link.to}
                            className={
                                "block w-full py-2 text-base " +
                                (isActive(link.to)
                                    ? "text-[#241c4f] font-semibold"
                                    : "text-[#241c4f]/80 hover:text-[#241c4f]")
                            }
                            onClick={() => setIsMenuOpen(false)}
                        >
                            {link.label}
                        </RouterLink>
                    </NavbarMenuItem>
                ))}

                {/* Lien profil + déconnexion en mobile */}
                {isAuthenticated && (
                    <>
                        <NavbarMenuItem>
                            <RouterLink
                                to="/profile"
                                className="block w-full py-2 text-base text-[#241c4f]/80 hover:text-[#241c4f]"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Mon profil
                            </RouterLink>
                        </NavbarMenuItem>
                        <NavbarMenuItem>
                            <button
                                className="block w-full text-left py-2 text-base text-red-500 hover:text-red-600"
                                onClick={() => {
                                    setIsMenuOpen(false);
                                    logout();
                                }}
                            >
                                Se déconnecter
                            </button>
                        </NavbarMenuItem>
                    </>
                )}

                <NavbarMenuItem>
                    <Button
                        as={RouterLink}
                        to="/"
                        radius="full"
                        variant="bordered"
                        className="mt-2 w-full border-[#f400b4] text-[#f400b4] font-semibold text-base hover:bg-[#f400b4] hover:text-white"
                        onClick={() => setIsMenuOpen(false)}
                    >
                        Louer ma voiture
                    </Button>
                </NavbarMenuItem>
            </NavbarMenu>
        </Navbar>
    );
};

export default AppNavbar;
