import React, { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";

import AppNavbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";
import ForcePasswordChangeModal from "@/components/ForcePasswordChangeModal";
import BlockedAccountModal from "@/components/BlockedAccountModal";
import { useTheme } from "@/theme/ThemeProvider";

const RootLayout = () => {
    const location = useLocation();
    const { isDark } = useTheme();
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

    const hideFooterPaths = ["/messages"];
    const hideFooter = hideFooterPaths.includes(location.pathname);
    const isMessages = location.pathname === "/messages";

    return (
        <div
            style={{ display: "flex", height: "100vh", overflow: "hidden" }}
            className={`w-full transition-colors duration-200 ${
                isDark
                    ? "bg-[#05071a] text-slate-100"
                    : "bg-[#f8fafc] text-slate-800"
            }`}
        >
            {/* Overlay mobile (fond sombre quand sidebar ouverte) */}
            {mobileSidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
                    onClick={() => setMobileSidebarOpen(false)}
                />
            )}

            {/* Sidebar — drawer sur mobile, sticky sur desktop */}
            <div className={`
                fixed md:relative inset-y-0 left-0 z-50 md:z-auto
                transition-transform duration-300 ease-in-out
                ${mobileSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
            `}>
                <Sidebar onClose={() => setMobileSidebarOpen(false)} />
            </div>

            {/* Zone principale */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0, overflow: "hidden" }}>

                {/* Navbar */}
                <AppNavbar onToggleSidebar={() => setMobileSidebarOpen(prev => !prev)} />

                {/* Contenu */}
                {isMessages ? (
                    <main style={{ flex: 1, minHeight: 0, overflow: "hidden" }}>
                        <Outlet />
                    </main>
                ) : (
                    <main className="flex-1 overflow-y-auto px-3 py-3 md:px-6 md:py-4">
                        <Outlet />
                    </main>
                )}

                {/* Footer */}
                {!hideFooter && <Footer />}
            </div>

            {/* Popup première connexion ALP */}
            <ForcePasswordChangeModal />
            {/* Overlay compte suspendu */}
            <BlockedAccountModal />
        </div>
    );
};

export default RootLayout;
