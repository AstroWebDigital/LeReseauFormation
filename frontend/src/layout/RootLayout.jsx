import React from "react";
import { Outlet, useLocation } from "react-router-dom";

import AppNavbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";

const RootLayout = () => {
    const location = useLocation();

    // Pages où on cache le footer (ex: chat)
    const hideFooterPaths = ["/messages"];
    const hideFooter = hideFooterPaths.includes(location.pathname);

    return (
        <div className="min-h-screen w-full flex bg-[#05071a] text-slate-100">
            {/* Sidebar */}
            <Sidebar />

            {/* Zone principale */}
            <div className="flex-1 flex flex-col min-h-screen">
                {/* Navbar */}
                <AppNavbar />

                {/* Contenu */}
                <main className="flex-1 overflow-y-auto px-6 py-4">
                    <Outlet />
                </main>

                {/* Footer */}
                {!hideFooter && <Footer />}
            </div>
        </div>
    );
};

export default RootLayout;
