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
import Messages from "@/pages/messages/Messages";
import Vehicle from "@/pages/vehicle/Vehicle"; // Nouveau composant
import DocumentPage from "./pages/document/DocumentPage";
import ProtectedRoute from "@/auth/ProtectedRoute";

import { HeroUIProvider } from "@heroui/react";
import { AuthProvider } from "@/auth/AuthContext";

import "@/styles/global.css";


ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
        <HeroUIProvider>
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
                                <Route path="profile" element={<Profile />} />
                                <Route path="messages" element={<Messages />} />
                                <Route path="vehicles" element={<Vehicle />} />
                                <Route path="documents" element={<DocumentPage />} />
                            </Route>
                        </Route>
                    </Routes>
                </AuthProvider>
            </BrowserRouter>
        </HeroUIProvider>
    </React.StrictMode>
);