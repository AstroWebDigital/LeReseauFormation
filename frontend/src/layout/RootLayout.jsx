// src/layout/RootLayout.jsx
import React from "react";
import { Outlet } from "react-router-dom";
import AppNavbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const RootLayout = () => {
    return (
        <div className="min-h-screen flex flex-col bg-[#f5f7fb] text-slate-900">
            <AppNavbar />

            <main className="flex-1">
                <Outlet />
            </main>

            <Footer />
        </div>
    );
};

export default RootLayout;
