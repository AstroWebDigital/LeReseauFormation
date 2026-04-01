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
import RoleRoute from "@/auth/RoleRoute";
import ReservationPage from "./pages/reservation/ReservationPage";
import MessagesPage from "./pages/messages/MessagesPage";
import StatisticsPage from "./pages/Statistics/StatisticsPage";
import AdminVehiclesPage from "@/pages/admin/AdminVehiclesPage";
import MyTeamPage from "@/pages/alp/MyTeamPage";

import { HeroUIProvider } from "@heroui/react";
import { AuthProvider } from "@/auth/AuthContext";
import { NotificationsProvider } from "@/context/NotificationsContext";
import { ThemeProvider, useTheme } from "@/theme/ThemeProvider";
import { GoogleOAuthProvider } from "@react-oauth/google";

import "@/styles/global.css";


function ThemedApp() {
    const { theme } = useTheme();

    return (
        <HeroUIProvider theme={theme}>
            <BrowserRouter>
                <AuthProvider>
                    <NotificationsProvider>
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
                                <Route path="vehicles" element={
                                    <RoleRoute allowedRoles={["ADMIN", "ALP", "PARTENAIRE"]}>
                                        <Vehicle />
                                    </RoleRoute>
                                } />
                                <Route path="documents" element={<DocumentPage />} />
                                <Route path="settings" element={<Settings />} />
                                <Route path="reservations" element={<ReservationPage />} />
                                <Route path="statistiques" element={
                                    <RoleRoute allowedRoles={["ADMIN", "ALP", "PARTENAIRE"]}>
                                        <StatisticsPage />
                                    </RoleRoute>
                                } />
                                <Route path="admin/vehicles" element={
                                    <RoleRoute allowedRoles={["ADMIN"]}>
                                        <AdminVehiclesPage />
                                    </RoleRoute>
                                } />
                                <Route path="equipe" element={
                                    <RoleRoute allowedRoles={["ALP"]}>
                                        <MyTeamPage />
                                    </RoleRoute>
                                } />
                            </Route>
                        </Route>
                    </Routes>
                    </NotificationsProvider>
                </AuthProvider>
            </BrowserRouter>
        </HeroUIProvider>
    );
}

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

const AppWithProviders = () => {
    const content = (
        <ThemeProvider>
            <ThemedApp />
        </ThemeProvider>
    );

    // Si pas de clientId Google, on rend l'app sans GoogleOAuthProvider
    if (!googleClientId) {
        return content;
    }

    return (
        <GoogleOAuthProvider clientId={googleClientId}>
            {content}
        </GoogleOAuthProvider>
    );
};

ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
        <AppWithProviders />
    </React.StrictMode>
);