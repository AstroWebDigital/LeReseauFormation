import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "@/auth/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import { ShieldOff, MessageSquare, LogOut, Send, ChevronDown, ChevronUp, Lock } from "lucide-react";
import { useTheme } from "@/theme/ThemeProvider";
import api from "@/services/auth/client";

function Avatar({ name, isAdmin, size = "sm" }) {
    const initials = name ? name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2) : "?";
    const s = size === "sm" ? "w-7 h-7 text-xs" : "w-9 h-9 text-sm";
    return (
        <div className={`${s} rounded-xl flex items-center justify-center font-black shrink-0 ${
            isAdmin
                ? "bg-gradient-to-br from-orange-500 to-amber-500 text-white"
                : "bg-gradient-to-br from-slate-500 to-slate-600 text-white"
        }`}>
            {initials}
        </div>
    );
}

export default function BlockedAccountModal() {
    const { user, logout } = useAuth();
    const { isDark } = useTheme();
    const navigate = useNavigate();
    const location = useLocation();

    const [chatOpen, setChatOpen]       = useState(false);
    const [channel, setChannel]         = useState(null);
    const [messages, setMessages]       = useState([]);
    const [input, setInput]             = useState("");
    const [sending, setSending]         = useState(false);
    const [loadingChat, setLoadingChat] = useState(false);
    const messagesEndRef                = useRef(null);

    const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    useEffect(() => { if (chatOpen) scrollToBottom(); }, [messages, chatOpen]);

    const openChat = async () => {
        if (channel) { setChatOpen(true); return; }
        setLoadingChat(true);
        try {
            const { data } = await api.post("/api/support/channel");
            setChannel(data);
            setMessages(data.messages || []);
            setChatOpen(true);
        } catch { /* ignore */ }
        finally { setLoadingChat(false); }
    };

    const pollMessages = async () => {
        if (!channel) return;
        try {
            const { data } = await api.get(`/api/support/channel/${channel.id}/messages`);
            setMessages(data);
        } catch { /* ignore */ }
    };

    useEffect(() => {
        if (!chatOpen || !channel) return;
        const interval = setInterval(pollMessages, 5000);
        return () => clearInterval(interval);
    }, [chatOpen, channel]);

    const handleSend = async () => {
        const text = input.trim();
        if (!text || sending || !channel) return;
        setSending(true);
        setInput("");
        const temp = { id: Date.now(), content: text, senderId: user.id, isAdmin: false, sentAt: new Date().toISOString(), isTemp: true };
        setMessages(prev => [...prev, temp]);
        try {
            const { data } = await api.post(`/api/support/channel/${channel.id}/messages`, { content: text });
            setMessages(prev => prev.map(m => m.id === temp.id ? data : m));
        } catch {
            setMessages(prev => prev.filter(m => m.id !== temp.id));
            setInput(text);
        } finally { setSending(false); }
    };

    const handleKeyDown = (e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } };

    const handleLogout = () => { logout(); navigate("/login"); };

    if (!user || user.status !== "SUSPENDU" || location.pathname === "/messages") return null;

    const adminName = channel ? `${channel.adminFirstname || ""} ${channel.adminLastname || ""}`.trim() || "Admin" : "Admin";

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
            style={{ backdropFilter: "blur(10px)", background: "rgba(0,0,0,0.8)" }}>

            <div className={`w-full max-w-[420px] rounded-3xl shadow-2xl overflow-hidden flex flex-col ${
                isDark
                    ? "bg-gradient-to-b from-[#0d1130] to-[#080d20] border border-white/8"
                    : "bg-white border border-slate-200"
            }`} style={{ maxHeight: "92vh" }}>

                {/* ── Header gradient ── */}
                <div className="relative shrink-0 overflow-hidden" style={{ minHeight: 140 }}>
                    {/* Background */}
                    <div className="absolute inset-0 bg-gradient-to-br from-red-700 via-red-600 to-rose-700" />
                    {/* Noise texture */}
                    <div className="absolute inset-0 opacity-10"
                        style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E\")" }} />
                    {/* Glow circles */}
                    <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-red-400/20 blur-2xl" />
                    <div className="absolute -bottom-6 -left-6 w-28 h-28 rounded-full bg-rose-400/20 blur-xl" />

                    {/* Content */}
                    <div className="relative px-7 pt-7 pb-6 flex items-start gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center shrink-0 backdrop-blur-sm">
                            <Lock size={24} className="text-white" strokeWidth={2.5} />
                        </div>
                        <div className="flex-1 min-w-0 pt-1">
                            <p className="text-white/70 text-[11px] font-bold uppercase tracking-widest mb-0.5">Accès suspendu</p>
                            <h2 className="text-white text-xl font-black leading-tight">Compte bloqué</h2>
                            <p className="text-white/60 text-xs mt-1">
                                {user.firstname ? `${user.firstname}, votre` : "Votre"} accès à la plateforme a été restreint.
                            </p>
                        </div>
                    </div>
                </div>

                {/* ── Body scrollable ── */}
                <div className="flex-1 overflow-y-auto">
                    <div className="px-6 py-5 space-y-4">

                        {/* Raison */}
                        <div className={`rounded-2xl border p-4 ${isDark ? "bg-red-500/6 border-red-500/15" : "bg-red-50 border-red-100"}`}>
                            <div className="flex items-center gap-2 mb-2">
                                <div className={`w-1.5 h-1.5 rounded-full ${isDark ? "bg-red-400" : "bg-red-500"}`} />
                                <p className={`text-[11px] font-bold uppercase tracking-widest ${isDark ? "text-red-400" : "text-red-500"}`}>
                                    Motif du blocage
                                </p>
                            </div>
                            <p className={`text-sm leading-relaxed ${isDark ? "text-slate-200" : "text-slate-700"}`}>
                                {user.blockReason || "Aucune raison précisée par l'administrateur."}
                            </p>
                        </div>

                        {/* Chat section */}
                        <div className={`rounded-2xl border overflow-hidden ${isDark ? "border-white/8 bg-white/3" : "border-slate-200 bg-slate-50/50"}`}>
                            {/* Chat header — toggle */}
                            <button
                                onClick={chatOpen ? () => setChatOpen(false) : openChat}
                                disabled={loadingChat}
                                className={`w-full flex items-center gap-3 px-4 py-3.5 transition-all ${
                                    isDark ? "hover:bg-white/5" : "hover:bg-slate-100/70"
                                }`}
                            >
                                <div className={`p-2 rounded-xl shrink-0 ${isDark ? "bg-orange-500/15" : "bg-orange-50"}`}>
                                    <MessageSquare size={15} className="text-orange-500" />
                                </div>
                                <div className="flex-1 text-left min-w-0">
                                    <p className={`text-sm font-bold truncate ${isDark ? "text-white" : "text-slate-800"}`}>
                                        Contacter l'administrateur
                                    </p>
                                    <p className={`text-[11px] truncate ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                                        {chatOpen ? "Cacher le chat" : "Expliquer votre situation"}
                                    </p>
                                </div>
                                {loadingChat ? (
                                    <span className="w-4 h-4 border-2 border-orange-400 border-t-transparent rounded-full animate-spin shrink-0" />
                                ) : chatOpen ? (
                                    <ChevronUp size={16} className={isDark ? "text-slate-400 shrink-0" : "text-slate-500 shrink-0"} />
                                ) : (
                                    <ChevronDown size={16} className={isDark ? "text-slate-400 shrink-0" : "text-slate-500 shrink-0"} />
                                )}
                            </button>

                            {/* Chat body */}
                            {chatOpen && (
                                <div className={`border-t ${isDark ? "border-white/8" : "border-slate-200"}`}>
                                    {/* Messages */}
                                    <div className="px-4 py-3 h-52 overflow-y-auto flex flex-col gap-2.5 scroll-smooth">
                                        {messages.length === 0 ? (
                                            <div className={`flex flex-col items-center justify-center h-full gap-2 ${isDark ? "text-slate-600" : "text-slate-400"}`}>
                                                <MessageSquare size={24} className="opacity-40" />
                                                <p className="text-xs">Envoyez un message à l'administrateur</p>
                                            </div>
                                        ) : messages.map((msg) => {
                                            const isMe = !msg.isAdmin;
                                            const senderName = msg.isAdmin
                                                ? adminName
                                                : `${user.firstname || ""} ${user.lastname || ""}`.trim() || "Vous";
                                            return (
                                                <div key={msg.id} className={`flex gap-2 ${isMe ? "flex-row-reverse" : "flex-row"}`}>
                                                    <Avatar name={senderName} isAdmin={msg.isAdmin} />
                                                    <div className={`max-w-[75%] flex flex-col gap-0.5 ${isMe ? "items-end" : "items-start"}`}>
                                                        <p className={`text-[10px] font-semibold ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                                                            {isMe ? "Vous" : senderName}
                                                        </p>
                                                        <div className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                                                            isMe
                                                                ? "bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-tr-sm"
                                                                : isDark
                                                                    ? "bg-white/8 text-slate-200 border border-white/8 rounded-tl-sm"
                                                                    : "bg-white text-slate-700 border border-slate-200 shadow-sm rounded-tl-sm"
                                                        }`}>
                                                            {msg.content}
                                                        </div>
                                                        <p className={`text-[10px] ${isDark ? "text-slate-600" : "text-slate-400"}`}>
                                                            {msg.sentAt ? new Date(msg.sentAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }) : ""}
                                                        </p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        <div ref={messagesEndRef} />
                                    </div>

                                    {/* Input */}
                                    <div className={`flex items-end gap-2 p-3 border-t ${isDark ? "border-white/8" : "border-slate-200"}`}>
                                        <textarea
                                            value={input}
                                            onChange={e => setInput(e.target.value)}
                                            onKeyDown={handleKeyDown}
                                            rows={1}
                                            placeholder="Votre message..."
                                            disabled={sending}
                                            className={`flex-1 resize-none rounded-xl px-3 py-2.5 text-sm focus:outline-none transition-all min-h-[40px] max-h-24 overflow-auto ${
                                                isDark
                                                    ? "bg-white/8 border border-white/10 text-white placeholder:text-slate-600 focus:border-orange-500/50"
                                                    : "bg-white border border-slate-200 text-slate-800 placeholder:text-slate-400 focus:border-orange-400"
                                            }`}
                                            style={{ fieldSizing: "content" }}
                                        />
                                        <button
                                            onClick={handleSend}
                                            disabled={sending || !input.trim()}
                                            className="w-9 h-9 shrink-0 flex items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 text-white disabled:opacity-40 transition-all hover:brightness-110"
                                        >
                                            {sending ? <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Send size={14} />}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* ── Footer ── */}
                <div className={`shrink-0 px-6 py-4 border-t ${isDark ? "border-white/8" : "border-slate-100"}`}>
                    <button
                        onClick={handleLogout}
                        className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                            isDark
                                ? "text-slate-500 hover:text-slate-300 hover:bg-white/5"
                                : "text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                        }`}
                    >
                        <LogOut size={14} />
                        Se déconnecter
                    </button>
                </div>
            </div>
        </div>
    );
}
