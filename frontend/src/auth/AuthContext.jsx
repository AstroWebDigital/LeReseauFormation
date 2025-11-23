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

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    isAuthenticated: !!user && !!token,
    setUser,   // 👈 AJOUTER ÇA
    setToken,  // 👈 ET ÇA
  };


  return (
      <AuthContext.Provider value={value}>
        {!loading && children}
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
