// src/layout/RootLayout.jsx
import React from "react";
import { Outlet } from "react-router-dom";
import AppNavbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Sidebar from "@/components/Sidebar";

const RootLayout = () => {
    return (
        <div className="h-screen flex bg-[#05071a] text-slate-100 overflow-hidden">
            {/* Sidebar fixe à gauche */}
            <Sidebar />

            {/* Colonne droite : navbar + contenu scrollable + footer */}
            <div className="flex-1 flex flex-col">
                <AppNavbar />

                {/* Zone scrollable */}
                <div className="flex-1 overflow-y-auto">
                    <Outlet />
                    <Footer />
                </div>
            </div>
        </div>
    );
};

export default RootLayout;
