// src/layout/RootLayout.jsx
import React from "react";
import { Outlet } from "react-router-dom";
import AppNavbar from "@/components/Navbar";          // HeroUI navbar
import Footer from "@/components/Footer";
import { ThemeProvider } from "@/theme/ThemeProvider";

const RootLayout = () => {
    return (
        <ThemeProvider>
            <div className="min-h-screen flex flex-col bg-background text-foreground">
                <AppNavbar />

                <main className="flex-1">
                    <Outlet />
                </main>

                <Footer />
            </div>
        </ThemeProvider>
    );
};

export default RootLayout;
