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

const AppNavbar = () => {
    const { pathname } = useLocation();
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);

    const links = [
        { label: "Se connecter", to: "/login" },
        { label: "Offre entreprise", to: "/offre-entreprise" },
        { label: "Des questions ?", to: "/faq" },
        { label: "Blog", to: "/blog" },
    ];

    const isActive = (to) => pathname === to;

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

            {/* Liens + CTA en desktop */}
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
            </NavbarContent>

            {/* Toggle menu mobile */}
            <NavbarContent className="md:hidden" justify="end">
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
