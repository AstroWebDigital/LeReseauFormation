import React, { createContext, useContext, useEffect, useState } from "react";
import { apiGetProfile, apiLogin, apiLogout, apiRegister } from "../config/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const profile = await apiGetProfile();
        setUser(profile);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const login = async (email, password) => {
    const data = await apiLogin({ email, password });
    try {
      const profile = await apiGetProfile();
      setUser(profile);
    } catch {
      // fallback: build a minimal user object from login response
      if (data) {
        setUser(data.user || { email });
      }
    }
    return data;
  };

  const register = async (payload) => {
    const data = await apiRegister(payload);
    return data;
  };

  const logout = async () => {
    try {
      await apiLogout();
    } finally {
      setUser(null);
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
