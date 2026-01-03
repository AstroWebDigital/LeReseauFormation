// src/main.jsx
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

// Assurez-vous d'avoir bien importé ProtectedRoute
// Vous devrez créer ce fichier si ce n'est pas déjà fait.
import ProtectedRoute from "@/auth/ProtectedRoute";

import { HeroUIProvider } from "@heroui/react";
import { AuthProvider } from "@/auth/AuthContext";

import "@/styles/global.css";
import Messages from "./pages/messages/Messages";

ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
        <HeroUIProvider>
            <BrowserRouter>
                <AuthProvider>
                    <Routes>
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/forgot-password" element={<ForgotPassword />} />
                        <Route path="/reset-password" element={<ResetPassword />} />
                       <Route element={
                         <ProtectedRoute>
                           <RootLayout />
                         </ProtectedRoute>
                       }>
                         <Route index element={<Dashboard />} />
                         <Route path="profile" element={<Profile />} />
                         <Route path="messages" element={<Messages />} />
                       </Route>


                        {/* Optionnel : Route 404 */}
                        {/* <Route path="*" element={<NotFoundPage />} /> */}

                    </Routes>
                </AuthProvider>
            </BrowserRouter>
        </HeroUIProvider>
    </React.StrictMode>
);