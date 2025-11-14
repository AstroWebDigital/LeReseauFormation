import React, { createContext, useContext, useEffect, useState } from "react";
import { AuthAPI } from "../services/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem("auth_token"));
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem("auth_user");
    return raw ? JSON.parse(raw) : null;
  });
  const [loading, setLoading] = useState(false);

  const login = (jwt, usr) => {
    setToken(jwt);
    setUser(usr || null);
    localStorage.setItem("auth_token", jwt);
    if (usr) localStorage.setItem("auth_user", JSON.stringify(usr));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
  };

  // Hydrate l'utilisateur via /me si on a un token mais pas de user (refresh page)
  useEffect(() => {
    const hydrate = async () => {
      if (!token || user) return;
      try {
        setLoading(true);
        const { data } = await AuthAPI.me();
        setUser(data || null);
        if (data) localStorage.setItem("auth_user", JSON.stringify(data));
      } catch {
        logout();
      } finally {
        setLoading(false);
      }
    };
    hydrate();
  }, [token]); // eslint-disable-line

  return (
      <AuthContext.Provider value={{ token, user, login, logout, loading }}>
        {children}
      </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
