// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HeroUIProvider } from "@heroui/react";

import { ThemeProvider } from "@/theme/ThemeProvider";

import { AuthProvider } from "./context/AuthContext";
import RootLayout from "./routes/RootLayout";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Logout from "./pages/Logout";

import "./styles/globals.css";

ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
        <ThemeProvider>
            <HeroUIProvider locale="fr-FR">
                <BrowserRouter>
                    <AuthProvider>
                        <RootLayout>
                            <Routes>
                                <Route path="/" element={<Home />} />
                                <Route path="/login" element={<Login />} />
                                <Route path="/register" element={<Register />} />
                                <Route path="/dashboard" element={<Dashboard />} />
                                <Route path="/logout" element={<Logout />} />
                            </Routes>
                        </RootLayout>
                    </AuthProvider>
                </BrowserRouter>
            </HeroUIProvider>
        </ThemeProvider>
    </React.StrictMode>
);
