// src/layout/RootLayout.jsx
import React from "react";
import { Outlet, useLocation } from "react-router-dom"; // <-- Importez useLocation
import AppNavbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Sidebar from "@/components/Sidebar";

const RootLayout = () => {
    const location = useLocation();
    const hideLayoutElementsPaths = ["/messages"];
    const isChatPage = hideLayoutElementsPaths.includes(location.pathname);

    return (
        // Le container principal prend toute la hauteur
        <div className="h-screen flex bg-[#05071a] text-slate-100 overflow-hidden">
            <Sidebar />

            <div className="flex-1 flex flex-col">
                <AppNavbar />
                <div className="flex-1 overflow-y-auto">
                    <Outlet />
                    {!isChatPage && <Footer />}
                </div>
            </div>
        </div>
    );
};

export default RootLayout;