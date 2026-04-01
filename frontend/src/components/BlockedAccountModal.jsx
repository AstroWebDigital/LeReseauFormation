import React from "react";
import { useAuth } from "@/auth/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import { ShieldOff, MessageSquare, LogOut } from "lucide-react";
import { useTheme } from "@/theme/ThemeProvider";

export default function BlockedAccountModal() {
    const { user, logout } = useAuth();
    const { isDark } = useTheme();
    const navigate = useNavigate();
    const location = useLocation();

    // Ne pas bloquer la page messages (seul recours autorisé)
    if (!user || user.status !== "SUSPENDU" || location.pathname === "/messages") {
        return null;
    }

    const handleMessage = () => {
        navigate("/messages");
    };

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
            style={{ backdropFilter: "blur(8px)", backgroundColor: "rgba(0,0,0,0.75)" }}>

            <div className={`w-full max-w-md rounded-3xl border shadow-2xl overflow-hidden ${
                isDark ? "bg-[#0d1130] border-red-500/20" : "bg-white border-red-200"
            }`}>

                {/* Header rouge */}
                <div className="relative h-32 bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center overflow-hidden">
                    <div className="absolute inset-0 opacity-20"
                        style={{ backgroundImage: "radial-gradient(circle at 30% 50%, white 1px, transparent 1px), radial-gradient(circle at 70% 80%, white 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
                    <div className="relative flex flex-col items-center gap-2">
                        <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center border border-white/30">
                            <ShieldOff size={28} className="text-white" />
                        </div>
                    </div>
                </div>

                <div className="px-7 py-6 space-y-5">
                    <div className="text-center">
                        <h2 className={`text-xl font-black mb-1 ${isDark ? "text-white" : "text-slate-800"}`}>
                            Compte suspendu
                        </h2>
                        <p className={`text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                            Votre accès à la plateforme a été suspendu.
                        </p>
                    </div>

                    {/* Raison */}
                    {user.blockReason && (
                        <div className={`rounded-2xl border px-4 py-3.5 ${
                            isDark ? "bg-red-500/8 border-red-500/20" : "bg-red-50 border-red-200"
                        }`}>
                            <p className={`text-[11px] font-bold uppercase tracking-wider mb-1 ${
                                isDark ? "text-red-400" : "text-red-500"
                            }`}>Raison :</p>
                            <p className={`text-sm leading-relaxed ${isDark ? "text-slate-200" : "text-slate-700"}`}>
                                {user.blockReason}
                            </p>
                        </div>
                    )}

                    {/* Info */}
                    <div className={`rounded-2xl border px-4 py-3.5 ${
                        isDark ? "bg-slate-800/50 border-slate-700" : "bg-slate-50 border-slate-200"
                    }`}>
                        <p className={`text-sm leading-relaxed ${isDark ? "text-slate-300" : "text-slate-600"}`}>
                            Pour contester cette décision ou obtenir de l'aide, envoyez un message à l'administrateur via la messagerie.
                        </p>
                    </div>

                    {/* Boutons */}
                    <div className="flex flex-col gap-2.5">
                        <button
                            onClick={handleMessage}
                            className="w-full flex items-center justify-center gap-2.5 py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/25 hover:brightness-110 transition-all"
                        >
                            <MessageSquare size={16} />
                            Envoyer un message à l'administrateur
                        </button>
                        <button
                            onClick={handleLogout}
                            className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                                isDark ? "text-slate-400 hover:text-slate-200 hover:bg-white/5" : "text-slate-500 hover:text-slate-700 hover:bg-slate-100"
                            }`}
                        >
                            <LogOut size={14} />
                            Se déconnecter
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
