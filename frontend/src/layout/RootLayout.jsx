import React from "react";
import { Outlet, useLocation } from "react-router-dom";

import AppNavbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";

const RootLayout = () => {
    const location = useLocation();

    const hideFooterPaths = ["/messages"];
    const hideFooter = hideFooterPaths.includes(location.pathname);
    const isMessages = location.pathname === "/messages";

    return (
        <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}
             className="w-full bg-[#05071a] text-slate-100">

            {/* Sidebar */}
            <Sidebar />

            {/* Zone principale */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0, overflow: "hidden" }}>

                {/* Navbar */}
                <AppNavbar />

                {/* Contenu */}
                {isMessages ? (
                    // Page messages : pas de padding, pas de scroll ici, hauteur = tout l'espace restant
                    <main style={{ flex: 1, minHeight: 0, overflow: "hidden" }}>
                        <Outlet />
                    </main>
                ) : (
                    // Autres pages : comportement normal avec scroll
                    <main className="flex-1 overflow-y-auto px-6 py-4">
                        <Outlet />
                    </main>
                )}

                {/* Footer */}
                {!hideFooter && <Footer />}
            </div>
        </div>
    );
};

export default RootLayout;
