import React from "react";
import { Outlet, useLocation } from "react-router-dom";

import AppNavbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";
import { useTheme } from "@/theme/ThemeProvider";

const RootLayout = () => {
    const location = useLocation();
    const { isDark } = useTheme();

    const hideFooterPaths = ["/messages"];
    const hideFooter = hideFooterPaths.includes(location.pathname);
    const isMessages = location.pathname === "/messages";

    return (
        <div
            style={{ display: "flex", height: "100vh", overflow: "hidden" }}
            className={`w-full transition-colors duration-200 ${
                isDark
                    ? "bg-[#05071a] text-slate-100"
                    : "bg-slate-100 text-slate-800"
            }`}
        >
            {/* Sidebar */}
            <Sidebar />

            {/* Zone principale */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0, overflow: "hidden" }}>

                {/* Navbar */}
                <AppNavbar />

                {/* Contenu */}
                {isMessages ? (
                    <main style={{ flex: 1, minHeight: 0, overflow: "hidden" }}>
                        <Outlet />
                    </main>
                ) : (
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
