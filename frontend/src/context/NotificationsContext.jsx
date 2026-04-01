import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import api from "@/services/auth/client";
import { useAuth } from "@/auth/AuthContext";

const NotificationsContext = createContext(null);

export function NotificationsProvider({ children }) {
    const { token, user } = useAuth();
    const isAdmin = user?.roles?.includes("ADMIN");

    const [unreadMessages, setUnreadMessages] = useState(0);
    const [pendingAdminCount, setPendingAdminCount] = useState(0);
    const [pendingDocuments, setPendingDocuments] = useState(0);
    const [pendingVehicles, setPendingVehicles] = useState(0);
    const [unreadSupport, setUnreadSupport] = useState(0);

    const fetchUnreadMessages = useCallback(async () => {
        if (!token) return;
        try {
            const { data } = await api.get("/api/channels/unread-count");
            setUnreadMessages(data.unread ?? 0);
        } catch {
            // silencieux
        }
    }, [token]);

    const fetchPendingAdmin = useCallback(async () => {
        if (!token || !isAdmin) return;
        try {
            const { data } = await api.get("/api/admin/pending-count");
            setPendingAdminCount(data.total ?? 0);
            setPendingDocuments(data.documents ?? 0);
            setPendingVehicles(data.vehicles ?? 0);
        } catch {
            // silencieux
        }
    }, [token, isAdmin]);

    const fetchUnreadSupport = useCallback(async () => {
        if (!token || !isAdmin) return;
        try {
            const { data } = await api.get("/api/admin/support/unread-count");
            setUnreadSupport(typeof data === "number" ? data : 0);
        } catch {
            // silencieux
        }
    }, [token, isAdmin]);

    // Décrémente immédiatement le compteur admin (optimistic update)
    const decrementPending = useCallback((n = 1) => {
        setPendingAdminCount(prev => Math.max(0, prev - n));
    }, []);

    // Remet à zéro les messages non lus (quand on ouvre la page Messages)
    const resetUnreadMessages = useCallback(() => {
        setUnreadMessages(0);
    }, []);

    useEffect(() => {
        if (!token) {
            setUnreadMessages(0);
            setPendingAdminCount(0);
            setPendingDocuments(0);
            setPendingVehicles(0);
            return;
        }

        fetchUnreadMessages();
        fetchPendingAdmin();
        fetchUnreadSupport();

        const interval = setInterval(() => {
            fetchUnreadMessages();
            fetchPendingAdmin();
            fetchUnreadSupport();
        }, 15000);

        return () => clearInterval(interval);
    }, [token, fetchUnreadMessages, fetchPendingAdmin, fetchUnreadSupport]);

    return (
        <NotificationsContext.Provider value={{
            unreadMessages,
            pendingAdminCount,
            pendingDocuments,
            pendingVehicles,
            unreadSupport,
            fetchUnreadMessages,
            fetchPendingAdmin,
            fetchUnreadSupport,
            decrementPending,
            resetUnreadMessages,
        }}>
            {children}
        </NotificationsContext.Provider>
    );
}

export function useNotifications() {
    const ctx = useContext(NotificationsContext);
    if (!ctx) throw new Error("useNotifications must be used inside NotificationsProvider");
    return ctx;
}
