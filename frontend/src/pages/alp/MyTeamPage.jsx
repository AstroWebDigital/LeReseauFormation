import React, { useState, useEffect } from "react";
import api from "@/services/auth/client";
import { useTheme } from "@/theme/ThemeProvider";
import { Users, Lock, Unlock, AlertCircle } from "lucide-react";
import { Spinner } from "@heroui/react";

export default function MyTeamPage() {
    const { isDark } = useTheme();
    const [arcs, setArcs]               = useState([]);
    const [loading, setLoading]         = useState(true);
    const [blockTarget, setBlockTarget] = useState(null);
    const [blockReason, setBlockReason] = useState("");
    const [blockLoading, setBlockLoading] = useState(false);

    const textPrimary = isDark ? "text-white" : "text-slate-800";
    const textMuted   = isDark ? "text-slate-400" : "text-slate-500";

    const fetchArcs = async () => {
        setLoading(true);
        try { const { data } = await api.get("/api/alp/team"); setArcs(data); }
        catch { /* ignore */ }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchArcs(); }, []);

    const handleBlockConfirm = async () => {
        if (!blockTarget || !blockReason.trim()) return;
        setBlockLoading(true);
        try {
            await api.put(`/api/alp/team/${blockTarget.id}/block`, { reason: blockReason });
            setBlockTarget(null);
            setBlockReason("");
            fetchArcs();
        } catch { /* ignore */ }
        finally { setBlockLoading(false); }
    };

    const handleUnblock = async (arcId) => {
        try {
            await api.put(`/api/alp/team/${arcId}/unblock`);
            fetchArcs();
        } catch { /* ignore */ }
    };

    return (
        <div className="max-w-2xl mx-auto py-2">
            <div className="mb-6">
                <h1 className={`text-2xl font-black ${textPrimary}`}>Mon équipe</h1>
                <p className={`text-sm mt-0.5 ${textMuted}`}>Gérez vos apprenants ARC rattachés à votre compte</p>
            </div>

            {/* Modal blocage */}
            {blockTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backdropFilter: "blur(6px)", backgroundColor: "rgba(0,0,0,0.6)" }}>
                    <div className={`w-full max-w-sm rounded-2xl border shadow-xl overflow-hidden ${isDark ? "bg-[#0f1129] border-slate-700" : "bg-white border-slate-200"}`}>
                        <div className={`px-5 py-4 border-b flex items-center gap-3 ${isDark ? "border-slate-700" : "border-slate-100"}`}>
                            <Lock size={16} className="text-red-500" />
                            <p className={`font-bold text-sm ${textPrimary}`}>Bloquer {blockTarget.name}</p>
                        </div>
                        <div className="p-5 space-y-3">
                            <p className={`text-xs ${textMuted}`}>Précisez la raison du blocage (visible par l'utilisateur) :</p>
                            <textarea
                                value={blockReason}
                                onChange={e => setBlockReason(e.target.value)}
                                rows={3}
                                placeholder="Ex : Non-respect des règles..."
                                className={`w-full rounded-xl border px-3 py-2.5 text-sm resize-none focus:outline-none transition-all ${isDark ? "bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-red-500/50" : "bg-slate-50 border-slate-200 text-slate-800 placeholder:text-slate-400 focus:border-red-400"}`}
                            />
                            <div className="flex gap-2 pt-1">
                                <button onClick={() => { setBlockTarget(null); setBlockReason(""); }}
                                    className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-all ${isDark ? "border-slate-700 text-slate-400 hover:bg-white/5" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
                                    Annuler
                                </button>
                                <button onClick={handleBlockConfirm} disabled={blockLoading || !blockReason.trim()}
                                    className="flex-1 py-2.5 rounded-xl text-sm font-bold bg-red-500 text-white hover:bg-red-600 transition-all disabled:opacity-50">
                                    {blockLoading ? "..." : "Bloquer"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className={`rounded-2xl border overflow-hidden ${isDark ? "bg-[#0f1129] border-slate-800" : "bg-white border-slate-200 shadow-sm"}`}>
                <div className={`px-6 py-4 border-b ${isDark ? "border-slate-800" : "border-slate-100"}`}>
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl ${isDark ? "bg-purple-500/10" : "bg-purple-50"}`}>
                            <Users size={18} className="text-purple-500" />
                        </div>
                        <div>
                            <p className={`font-black text-base ${textPrimary}`}>Mes ARC</p>
                            <p className={`text-xs mt-0.5 ${textMuted}`}>{arcs.length} apprenant{arcs.length !== 1 ? "s" : ""} rattaché{arcs.length !== 1 ? "s" : ""}</p>
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center py-12"><Spinner size="sm" color="warning" /></div>
                ) : arcs.length === 0 ? (
                    <div className={`flex flex-col items-center justify-center py-14 gap-2 ${textMuted}`}>
                        <Users size={36} className="opacity-25" />
                        <p className="text-sm">Aucun ARC rattaché à votre compte</p>
                    </div>
                ) : (
                    <div className="divide-y">
                        {arcs.map(arc => (
                            <div key={arc.id} className={`flex items-center gap-3 px-5 py-4 ${isDark ? "divide-slate-800" : "divide-slate-100"}`}>
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-violet-500 flex items-center justify-center text-white font-black text-sm shrink-0">
                                    {((arc.firstname?.[0]||"")+(arc.lastname?.[0]||"")).toUpperCase()||"?"}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className={`font-bold text-sm truncate ${textPrimary}`}>{arc.firstname} {arc.lastname}</p>
                                    <p className={`text-xs truncate ${textMuted}`}>{arc.email}</p>
                                    {arc.status === "SUSPENDU" && arc.blockReason && (
                                        <div className={`flex items-start gap-1.5 mt-1 ${isDark ? "text-red-400" : "text-red-500"}`}>
                                            <AlertCircle size={11} className="shrink-0 mt-0.5" />
                                            <p className="text-[11px] leading-tight">{arc.blockReason}</p>
                                        </div>
                                    )}
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                    {arc.status === "SUSPENDU" ? (
                                        <>
                                            <span className={`text-[11px] font-bold px-2 py-1 rounded-lg ${isDark ? "bg-red-500/10 text-red-400 border border-red-500/20" : "bg-red-50 text-red-600 border border-red-200"}`}>Bloqué</span>
                                            <button onClick={() => handleUnblock(arc.id)} title="Débloquer"
                                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${isDark ? "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20" : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-200"}`}>
                                                <Unlock size={12} /> Débloquer
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <span className={`text-[11px] font-bold px-2 py-1 rounded-lg ${isDark ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-emerald-50 text-emerald-600 border border-emerald-200"}`}>Actif</span>
                                            <button onClick={() => setBlockTarget({ id: arc.id, name: `${arc.firstname} ${arc.lastname}` })}
                                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${isDark ? "bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20" : "bg-red-50 text-red-600 hover:bg-red-100 border border-red-200"}`}>
                                                <Lock size={12} /> Bloquer
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
