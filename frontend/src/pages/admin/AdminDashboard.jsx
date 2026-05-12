import React, { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Spinner } from "@heroui/react";
import {
    Users, Car, CalendarCheck, FileText, AlertTriangle,
    CheckCircle, XCircle, Clock, Shield, TrendingUp,
    ChevronRight, RefreshCw, ArrowUpRight, Truck,
    UserCheck, UserX, Activity, Euro,
} from "lucide-react";
import api from "@/services/auth/client";
import { useTheme } from "@/theme/ThemeProvider";
import { useNotifications } from "@/context/NotificationsContext";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8080";
const resolveUrl = (url) => {
    if (!url) return null;
    if (url.startsWith("http")) return url;
    return `${API_BASE}${url.startsWith("/") ? url : "/" + url}`;
};

const fmtDate = (d) => d ? new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" }) : "—";
const fmtCurrency = (n) => n != null ? `${Number(n).toLocaleString("fr-FR")} €` : "—";

const STATUS_RES = {
    en_attente: { label: "En attente",  cls: "text-amber-400 bg-amber-400/10 border-amber-400/20" },
    accepte:    { label: "Confirmée",   cls: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20" },
    refuse:     { label: "Refusée",     cls: "text-red-400 bg-red-400/10 border-red-400/20" },
};
const STATUS_VEH = {
    en_attente: { label: "En attente",  cls: "text-amber-400 bg-amber-400/10 border-amber-400/20" },
    disponible: { label: "Disponible",  cls: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20" },
    rejete:     { label: "Rejeté",      cls: "text-red-400 bg-red-400/10 border-red-400/20" },
    reserve:    { label: "Réservé",     cls: "text-blue-400 bg-blue-400/10 border-blue-400/20" },
};

// ─── KPI Card ─────────────────────────────────────────────────────────────────
function KpiCard({ icon: Icon, label, value, sub, gradient, badge, isLight }) {
    return (
        <div className={`relative rounded-2xl p-3.5 sm:p-5 flex flex-col gap-2.5 sm:gap-3 overflow-hidden transition-all duration-300 group cursor-default
            ${isLight
                ? "bg-white border border-slate-100 shadow-sm hover:shadow-lg hover:shadow-slate-200/60 hover:-translate-y-0.5"
                : "bg-[#0d1533] border border-white/5 hover:border-white/10 hover:-translate-y-0.5"}`}>
            <div className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${gradient} opacity-70 group-hover:opacity-100 transition-opacity`} />
            <div className={`absolute -top-8 -right-8 w-24 h-24 rounded-full blur-2xl bg-gradient-to-br ${gradient} opacity-10 group-hover:opacity-20 transition-opacity`} />
            <div className="flex items-start justify-between gap-2 relative">
                <span className={`text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider leading-tight ${isLight ? "text-slate-400" : "text-slate-500"}`}>{label}</span>
                <div className="relative shrink-0">
                    <div className={`p-2 sm:p-2.5 rounded-xl bg-gradient-to-br ${gradient} shadow-lg`}>
                        <Icon size={14} className="text-white sm:hidden" />
                        <Icon size={16} className="text-white hidden sm:block" />
                    </div>
                    {badge > 0 && (
                        <span className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-red-500 text-white text-[0.55rem] font-bold flex items-center justify-center ring-2 ring-[#0d1533]">
                            {badge > 9 ? "9+" : badge}
                        </span>
                    )}
                </div>
            </div>
            <div className="relative">
                <div className={`text-2xl sm:text-3xl font-black tracking-tight ${isLight ? "text-slate-800" : "text-white"}`}>{value}</div>
                {sub && <div className={`text-[11px] sm:text-xs mt-0.5 ${isLight ? "text-slate-400" : "text-slate-500"}`}>{sub}</div>}
            </div>
        </div>
    );
}

// ─── Section header ───────────────────────────────────────────────────────────
function SectionHeader({ title, sub, to, isLight }) {
    return (
        <div className="flex items-center justify-between mb-4">
            <div>
                <h2 className={`text-base font-bold ${isLight ? "text-slate-800" : "text-white"}`}>{title}</h2>
                {sub && <p className={`text-xs mt-0.5 ${isLight ? "text-slate-400" : "text-slate-500"}`}>{sub}</p>}
            </div>
            {to && (
                <Link to={to} className="flex items-center gap-1 text-xs font-semibold text-orange-400 hover:text-orange-300 transition-colors">
                    Voir tout <ChevronRight size={14} />
                </Link>
            )}
        </div>
    );
}

// ─── Pending reservation row ──────────────────────────────────────────────────
function PendingResRow({ r, onApprove, onReject, loading, isLight }) {
    const [showLicense, setShowLicense] = React.useState(false);
    const hasLicense = r.customerLicenseNumber || r.customerLicensePhotoFront;
    return (
        <div className={`rounded-xl border overflow-hidden transition-colors ${
            isLight ? "bg-slate-50 border-slate-100" : "bg-white/3 border-white/5"
        }`}>
            <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3">
                <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold truncate ${isLight ? "text-slate-800" : "text-white"}`}>
                        {r.vehicleBrand} {r.vehicleModel}
                    </p>
                    <p className={`text-xs truncate ${isLight ? "text-slate-500" : "text-slate-400"}`}>
                        <span className="hidden sm:inline">{r.customerName} · </span>
                        {fmtDate(r.startDate)} → {fmtDate(r.endDate)}
                    </p>
                </div>
                <span className={`hidden sm:inline text-xs font-semibold px-2 py-0.5 rounded-full border shrink-0 ${isLight ? "text-orange-600 bg-orange-50 border-orange-200" : "text-orange-400 bg-orange-400/10 border-orange-400/20"}`}>
                    {fmtCurrency(r.totalAmount)}
                </span>
                {hasLicense && (
                    <button onClick={() => setShowLicense(v => !v)}
                        className={`p-1.5 rounded-lg transition-colors shrink-0 ${showLicense ? "bg-blue-500/20 text-blue-400" : isLight ? "bg-slate-200 text-slate-500 hover:bg-blue-100 hover:text-blue-500" : "bg-white/10 text-slate-400 hover:bg-blue-500/15 hover:text-blue-400"}`}
                        title="Voir le permis">
                        <UserCheck size={15} />
                    </button>
                )}
                <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => onApprove(r.id)} disabled={loading}
                        className="p-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 transition-colors disabled:opacity-40" title="Approuver">
                        <CheckCircle size={15} />
                    </button>
                    <button onClick={() => onReject(r.id)} disabled={loading}
                        className="p-1.5 rounded-lg bg-red-500/15 hover:bg-red-500/25 text-red-400 transition-colors disabled:opacity-40" title="Refuser">
                        <XCircle size={15} />
                    </button>
                </div>
            </div>
            {showLicense && hasLicense && (
                <div className={`px-3 pb-3 border-t ${isLight ? "border-slate-100 bg-blue-50/50" : "border-white/5 bg-blue-500/5"}`}>
                    <p className={`text-[11px] font-bold uppercase tracking-wider pt-2 pb-1.5 flex items-center gap-1 ${isLight ? "text-blue-600" : "text-blue-400"}`}>
                        <UserCheck size={12}/> Permis de conduire
                    </p>
                    {r.customerLicenseNumber && (
                        <p className={`text-xs mb-2 ${isLight ? "text-slate-600" : "text-slate-300"}`}>
                            N° <span className="font-mono font-semibold">{r.customerLicenseNumber}</span>
                        </p>
                    )}
                    <div className="grid grid-cols-2 gap-2">
                        {r.customerLicensePhotoFront && (
                            <a href={r.customerLicensePhotoFront} target="_blank" rel="noopener noreferrer">
                                <img src={r.customerLicensePhotoFront} alt="Recto" className="w-full h-20 object-cover rounded-lg" />
                                <p className={`text-[10px] text-center mt-0.5 ${isLight ? "text-slate-400" : "text-slate-500"}`}>Recto</p>
                            </a>
                        )}
                        {r.customerLicensePhotoBack && (
                            <a href={r.customerLicensePhotoBack} target="_blank" rel="noopener noreferrer">
                                <img src={r.customerLicensePhotoBack} alt="Verso" className="w-full h-20 object-cover rounded-lg" />
                                <p className={`text-[10px] text-center mt-0.5 ${isLight ? "text-slate-400" : "text-slate-500"}`}>Verso</p>
                            </a>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

// ─── Pending vehicle row ──────────────────────────────────────────────────────
function PendingVehRow({ v, onApprove, onReject, loading, isLight }) {
    return (
        <div className={`flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border transition-colors ${
            isLight ? "bg-slate-50 border-slate-100" : "bg-white/3 border-white/5"
        }`}>
            <div className={`h-9 w-9 sm:h-10 sm:w-10 rounded-xl flex-shrink-0 overflow-hidden flex items-center justify-center ${isLight ? "bg-slate-200" : "bg-white/10"}`}>
                {v.images?.[0]
                    ? <img src={resolveUrl(v.images[0])} alt="" className="h-full w-full object-cover" />
                    : <Truck size={16} className={isLight ? "text-slate-400" : "text-slate-500"} />
                }
            </div>
            <div className="flex-1 min-w-0">
                <p className={`text-sm font-semibold truncate ${isLight ? "text-slate-800" : "text-white"}`}>
                    {v.brand} {v.model}
                </p>
                <p className={`text-xs truncate ${isLight ? "text-slate-500" : "text-slate-400"}`}>
                    {v.plateNumber}<span className="hidden sm:inline"> · {v.type}</span>
                </p>
            </div>
            <span className={`hidden sm:inline text-xs font-semibold px-2 py-0.5 rounded-full border shrink-0 ${isLight ? "text-orange-600 bg-orange-50 border-orange-200" : "text-orange-400 bg-orange-400/10 border-orange-400/20"}`}>
                {fmtCurrency(v.baseDailyPrice)}/j
            </span>
            <div className="flex items-center gap-1 shrink-0">
                <button
                    onClick={() => onApprove(v.id)}
                    disabled={loading}
                    className="p-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 transition-colors disabled:opacity-40"
                    title="Approuver"
                >
                    <CheckCircle size={15} />
                </button>
                <button
                    onClick={() => onReject(v.id)}
                    disabled={loading}
                    className="p-1.5 rounded-lg bg-red-500/15 hover:bg-red-500/25 text-red-400 transition-colors disabled:opacity-40"
                    title="Refuser"
                >
                    <XCircle size={15} />
                </button>
            </div>
        </div>
    );
}

// ─── User row ─────────────────────────────────────────────────────────────────
function UserRow({ u, isLight }) {
    const initials = [(u.firstname?.[0] || ""), (u.lastname?.[0] || "")].join("").toUpperCase() || "?";
    const role = Array.isArray(u.roles) ? u.roles.join(", ") : u.roles;
    const isBlocked = u.status === "BLOCKED";
    return (
        <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-colors ${
            isLight ? "bg-slate-50 border-slate-100" : "bg-white/3 border-white/5"
        }`}>
            <div className="h-9 w-9 rounded-full flex-shrink-0 flex items-center justify-center bg-gradient-to-tr from-orange-500 to-yellow-400 text-white text-xs font-bold shadow">
                {initials}
            </div>
            <div className="flex-1 min-w-0">
                <p className={`text-sm font-semibold truncate ${isLight ? "text-slate-800" : "text-white"}`}>
                    {u.firstname} {u.lastname}
                </p>
                <p className={`text-xs truncate ${isLight ? "text-slate-400" : "text-slate-500"}`}>{u.email}</p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
                <span className={`text-[0.65rem] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                    isLight ? "bg-blue-50 text-blue-600 border-blue-200" : "bg-blue-400/10 text-blue-400 border-blue-400/20"
                }`}>{role}</span>
                {isBlocked && (
                    <span className={`text-[0.65rem] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                        isLight ? "bg-red-50 text-red-600 border-red-200" : "bg-red-400/10 text-red-400 border-red-400/20"
                    }`}>Bloqué</span>
                )}
            </div>
        </div>
    );
}

// ─── Quick action card ────────────────────────────────────────────────────────
function QuickAction({ icon: Icon, label, to, color, badge, isLight }) {
    return (
        <Link to={to} className={`relative flex flex-col items-center gap-2 p-4 rounded-2xl border text-center transition-all hover:-translate-y-0.5 group ${
            isLight
                ? "bg-white border-slate-100 shadow-sm hover:shadow-md hover:border-slate-200"
                : "bg-white/4 border-white/6 hover:bg-white/7 hover:border-white/12"
        }`}>
            <div className={`p-3 rounded-xl ${color}`}>
                <Icon size={20} className="text-white" />
            </div>
            <span className={`text-xs font-semibold ${isLight ? "text-slate-700" : "text-slate-300"}`}>{label}</span>
            {badge > 0 && (
                <span className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-red-500 text-white text-[0.6rem] font-bold flex items-center justify-center ring-2 ring-[#060d33]">
                    {badge > 9 ? "9+" : badge}
                </span>
            )}
            <ChevronRight size={12} className={`absolute right-2.5 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity ${isLight ? "text-slate-400" : "text-slate-500"}`} />
        </Link>
    );
}

// ─── Main Admin Dashboard ─────────────────────────────────────────────────────
export default function AdminDashboard({ user }) {
    const { isDark } = useTheme();
    const isLight = !isDark;
    const navigate = useNavigate();
    const { pendingAdminCount } = useNotifications();

    const [pendingCount, setPendingCount] = useState({ vehicles: 0, documents: 0, reservations: 0, total: 0 });
    const [pendingVehicles, setPendingVehicles] = useState([]);
    const [pendingReservations, setPendingReservations] = useState([]);
    const [overview, setOverview] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [lastRefresh, setLastRefresh] = useState(new Date());

    const fetchAll = async () => {
        setLoading(true);
        try {
            const [countRes, vehRes, resRes, overviewRes, usersRes] = await Promise.all([
                api.get("/api/admin/pending-count"),
                api.get("/api/admin/vehicles/pending?page=0&size=5"),
                api.get("/api/admin/reservations/pending"),
                api.get("/api/admin/overview"),
                api.get("/api/admin/users/alp"),
            ]);
            setPendingCount(countRes.data);
            setPendingVehicles(vehRes.data?.content || []);
            setPendingReservations(resRes.data?.slice(0, 5) || []);
            setOverview(overviewRes.data || []);
            setUsers(usersRes.data || []);
            setLastRefresh(new Date());
        } catch (e) {
            console.error("AdminDashboard fetch error:", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchAll(); }, []);

    // ─── Stats derived from overview ─────────────────────────────────────────
    const stats = useMemo(() => {
        const totalVehicles   = overview.reduce((s, u) => s + (u.vehicles?.length || 0), 0);
        const totalDocuments  = overview.reduce((s, u) => s + (u.documents?.length || 0), 0);
        const activeVehicles  = overview.reduce((s, u) => s + (u.vehicles?.filter(v => v.status === "disponible").length || 0), 0);
        const blockedUsers    = users.filter(u => u.status === "BLOCKED").length;
        return { totalVehicles, totalDocuments, activeVehicles, blockedUsers };
    }, [overview, users]);

    // ─── Approve / reject handlers ───────────────────────────────────────────
    const approveVehicle = async (id) => {
        setActionLoading(true);
        try {
            await api.put(`/api/admin/vehicles/${id}/approve`);
            setPendingVehicles(prev => prev.filter(v => v.id !== id));
            setPendingCount(prev => ({ ...prev, vehicles: prev.vehicles - 1, total: prev.total - 1 }));
        } finally { setActionLoading(false); }
    };
    const rejectVehicle = async (id) => {
        setActionLoading(true);
        try {
            await api.put(`/api/admin/vehicles/${id}/reject`);
            setPendingVehicles(prev => prev.filter(v => v.id !== id));
            setPendingCount(prev => ({ ...prev, vehicles: prev.vehicles - 1, total: prev.total - 1 }));
        } finally { setActionLoading(false); }
    };
    const approveReservation = async (id) => {
        setActionLoading(true);
        try {
            await api.put(`/api/admin/reservations/${id}/approve`);
            setPendingReservations(prev => prev.filter(r => r.id !== id));
            setPendingCount(prev => ({ ...prev, reservations: prev.reservations - 1, total: prev.total - 1 }));
        } finally { setActionLoading(false); }
    };
    const rejectReservation = async (id) => {
        setActionLoading(true);
        try {
            await api.put(`/api/admin/reservations/${id}/reject`);
            setPendingReservations(prev => prev.filter(r => r.id !== id));
            setPendingCount(prev => ({ ...prev, reservations: prev.reservations - 1, total: prev.total - 1 }));
        } finally { setActionLoading(false); }
    };

    const greet = () => {
        const h = new Date().getHours();
        return h < 12 ? "Bonjour" : h < 18 ? "Bon après-midi" : "Bonsoir";
    };

    const displayName = [user?.firstname, user?.lastname].filter(Boolean).join(" ") || "Admin";

    if (loading) return (
        <div className="h-full flex items-center justify-center min-h-[400px]">
            <Spinner size="lg" color="warning" label="Chargement du tableau de bord..." />
        </div>
    );

    const pageBg = isLight ? "bg-[#f8fafc]" : "bg-[#060d33]";
    const cardBg = isLight ? "bg-white border-slate-100 shadow-sm" : "bg-[#0d1533] border-white/5";
    const titleText = isLight ? "text-slate-800" : "text-white";
    const subText = isLight ? "text-slate-500" : "text-slate-400";
    const divider = isLight ? "border-slate-100" : "border-white/5";

    return (
        <div className={`min-h-screen ${pageBg} p-3 sm:p-5 md:p-8 space-y-5 sm:space-y-8`}>

            {/* ── Header ── */}
            <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="min-w-0 flex items-center gap-3 sm:gap-4">
                    {resolveUrl(user?.profilPhoto) && (
                        <img src={resolveUrl(user?.profilPhoto)} alt="Photo"
                            className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl object-cover shadow-lg ring-2 ring-orange-500/40 shrink-0" />
                    )}
                    <div>
                    <div className="flex items-center gap-2 mb-1">
                        <div className="p-1.5 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 shadow">
                            <Shield size={13} className="text-white" />
                        </div>
                        <span className={`text-xs font-bold uppercase tracking-widest ${isLight ? "text-orange-500" : "text-orange-400"}`}>Administration</span>
                    </div>
                    <h1 className={`text-xl sm:text-2xl md:text-3xl font-black ${titleText}`}>
                        {greet()}, {displayName} 👋
                    </h1>
                    <p className={`text-xs sm:text-sm mt-1 ${subText} flex flex-wrap items-center gap-x-2 gap-y-1`}>
                        <span>MAJ · {lastRefresh.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}</span>
                        {pendingCount.total > 0 && (
                            <span className="inline-flex items-center gap-1 text-amber-400 font-semibold">
                                <AlertTriangle size={12} /> {pendingCount.total} en attente
                            </span>
                        )}
                    </p>
                    </div>
                </div>
                <button
                    onClick={fetchAll}
                    className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-sm font-semibold border transition-all hover:scale-[1.02] shrink-0 ${
                        isLight ? "border-slate-200 text-slate-600 hover:bg-slate-50" : "border-white/10 text-slate-400 hover:bg-white/5"
                    }`}
                >
                    <RefreshCw size={13} /> <span className="hidden sm:inline">Actualiser</span>
                </button>
            </div>

            {/* ── KPI Cards ── */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                <KpiCard
                    icon={Users}
                    label="Utilisateurs"
                    value={users.length}
                    sub={`${users.filter(u => u.status !== "BLOCKED").length} actifs`}
                    gradient="from-blue-500 to-cyan-500"
                    isLight={isLight}
                />
                <KpiCard
                    icon={Car}
                    label="Véhicules"
                    value={stats.totalVehicles}
                    sub={`${stats.activeVehicles} disponibles`}
                    gradient="from-orange-500 to-amber-500"
                    badge={pendingCount.vehicles}
                    isLight={isLight}
                />
                <KpiCard
                    icon={CalendarCheck}
                    label="Réservations en attente"
                    value={pendingCount.reservations}
                    sub="À valider"
                    gradient="from-purple-500 to-violet-500"
                    badge={pendingCount.reservations}
                    isLight={isLight}
                />
                <KpiCard
                    icon={FileText}
                    label="Documents"
                    value={stats.totalDocuments}
                    sub={`${pendingCount.documents} en attente`}
                    gradient="from-emerald-500 to-teal-500"
                    badge={pendingCount.documents}
                    isLight={isLight}
                />
            </div>

            {/* ── Quick actions ── */}
            <div>
                <SectionHeader title="Accès rapide" isLight={isLight} />
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                    <QuickAction icon={Shield}       label="Véhicules & Docs"   to="/admin/vehicles"  color="bg-gradient-to-br from-orange-500 to-red-500"    badge={pendingCount.total} isLight={isLight} />
                    <QuickAction icon={Users}        label="Utilisateurs"        to="/admin/vehicles"  color="bg-gradient-to-br from-blue-500 to-cyan-500"      isLight={isLight} />
                    <QuickAction icon={CalendarCheck} label="Réservations"       to="/reservations"    color="bg-gradient-to-br from-purple-500 to-violet-500"  badge={pendingCount.reservations} isLight={isLight} />
                    <QuickAction icon={Activity}     label="Statistiques"        to="/statistiques"    color="bg-gradient-to-br from-emerald-500 to-teal-500"   isLight={isLight} />
                </div>
            </div>

            {/* ── Pending items (2 cols) ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Véhicules en attente */}
                <div className={`rounded-2xl border p-5 ${cardBg}`}>
                    <SectionHeader
                        title="Véhicules en attente"
                        sub={`${pendingCount.vehicles} à valider`}
                        to="/admin/vehicles"
                        isLight={isLight}
                    />
                    {pendingVehicles.length === 0 ? (
                        <div className={`flex flex-col items-center justify-center py-10 gap-2 ${subText}`}>
                            <CheckCircle size={28} className="text-emerald-400 opacity-60" />
                            <p className="text-sm">Aucun véhicule en attente</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {pendingVehicles.map(v => (
                                <PendingVehRow
                                    key={v.id}
                                    v={v}
                                    onApprove={approveVehicle}
                                    onReject={rejectVehicle}
                                    loading={actionLoading}
                                    isLight={isLight}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* Réservations en attente */}
                <div className={`rounded-2xl border p-5 ${cardBg}`}>
                    <SectionHeader
                        title="Réservations en attente"
                        sub={`${pendingCount.reservations} à valider`}
                        to="/admin/vehicles"
                        isLight={isLight}
                    />
                    {pendingReservations.length === 0 ? (
                        <div className={`flex flex-col items-center justify-center py-10 gap-2 ${subText}`}>
                            <CheckCircle size={28} className="text-emerald-400 opacity-60" />
                            <p className="text-sm">Aucune réservation en attente</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {pendingReservations.map(r => (
                                <PendingResRow
                                    key={r.id}
                                    r={r}
                                    onApprove={approveReservation}
                                    onReject={rejectReservation}
                                    loading={actionLoading}
                                    isLight={isLight}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* ── Users overview ── */}
            <div className={`rounded-2xl border p-5 ${cardBg}`}>
                <SectionHeader
                    title="Utilisateurs de la plateforme"
                    sub={`${users.length} comptes ALP / ARC`}
                    to="/admin/vehicles"
                    isLight={isLight}
                />
                {users.length === 0 ? (
                    <div className={`flex flex-col items-center justify-center py-10 gap-2 ${subText}`}>
                        <Users size={28} className="opacity-40" />
                        <p className="text-sm">Aucun utilisateur</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {users.slice(0, 10).map(u => (
                            <UserRow key={u.id} u={u} isLight={isLight} />
                        ))}
                    </div>
                )}
                {users.length > 10 && (
                    <div className={`mt-3 text-center`}>
                        <Link to="/admin/vehicles" className="text-xs font-semibold text-orange-400 hover:text-orange-300 transition-colors">
                            Voir tous les utilisateurs ({users.length}) →
                        </Link>
                    </div>
                )}
            </div>

            {/* ── Overview par loueur ── */}
            <div className={`rounded-2xl border p-5 ${cardBg}`}>
                <SectionHeader
                    title="Vue d'ensemble par loueur"
                    sub={`${overview.length} loueurs enregistrés`}
                    to="/admin/vehicles"
                    isLight={isLight}
                />
                {overview.length === 0 ? (
                    <div className={`flex flex-col items-center justify-center py-10 gap-2 ${subText}`}>
                        <Car size={28} className="opacity-40" />
                        <p className="text-sm">Aucune donnée</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className={`border-b text-xs font-semibold uppercase tracking-wider ${divider} ${subText}`}>
                                    <th className="text-left pb-3 pr-4">Loueur</th>
                                    <th className="text-center pb-3 px-4">Véhicules</th>
                                    <th className="text-center pb-3 px-4">Docs</th>
                                    <th className="text-center pb-3 px-4">Statut</th>
                                    <th className="text-right pb-3">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-transparent">
                                {overview.slice(0, 8).map(u => {
                                    const initials = [(u.firstname?.[0] || ""), (u.lastname?.[0] || "")].join("").toUpperCase() || "?";
                                    const pendingVehs = u.vehicles?.filter(v => v.status === "en_attente").length || 0;
                                    const pendingDocs = u.documents?.filter(d => d.status === "en_attente").length || 0;
                                    return (
                                        <tr key={u.id} className={`border-b ${divider} transition-colors ${isLight ? "hover:bg-slate-50" : "hover:bg-white/3"}`}>
                                            <td className="py-3 pr-4">
                                                <div className="flex items-center gap-2.5">
                                                    <div className="h-8 w-8 rounded-full flex-shrink-0 flex items-center justify-center bg-gradient-to-tr from-orange-500 to-yellow-400 text-white text-xs font-bold">
                                                        {initials}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className={`text-sm font-semibold truncate ${titleText}`}>{u.firstname} {u.lastname}</p>
                                                        <p className={`text-xs truncate ${subText}`}>{u.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4 text-center">
                                                <div className="flex items-center justify-center gap-1.5">
                                                    <span className={`font-semibold ${titleText}`}>{u.vehicles?.length || 0}</span>
                                                    {pendingVehs > 0 && (
                                                        <span className="text-[0.6rem] font-bold px-1.5 py-0.5 rounded-full bg-amber-400/15 text-amber-400 border border-amber-400/20">
                                                            +{pendingVehs}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="py-3 px-4 text-center">
                                                <div className="flex items-center justify-center gap-1.5">
                                                    <span className={`font-semibold ${titleText}`}>{u.documents?.length || 0}</span>
                                                    {pendingDocs > 0 && (
                                                        <span className="text-[0.6rem] font-bold px-1.5 py-0.5 rounded-full bg-amber-400/15 text-amber-400 border border-amber-400/20">
                                                            +{pendingDocs}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="py-3 px-4 text-center">
                                                <span className={`text-[0.65rem] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                                                    u.status === "BLOCKED"
                                                        ? isLight ? "bg-red-50 text-red-600 border-red-200" : "bg-red-400/10 text-red-400 border-red-400/20"
                                                        : isLight ? "bg-emerald-50 text-emerald-600 border-emerald-200" : "bg-emerald-400/10 text-emerald-400 border-emerald-400/20"
                                                }`}>
                                                    {u.status === "BLOCKED" ? "Bloqué" : "Actif"}
                                                </span>
                                            </td>
                                            <td className="py-3 text-right">
                                                <Link to="/admin/vehicles" className="text-orange-400 hover:text-orange-300 transition-colors">
                                                    <ArrowUpRight size={15} />
                                                </Link>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                        {overview.length > 8 && (
                            <div className="mt-3 text-center">
                                <Link to="/admin/vehicles" className="text-xs font-semibold text-orange-400 hover:text-orange-300 transition-colors">
                                    Voir tous ({overview.length}) →
                                </Link>
                            </div>
                        )}
                    </div>
                )}
            </div>

        </div>
    );
}
