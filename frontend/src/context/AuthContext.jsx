// src/context/AuthContext.jsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { AuthAPI } from "../services/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem("auth_token"));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(!!token);

  useEffect(() => {
    const fetchMe = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const { data } = await AuthAPI.me();
        // si /me renvoie l'objet utilisateur directement
        setUser(data);
      } catch (e) {
        console.error("Failed to load profile", e);
        setUser(null);
        setToken(null);
        localStorage.removeItem("auth_token");
      } finally {
        setLoading(false);
      }
    };

    fetchMe();
  }, [token]);

  const login = (rawToken, rawUser) => {
    if (!rawToken) {
      console.error("No token provided on login");
      return;
    }
    setToken(rawToken);
    localStorage.setItem("auth_token", rawToken);
    if (rawUser) setUser(rawUser);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("auth_token");
  };

  return (
      <AuthContext.Provider value={{ token, user, loading, login, logout }}>
        {children}
      </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
