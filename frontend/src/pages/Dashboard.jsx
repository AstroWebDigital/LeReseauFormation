import React, { useState, useEffect, useMemo } from "react";
import { Spinner, Avatar } from "@heroui/react";
import {
    Car, FileText, CalendarCheck, TrendingUp, AlertTriangle,
    RefreshCw, MapPin, ChevronRight, ChevronLeft, Clock, Star,
    BarChart2, CheckCircle, XCircle, AlertCircle, Calendar,
    CreditCard, History, UserCircle, Zap, ArrowUpRight, ArrowRight
} from "lucide-react";
import api from "@/services/auth/client";
import { useAuth } from "@/auth/AuthContext";
import { useTheme } from "@/theme/ThemeProvider";

import {
    AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, Cell
} from "recharts";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8080";

const resolvePhoto = (url) => {
    if (!url) return null;
    if (url.startsWith("http")) return url;
    return `${API_BASE}${url.startsWith("/") ? url : "/" + url}`;
};

const statusLabel = (s) => {
    const map = { AVAILABLE: "Disponible", RENTED: "Loué", BLOCKED: "Bloqué", MAINTENANCE: "Maintenance" };
    return map[s] || s;
};
const statusColor = (s, isLight) => {
    const dark = { AVAILABLE: "text-emerald-400 bg-emerald-400/10 border border-emerald-400/20", RENTED: "text-orange-400 bg-orange-400/10 border border-orange-400/20", BLOCKED: "text-red-400 bg-red-400/10 border border-red-400/20", MAINTENANCE: "text-yellow-400 bg-yellow-400/10 border border-yellow-400/20" };
    const light = { AVAILABLE: "text-emerald-700 bg-emerald-50 border border-emerald-200", RENTED: "text-orange-700 bg-orange-50 border border-orange-200", BLOCKED: "text-red-700 bg-red-50 border border-red-200", MAINTENANCE: "text-yellow-700 bg-yellow-50 border border-yellow-200" };
    return (isLight ? light : dark)[s] || (isLight ? "text-slate-500 bg-slate-100 border border-slate-200" : "text-slate-400 bg-slate-700 border border-slate-600");
};

const resStatusLabel = (s) => {
    const map = {
        en_attente: "En attente", EN_ATTENTE: "En attente",
        accepte: "Approuvée",    CONFIRME: "Confirmée",
        refuse:  "Refusée",      ANNULE: "Annulée",
        EN_COURS: "En cours",    TERMINE: "Terminée",
    };
    return map[s] || s;
};
const resStatusColor = (s) => {
    const map = {
        en_attente: "text-orange-400 bg-orange-400/10 border border-orange-400/20",
        EN_ATTENTE: "text-orange-400 bg-orange-400/10 border border-orange-400/20",
        accepte:    "text-emerald-400 bg-emerald-400/10 border border-emerald-400/20",
        CONFIRME:   "text-emerald-400 bg-emerald-400/10 border border-emerald-400/20",
        refuse:     "text-red-400 bg-red-400/10 border border-red-400/20",
        ANNULE:     "text-red-400 bg-red-400/10 border border-red-400/20",
        EN_COURS:   "text-blue-400 bg-blue-400/10 border border-blue-400/20",
        TERMINE:    "text-slate-400 bg-slate-400/10 border border-slate-400/20",
    };
    return map[s] || "text-slate-400 bg-slate-400/10 border border-slate-400/20";
};

const fmtDate = (d) => d ? new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" }) : "—";
const fmtDateLong = (d) => d ? new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" }) : "—";
const fmtCurrency = (n) => n != null ? `${Number(n).toLocaleString("fr-FR")}€` : "—";

const greetingByTime = (name) => {
    const h = new Date().getHours();
    const prefix = h < 12 ? "Bonjour" : h < 18 ? "Bon après-midi" : "Bonsoir";
    return `${prefix}, ${name}`;
};

// ── KPI Card améliorée ────────────────────────────────────────────────────────
function KpiCard({ icon: Icon, label, value, sub, gradient, isLight }) {
    return (
        <div className={`relative rounded-2xl p-5 flex flex-col gap-4 overflow-hidden transition-all duration-300 group cursor-default
            ${isLight
                ? "bg-white border border-slate-100 shadow-sm hover:shadow-lg hover:shadow-slate-200/80 hover:-translate-y-0.5"
                : "bg-[#0d1533] border border-white/5 hover:border-white/10 hover:-translate-y-0.5"}`}>
            {/* Gradient top line */}
            <div className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${gradient} opacity-70 group-hover:opacity-100 transition-opacity`} />
            {/* Bg glow */}
            <div className={`absolute -top-8 -right-8 w-24 h-24 rounded-full blur-2xl bg-gradient-to-br ${gradient} opacity-10 group-hover:opacity-20 transition-opacity`} />

            <div className="flex items-start justify-between relative">
                <span className={`text-[11px] font-semibold uppercase tracking-widest ${isLight ? "text-slate-400" : "text-slate-500"}`}>{label}</span>
                <div className={`p-2.5 rounded-xl bg-gradient-to-br ${gradient} shadow-lg`}>
                    <Icon size={16} className="text-white" />
                </div>
            </div>
            <div className="relative">
                <div className={`text-3xl font-black tracking-tight ${isLight ? "text-slate-800" : "text-white"}`}>{value}</div>
                {sub && <div className={`text-xs mt-1 ${isLight ? "text-slate-400" : "text-slate-500"}`}>{sub}</div>}
            </div>
        </div>
    );
}

// ── Vehicle Card améliorée ────────────────────────────────────────────────────
function VehicleCard({ v, isLight }) {
    const photo = resolvePhoto(v.profilPhoto);
    return (
        <div className={`rounded-2xl overflow-hidden border transition-all duration-300 group flex flex-col
            ${isLight
            ? "bg-white border-slate-100 hover:border-orange-300 shadow-sm hover:shadow-xl hover:shadow-orange-500/10 hover:-translate-y-1"
            : "bg-[#0d1533] border-white/5 hover:border-orange-500/30 hover:shadow-xl hover:shadow-orange-500/10 hover:-translate-y-1"}`}>
            <div className={`relative h-40 flex items-center justify-center overflow-hidden
                ${isLight ? "bg-gradient-to-br from-slate-100 to-slate-50" : "bg-gradient-to-br from-[#080f28] to-[#0d1533]"}`}>
                {photo
                    ? <img src={photo} alt={`${v.brand} ${v.model}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                    : <Car size={40} className={isLight ? "text-slate-200" : "text-white/10"} />
                }
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                <span className={`absolute top-3 right-3 text-[11px] font-bold px-2.5 py-1 rounded-lg backdrop-blur-sm ${statusColor(v.status, isLight)}`}>
                    {statusLabel(v.status)}
                </span>
                <div className="absolute bottom-3 left-3 right-3">
                    <h3 className="font-black text-white text-base drop-shadow">
                        {v.brand} <span className="text-orange-400">{v.model}</span>
                    </h3>
                    <p className="text-white/60 text-xs">{v.year} · {v.licensePlate}</p>
                </div>
            </div>

            <div className="p-4 flex flex-col gap-3 flex-1">
                {v.defaultParkingLocation && (
                    <div className={`flex items-center gap-1.5 text-xs ${isLight ? "text-slate-500" : "text-slate-400"}`}>
                        <MapPin size={12} className="text-orange-400 shrink-0" />
                        <span className="truncate">{v.defaultParkingLocation}</span>
                    </div>
                )}

                <div className={`rounded-xl p-3 ${isLight ? "bg-slate-50" : "bg-white/4"}`}>
                    <div className="flex items-center justify-between mb-2">
                        <span className={`text-[10px] uppercase tracking-wider font-semibold ${isLight ? "text-slate-400" : "text-slate-500"}`}>Occupation</span>
                        <span className={`text-sm font-black ${isLight ? "text-slate-700" : "text-white"}`}>{v.occupancyRate}%</span>
                    </div>
                    <div className={`h-2 rounded-full ${isLight ? "bg-slate-200" : "bg-white/10"}`}>
                        <div className="h-full rounded-full bg-gradient-to-r from-orange-500 to-amber-400 transition-all duration-700"
                             style={{ width: `${v.occupancyRate}%` }} />
                    </div>
                </div>

                <div className={`text-xs space-y-1.5 ${isLight ? "text-slate-500" : "text-slate-400"}`}>
                    <div className="flex justify-between">
                        <span>CA/mois</span>
                        <span className={`font-semibold ${isLight ? "text-slate-700" : "text-slate-200"}`}>{fmtCurrency(v.monthlyRevenue)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Kilométrage</span>
                        <span className={`font-semibold ${isLight ? "text-slate-700" : "text-slate-200"}`}>{v.mileage?.toLocaleString("fr-FR")} km</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Tarif/jour</span>
                        <span className="text-orange-400 font-bold">{fmtCurrency(v.baseDailyPrice)}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ── Reservation Row (loueur) ──────────────────────────────────────────────────
function ReservationRow({ r, isLight }) {
    const progress = (() => {
        if (!r.startDate || !r.endDate) return 0;
        const start = new Date(r.startDate), end = new Date(r.endDate), now = new Date();
        if (now < start) return 0;
        if (now > end) return 100;
        return Math.round(((now - start) / (end - start)) * 100);
    })();

    return (
        <div className={`rounded-2xl p-4 border transition-all duration-200 hover:-translate-y-0.5
            ${isLight
                ? "bg-white border-slate-100 shadow-sm hover:shadow-md hover:border-slate-200"
                : "bg-[#0d1533] border-white/5 hover:border-white/10"}`}>
            <div className="flex items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                    <Avatar
                        name={r.customerName || "C"}
                        size="sm"
                        classNames={{
                            base: `font-bold text-xs ${isLight ? "bg-gradient-to-br from-orange-400 to-orange-500 text-white" : "bg-orange-500/20 text-orange-400"}`,
                        }}
                    />
                    <div>
                        <p className={`font-bold text-sm ${isLight ? "text-slate-800" : "text-white"}`}>
                            {r.customerName || "Client"}
                        </p>
                        <p className={`text-xs ${isLight ? "text-slate-400" : "text-slate-500"}`}>
                            {r.vehicleBrand} {r.vehicleModel}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    <span className="text-orange-400 font-black text-sm">{fmtCurrency(r.totalPrice)}</span>
                    <span className={`text-[11px] font-bold px-2 py-1 rounded-lg ${resStatusColor(r.status)}`}>
                        {resStatusLabel(r.status)}
                    </span>
                </div>
            </div>

            <div className={`flex items-center gap-2 text-xs mb-3 ${isLight ? "text-slate-400" : "text-slate-500"}`}>
                <Clock size={11} className="shrink-0" />
                <span>{fmtDate(r.startDate)}</span>
                <ArrowRight size={11} />
                <span>{fmtDate(r.endDate)}</span>
                {progress > 0 && progress < 100 && (
                    <span className="ml-auto text-orange-400 font-semibold">{progress}%</span>
                )}
            </div>

            <div className={`h-1.5 rounded-full overflow-hidden ${isLight ? "bg-slate-100" : "bg-white/5"}`}>
                <div className="h-full rounded-full bg-gradient-to-r from-orange-500 to-amber-400 transition-all duration-700"
                     style={{ width: `${progress}%` }} />
            </div>
        </div>
    );
}

// ── Alert Row ─────────────────────────────────────────────────────────────────
function AlertRow({ alert, isLight }) {
    const iconMap = { high: XCircle, medium: AlertCircle, low: CheckCircle };
    const colorMap = { high: "text-red-400", medium: "text-orange-400", low: "text-emerald-400" };
    const bgMap = { high: isLight ? "bg-red-50 border-red-100" : "bg-red-500/8 border-red-500/15", medium: isLight ? "bg-orange-50 border-orange-100" : "bg-orange-500/8 border-orange-500/15", low: isLight ? "bg-emerald-50 border-emerald-100" : "bg-emerald-500/8 border-emerald-500/15" };
    const Icon = iconMap[alert.severity] || AlertCircle;

    return (
        <div className={`flex items-center gap-3 p-3 rounded-xl border transition-all
            ${bgMap[alert.severity] || (isLight ? "bg-white border-slate-200" : "bg-white/3 border-white/5")}`}>
            <Icon size={18} className={`shrink-0 ${colorMap[alert.severity]}`} />
            <div className="flex-1 min-w-0">
                <p className={`text-sm font-semibold truncate ${isLight ? "text-slate-700" : "text-white"}`}>
                    {alert.type?.replace("_", " ")} — {alert.vehicleName}
                </p>
                <p className={`text-xs mt-0.5 ${isLight ? "text-slate-400" : "text-slate-500"}`}>
                    {alert.status === "expire" ? "Expiré le" : "Expire le"} {fmtDate(alert.expirationDate)}
                </p>
            </div>
            <span className={`text-[11px] font-bold px-2 py-1 rounded-lg shrink-0 ${colorMap[alert.severity]} ${alert.severity === "high" ? "bg-red-400/10" : "bg-orange-400/10"}`}>
                {alert.severity === "high" ? "Urgent" : "Bientôt"}
            </span>
        </div>
    );
}

// ── Fleet Planning (Gantt) ────────────────────────────────────────────────────
const GANTT_DAYS = 35;
const GANTT_COL_W = 32;

function FleetPlanning({ reservations, vehicles, isLight }) {
    const [windowStart, setWindowStart] = useState(() => {
        const d = new Date();
        d.setDate(d.getDate() - 7);
        d.setHours(0, 0, 0, 0);
        return d;
    });

    const days = useMemo(() => Array.from({ length: GANTT_DAYS }, (_, i) => {
        const d = new Date(windowStart);
        d.setDate(windowStart.getDate() + i);
        return d;
    }), [windowStart]);

    const today = useMemo(() => { const d = new Date(); d.setHours(0,0,0,0); return d; }, []);
    const todayMs = today.getTime();
    const windowStartMs = windowStart.getTime();
    const windowEndMs = useMemo(() => {
        const e = new Date(windowStart); e.setDate(windowStart.getDate() + GANTT_DAYS); return e.getTime();
    }, [windowStart]);

    const shiftWindow = (weeks) => setWindowStart(prev => {
        const d = new Date(prev); d.setDate(d.getDate() + weeks * 7); return d;
    });
    const resetToday = () => setWindowStart(() => {
        const d = new Date(); d.setDate(d.getDate() - 7); d.setHours(0,0,0,0); return d;
    });

    const monthGroups = useMemo(() => {
        const groups = [];
        days.forEach(d => {
            const key = `${d.getFullYear()}-${d.getMonth()}`;
            const last = groups[groups.length - 1];
            if (last && last.key === key) { last.count++; }
            else groups.push({ key, label: d.toLocaleDateString("fr-FR", { month: "long", year: "numeric" }), count: 1 });
        });
        return groups;
    }, [days]);

    const resByVehicle = useMemo(() => {
        const map = {};
        (reservations || []).forEach(r => {
            const k = `${r.vehicleBrand}|${r.vehicleModel}`;
            if (!map[k]) map[k] = [];
            map[k].push(r);
        });
        return map;
    }, [reservations]);

    const barColor = (s) => ({
        en_attente: "bg-orange-500", EN_ATTENTE: "bg-orange-500",
        accepte: "bg-emerald-500",   CONFIRME: "bg-emerald-500",
        refuse:  "bg-red-400",       ANNULE: "bg-red-400",
        EN_COURS: "bg-blue-500",     TERMINE: "bg-slate-400",
    }[s] || "bg-slate-500");

    return (
        <div>
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className={`text-base font-black ${isLight ? "text-slate-800" : "text-white"}`}>Planning flotte</h3>
                    <p className={`text-xs ${isLight ? "text-slate-400" : "text-slate-500"}`}>Vue Gantt · {GANTT_DAYS} jours</p>
                </div>
                <div className="flex items-center gap-1.5">
                    <button onClick={() => shiftWindow(-1)} className={`p-1.5 rounded-lg transition-colors ${isLight ? "hover:bg-slate-100 text-slate-500" : "hover:bg-white/10 text-slate-400"}`}>
                        <ChevronLeft size={16} />
                    </button>
                    <button onClick={resetToday} className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${isLight ? "bg-slate-100 hover:bg-slate-200 text-slate-600" : "bg-white/5 hover:bg-white/10 text-slate-300"}`}>
                        Aujourd'hui
                    </button>
                    <button onClick={() => shiftWindow(1)} className={`p-1.5 rounded-lg transition-colors ${isLight ? "hover:bg-slate-100 text-slate-500" : "hover:bg-white/10 text-slate-400"}`}>
                        <ChevronRight size={16} />
                    </button>
                </div>
            </div>

            <div className={`rounded-2xl border overflow-hidden ${isLight ? "bg-white border-slate-100 shadow-sm" : "bg-[#0d1533] border-white/5"}`}>
                <div className="overflow-x-auto">
                    <div style={{ minWidth: `${200 + GANTT_DAYS * GANTT_COL_W}px` }}>
                        {/* Month row */}
                        <div className={`flex border-b ${isLight ? "border-slate-100" : "border-white/5"}`}>
                            <div style={{ width: 200 }} className="shrink-0" />
                            {monthGroups.map(g => (
                                <div key={g.key} style={{ width: g.count * GANTT_COL_W }}
                                    className={`text-center text-[10px] font-bold uppercase tracking-wider py-1.5 border-r last:border-r-0 capitalize
                                        ${isLight ? "text-slate-500 border-slate-100" : "text-slate-400 border-white/5"}`}>
                                    {g.label}
                                </div>
                            ))}
                        </div>

                        {/* Day headers */}
                        <div className={`flex border-b ${isLight ? "border-slate-100" : "border-white/5"}`}>
                            <div style={{ width: 200 }} className={`shrink-0 px-4 py-2 text-[10px] font-bold uppercase tracking-wider ${isLight ? "text-slate-400" : "text-slate-600"}`}>
                                Véhicule
                            </div>
                            {days.map((d, i) => {
                                const isToday = d.getTime() === todayMs;
                                const isWeekend = d.getDay() === 0 || d.getDay() === 6;
                                return (
                                    <div key={i} style={{ width: GANTT_COL_W }}
                                        className={`shrink-0 text-center text-[9px] py-1.5 border-r last:border-r-0
                                            ${isToday ? "bg-orange-500/10 font-black text-orange-400" : isWeekend ? (isLight ? "text-slate-300 bg-slate-50" : "text-slate-600 bg-white/[0.015]") : (isLight ? "text-slate-400" : "text-slate-500")}
                                            ${isLight ? "border-slate-100" : "border-white/5"}`}>
                                        <div className="font-semibold">{d.getDate()}</div>
                                        <div className="text-[7px] uppercase opacity-70">{d.toLocaleDateString("fr-FR", { weekday: "short" }).slice(0, 2)}</div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Vehicle rows */}
                        {(vehicles || []).map((v, vi) => {
                            const key = `${v.brand}|${v.model}`;
                            const vRes = (resByVehicle[key] || []).filter(r => {
                                const s = new Date(r.startDate).getTime();
                                const e = new Date(r.endDate).getTime();
                                return e >= windowStartMs && s < windowEndMs;
                            });
                            return (
                                <div key={v.id || vi}
                                    className={`flex items-center border-b last:border-b-0 relative
                                        ${isLight ? "border-slate-50 hover:bg-orange-50/30" : "border-white/[0.03] hover:bg-white/[0.02]"}`}
                                    style={{ height: 40 }}>
                                    <div style={{ width: 200 }} className="shrink-0 px-4 flex items-center gap-2">
                                        <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${v.status === "AVAILABLE" ? "bg-emerald-400" : v.status === "RENTED" ? "bg-orange-400" : "bg-slate-400"}`} />
                                        <span className={`text-xs font-semibold truncate ${isLight ? "text-slate-700" : "text-slate-300"}`}>
                                            {v.brand} {v.model}
                                        </span>
                                    </div>

                                    <div className="relative flex" style={{ flex: 1, height: 40 }}>
                                        {days.map((d, i) => {
                                            const isToday = d.getTime() === todayMs;
                                            const isWeekend = d.getDay() === 0 || d.getDay() === 6;
                                            return (
                                                <div key={i} style={{ width: GANTT_COL_W }}
                                                    className={`h-full border-r last:border-r-0
                                                        ${isToday ? (isLight ? "bg-orange-50" : "bg-orange-500/[0.06]") : isWeekend ? (isLight ? "bg-slate-50/60" : "bg-white/[0.01]") : ""}
                                                        ${isLight ? "border-slate-100" : "border-white/[0.04]"}`} />
                                            );
                                        })}

                                        {vRes.map((r, ri) => {
                                            const rStartMs = Math.max(new Date(r.startDate).getTime(), windowStartMs);
                                            const rEndMs = Math.min(new Date(r.endDate).getTime(), windowEndMs);
                                            const startCol = (rStartMs - windowStartMs) / (24 * 60 * 60 * 1000);
                                            const durCols = (rEndMs - rStartMs) / (24 * 60 * 60 * 1000);
                                            if (durCols <= 0) return null;
                                            return (
                                                <div key={ri}
                                                    title={`${r.customerName || "Client"} · ${fmtDate(r.startDate)} → ${fmtDate(r.endDate)}`}
                                                    className={`absolute top-2 bottom-2 rounded-md ${barColor(r.status)} opacity-80 hover:opacity-100 transition-opacity cursor-default flex items-center overflow-hidden`}
                                                    style={{ left: startCol * GANTT_COL_W + 1, width: Math.max(durCols * GANTT_COL_W - 2, 4) }}>
                                                    <span className="text-[9px] text-white font-bold px-1.5 truncate leading-none">
                                                        {r.customerName?.split(" ")[0] || ""}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}

                        {(!vehicles || vehicles.length === 0) && (
                            <div className={`py-10 text-center text-sm ${isLight ? "text-slate-400" : "text-slate-600"}`}>
                                Aucun véhicule enregistré
                            </div>
                        )}
                    </div>
                </div>

                {/* Legend */}
                <div className={`flex flex-wrap gap-4 px-4 py-3 border-t text-[11px] ${isLight ? "border-slate-100 text-slate-400" : "border-white/5 text-slate-500"}`}>
                    {[
                        { color: "bg-blue-500", label: "En cours" },
                        { color: "bg-orange-500", label: "En attente" },
                        { color: "bg-emerald-500", label: "Confirmée" },
                        { color: "bg-red-400", label: "Annulée" },
                        { color: "bg-slate-400", label: "Terminée" },
                    ].map(({ color, label }) => (
                        <div key={label} className="flex items-center gap-1.5">
                            <div className={`w-2.5 h-2.5 rounded-sm ${color}`} />
                            {label}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

// ── User Reservation Card ─────────────────────────────────────────────────────
function UserReservationCard({ r, isLight, isUpcoming = false }) {
    const startDate = new Date(r.startDate);
    const endDate = new Date(r.endDate);
    const now = new Date();
    const daysUntil = Math.ceil((startDate - now) / (1000 * 60 * 60 * 24));
    const duration = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));

    return (
        <div className={`rounded-2xl overflow-hidden border transition-all duration-300 hover:-translate-y-0.5 group
            ${isLight
                ? "bg-white border-slate-100 shadow-sm hover:shadow-lg hover:shadow-slate-200/80"
                : "bg-[#0d1533] border-white/5 hover:border-white/10"}`}>

            {/* Top accent strip */}
            <div className={`h-1 w-full ${isUpcoming
                ? "bg-gradient-to-r from-orange-500 to-amber-400"
                : "bg-gradient-to-r from-slate-400 to-slate-300"
            }`} />

            <div className="p-5">
                <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                        <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0
                            ${isUpcoming
                                ? isLight ? "bg-orange-50 border border-orange-100" : "bg-orange-500/10 border border-orange-500/20"
                                : isLight ? "bg-slate-100 border border-slate-200" : "bg-white/5 border border-white/10"
                            }`}>
                            <Car size={22} className={isUpcoming ? "text-orange-500" : isLight ? "text-slate-400" : "text-slate-500"} />
                        </div>
                        <div>
                            <p className={`font-black text-base leading-tight ${isLight ? "text-slate-800" : "text-white"}`}>
                                {r.vehicleBrand} <span className="text-orange-400">{r.vehicleModel}</span>
                            </p>
                            {r.vehiclePlate && (
                                <p className={`text-xs font-mono mt-0.5 ${isLight ? "text-slate-400" : "text-slate-500"}`}>
                                    {r.vehiclePlate}
                                </p>
                            )}
                        </div>
                    </div>
                    <span className={`text-[11px] font-bold px-2.5 py-1 rounded-lg shrink-0 ${resStatusColor(r.status)}`}>
                        {resStatusLabel(r.status)}
                    </span>
                </div>

                {/* Date timeline */}
                <div className={`flex items-center gap-3 rounded-xl p-3 mb-4
                    ${isLight ? "bg-slate-50 border border-slate-100" : "bg-white/3 border border-white/5"}`}>
                    <div className="flex-1 text-center">
                        <p className={`text-[10px] uppercase tracking-wider font-semibold mb-1 ${isLight ? "text-slate-400" : "text-slate-500"}`}>Départ</p>
                        <p className={`font-bold text-sm ${isLight ? "text-slate-800" : "text-white"}`}>{fmtDate(r.startDate)}</p>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className={`w-1.5 h-1.5 rounded-full ${isLight ? "bg-orange-400" : "bg-orange-500"}`} />
                        <div className={`w-8 h-px ${isLight ? "bg-orange-200" : "bg-orange-500/30"}`} />
                        <div className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${isLight ? "bg-orange-100 text-orange-600" : "bg-orange-500/15 text-orange-400"}`}>
                            {duration}j
                        </div>
                        <div className={`w-8 h-px ${isLight ? "bg-orange-200" : "bg-orange-500/30"}`} />
                        <div className={`w-1.5 h-1.5 rounded-full ${isLight ? "bg-orange-400" : "bg-orange-500"}`} />
                    </div>
                    <div className="flex-1 text-center">
                        <p className={`text-[10px] uppercase tracking-wider font-semibold mb-1 ${isLight ? "text-slate-400" : "text-slate-500"}`}>Retour</p>
                        <p className={`font-bold text-sm ${isLight ? "text-slate-800" : "text-white"}`}>{fmtDate(r.endDate)}</p>
                    </div>
                </div>

                <div className="flex items-center justify-between">
                    <div>
                        {isUpcoming && daysUntil > 0 && (
                            <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg
                                ${isLight ? "bg-orange-50 text-orange-600 border border-orange-100" : "bg-orange-500/10 text-orange-400 border border-orange-500/20"}`}>
                                <Clock size={11} />
                                Dans {daysUntil} jour{daysUntil > 1 ? "s" : ""}
                            </span>
                        )}
                        {isUpcoming && daysUntil <= 0 && (
                            <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                <Zap size={11} />
                                Aujourd'hui !
                            </span>
                        )}
                        {!isUpcoming && (
                            <span className={`text-xs ${isLight ? "text-slate-400" : "text-slate-500"}`}>
                                {duration} jour{duration > 1 ? "s" : ""} de location
                            </span>
                        )}
                    </div>
                    <span className={`font-black text-lg ${isLight ? "text-slate-800" : "text-white"}`}>{fmtCurrency(r.totalPrice)}</span>
                </div>
            </div>
        </div>
    );
}

// ── Section Header ────────────────────────────────────────────────────────────
function SectionHeader({ title, sub, href, linkLabel, icon: Icon, isLight }) {
    return (
        <div className="flex items-end justify-between mb-5">
            <div className="flex items-center gap-3">
                {Icon && (
                    <div className={`p-2 rounded-xl ${isLight ? "bg-orange-50 border border-orange-100" : "bg-orange-500/10 border border-orange-500/20"}`}>
                        <Icon size={18} className="text-orange-500" />
                    </div>
                )}
                <div>
                    <h2 className={`font-black text-xl ${isLight ? "text-slate-800" : "text-white"}`}>{title}</h2>
                    {sub && <p className={`text-xs mt-0.5 ${isLight ? "text-slate-400" : "text-slate-500"}`}>{sub}</p>}
                </div>
            </div>
            {href && (
                <a href={href}
                   className="flex items-center gap-1.5 text-sm font-bold text-orange-400 hover:text-orange-300 transition-colors group">
                    {linkLabel || "Voir tout"}
                    <ArrowUpRight size={15} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </a>
            )}
        </div>
    );
}

// ── Tooltip personnalisé recharts ─────────────────────────────────────────────
function CustomTooltip({ active, payload, label, isLight }) {
    if (!active || !payload?.length) return null;
    return (
        <div className={`rounded-xl px-4 py-3 shadow-xl border text-sm
            ${isLight ? "bg-white border-slate-200 text-slate-800" : "bg-[#0d1533] border-white/10 text-white"}`}>
            <p className={`font-semibold mb-1 ${isLight ? "text-slate-500" : "text-slate-400"}`}>{label}</p>
            <p className="font-black text-orange-400 text-base">{fmtCurrency(payload[0].value)}</p>
        </div>
    );
}

// ── Dashboard Loueur (ALP/ADMIN/PARTENAIRE) ──────────────────────────────────
function LoueurDashboard({ data, user, isLight, fetchDashboard, lastRefresh }) {
    const today = new Date().toLocaleDateString("fr-FR", {
        weekday: "long", day: "numeric", month: "long", year: "numeric"
    });
    const todayCapitalized = today.charAt(0).toUpperCase() + today.slice(1);

    const kpis = [
        {
            icon: Car,
            label: "Véhicules",
            value: data.totalVehicles ?? "—",
            sub: `${data.availableVehicles ?? 0} dispo · ${data.rentedVehicles ?? 0} loués`,
            gradient: "from-orange-500 to-amber-500"
        },
        {
            icon: CalendarCheck,
            label: "Réservations actives",
            value: data.activeReservations ?? "—",
            sub: `${data.pendingReservations ?? 0} en attente`,
            gradient: "from-blue-500 to-cyan-500"
        },
        {
            icon: FileText,
            label: "Documents",
            value: data.totalDocuments ?? "—",
            sub: `${data.expiredDocuments ?? 0} expirés · ${data.expiringDocuments ?? 0} bientôt`,
            gradient: data.expiredDocuments > 0 ? "from-red-500 to-rose-500" : "from-emerald-500 to-teal-500"
        },
        {
            icon: TrendingUp,
            label: "Tarif moyen",
            value: `${Number(data.averageDailyRate || 0).toFixed(0)}€`,
            sub: "par jour · toute flotte",
            gradient: "from-violet-500 to-purple-500"
        },
    ];

    const maxRevenue = Math.max(...(data.monthlyRevenue?.map(m => Number(m.amount)) || [1]));
    const occupancyRate = data.totalVehicles > 0
        ? Math.round((data.rentedVehicles / data.totalVehicles) * 100)
        : 0;

    return (
        <div className={`p-5 lg:p-8 space-y-8 min-h-screen ${isLight ? "bg-slate-50" : "bg-[#050721]"}`}>

            {/* ── Hero ──────────────────────────────────────────────────────── */}
            <div className={`relative rounded-3xl overflow-hidden
                ${isLight
                    ? "bg-white border border-slate-100 shadow-md"
                    : "bg-gradient-to-br from-[#0d1533] via-[#111b46] to-[#0a1128]"
                }`}>
                {/* Background orbs */}
                <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-orange-500/20 blur-3xl pointer-events-none" />
                <div className="absolute -bottom-16 left-1/4 w-48 h-48 rounded-full bg-blue-500/15 blur-3xl pointer-events-none" />
                <div className="absolute top-1/2 right-1/4 w-32 h-32 rounded-full bg-violet-500/10 blur-2xl pointer-events-none" />

                <div className="relative p-6 lg:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                    <div>
                        {/* Avatar + titre */}
                        <div className="flex items-center gap-4 mb-3">
                            <div className="relative">
                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-xl shadow-orange-500/40">
                                    <BarChart2 size={28} className="text-white" />
                                </div>
                                <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-400 border-2 border-white dark:border-[#0d1533] animate-pulse" />
                            </div>
                            <div>
                                <p className={`text-xs font-semibold uppercase tracking-widest mb-1 ${isLight ? "text-slate-400" : "text-orange-400/70"}`}>
                                    Tableau de bord
                                </p>
                                <h1 className={`text-2xl lg:text-3xl font-black ${isLight ? "text-slate-800" : "text-white"}`}>
                                    {greetingByTime(user?.firstname || "vous")} !
                                </h1>
                            </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-4 ml-1">
                            <span className={`flex items-center gap-1.5 text-xs ${isLight ? "text-slate-400" : "text-white/40"}`}>
                                <Clock size={12} /> {todayCapitalized}
                            </span>
                            <span className="flex items-center gap-1.5 text-emerald-500 text-xs font-semibold">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                Système opérationnel
                            </span>
                        </div>
                    </div>

                    {/* Stats hero cards */}
                    <div className="flex gap-3 relative shrink-0">
                        <div className={`rounded-2xl p-4 min-w-[140px] ${isLight ? "bg-gradient-to-br from-orange-500 to-amber-500 shadow-lg shadow-orange-500/30" : "bg-gradient-to-br from-orange-500 to-orange-600 shadow-lg shadow-orange-500/30"}`}>
                            <div className="flex justify-between items-start mb-3">
                                <p className="text-white/80 text-xs font-semibold uppercase tracking-wide">Loués</p>
                                <TrendingUp size={14} className="text-white/60" />
                            </div>
                            <p className="text-4xl font-black text-white">{data.rentedVehicles ?? 0}</p>
                            <div className={`h-1.5 rounded-full bg-white/20 mt-3`}>
                                <div className="h-full rounded-full bg-white transition-all duration-700"
                                     style={{ width: `${occupancyRate}%` }} />
                            </div>
                            <p className="text-white/60 text-[10px] mt-1 font-medium">{occupancyRate}% d'occupation</p>
                        </div>

                        {data.expiredDocuments + data.expiringDocuments > 0 && (
                            <div className="rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 p-4 min-w-[130px] shadow-lg shadow-red-500/30">
                                <div className="flex justify-between items-start mb-3">
                                    <p className="text-white/80 text-xs font-semibold uppercase tracking-wide">Alertes</p>
                                    <AlertTriangle size={14} className="text-white/60" />
                                </div>
                                <p className="text-4xl font-black text-white">{data.expiredDocuments + data.expiringDocuments}</p>
                                <p className="text-white/60 text-[10px] mt-3 font-medium">{data.expiredDocuments} expirés</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ── KPIs ─────────────────────────────────────────────────────── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {kpis.map((k, i) => <KpiCard key={i} {...k} isLight={isLight} />)}
            </div>

            {/* ── Graphique + Alertes ───────────────────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Chart */}
                <div className={`lg:col-span-2 rounded-2xl p-6 border
                    ${isLight ? "bg-white border-slate-100 shadow-sm" : "bg-[#0d1533] border-white/5"}`}>
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className={`font-black text-lg ${isLight ? "text-slate-800" : "text-white"}`}>
                                Chiffre d'affaires
                            </h2>
                            <p className={`text-xs mt-0.5 ${isLight ? "text-slate-400" : "text-slate-500"}`}>
                                6 derniers mois
                            </p>
                        </div>
                        <button onClick={fetchDashboard}
                                className={`flex items-center gap-2 text-xs px-3 py-2 rounded-xl transition-all font-semibold
                                ${isLight ? "bg-slate-100 text-slate-600 hover:bg-slate-200" : "bg-white/5 text-slate-400 hover:bg-white/10"}`}>
                            <RefreshCw size={13} /> Actualiser
                        </button>
                    </div>

                    <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={data.monthlyRevenue} barSize={36} barCategoryGap="30%">
                            <defs>
                                <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#ff922b" stopOpacity={1} />
                                    <stop offset="100%" stopColor="#f59e0b" stopOpacity={0.8} />
                                </linearGradient>
                                <linearGradient id="barGradDim" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor={isLight ? "#fed7aa" : "#1e3a5f"} stopOpacity={1} />
                                    <stop offset="100%" stopColor={isLight ? "#ffedd5" : "#0d1f3a"} stopOpacity={0.8} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke={isLight ? "#f1f5f9" : "#1e2d5a"} vertical={false} />
                            <XAxis dataKey="month" tick={{ fill: isLight ? "#94a3b8" : "#475569", fontSize: 12, fontWeight: 600 }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fill: isLight ? "#94a3b8" : "#475569", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}€`} />
                            <Tooltip content={(props) => <CustomTooltip {...props} isLight={isLight} />} cursor={{ fill: isLight ? "#f8fafc" : "rgba(255,255,255,0.03)", radius: 8 }} />
                            <Bar dataKey="amount" radius={[10, 10, 4, 4]}>
                                {data.monthlyRevenue?.map((entry, i) => (
                                    <Cell key={i} fill={Number(entry.amount) === maxRevenue ? "url(#barGrad)" : "url(#barGradDim)"} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>

                    {data.monthlyRevenue?.length > 0 && (
                        <div className={`grid grid-cols-3 gap-4 mt-4 pt-4 border-t ${isLight ? "border-slate-100" : "border-white/5"}`}>
                            {[
                                { label: "Meilleur mois", value: fmtCurrency(Math.max(...data.monthlyRevenue.map(m => Number(m.amount)))), color: "text-emerald-500" },
                                { label: "Moyenne / mois", value: fmtCurrency(data.monthlyRevenue.reduce((s, m) => s + Number(m.amount), 0) / data.monthlyRevenue.length), color: isLight ? "text-slate-700" : "text-white" },
                                { label: "Total 6 mois", value: fmtCurrency(data.monthlyRevenue.reduce((s, m) => s + Number(m.amount), 0)), color: "text-orange-500" }
                            ].map((s, i) => (
                                <div key={i} className="text-center">
                                    <div className={`text-[10px] uppercase tracking-wider font-semibold mb-1.5 ${isLight ? "text-slate-400" : "text-slate-500"}`}>{s.label}</div>
                                    <div className={`font-black text-base ${s.color}`}>{s.value}</div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Alertes */}
                <div className={`rounded-2xl p-6 border flex flex-col
                    ${isLight ? "bg-white border-slate-100 shadow-sm" : "bg-[#0d1533] border-white/5"}`}>
                    <div className="flex items-center justify-between mb-5">
                        <div>
                            <h2 className={`font-black text-lg ${isLight ? "text-slate-800" : "text-white"}`}>
                                Alertes docs
                            </h2>
                            <p className={`text-xs mt-0.5 ${isLight ? "text-slate-400" : "text-slate-500"}`}>
                                À renouveler
                            </p>
                        </div>
                        {data.documentAlerts?.length > 0 && (
                            <span className="w-7 h-7 rounded-full bg-gradient-to-br from-red-500 to-rose-600 text-white text-xs font-black flex items-center justify-center shadow-lg shadow-red-500/40">
                                {data.documentAlerts.length}
                            </span>
                        )}
                    </div>

                    {data.documentAlerts?.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center gap-2 py-8">
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${isLight ? "bg-emerald-50 border border-emerald-100" : "bg-emerald-500/10 border border-emerald-500/20"}`}>
                                <CheckCircle size={28} className="text-emerald-500" />
                            </div>
                            <p className={`text-sm font-bold mt-2 ${isLight ? "text-slate-700" : "text-slate-200"}`}>Tout est en ordre !</p>
                            <p className={`text-xs text-center ${isLight ? "text-slate-400" : "text-slate-500"}`}>Aucun document à renouveler</p>
                        </div>
                    ) : (
                        <div className="space-y-2 flex-1 overflow-y-auto">
                            {data.documentAlerts.map((a, i) => <AlertRow key={i} alert={a} isLight={isLight} />)}
                        </div>
                    )}
                </div>
            </div>

            {/* ── Mes véhicules ─────────────────────────────────────────────── */}
            {data.myVehicles?.length > 0 && (
                <div>
                    <SectionHeader
                        title="Ma flotte"
                        sub={`${data.myVehicles.length} véhicule${data.myVehicles.length > 1 ? "s" : ""} enregistré${data.myVehicles.length > 1 ? "s" : ""}`}
                        href="/vehicles"
                        linkLabel="Gérer"
                        icon={Car}
                        isLight={isLight}
                    />
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                        {data.myVehicles.map((v) => <VehicleCard key={v.id} v={v} isLight={isLight} />)}
                    </div>
                </div>
            )}

            {/* ── Réservations récentes ─────────────────────────────────────── */}
            {data.recentReservations?.length > 0 && (
                <div>
                    <SectionHeader
                        title="Réservations récentes"
                        sub="Suivi en temps réel"
                        href="/reservations"
                        icon={CalendarCheck}
                        isLight={isLight}
                    />
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {data.recentReservations.map((r, i) => <ReservationRow key={i} r={r} isLight={isLight} />)}
                    </div>
                </div>
            )}

            {/* ── Planning flotte ──────────────────────────────────────────── */}
            {data.myVehicles?.length > 0 && (
                <div>
                    <SectionHeader
                        title="Planning flotte"
                        sub="Vue Gantt des réservations"
                        href="/reservations"
                        icon={CalendarCheck}
                        isLight={isLight}
                    />
                    <FleetPlanning
                        reservations={data.recentReservations || []}
                        vehicles={data.myVehicles || []}
                        isLight={isLight}
                    />
                </div>
            )}

            <div className={`text-center text-xs pb-2 ${isLight ? "text-slate-300" : "text-slate-700"}`}>
                Dernière mise à jour : {lastRefresh.toLocaleTimeString("fr-FR")}
            </div>
        </div>
    );
}

// ── Dashboard Utilisateur (USER simple) ──────────────────────────────────────
function UserDashboard({ data, user, isLight, fetchDashboard, lastRefresh }) {
    const today = new Date().toLocaleDateString("fr-FR", {
        weekday: "long", day: "numeric", month: "long", year: "numeric"
    });
    const todayCapitalized = today.charAt(0).toUpperCase() + today.slice(1);

    const now = new Date();
    const upcomingReservations = (data.myReservations || [])
        .filter(r => new Date(r.startDate) >= now || (new Date(r.startDate) <= now && new Date(r.endDate) >= now))
        .sort((a, b) => new Date(a.startDate) - new Date(b.startDate));

    const pastReservations = (data.myReservations || [])
        .filter(r => new Date(r.endDate) < now)
        .sort((a, b) => new Date(b.endDate) - new Date(a.endDate))
        .slice(0, 4);

    const totalReservations = data.myReservations?.length || 0;
    const totalSpent = data.myReservations?.reduce((sum, r) => sum + (Number(r.totalPrice) || 0), 0) || 0;
    const completedReservations = data.myReservations?.filter(r => r.status === "TERMINE").length || 0;

    const kpis = [
        { icon: CalendarCheck, label: "Réservations", value: totalReservations, sub: `${upcomingReservations.length} à venir`, gradient: "from-orange-500 to-amber-500" },
        { icon: CreditCard, label: "Total dépensé", value: fmtCurrency(totalSpent), sub: "toutes locations", gradient: "from-emerald-500 to-teal-500" },
        { icon: CheckCircle, label: "Terminées", value: completedReservations, sub: "locations effectuées", gradient: "from-blue-500 to-cyan-500" },
        { icon: FileText, label: "Documents", value: data.totalDocuments || 0, sub: "pièces enregistrées", gradient: "from-violet-500 to-purple-500" },
    ];

    const nextRes = upcomingReservations[0];
    const nextDaysUntil = nextRes ? Math.ceil((new Date(nextRes.startDate) - now) / (1000 * 60 * 60 * 24)) : null;

    return (
        <div className={`p-5 lg:p-8 space-y-8 min-h-screen ${isLight ? "bg-slate-50" : "bg-[#050721]"}`}>

            {/* ── Hero utilisateur ─────────────────────────────────────────── */}
            <div className={`relative rounded-3xl overflow-hidden
                ${isLight
                    ? "bg-white border border-slate-100 shadow-md"
                    : "bg-gradient-to-br from-[#0d1533] via-[#111b46] to-[#0a1128]"
                }`}>
                <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-orange-500/15 blur-3xl pointer-events-none" />
                <div className="absolute -bottom-8 left-1/4 w-48 h-48 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />

                <div className="relative p-6 lg:p-8">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                        <div>
                            <div className="flex items-center gap-4 mb-3">
                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-xl shadow-orange-500/40 shrink-0">
                                    <span className="text-white font-black text-xl">
                                        {(user?.firstname || "U")[0].toUpperCase()}
                                    </span>
                                </div>
                                <div>
                                    <p className={`text-xs font-semibold uppercase tracking-widest mb-1 ${isLight ? "text-slate-400" : "text-orange-400/70"}`}>
                                        Espace client
                                    </p>
                                    <h1 className={`text-2xl lg:text-3xl font-black ${isLight ? "text-slate-800" : "text-white"}`}>
                                        {greetingByTime(user?.firstname || "vous")} !
                                    </h1>
                                </div>
                            </div>
                            <span className={`flex items-center gap-1.5 text-xs ml-1 ${isLight ? "text-slate-400" : "text-white/40"}`}>
                                <Clock size={12} /> {todayCapitalized}
                            </span>
                        </div>

                        {/* Prochaine réservation */}
                        {nextRes ? (
                            <div className="rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 p-5 min-w-[210px] shadow-xl shadow-orange-500/30 shrink-0">
                                <div className="flex justify-between items-start mb-3">
                                    <p className="text-white/80 text-xs font-bold uppercase tracking-wide">Prochaine location</p>
                                    <Calendar size={14} className="text-white/60" />
                                </div>
                                <p className="text-white font-black text-lg leading-tight mb-1">
                                    {nextRes.vehicleBrand} {nextRes.vehicleModel}
                                </p>
                                <p className="text-white/70 text-xs mb-3">{fmtDateLong(nextRes.startDate)}</p>
                                {nextDaysUntil !== null && nextDaysUntil >= 0 && (
                                    <div className="rounded-xl bg-white/20 px-3 py-1.5 text-center">
                                        <span className="text-white font-black text-sm">
                                            {nextDaysUntil === 0 ? "Aujourd'hui !" : `J-${nextDaysUntil}`}
                                        </span>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <a href="/reservations"
                               className="rounded-2xl border-2 border-dashed border-orange-500/40 p-5 min-w-[200px] flex flex-col items-center gap-3 group hover:border-orange-500/70 transition-colors shrink-0">
                                <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center group-hover:bg-orange-500/20 transition-colors">
                                    <CalendarCheck size={24} className="text-orange-500" />
                                </div>
                                <p className={`text-sm font-bold text-center ${isLight ? "text-slate-600" : "text-slate-300"}`}>
                                    Réserver un véhicule
                                </p>
                                <span className="text-xs text-orange-400 font-semibold flex items-center gap-1">
                                    Voir les véhicules <ArrowRight size={12} />
                                </span>
                            </a>
                        )}
                    </div>
                </div>
            </div>

            {/* ── KPIs ─────────────────────────────────────────────────────── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {kpis.map((k, i) => <KpiCard key={i} {...k} isLight={isLight} />)}
            </div>

            {/* ── Réservations à venir ─────────────────────────────────────── */}
            <div>
                <SectionHeader
                    title="Mes prochaines réservations"
                    sub={`${upcomingReservations.length} réservation${upcomingReservations.length > 1 ? "s" : ""} à venir`}
                    href="/reservations"
                    icon={CalendarCheck}
                    isLight={isLight}
                />

                {upcomingReservations.length === 0 ? (
                    <div className={`rounded-2xl p-10 border text-center
                        ${isLight ? "bg-white border-slate-100 shadow-sm" : "bg-[#0d1533] border-white/5"}`}>
                        <div className={`w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center
                            ${isLight ? "bg-slate-100 border border-slate-200" : "bg-white/5 border border-white/10"}`}>
                            <Calendar size={32} className={isLight ? "text-slate-300" : "text-slate-600"} />
                        </div>
                        <p className={`font-bold text-base mb-1 ${isLight ? "text-slate-700" : "text-slate-200"}`}>
                            Aucune réservation à venir
                        </p>
                        <p className={`text-sm mb-5 ${isLight ? "text-slate-400" : "text-slate-500"}`}>
                            Réservez dès maintenant votre prochain véhicule
                        </p>
                        <a href="/reservations"
                           className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-sm font-bold rounded-xl shadow-lg shadow-orange-500/30 hover:brightness-110 transition-all">
                            <CalendarCheck size={16} />
                            Nouvelle réservation
                        </a>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {upcomingReservations.slice(0, 4).map((r, i) => (
                            <UserReservationCard key={i} r={r} isLight={isLight} isUpcoming />
                        ))}
                    </div>
                )}
            </div>

            {/* ── Historique ───────────────────────────────────────────────── */}
            {pastReservations.length > 0 && (
                <div>
                    <SectionHeader
                        title="Historique"
                        sub="Vos dernières locations"
                        icon={History}
                        isLight={isLight}
                    />
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {pastReservations.map((r, i) => (
                            <UserReservationCard key={i} r={r} isLight={isLight} isUpcoming={false} />
                        ))}
                    </div>
                </div>
            )}

            {/* ── Accès rapides ────────────────────────────────────────────── */}
            <div>
                <SectionHeader title="Accès rapides" isLight={isLight} />
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[
                        { href: "/documents", icon: FileText, label: "Mes documents", sub: "Gérer mes pièces justificatives", iconBg: isLight ? "bg-violet-50 border-violet-100" : "bg-violet-500/10 border-violet-500/20", iconColor: "text-violet-500" },
                        { href: "/settings", icon: UserCircle, label: "Mon profil", sub: "Modifier mes informations", iconBg: isLight ? "bg-blue-50 border-blue-100" : "bg-blue-500/10 border-blue-500/20", iconColor: "text-blue-500" },
                        { href: "/messages", icon: Star, label: "Messages", sub: "Contacter le support", iconBg: isLight ? "bg-emerald-50 border-emerald-100" : "bg-emerald-500/10 border-emerald-500/20", iconColor: "text-emerald-500" },
                    ].map(({ href, icon: Icon, label, sub, iconBg, iconColor }) => (
                        <a key={href} href={href}
                           className={`rounded-2xl p-5 border transition-all duration-300 flex items-center gap-4 group hover:-translate-y-0.5
                            ${isLight
                                ? "bg-white border-slate-100 hover:border-orange-200 shadow-sm hover:shadow-lg hover:shadow-orange-500/10"
                                : "bg-[#0d1533] border-white/5 hover:border-orange-500/20"}`}>
                            <div className={`p-3 rounded-xl border ${iconBg} shrink-0 group-hover:scale-110 transition-transform`}>
                                <Icon size={22} className={iconColor} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className={`font-bold ${isLight ? "text-slate-800" : "text-white"}`}>{label}</p>
                                <p className={`text-xs mt-0.5 ${isLight ? "text-slate-400" : "text-slate-500"}`}>{sub}</p>
                            </div>
                            <ArrowUpRight size={18} className={`shrink-0 transition-all group-hover:text-orange-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 ${isLight ? "text-slate-300" : "text-slate-600"}`} />
                        </a>
                    ))}
                </div>
            </div>

            <div className={`text-center text-xs pb-2 ${isLight ? "text-slate-300" : "text-slate-700"}`}>
                Dernière mise à jour : {lastRefresh.toLocaleTimeString("fr-FR")}
            </div>
        </div>
    );
}

// ── Page principale ───────────────────────────────────────────────────────────
export default function Dashboard() {
    const { user } = useAuth();
    const { isDark } = useTheme();
    const isLight = !isDark;

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [lastRefresh, setLastRefresh] = useState(new Date());

    const getUserRoles = () => {
        if (!user?.roles) return [];
        if (Array.isArray(user.roles)) return user.roles.map(r => r.toUpperCase());
        return String(user.roles).toUpperCase().split(",").map(r => r.trim());
    };
    const userRoles = getUserRoles();
    const isLoueur = userRoles.some(role => ["ADMIN", "ALP", "PARTENAIRE"].includes(role));

    const fetchDashboard = async () => {
        setLoading(true);
        try {
            const endpoint = isLoueur ? "/api/dashboard" : "/api/dashboard/user";
            const res = await api.get(endpoint);
            setData(res.data);
            setLastRefresh(new Date());
        } catch (err) {
            console.error("Dashboard error:", err);
            try {
                const fallbackRes = await api.get("/api/dashboard");
                setData(fallbackRes.data);
            } catch {
                setData({});
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchDashboard(); }, [isLoueur]);

    if (loading) return (
        <div className="h-full flex items-center justify-center min-h-[400px]">
            <Spinner size="lg" color="warning" label="Chargement du dashboard..." />
        </div>
    );

    if (!data) return (
        <div className={`p-8 text-center ${isLight ? "text-slate-500" : "text-slate-400"}`}>
            Impossible de charger les données.
        </div>
    );

    if (isLoueur) {
        return <LoueurDashboard data={data} user={user} isLight={isLight} fetchDashboard={fetchDashboard} lastRefresh={lastRefresh} />;
    }

    return <UserDashboard data={data} user={user} isLight={isLight} fetchDashboard={fetchDashboard} lastRefresh={lastRefresh} />;
}
