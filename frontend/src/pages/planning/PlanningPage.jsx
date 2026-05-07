import React, { useState, useEffect, useMemo, useRef } from "react";
import { Spinner } from "@heroui/react";
import { ChevronLeft, ChevronRight, CalendarCheck, X, Car, User, MapPin, Euro, Clock, CheckCircle2, XCircle, AlertCircle, LayoutGrid, List } from "lucide-react";
import api from "@/services/auth/client";
import { useTheme } from "@/theme/ThemeProvider";

const COL_W = 36;

const STATUS_META = {
    en_attente: { label: "En attente",  color: "bg-amber-400",   text: "text-amber-400",   dot: "bg-amber-400",   border: "border-amber-400/30"  },
    accepte:    { label: "Confirmée",   color: "bg-emerald-500", text: "text-emerald-500", dot: "bg-emerald-500", border: "border-emerald-500/30" },
    EN_ATTENTE: { label: "En attente",  color: "bg-amber-400",   text: "text-amber-400",   dot: "bg-amber-400",   border: "border-amber-400/30"  },
    CONFIRME:   { label: "Confirmée",   color: "bg-emerald-500", text: "text-emerald-500", dot: "bg-emerald-500", border: "border-emerald-500/30" },
    refuse:     { label: "Refusée",     color: "bg-red-400",     text: "text-red-400",     dot: "bg-red-400",     border: "border-red-400/30"    },
    ANNULE:     { label: "Annulée",     color: "bg-red-400",     text: "text-red-400",     dot: "bg-red-400",     border: "border-red-400/30"    },
    EN_COURS:   { label: "En cours",    color: "bg-blue-500",    text: "text-blue-500",    dot: "bg-blue-500",    border: "border-blue-500/30"   },
    TERMINE:    { label: "Terminée",    color: "bg-slate-400",   text: "text-slate-400",   dot: "bg-slate-400",   border: "border-slate-400/30"  },
};
const getMeta = (s) => STATUS_META[s] || { label: s, color: "bg-slate-400", text: "text-slate-400", dot: "bg-slate-400", border: "border-slate-400/30" };

const fmtDate = (d) => d ? new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" }) : "—";
const fmtShort = (d) => d ? new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" }) : "—";

const VIEWS = [
    { label: "2 sem", days: 14 },
    { label: "4 sem", days: 28 },
    { label: "6 sem", days: 42 },
];

const FILTERS = ["Tous", "En attente", "Confirmée", "En cours", "Refusée", "Terminée"];
const FILTER_STATUS = {
    "Tous":       null,
    "En attente": ["en_attente", "EN_ATTENTE"],
    "Confirmée":  ["accepte", "CONFIRME"],
    "En cours":   ["EN_COURS"],
    "Refusée":    ["refuse", "ANNULE"],
    "Terminée":   ["TERMINE"],
};

export default function PlanningPage() {
    const { isDark } = useTheme();
    const isLight = !isDark;

    const [vehicles, setVehicles]     = useState([]);
    const [reservations, setRes]      = useState([]);
    const [loading, setLoading]       = useState(true);
    const [viewDays, setViewDays]     = useState(42);
    const [filter, setFilter]         = useState("Tous");
    const [selected, setSelected]     = useState(null); // réservation cliquée
    const panelRef = useRef(null);

    const [windowStart, setWindowStart] = useState(() => {
        const d = new Date(); d.setDate(d.getDate() - 7); d.setHours(0,0,0,0); return d;
    });

    useEffect(() => {
        Promise.all([
            api.get("/api/vehicles/my-fleet?size=100"),
            api.get("/api/reservations/owner"),
        ]).then(([vRes, rRes]) => {
            setVehicles(vRes.data?.content || vRes.data || []);
            setRes(rRes.data || []);
        }).catch(() => {}).finally(() => setLoading(false));
    }, []);

    // Fermer le panel quand on clique dehors
    useEffect(() => {
        if (!selected) return;
        const handler = (e) => { if (panelRef.current && !panelRef.current.contains(e.target)) setSelected(null); };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [selected]);

    const days = useMemo(() => Array.from({ length: viewDays }, (_, i) => {
        const d = new Date(windowStart); d.setDate(windowStart.getDate() + i); return d;
    }), [windowStart, viewDays]);

    const today = useMemo(() => { const d = new Date(); d.setHours(0,0,0,0); return d; }, []);
    const todayMs      = today.getTime();
    const windowStartMs = windowStart.getTime();
    const windowEndMs   = useMemo(() => {
        const e = new Date(windowStart); e.setDate(windowStart.getDate() + viewDays); return e.getTime();
    }, [windowStart, viewDays]);

    const shiftWindow = (weeks) => setWindowStart(prev => {
        const d = new Date(prev); d.setDate(d.getDate() + weeks * 7); return d;
    });
    const resetToday = () => setWindowStart(() => {
        const d = new Date(); d.setDate(d.getDate() - 7); d.setHours(0,0,0,0); return d;
    });

    // Today column index (for vertical line)
    const todayColIdx = useMemo(() => {
        const diff = (todayMs - windowStartMs) / 86400000;
        return diff >= 0 && diff < viewDays ? diff : null;
    }, [todayMs, windowStartMs, viewDays]);

    const monthGroups = useMemo(() => {
        const groups = [];
        days.forEach(d => {
            const key = `${d.getFullYear()}-${d.getMonth()}`;
            const last = groups[groups.length - 1];
            if (last?.key === key) last.count++;
            else groups.push({ key, count: 1, label: d.toLocaleDateString("fr-FR", { month: "long", year: "numeric" }) });
        });
        return groups;
    }, [days]);

    const filteredStatuses = FILTER_STATUS[filter];

    const resByVehicle = useMemo(() => {
        const map = {};
        reservations
            .filter(r => !filteredStatuses || filteredStatuses.includes(r.status))
            .forEach(r => {
                if (!map[r.vehicleId]) map[r.vehicleId] = [];
                map[r.vehicleId].push(r);
            });
        return map;
    }, [reservations, filteredStatuses]);

    // Stats
    const stats = useMemo(() => ({
        total:    vehicles.length,
        pending:  reservations.filter(r => ["en_attente","EN_ATTENTE"].includes(r.status)).length,
        active:   reservations.filter(r => r.status === "EN_COURS").length,
        confirmed:reservations.filter(r => ["accepte","CONFIRME"].includes(r.status)).length,
    }), [vehicles, reservations]);

    // ── Thème ──
    const bg       = isLight ? "bg-slate-50"        : "bg-[#050721]";
    const cardBg   = isLight ? "bg-white border-slate-200 shadow-sm" : "bg-[#0d1533] border-white/5";
    const textPri  = isLight ? "text-slate-800"     : "text-white";
    const textSub  = isLight ? "text-slate-400"     : "text-slate-500";
    const divider  = isLight ? "border-slate-100"   : "border-white/[0.05]";
    const btnBase  = isLight ? "hover:bg-slate-100 text-slate-500" : "hover:bg-white/10 text-slate-400";
    const wkndBg   = isLight ? "bg-slate-50/70"     : "bg-white/[0.012]";
    const todayBg  = isLight ? "bg-orange-50/70"    : "bg-orange-500/[0.06]";
    const cellBord = isLight ? "border-slate-100"   : "border-white/[0.04]";
    const rowHov   = isLight ? "hover:bg-slate-50"  : "hover:bg-white/[0.02]";

    if (loading) return (
        <div className="h-full flex items-center justify-center min-h-[400px]">
            <Spinner size="lg" color="warning" label="Chargement du planning…" />
        </div>
    );

    return (
        <div className={`p-5 lg:p-8 space-y-5 min-h-screen ${bg}`}>

            {/* ── En-tête ── */}
            <div className="flex items-start justify-between flex-wrap gap-4">
                <div>
                    <h1 className={`text-2xl font-black ${textPri}`}>Planning flotte</h1>
                    <p className={`text-sm mt-0.5 ${textSub}`}>
                        Vue Gantt · {vehicles.length} véhicule{vehicles.length !== 1 ? "s" : ""} · {reservations.length} réservation{reservations.length !== 1 ? "s" : ""}
                    </p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                    {/* Selector vue */}
                    <div className={`flex items-center rounded-xl p-1 gap-1 ${isLight ? "bg-slate-100" : "bg-white/5"}`}>
                        {VIEWS.map(v => (
                            <button key={v.days} onClick={() => setViewDays(v.days)}
                                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                                    viewDays === v.days
                                        ? "bg-orange-500 text-white shadow-sm shadow-orange-500/30"
                                        : `${isLight ? "text-slate-500 hover:bg-white" : "text-slate-400 hover:bg-white/10"}`
                                }`}>
                                {v.label}
                            </button>
                        ))}
                    </div>
                    {/* Navigation */}
                    <div className="flex items-center gap-1">
                        <button onClick={() => shiftWindow(-1)} className={`p-2 rounded-xl transition-colors ${btnBase}`}><ChevronLeft size={17} /></button>
                        <button onClick={resetToday}
                            className="px-4 py-2 text-xs font-bold rounded-xl bg-orange-500 hover:bg-orange-600 text-white transition-colors shadow-sm shadow-orange-500/30">
                            Aujourd'hui
                        </button>
                        <button onClick={() => shiftWindow(1)} className={`p-2 rounded-xl transition-colors ${btnBase}`}><ChevronRight size={17} /></button>
                    </div>
                </div>
            </div>

            {/* ── Stats ── */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                    { label: "Véhicules",    value: stats.total,     color: "text-blue-400",    bg: isLight ? "bg-blue-50" : "bg-blue-500/10" },
                    { label: "En attente",   value: stats.pending,   color: "text-amber-400",   bg: isLight ? "bg-amber-50" : "bg-amber-500/10" },
                    { label: "Confirmées",   value: stats.confirmed, color: "text-emerald-400", bg: isLight ? "bg-emerald-50" : "bg-emerald-500/10" },
                    { label: "En cours",     value: stats.active,    color: "text-indigo-400",  bg: isLight ? "bg-indigo-50" : "bg-indigo-500/10" },
                ].map(s => (
                    <div key={s.label} className={`rounded-2xl border p-4 flex items-center gap-3 ${cardBg}`}>
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${s.bg}`}>
                            <span className={`text-lg font-black ${s.color}`}>{s.value}</span>
                        </div>
                        <span className={`text-xs font-semibold ${textSub}`}>{s.label}</span>
                    </div>
                ))}
            </div>

            {/* ── Filtres ── */}
            <div className="flex flex-wrap gap-2">
                {FILTERS.map(f => {
                    const active = filter === f;
                    return (
                        <button key={f} onClick={() => setFilter(f)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                                active
                                    ? "bg-orange-500 text-white shadow-sm shadow-orange-500/30"
                                    : isLight ? "bg-white border border-slate-200 text-slate-500 hover:border-orange-300" : "bg-white/5 border border-white/10 text-slate-400 hover:border-orange-500/30"
                            }`}>
                            {f}
                            {f === "En attente" && stats.pending > 0 && (
                                <span className={`ml-1.5 px-1 rounded-full text-[10px] ${active ? "bg-white/30 text-white" : "bg-amber-500 text-white"}`}>{stats.pending}</span>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* ── Gantt ── */}
            <div className={`rounded-2xl border overflow-hidden ${cardBg}`}>
                <div className="overflow-x-auto">
                    <div style={{ minWidth: `${220 + viewDays * COL_W}px` }} className="relative">

                        {/* Ligne mois */}
                        <div className={`flex border-b ${divider}`}>
                            <div style={{ width: 220 }} className="shrink-0" />
                            {monthGroups.map(g => (
                                <div key={g.key} style={{ width: g.count * COL_W }}
                                    className={`text-center text-[10px] font-bold uppercase tracking-widest py-2 border-r last:border-r-0 capitalize ${divider} ${textSub}`}>
                                    {g.label}
                                </div>
                            ))}
                        </div>

                        {/* Ligne jours */}
                        <div className={`flex border-b ${divider}`}>
                            <div style={{ width: 220 }}
                                className={`shrink-0 px-5 py-2 text-[10px] font-bold uppercase tracking-widest ${textSub}`}>
                                Véhicule
                            </div>
                            {days.map((d, i) => {
                                const isToday   = d.getTime() === todayMs;
                                const isWeekend = d.getDay() === 0 || d.getDay() === 6;
                                return (
                                    <div key={i} style={{ width: COL_W }}
                                        className={`shrink-0 text-center text-[9px] py-1.5 border-r last:border-r-0
                                            ${isToday ? "bg-orange-500/10 font-black text-orange-400"
                                                : isWeekend ? `${wkndBg} ${isLight ? "text-slate-300" : "text-slate-600"}`
                                                : textSub}
                                            ${cellBord}`}>
                                        <div className="font-semibold">{d.getDate()}</div>
                                        <div className="text-[7px] uppercase opacity-70">
                                            {d.toLocaleDateString("fr-FR", { weekday: "short" }).slice(0, 2)}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Lignes véhicules */}
                        {vehicles.map((v, vi) => {
                            const vRes = (resByVehicle[v.id] || []).filter(r => {
                                const s = new Date(r.startDate).getTime();
                                const e = new Date(r.endDate).getTime();
                                return e >= windowStartMs && s < windowEndMs;
                            });
                            const vStatus = v.status;
                            return (
                                <div key={v.id || vi}
                                    className={`flex items-center border-b last:border-b-0 relative ${rowHov} ${divider} transition-colors`}
                                    style={{ height: 48 }}>

                                    {/* Label véhicule */}
                                    <div style={{ width: 220 }} className="shrink-0 px-4 flex items-center gap-2.5">
                                        <div className={`w-2 h-2 rounded-full shrink-0 ${
                                            vStatus === "disponible" ? "bg-emerald-400"
                                            : vStatus === "reserve"  ? "bg-orange-400"
                                            : vStatus === "en_attente" ? "bg-amber-400"
                                            : "bg-slate-400"}`} />
                                        {v.images?.[0]
                                            ? <img src={v.images[0].startsWith("http") ? v.images[0] : `${import.meta.env.VITE_API_URL || ""}${v.images[0]}`}
                                                alt="" className="w-8 h-8 rounded-lg object-cover shrink-0 border border-white/10" />
                                            : <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${isLight ? "bg-slate-100" : "bg-white/5"}`}>
                                                <Car size={14} className={textSub} />
                                              </div>
                                        }
                                        <div className="min-w-0">
                                            <p className={`text-xs font-bold truncate leading-tight ${textPri}`}>{v.brand} {v.model}</p>
                                            {v.plateNumber && <p className={`text-[10px] font-mono truncate ${textSub}`}>{v.plateNumber}</p>}
                                        </div>
                                    </div>

                                    {/* Cellules + barres */}
                                    <div className="relative flex" style={{ flex: 1, height: 48 }}>
                                        {days.map((d, i) => {
                                            const isToday   = d.getTime() === todayMs;
                                            const isWeekend = d.getDay() === 0 || d.getDay() === 6;
                                            return (
                                                <div key={i} style={{ width: COL_W }}
                                                    className={`h-full border-r last:border-r-0
                                                        ${isToday ? todayBg : isWeekend ? wkndBg : ""}
                                                        ${cellBord}`} />
                                            );
                                        })}

                                        {/* Ligne "aujourd'hui" */}
                                        {todayColIdx !== null && (
                                            <div className="absolute top-0 bottom-0 pointer-events-none"
                                                style={{ left: (todayColIdx + 0.5) * COL_W - 1, width: 2 }}>
                                                <div className="w-full h-full bg-orange-500/60 rounded-full" />
                                            </div>
                                        )}

                                        {/* Barres */}
                                        {vRes.map((r, ri) => {
                                            const rStartMs = Math.max(new Date(r.startDate).getTime(), windowStartMs);
                                            const rEndMs   = Math.min(new Date(r.endDate).getTime(),   windowEndMs);
                                            const startCol = (rStartMs - windowStartMs) / 86400000;
                                            const durCols  = (rEndMs - rStartMs) / 86400000;
                                            if (durCols <= 0) return null;
                                            const meta  = getMeta(r.status);
                                            const isPending = ["en_attente","EN_ATTENTE"].includes(r.status);
                                            return (
                                                <button key={ri} type="button"
                                                    onClick={() => setSelected(r)}
                                                    title={`${r.customerName || "Client"} · ${fmtShort(r.startDate)} → ${fmtShort(r.endDate)}`}
                                                    className={`absolute top-2.5 bottom-2.5 rounded-lg ${meta.color}
                                                        hover:brightness-110 hover:scale-y-110 transition-all cursor-pointer
                                                        flex items-center overflow-hidden group
                                                        ${selected?.id === r.id ? "ring-2 ring-white/80 brightness-110" : ""}
                                                        ${isPending ? "opacity-80 border-2 border-dashed border-white/40" : "opacity-90"}`}
                                                    style={{
                                                        left:  startCol * COL_W + 2,
                                                        width: Math.max(durCols * COL_W - 4, 6),
                                                    }}>
                                                    <span className="text-[9px] text-white font-bold px-1.5 truncate leading-none select-none">
                                                        {isPending && "⏳ "}
                                                        {r.customerName?.split(" ")[0] || ""}
                                                    </span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}

                        {/* Ligne "aujourd'hui" globale (dans la colonne label) */}
                        {vehicles.length === 0 && (
                            <div className={`py-16 text-center ${textSub}`}>
                                <CalendarCheck size={36} className="mx-auto mb-3 opacity-30" />
                                <p className="text-sm font-semibold">Aucun véhicule enregistré</p>
                                <p className="text-xs mt-1 opacity-60">Ajoutez des véhicules depuis "Mes véhicules"</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ── Légende ── */}
            <div className="flex flex-wrap gap-4">
                {[
                    { color: "bg-blue-500",    label: "En cours" },
                    { color: "bg-amber-400",   label: "En attente" },
                    { color: "bg-emerald-500", label: "Confirmée" },
                    { color: "bg-red-400",     label: "Refusée / Annulée" },
                    { color: "bg-slate-400",   label: "Terminée" },
                ].map(l => (
                    <div key={l.label} className="flex items-center gap-1.5">
                        <div className={`w-3 h-3 rounded-sm ${l.color}`} />
                        <span className={`text-xs font-medium ${textSub}`}>{l.label}</span>
                    </div>
                ))}
                <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-sm bg-amber-400 opacity-80 border-2 border-dashed border-white/60" />
                    <span className={`text-xs font-medium ${textSub}`}>En attente (pointillé)</span>
                </div>
            </div>

            {/* ── Panel détail réservation ── */}
            {selected && (
                <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-end p-4 pointer-events-none">
                    <div ref={panelRef}
                        className={`pointer-events-auto w-full sm:w-[360px] rounded-2xl border shadow-2xl overflow-hidden
                            ${isLight ? "bg-white border-slate-200" : "bg-[#0d1533] border-white/10"}`}
                        style={{ boxShadow: "0 25px 60px rgba(0,0,0,0.4)" }}>

                        {/* Header */}
                        <div className={`flex items-center justify-between px-5 py-4 border-b ${divider}`}>
                            <div className="flex items-center gap-2.5">
                                <div className={`w-2.5 h-2.5 rounded-full ${getMeta(selected.status).dot}`} />
                                <p className={`font-bold text-sm ${textPri}`}>{getMeta(selected.status).label}</p>
                            </div>
                            <button onClick={() => setSelected(null)}
                                className={`p-1.5 rounded-lg transition-colors ${isLight ? "hover:bg-slate-100 text-slate-400" : "hover:bg-white/10 text-slate-500"}`}>
                                <X size={15} />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="p-5 space-y-4">
                            {/* Véhicule */}
                            <div className={`rounded-xl p-3 flex items-center gap-3 ${isLight ? "bg-slate-50" : "bg-white/5"}`}>
                                <Car size={18} className="text-orange-500 shrink-0" />
                                <div>
                                    <p className={`font-bold text-sm ${textPri}`}>{selected.vehicleBrand} {selected.vehicleModel}</p>
                                </div>
                            </div>

                            {/* Client */}
                            <div className="flex items-start gap-3">
                                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 font-bold text-sm
                                    ${isLight ? "bg-indigo-50 text-indigo-600" : "bg-indigo-500/10 text-indigo-400"}`}>
                                    {(selected.customerName || "?").split(" ").map(p => p[0]).join("").toUpperCase().slice(0,2)}
                                </div>
                                <div>
                                    <p className={`font-bold text-sm ${textPri}`}>{selected.customerName || "—"}</p>
                                    <p className={`text-xs ${textSub}`}>{selected.customerEmail || "—"}</p>
                                </div>
                            </div>

                            {/* Dates */}
                            <div className={`grid grid-cols-2 gap-2`}>
                                <div className={`rounded-xl p-3 ${isLight ? "bg-slate-50" : "bg-white/5"}`}>
                                    <p className={`text-[10px] uppercase font-bold tracking-wider mb-1 ${textSub}`}>Début</p>
                                    <p className={`text-xs font-bold ${textPri}`}>{fmtDate(selected.startDate)}</p>
                                </div>
                                <div className={`rounded-xl p-3 ${isLight ? "bg-slate-50" : "bg-white/5"}`}>
                                    <p className={`text-[10px] uppercase font-bold tracking-wider mb-1 ${textSub}`}>Fin</p>
                                    <p className={`text-xs font-bold ${textPri}`}>{fmtDate(selected.endDate)}</p>
                                </div>
                            </div>

                            {/* Lieux */}
                            {(selected.pickupLocation || selected.returnLocation) && (
                                <div className="space-y-1.5">
                                    {selected.pickupLocation && (
                                        <div className="flex items-center gap-2">
                                            <MapPin size={13} className="text-emerald-500 shrink-0" />
                                            <span className={`text-xs ${textSub}`}><strong className={textPri}>Prise :</strong> {selected.pickupLocation}</span>
                                        </div>
                                    )}
                                    {selected.returnLocation && (
                                        <div className="flex items-center gap-2">
                                            <MapPin size={13} className="text-red-400 shrink-0" />
                                            <span className={`text-xs ${textSub}`}><strong className={textPri}>Retour :</strong> {selected.returnLocation}</span>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Montant */}
                            {selected.totalAmount && (
                                <div className={`flex items-center justify-between rounded-xl px-4 py-3 ${isLight ? "bg-orange-50 border border-orange-100" : "bg-orange-500/10 border border-orange-500/20"}`}>
                                    <span className={`text-xs font-semibold ${isLight ? "text-orange-700" : "text-orange-300"}`}>Total</span>
                                    <span className={`text-lg font-black ${isLight ? "text-orange-600" : "text-orange-400"}`}>
                                        {Number(selected.totalAmount).toLocaleString("fr-FR")} €
                                    </span>
                                </div>
                            )}

                            {/* Durée */}
                            {selected.startDate && selected.endDate && (() => {
                                const nights = Math.max(1, Math.round((new Date(selected.endDate) - new Date(selected.startDate)) / 86400000));
                                return (
                                    <p className={`text-xs ${textSub} text-center`}>
                                        <Clock size={11} className="inline mr-1" />
                                        {nights} nuit{nights > 1 ? "s" : ""} de location
                                    </p>
                                );
                            })()}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
