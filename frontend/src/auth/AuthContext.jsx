// frontend/src/auth/AuthContext.jsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { AuthAPI, TOKEN_KEY } from "../services/auth";


const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem(TOKEN_KEY));
  const [loading, setLoading] = useState(true);

  // Au chargement : si token présent, on récupère le profil
  useEffect(() => {
    const init = async () => {
      const existingToken = localStorage.getItem(TOKEN_KEY);
      if (!existingToken) {
        setLoading(false);
        return;
      }

      try {
        const profile = await AuthAPI.profile();
        setUser(profile);
        setToken(existingToken);
      } catch (err) {
        // console.error("Erreur de récupération du profil :", err);
        localStorage.removeItem(TOKEN_KEY);
        setUser(null);
        setToken(null);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  const login = async (email, password) => {
    const data = await AuthAPI.login({ email, password });

    if (!data || !data.token) {
      throw new Error(
          data?.message || "Identifiants invalides ou réponse inattendue de l'API."
      );
    }

    localStorage.setItem(TOKEN_KEY, data.token);
    setToken(data.token);

    if (data.user) {
      setUser(data.user);
    } else {
      const profile = await AuthAPI.profile();
      setUser(profile);
    }

    return data;
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
    setToken(null);
  };

  const loginWithToken = (token, user) => {
    localStorage.setItem(TOKEN_KEY, token);
    setToken(token);
    setUser(user);
  };

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    loginWithToken,
    isAuthenticated: !!user && !!token,
    setUser,
    setToken,
  };


  if (loading) {
    const savedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const isDark = savedTheme ? savedTheme === "dark" : prefersDark;
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? "bg-[#050721]" : "bg-[#f8fafc]"}`}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-orange-400 border-t-transparent rounded-full animate-spin" />
          <span className={`text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>Chargement...</span>
        </div>
      </div>
    );
  }

  return (
      <AuthContext.Provider value={value}>
        {children}
      </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
