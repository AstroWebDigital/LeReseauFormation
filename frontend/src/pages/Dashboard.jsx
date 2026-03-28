import React, { useState, useEffect } from "react";
import { Spinner, Avatar } from "@heroui/react";
import {
    Car, FileText, CalendarCheck, TrendingUp, AlertTriangle,
    RefreshCw, MapPin, Fuel, ChevronRight, Clock, Star,
    BarChart2, CheckCircle, XCircle, AlertCircle
} from "lucide-react";
import api from "@/services/auth/client";
import { useAuth } from "@/auth/AuthContext";
import { useTheme } from "@/theme/ThemeProvider";

// ── Recharts pour le graphique ────────────────────────────────────────────────
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, Cell
} from "recharts";

// ── Helpers ───────────────────────────────────────────────────────────────────
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
    const dark = { AVAILABLE: "text-emerald-400 bg-emerald-400/10", RENTED: "text-orange-400 bg-orange-400/10", BLOCKED: "text-red-400 bg-red-400/10", MAINTENANCE: "text-yellow-400 bg-yellow-400/10" };
    const light = { AVAILABLE: "text-emerald-600 bg-emerald-50", RENTED: "text-orange-600 bg-orange-50", BLOCKED: "text-red-600 bg-red-50", MAINTENANCE: "text-yellow-600 bg-yellow-50" };
    return (isLight ? light : dark)[s] || (isLight ? "text-slate-500 bg-slate-100" : "text-slate-400 bg-slate-700");
};

const resStatusLabel = (s) => {
    const map = { EN_COURS: "En cours", EN_ATTENTE: "En attente", CONFIRME: "Confirmée", ANNULE: "Annulée", TERMINE: "Terminée" };
    return map[s] || s;
};
const resStatusColor = (s) => {
    const map = { EN_COURS: "text-blue-400 bg-blue-400/10", EN_ATTENTE: "text-orange-400 bg-orange-400/10", CONFIRME: "text-emerald-400 bg-emerald-400/10", ANNULE: "text-red-400 bg-red-400/10", TERMINE: "text-slate-400 bg-slate-400/10" };
    return map[s] || "text-slate-400 bg-slate-400/10";
};

const fmtDate = (d) => d ? new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" }) : "—";
const fmtCurrency = (n) => n != null ? `${Number(n).toLocaleString("fr-FR")}€` : "—";

const greetingByTime = (name) => {
    const h = new Date().getHours();
    const prefix = h < 12 ? "Bonjour" : h < 18 ? "Bon après-midi" : "Bonsoir";
    return `${prefix} ${name} 👋`;
};

// ── Sous-composants ───────────────────────────────────────────────────────────

function KpiCard({ icon: Icon, label, value, sub, accent, isLight }) {
    return (
        <div className={`rounded-2xl p-5 flex flex-col gap-3 transition-all
            ${isLight ? "bg-white border border-slate-200 shadow-sm hover:shadow-md" : "bg-[#0d1533] border border-white/5 hover:border-white/10"}`}>
            <div className="flex items-center justify-between">
                <span className={`text-xs font-semibold uppercase tracking-widest ${isLight ? "text-slate-400" : "text-slate-500"}`}>{label}</span>
                <div className={`p-2 rounded-xl ${accent}`}>
                    <Icon size={16} className="text-white" />
                </div>
            </div>
            <div className={`text-3xl font-bold ${isLight ? "text-slate-800" : "text-white"}`}>{value}</div>
            {sub && <div className={`text-xs ${isLight ? "text-slate-400" : "text-slate-500"}`}>{sub}</div>}
        </div>
    );
}

function VehicleCard({ v, isLight }) {
    const photo = resolvePhoto(v.profilPhoto);
    return (
        <div className={`rounded-2xl overflow-hidden border transition-all group
            ${isLight
            ? "bg-white border-slate-200 hover:border-orange-300 shadow-sm hover:shadow-md"
            : "bg-[#0d1533] border-white/5 hover:border-orange-500/30 hover:shadow-orange-500/10 shadow-lg"}`}>
            {/* Image */}
            <div className={`relative h-36 flex items-center justify-center overflow-hidden
                ${isLight ? "bg-slate-100" : "bg-[#080f28]"}`}>
                {photo
                    ? <img src={photo} alt={`${v.brand} ${v.model}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    : <Car size={40} className={isLight ? "text-slate-300" : "text-white/10"} />
                }
                <span className={`absolute top-2 right-2 text-xs font-bold px-2 py-1 rounded-lg ${statusColor(v.status, isLight)}`}>
                    {statusLabel(v.status)}
                </span>
            </div>

            {/* Body */}
            <div className="p-4 flex flex-col gap-3">
                <div>
                    <h3 className={`font-bold text-base ${isLight ? "text-slate-800" : "text-white"}`}>
                        {v.brand} <span className="text-orange-400">{v.model}</span>
                    </h3>
                    <p className={`text-xs ${isLight ? "text-slate-400" : "text-slate-500"}`}>
                        {v.year} · {v.licensePlate}
                    </p>
                </div>

                {v.defaultParkingLocation && (
                    <div className={`flex items-center gap-1 text-xs ${isLight ? "text-slate-500" : "text-slate-400"}`}>
                        <MapPin size={12} className="text-orange-400" />
                        {v.defaultParkingLocation}
                    </div>
                )}

                {/* Stats */}
                <div className={`grid grid-cols-2 gap-2 rounded-xl p-3 ${isLight ? "bg-slate-50" : "bg-white/5"}`}>
                    <div>
                        <div className={`text-[10px] uppercase tracking-wider ${isLight ? "text-slate-400" : "text-slate-500"}`}>Occupation</div>
                        <div className={`font-bold text-sm ${isLight ? "text-slate-700" : "text-white"}`}>{v.occupancyRate}%</div>
                        <div className={`h-1 rounded-full mt-1 ${isLight ? "bg-slate-200" : "bg-white/10"}`}>
                            <div className="h-full rounded-full bg-orange-400 transition-all" style={{ width: `${v.occupancyRate}%` }} />
                        </div>
                    </div>
                    <div>
                        <div className={`text-[10px] uppercase tracking-wider ${isLight ? "text-slate-400" : "text-slate-500"}`}>CA/mois</div>
                        <div className={`font-bold text-sm ${isLight ? "text-slate-700" : "text-white"}`}>{fmtCurrency(v.monthlyRevenue)}</div>
                    </div>
                </div>

                {/* Details */}
                <div className={`text-xs space-y-1 ${isLight ? "text-slate-500" : "text-slate-400"}`}>
                    <div className="flex justify-between"><span>Carburant</span><span className={isLight ? "text-slate-700" : "text-slate-200"}>{v.fuel}</span></div>
                    <div className="flex justify-between"><span>Kilométrage</span><span className={isLight ? "text-slate-700" : "text-slate-200"}>{v.mileage?.toLocaleString("fr-FR")} km</span></div>
                    <div className="flex justify-between"><span>Tarif/jour</span><span className="text-orange-400 font-semibold">{fmtCurrency(v.baseDailyPrice)}</span></div>
                </div>

                {/* Maintenance date */}
                {v.lastMaintenanceDate && (
                    <div className={`text-xs border-t pt-2 flex justify-between ${isLight ? "border-slate-100 text-slate-400" : "border-white/5 text-slate-500"}`}>
                        <span>Dernier entretien</span>
                        <span>{fmtDate(v.lastMaintenanceDate)}</span>
                    </div>
                )}
            </div>
        </div>
    );
}

function ReservationRow({ r, isLight }) {
    const progress = (() => {
        if (!r.startDate || !r.endDate) return 0;
        const start = new Date(r.startDate), end = new Date(r.endDate), now = new Date();
        if (now < start) return 0;
        if (now > end) return 100;
        return Math.round(((now - start) / (end - start)) * 100);
    })();

    return (
        <div className={`rounded-2xl p-4 border transition-all
            ${isLight ? "bg-white border-slate-200 shadow-sm" : "bg-[#0d1533] border-white/5"}`}>
            <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex items-center gap-3">
                    <Avatar
                        name={r.customerName || "Client"}
                        size="sm"
                        className={`font-bold ${isLight ? "bg-slate-200 text-slate-600" : "bg-white/10 text-white"}`}
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
                <div className="flex items-center gap-3 shrink-0">
                    <span className="text-orange-400 font-bold text-sm">{fmtCurrency(r.totalPrice)}</span>
                    <span className={`text-xs font-semibold px-2 py-1 rounded-lg ${resStatusColor(r.status)}`}>
                        {resStatusLabel(r.status)}
                    </span>
                </div>
            </div>

            <div className={`flex items-center gap-2 text-xs mb-3 ${isLight ? "text-slate-400" : "text-slate-500"}`}>
                <Clock size={12} />
                {fmtDate(r.startDate)} → {fmtDate(r.endDate)}
            </div>

            <div className={`h-1.5 rounded-full ${isLight ? "bg-slate-100" : "bg-white/5"}`}>
                <div className="h-full rounded-full bg-gradient-to-r from-orange-500 to-orange-400 transition-all" style={{ width: `${progress}%` }} />
            </div>
            <div className={`text-right text-[10px] mt-1 ${isLight ? "text-slate-400" : "text-slate-600"}`}>{progress}%</div>
        </div>
    );
}

function AlertRow({ alert, isLight }) {
    const iconMap = { high: XCircle, medium: AlertCircle, low: CheckCircle };
    const colorMap = { high: "text-red-400", medium: "text-orange-400", low: "text-emerald-400" };
    const bgMap = { high: "bg-red-500/10", medium: "bg-orange-500/10", low: "bg-emerald-500/10" };
    const Icon = iconMap[alert.severity] || AlertCircle;

    return (
        <div className={`flex items-center gap-3 p-3 rounded-xl border transition-all
            ${isLight ? "bg-white border-slate-200" : "bg-white/3 border-white/5"}`}>
            <div className={`p-2 rounded-lg ${bgMap[alert.severity]}`}>
                <Icon size={16} className={colorMap[alert.severity]} />
            </div>
            <div className="flex-1 min-w-0">
                <p className={`text-sm font-semibold truncate ${isLight ? "text-slate-700" : "text-white"}`}>
                    {alert.type?.replace("_", " ")} — {alert.vehicleName}
                </p>
                <p className={`text-xs ${isLight ? "text-slate-400" : "text-slate-500"}`}>
                    {alert.status === "expire" ? "Expiré le" : "Expire le"} {fmtDate(alert.expirationDate)}
                </p>
            </div>
            <span className={`text-xs font-bold px-2 py-1 rounded-lg shrink-0
                ${alert.severity === "high" ? "text-red-400 bg-red-400/10" : "text-orange-400 bg-orange-400/10"}`}>
                {alert.severity}
            </span>
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

    const fetchDashboard = async () => {
        setLoading(true);
        try {
            const res = await api.get("/api/dashboard");
            setData(res.data);
            setLastRefresh(new Date());
        } catch (err) {
            console.error("Dashboard error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchDashboard(); }, []);

    const today = new Date().toLocaleDateString("fr-FR", {
        weekday: "long", day: "numeric", month: "long", year: "numeric"
    });
    const todayCapitalized = today.charAt(0).toUpperCase() + today.slice(1);

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

    const kpis = [
        {
            icon: Car,
            label: "Véhicules",
            value: data.totalVehicles,
            sub: `${data.availableVehicles} dispo · ${data.rentedVehicles} loués`,
            accent: "bg-orange-500"
        },
        {
            icon: CalendarCheck,
            label: "Réservations",
            value: data.activeReservations,
            sub: `${data.pendingReservations} en attente`,
            accent: "bg-blue-500"
        },
        {
            icon: FileText,
            label: "Documents",
            value: data.totalDocuments,
            sub: `${data.expiredDocuments} expirés · ${data.expiringDocuments} bientôt`,
            accent: data.expiredDocuments > 0 ? "bg-red-500" : "bg-emerald-500"
        },
        {
            icon: TrendingUp,
            label: "Tarif moyen",
            value: `${Number(data.averageDailyRate || 0).toFixed(0)}€`,
            sub: "par jour",
            accent: "bg-violet-500"
        },
    ];

    const maxRevenue = Math.max(...(data.monthlyRevenue?.map(m => Number(m.amount)) || [1]));

    return (
        <div className={`p-6 lg:p-8 space-y-8 min-h-screen ${isLight ? "bg-slate-50" : ""}`}>

            {/* ── Hero banner ──────────────────────────────────────────────── */}
            <div className={`rounded-3xl p-6 lg:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative overflow-hidden
                ${isLight
                ? "bg-white border border-slate-200 shadow-sm"
                : "bg-gradient-to-r from-[#0d1533] via-[#111b46] to-[#0a1128]"
            }`}>
                {/* Glow */}
                <div className={`absolute -top-10 -right-10 w-48 h-48 rounded-full blur-3xl pointer-events-none ${isLight ? "bg-orange-500/10" : "bg-orange-500/20"}`} />
                <div className={`absolute -bottom-10 left-1/3 w-32 h-32 rounded-full blur-2xl pointer-events-none ${isLight ? "bg-blue-500/5" : "bg-blue-500/10"}`} />

                <div className="relative">
                    <div className="flex items-center gap-3 mb-1">
                        <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/40">
                            <BarChart2 size={20} className="text-white" />
                        </div>
                        <h1 className={`text-2xl lg:text-3xl font-bold ${isLight ? "text-slate-800" : "text-white"}`}>
                            {greetingByTime(user?.firstname || "vous")}
                        </h1>
                    </div>
                    <p className={`text-sm ml-13 pl-1 ${isLight ? "text-slate-400" : "text-white/50"}`}>Content de vous revoir sur Le Réseau Location.</p>
                    <div className="flex items-center gap-4 mt-4">
                        <span className={`flex items-center gap-2 text-xs ${isLight ? "text-slate-400" : "text-white/40"}`}>
                            <Clock size={12} /> {todayCapitalized}
                        </span>
                        <span className="flex items-center gap-2 text-emerald-500 text-xs font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Système opérationnel
                        </span>
                    </div>
                </div>

                <div className="flex gap-3 relative">
                    {/* Objectif card */}
                    <div className="rounded-2xl bg-emerald-500 p-4 min-w-[140px] shadow-lg shadow-emerald-500/30">
                        <div className="flex justify-between items-start mb-2">
                            <p className="text-white/80 text-xs font-medium">Véhicules actifs</p>
                            <TrendingUp size={14} className="text-white/60" />
                        </div>
                        <p className="text-3xl font-bold text-white">{data.rentedVehicles}</p>
                        <div className="h-1.5 rounded-full bg-white/20 mt-2">
                            <div className="h-full rounded-full bg-white transition-all"
                                 style={{ width: `${data.totalVehicles > 0 ? (data.rentedVehicles / data.totalVehicles) * 100 : 0}%` }} />
                        </div>
                        <p className="text-white/60 text-[10px] mt-1">sur {data.totalVehicles} véhicules</p>
                    </div>

                    {/* Alertes card */}
                    {data.expiredDocuments + data.expiringDocuments > 0 && (
                        <div className="rounded-2xl bg-orange-500 p-4 min-w-[140px] shadow-lg shadow-orange-500/30">
                            <div className="flex justify-between items-start mb-2">
                                <p className="text-white/80 text-xs font-medium">Alertes docs</p>
                                <AlertTriangle size={14} className="text-white/60" />
                            </div>
                            <p className="text-3xl font-bold text-white">{data.expiredDocuments + data.expiringDocuments}</p>
                            <p className="text-white/60 text-[10px] mt-2">{data.expiredDocuments} expirés · {data.expiringDocuments} bientôt</p>
                        </div>
                    )}
                </div>
            </div>

            {/* ── KPIs ─────────────────────────────────────────────────────── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {kpis.map((k, i) => (
                    <KpiCard key={i} {...k} isLight={isLight} />
                ))}
            </div>

            {/* ── Graphique CA + Alertes ────────────────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Graphique CA */}
                <div className={`lg:col-span-2 rounded-2xl p-6 border
                    ${isLight ? "bg-white border-slate-200 shadow-sm" : "bg-[#0d1533] border-white/5"}`}>
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className={`font-bold text-lg ${isLight ? "text-slate-800" : "text-white"}`}>
                                Évolution du chiffre d'affaires
                            </h2>
                            <p className={`text-xs ${isLight ? "text-slate-400" : "text-slate-500"}`}>
                                6 derniers mois · basé sur les réservations
                            </p>
                        </div>
                        <button onClick={fetchDashboard}
                                className={`flex items-center gap-2 text-xs px-3 py-2 rounded-xl transition-all
                                ${isLight ? "bg-slate-100 text-slate-600 hover:bg-slate-200" : "bg-white/5 text-slate-400 hover:bg-white/10"}`}>
                            <RefreshCw size={13} /> Actualiser
                        </button>
                    </div>

                    <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={data.monthlyRevenue} barSize={32}>
                            <CartesianGrid strokeDasharray="3 3" stroke={isLight ? "#f1f5f9" : "#1e2d5a"} vertical={false} />
                            <XAxis dataKey="month" tick={{ fill: isLight ? "#94a3b8" : "#475569", fontSize: 12 }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fill: isLight ? "#94a3b8" : "#475569", fontSize: 11 }} axisLine={false} tickLine={false}
                                   tickFormatter={(v) => `${v}€`} />
                            <Tooltip
                                contentStyle={{
                                    background: isLight ? "#fff" : "#0d1533",
                                    border: isLight ? "1px solid #e2e8f0" : "1px solid rgba(255,255,255,0.1)",
                                    borderRadius: 12,
                                    color: isLight ? "#1e293b" : "#fff"
                                }}
                                formatter={(v) => [`${v}€`, "CA"]}
                            />
                            <Bar dataKey="amount" radius={[8, 8, 0, 0]}>
                                {data.monthlyRevenue?.map((entry, i) => (
                                    <Cell key={i}
                                          fill={Number(entry.amount) === maxRevenue ? "#ff922b" : isLight ? "#fed7aa" : "#1e3a5f"}
                                    />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>

                    {/* Stats bas de graphique */}
                    {data.monthlyRevenue?.length > 0 && (
                        <div className={`grid grid-cols-3 gap-4 mt-4 pt-4 border-t ${isLight ? "border-slate-100" : "border-white/5"}`}>
                            {[
                                {
                                    label: "Meilleur mois",
                                    value: fmtCurrency(Math.max(...data.monthlyRevenue.map(m => Number(m.amount)))),
                                    color: "text-emerald-400"
                                },
                                {
                                    label: "Moyenne mensuelle",
                                    value: fmtCurrency(
                                        data.monthlyRevenue.reduce((s, m) => s + Number(m.amount), 0) / data.monthlyRevenue.length
                                    ),
                                    color: isLight ? "text-slate-700" : "text-white"
                                },
                                {
                                    label: "Total 6 mois",
                                    value: fmtCurrency(data.monthlyRevenue.reduce((s, m) => s + Number(m.amount), 0)),
                                    color: "text-orange-400"
                                }
                            ].map((s, i) => (
                                <div key={i} className="text-center">
                                    <div className={`text-[10px] uppercase tracking-wider mb-1 ${isLight ? "text-slate-400" : "text-slate-500"}`}>{s.label}</div>
                                    <div className={`font-bold text-sm ${s.color}`}>{s.value}</div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Alertes */}
                <div className={`rounded-2xl p-6 border flex flex-col
                    ${isLight ? "bg-white border-slate-200 shadow-sm" : "bg-[#0d1533] border-white/5"}`}>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className={`font-bold text-lg ${isLight ? "text-slate-800" : "text-white"}`}>
                            Alertes documents
                        </h2>
                        {data.documentAlerts?.length > 0 && (
                            <span className="w-6 h-6 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center">
                                {data.documentAlerts.length}
                            </span>
                        )}
                    </div>

                    {data.documentAlerts?.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center gap-2 py-8">
                            <CheckCircle size={32} className="text-emerald-400" />
                            <p className={`text-sm font-medium ${isLight ? "text-slate-600" : "text-slate-300"}`}>Tout est en ordre !</p>
                            <p className={`text-xs ${isLight ? "text-slate-400" : "text-slate-500"}`}>Aucun document à renouveler</p>
                        </div>
                    ) : (
                        <div className="space-y-2 flex-1 overflow-y-auto">
                            {data.documentAlerts.map((a, i) => (
                                <AlertRow key={i} alert={a} isLight={isLight} />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* ── Mes véhicules ─────────────────────────────────────────────── */}
            {data.myVehicles?.length > 0 && (
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h2 className={`font-bold text-xl ${isLight ? "text-slate-800" : "text-white"}`}>
                                🚗 Mes véhicules en détail
                            </h2>
                            <p className={`text-xs ${isLight ? "text-slate-400" : "text-slate-500"}`}>
                                Vue d'ensemble de votre flotte
                            </p>
                        </div>
                        <a href="/vehicles"
                           className="flex items-center gap-1 text-orange-400 text-sm font-semibold hover:text-orange-300 transition-colors">
                            Gérer la flotte <ChevronRight size={16} />
                        </a>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                        {data.myVehicles.map((v) => (
                            <VehicleCard key={v.id} v={v} isLight={isLight} />
                        ))}
                    </div>
                </div>
            )}

            {/* ── Réservations récentes ─────────────────────────────────────── */}
            {data.recentReservations?.length > 0 && (
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h2 className={`font-bold text-xl ${isLight ? "text-slate-800" : "text-white"}`}>
                                📋 Réservations récentes
                            </h2>
                            <p className={`text-xs ${isLight ? "text-slate-400" : "text-slate-500"}`}>
                                Suivi en temps réel
                            </p>
                        </div>
                        <a href="/reservations"
                           className="flex items-center gap-1 text-orange-400 text-sm font-semibold hover:text-orange-300 transition-colors">
                            Voir tout <ChevronRight size={16} />
                        </a>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {data.recentReservations.map((r, i) => (
                            <ReservationRow key={i} r={r} isLight={isLight} />
                        ))}
                    </div>
                </div>
            )}

            {/* Footer refresh info */}
            <div className={`text-center text-xs pb-2 ${isLight ? "text-slate-300" : "text-slate-700"}`}>
                Dernière mise à jour : {lastRefresh.toLocaleTimeString("fr-FR")}
            </div>
        </div>
    );
}
