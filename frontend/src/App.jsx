import React from "react";
import { Routes, Route } from "react-router-dom";
import { Navbar } from "./components/Navbar";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ProfilePage from "./pages/ProfilePage";
import { ProtectedRoute } from "./auth/ProtectedRoute";

export default function App() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
    </div>
  );
}
