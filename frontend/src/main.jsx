import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import RootLayout from "@/layout/RootLayout";
import Dashboard from "@/pages/Dashboard";
import Login from "@/pages/auth/Login";
import Register from "@/pages/auth/Register";
import Profile from "@/pages/Profile";
import ForgotPassword from "@/pages/auth/ForgotPassword";
import ResetPassword from "@/pages/auth/ResetPassword";
import Settings from "@/pages/settings/settings";
import Vehicle from "@/pages/vehicle/Vehicle";
import DocumentPage from "./pages/document/DocumentPage";
import ProtectedRoute from "@/auth/ProtectedRoute";
import ReservationPage from "./pages/reservation/ReservationPage";
import MessagesPage from "./pages/messages/MessagesPage";

import { HeroUIProvider } from "@heroui/react";
import { AuthProvider } from "@/auth/AuthContext";
import { ThemeProvider, useTheme } from "@/theme/ThemeProvider";

import "@/styles/global.css";

function ThemedApp() {
    const { theme } = useTheme();

    return (
        <HeroUIProvider theme={theme}>
            <BrowserRouter>
                <AuthProvider>
                    <Routes>
                        {/* Public Routes */}
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/forgot-password" element={<ForgotPassword />} />
                        <Route path="/reset-password" element={<ResetPassword />} />

                        {/* Protected Routes */}
                        <Route element={<ProtectedRoute />}>
                            <Route element={<RootLayout />}>
                                <Route index element={<Dashboard />} />
                                <Route path="messages" element={<MessagesPage />} />
                                <Route path="vehicles" element={<Vehicle />} />
                                <Route path="documents" element={<DocumentPage />} />
                                <Route path="settings" element={<Settings />} />
                                <Route path="reservations" element={<ReservationPage />} />
                            </Route>
                        </Route>
                    </Routes>
                </AuthProvider>
            </BrowserRouter>
        </HeroUIProvider>
    );
}

ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
        <ThemeProvider>
            <ThemedApp />
        </ThemeProvider>
    </React.StrictMode>
);