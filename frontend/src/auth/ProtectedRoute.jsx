import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { Spinner } from "@heroui/react";

export function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
        <div className="min-h-screen flex items-center justify-center">
          <Spinner label="Chargement..." />
        </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
