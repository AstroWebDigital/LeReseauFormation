import React, { useState, useEffect } from "react";
import api from "@/services/auth/client";
import { useTheme } from "@/theme/ThemeProvider";
import { useAuth } from "@/auth/AuthContext";
import { Spinner } from "@heroui/react";
import {
    TruckIcon, DocumentTextIcon, CalendarDaysIcon,
    CurrencyEuroIcon, ChartBarIcon, CheckCircleIcon,
    ExclamationTriangleIcon, ClockIcon
} from "@heroicons/react/24/outline";
import {
    AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";

export default function StatisticsPage() {
    const { isDark } = useTheme();
    const { user } = useAuth();
    const isLight = !isDark;

    const [vehicles, setVehicles] = useState([]);
    const [documents, setDocuments] = useState([]);
    const [reservations, setReservations] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchAll = async () => {
            setIsLoading(true);
            try {
                const [vRes, dRes] = await Promise.all([
                    api.get("/api/vehicles/my-fleet"),
                    api.get("/api/documents"),
                ]);
                setVehicles(vRes.data.content || []);
                setDocuments(Array.isArray(dRes.data) ? dRes.data : []);

                if (user?.id) {
                    try {
                        const rRes = await api.get(`/api/reservations/history/${user.id}`);
                        setReservations(Array.isArray(rRes.data) ? rRes.data : []);
                    } catch { setReservations([]); }
                }
            } catch (err) {
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchAll();
    }, [user]);

    // ── Calculs véhicules ──
    const totalVehicles = vehicles.length;
    const disponibles = vehicles.filter(v => v.status?.toLowerCase() === "disponible").length;
    const reserves = vehicles.filter(v => v.status?.toLowerCase() === "reserve").length;
    const enRevision = vehicles.filter(v => v.status?.toLowerCase() === "en_revision").length;
    const tauxOccupation = totalVehicles > 0 ? Math.round((reserves / totalVehicles) * 100) : 0;

    // ── Calculs CA ──
    const caEstime = vehicles.reduce((sum, v) => sum + (Number(v.baseDailyPrice) || 0) * 20, 0);
    const caReel = reservations.reduce((sum, r) => {
        return sum + (Number(r.totalAmount) || Number(r.total_amount) || Number(r.amount) || 0);
    }, 0);

    // ── Calculs documents ──
    const docsValides = documents.filter(d => d.status === "valide").length;
    const docsExpires = documents.filter(d => d.status === "expire").length;
    const docsAttente = documents.filter(d => d.status === "en_attente").length;

    // ── Calculs réservations ──
    const totalReservations = reservations.length;
    const reservationsAcceptees = reservations.filter(r =>
        r.status === "accepte" || r.status === "ACTIVE" || r.status === "CONFIRMED"
    ).length;

    // ── Données graphiques ──
    const vehicleStatusData = [
        { name: "Disponibles", value: disponibles, color: "#22c55e" },
        { name: "Réservés", value: reserves, color: "#ff922b" },
        { name: "En révision", value: enRevision, color: "#f59e0b" },
    ].filter(d => d.value > 0);

    const docStatusData = [
        { name: "Valides", value: docsValides, color: "#22c55e" },
        { name: "Expirés", value: docsExpires, color: "#ef4444" },
        { name: "En attente", value: docsAttente, color: "#f59e0b" },
    ].filter(d => d.value > 0);

    const caParType = vehicles.reduce((acc, v) => {
        const type = v.type || "Autre";
        if (!acc[type]) acc[type] = 0;
        acc[type] += Number(v.baseDailyPrice) * 20;
        return acc;
    }, {});
    const caParTypeData = Object.entries(caParType).map(([name, ca]) => ({ name, ca: Math.round(ca) }));

    const reservationsByMonth = (() => {
        const months = {};
        const now = new Date();
        for (let i = 5; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const key = d.toLocaleDateString("fr-FR", { month: "short", year: "2-digit" });
            months[key] = { count: 0, ca: 0 };
        }
        reservations.forEach(r => {
            if (!r.startDate) return;
            const d = new Date(r.startDate);
            const key = d.toLocaleDateString("fr-FR", { month: "short", year: "2-digit" });
            if (months[key] !== undefined) {
                months[key].count++;
                months[key].ca += Number(r.totalAmount) || Number(r.total_amount) || 0;
            }
        });
        return Object.entries(months).map(([month, data]) => ({
            month,
            count: data.count,
            ca: Math.round(data.ca)
        }));
    })();

    // ── Thème ──
    const pageBg = isLight ? "bg-slate-50" : "";
    const cardBg = isLight ? "bg-white border-slate-200 shadow-sm" : "bg-slate-900 border-slate-800";
    const textPrimary = isLight ? "text-slate-800" : "text-slate-100";
    const textSecondary = isLight ? "text-slate-500" : "text-slate-400";
    const gridColor = isLight ? "#e2e8f0" : "#1e293b";
    const axisColor = isLight ? "#94a3b8" : "#475569";
    const tooltipBg = isLight ? "#ffffff" : "#0f172a";
    const tooltipBorder = isLight ? "#e2e8f0" : "#1e293b";

    const StatCard = ({ icon: Icon, label, value, sub, color = "text-orange-500", bgColor = "bg-orange-500/10" }) => (
        <div className={`rounded-2xl border p-5 ${cardBg}`}>
            <div className="flex items-start justify-between">
                <div>
                    <p className={`text-xs font-medium mb-1 ${textSecondary}`}>{label}</p>
                    <p className={`text-3xl font-bold ${textPrimary}`}>{value}</p>
                    {sub && <p className={`text-xs mt-1 ${textSecondary}`}>{sub}</p>}
                </div>
                <div className={`p-3 rounded-xl ${bgColor}`}>
                    <Icon className={`h-6 w-6 ${color}`} />
                </div>
            </div>
        </div>
    );

    const SectionTitle = ({ icon: Icon, title, sub }) => (
        <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-orange-500/10 rounded-xl">
                <Icon className="h-5 w-5 text-orange-500" />
            </div>
            <div>
                <h2 className={`font-bold text-base ${textPrimary}`}>{title}</h2>
                {sub && <p className={`text-xs ${textSecondary}`}>{sub}</p>}
            </div>
        </div>
    );

    if (isLoading) return (
        <div className="h-full flex items-center justify-center min-h-[400px]">
            <Spinner size="lg" color="warning" label="Chargement des statistiques..." />
        </div>
    );

    return (
        <div className={`p-6 lg:p-8 min-h-screen ${pageBg}`}>

            {/* Header */}
            <div className="mb-8">
                <p className="text-xs uppercase tracking-widest text-orange-500 font-semibold mb-1">Tableau de bord</p>
                <h1 className={`text-2xl font-bold ${textPrimary}`}>Statistiques</h1>
                <p className={`text-sm mt-1 ${textSecondary}`}>Vue d'ensemble de votre activité et de votre flotte</p>
            </div>

            {/* ── KPI Cards ── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <StatCard
                    icon={TruckIcon} label="Véhicules total" value={totalVehicles}
                    sub={`${disponibles} disponibles · ${reserves} réservés`}
                />
                <StatCard
                    icon={CurrencyEuroIcon} label="CA réel (réservations)"
                    value={`${caReel.toLocaleString("fr-FR")}€`}
                    sub={`${totalReservations} réservation(s)`}
                    color="text-emerald-500" bgColor="bg-emerald-500/10"
                />
                <StatCard
                    icon={CalendarDaysIcon} label="CA estimé / mois"
                    value={`${caEstime.toLocaleString("fr-FR")}€`}
                    sub="Basé sur 20 jours/mois"
                    color="text-blue-500" bgColor="bg-blue-500/10"
                />
                <StatCard
                    icon={DocumentTextIcon} label="Documents" value={documents.length}
                    sub={docsExpires > 0 ? `⚠️ ${docsExpires} expiré(s)` : "Tous à jour"}
                    color={docsExpires > 0 ? "text-red-500" : "text-emerald-500"}
                    bgColor={docsExpires > 0 ? "bg-red-500/10" : "bg-emerald-500/10"}
                />
            </div>

            {/* ── Ligne 2 ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">

                {/* Taux occupation */}
                <div className={`rounded-2xl border p-5 ${cardBg}`}>
                    <p className={`text-xs font-medium mb-3 ${textSecondary}`}>Taux d'occupation</p>
                    <div className="flex items-end gap-2 mb-3">
                        <span className={`text-4xl font-bold ${textPrimary}`}>{tauxOccupation}%</span>
                        <span className={`text-sm mb-1 ${textSecondary}`}>de la flotte réservée</span>
                    </div>
                    <div className={`h-3 rounded-full overflow-hidden ${isLight ? "bg-slate-100" : "bg-slate-800"}`}>
                        <div className="h-full rounded-full bg-gradient-to-r from-orange-500 to-orange-400 transition-all duration-1000"
                             style={{ width: `${tauxOccupation}%` }} />
                    </div>
                    <div className="flex justify-between mt-2">
                        <span className={`text-[11px] ${textSecondary}`}>{reserves} réservés</span>
                        <span className={`text-[11px] ${textSecondary}`}>{totalVehicles} total</span>
                    </div>
                </div>

                {/* Répartition statuts */}
                <div className={`rounded-2xl border p-5 ${cardBg}`}>
                    <p className={`text-xs font-medium mb-3 ${textSecondary}`}>Répartition des statuts</p>
                    <div className="space-y-3">
                        {[
                            { label: "Disponibles", count: disponibles, color: "bg-emerald-500" },
                            { label: "Réservés", count: reserves, color: "bg-orange-500" },
                            { label: "En révision", count: enRevision, color: "bg-amber-500" },
                        ].map((item, i) => (
                            <div key={i}>
                                <div className="flex justify-between text-xs mb-1">
                                    <span className={textSecondary}>{item.label}</span>
                                    <span className={`font-bold ${textPrimary}`}>{item.count}</span>
                                </div>
                                <div className={`h-2 rounded-full ${isLight ? "bg-slate-100" : "bg-slate-800"}`}>
                                    <div className={`h-full rounded-full ${item.color} transition-all duration-700`}
                                         style={{ width: totalVehicles > 0 ? `${(item.count / totalVehicles) * 100}%` : "0%" }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* État documents */}
                <div className={`rounded-2xl border p-5 ${cardBg}`}>
                    <p className={`text-xs font-medium mb-3 ${textSecondary}`}>État des documents</p>
                    <div className="space-y-3">
                        <div className={`flex items-center justify-between p-2.5 rounded-xl ${isLight ? "bg-emerald-50" : "bg-emerald-500/10"}`}>
                            <div className="flex items-center gap-2">
                                <CheckCircleIcon className="h-4 w-4 text-emerald-500" />
                                <span className={`text-xs ${textPrimary}`}>Valides</span>
                            </div>
                            <span className="text-sm font-bold text-emerald-500">{docsValides}</span>
                        </div>
                        <div className={`flex items-center justify-between p-2.5 rounded-xl ${isLight ? "bg-amber-50" : "bg-amber-500/10"}`}>
                            <div className="flex items-center gap-2">
                                <ClockIcon className="h-4 w-4 text-amber-500" />
                                <span className={`text-xs ${textPrimary}`}>En attente</span>
                            </div>
                            <span className="text-sm font-bold text-amber-500">{docsAttente}</span>
                        </div>
                        <div className={`flex items-center justify-between p-2.5 rounded-xl ${isLight ? "bg-red-50" : "bg-red-500/10"}`}>
                            <div className="flex items-center gap-2">
                                <ExclamationTriangleIcon className="h-4 w-4 text-red-500" />
                                <span className={`text-xs ${textPrimary}`}>Expirés</span>
                            </div>
                            <span className="text-sm font-bold text-red-500">{docsExpires}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Graphiques ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">

                {/* CA par mois */}
                <div className={`rounded-2xl border p-5 ${cardBg}`}>
                    <SectionTitle icon={CurrencyEuroIcon} title="CA réel / mois" sub="6 derniers mois" />
                    {reservationsByMonth.every(d => d.ca === 0) ? (
                        <div className={`flex flex-col items-center justify-center h-40 ${textSecondary}`}>
                            <CurrencyEuroIcon className="h-10 w-10 mb-2 opacity-30" />
                            <p className="text-sm">Aucune donnée de CA</p>
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height={200}>
                            <AreaChart data={reservationsByMonth}>
                                <defs>
                                    <linearGradient id="colorCA" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                                <XAxis dataKey="month" tick={{ fill: axisColor, fontSize: 11 }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fill: axisColor, fontSize: 11 }} axisLine={false} tickLine={false} />
                                <Tooltip
                                    formatter={(v) => [`${v.toLocaleString("fr-FR")}€`, "CA"]}
                                    contentStyle={{ background: tooltipBg, border: `1px solid ${tooltipBorder}`, borderRadius: "12px", fontSize: "12px" }}
                                />
                                <Area type="monotone" dataKey="ca" name="CA" stroke="#22c55e" strokeWidth={2} fill="url(#colorCA)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    )}
                </div>

                {/* Réservations par mois */}
                <div className={`rounded-2xl border p-5 ${cardBg}`}>
                    <SectionTitle icon={CalendarDaysIcon} title="Réservations / mois" sub="6 derniers mois" />
                    {reservationsByMonth.every(d => d.count === 0) ? (
                        <div className={`flex flex-col items-center justify-center h-40 ${textSecondary}`}>
                            <CalendarDaysIcon className="h-10 w-10 mb-2 opacity-30" />
                            <p className="text-sm">Aucune réservation</p>
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height={200}>
                            <AreaChart data={reservationsByMonth}>
                                <defs>
                                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#ff922b" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#ff922b" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                                <XAxis dataKey="month" tick={{ fill: axisColor, fontSize: 11 }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fill: axisColor, fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                                <Tooltip contentStyle={{ background: tooltipBg, border: `1px solid ${tooltipBorder}`, borderRadius: "12px", fontSize: "12px" }} />
                                <Area type="monotone" dataKey="count" name="Réservations" stroke="#ff922b" strokeWidth={2} fill="url(#colorCount)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </div>

            {/* ── CA par type + Pies ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">

                {/* CA par type */}
                <div className={`rounded-2xl border p-5 ${cardBg}`}>
                    <SectionTitle icon={ChartBarIcon} title="CA estimé par type" sub="20 jours/mois" />
                    {caParTypeData.length === 0 ? (
                        <div className={`flex flex-col items-center justify-center h-40 ${textSecondary}`}>
                            <ChartBarIcon className="h-10 w-10 mb-2 opacity-30" />
                            <p className="text-sm">Aucun véhicule</p>
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height={180}>
                            <BarChart data={caParTypeData} barSize={28}>
                                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                                <XAxis dataKey="name" tick={{ fill: axisColor, fontSize: 10 }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fill: axisColor, fontSize: 10 }} axisLine={false} tickLine={false} />
                                <Tooltip
                                    formatter={(v) => [`${v.toLocaleString("fr-FR")}€`, "CA estimé"]}
                                    contentStyle={{ background: tooltipBg, border: `1px solid ${tooltipBorder}`, borderRadius: "12px", fontSize: "12px" }}
                                />
                                <Bar dataKey="ca" fill="#ff922b" radius={[8, 8, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </div>

                {/* Pie véhicules */}
                <div className={`rounded-2xl border p-5 ${cardBg}`}>
                    <SectionTitle icon={TruckIcon} title="Statuts flotte" />
                    {vehicleStatusData.length === 0 ? (
                        <div className={`flex flex-col items-center justify-center h-40 ${textSecondary}`}>
                            <TruckIcon className="h-10 w-10 mb-2 opacity-30" />
                            <p className="text-sm">Aucun véhicule</p>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-3">
                            <ResponsiveContainer width="100%" height={150}>
                                <PieChart>
                                    <Pie data={vehicleStatusData} cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={4} dataKey="value">
                                        {vehicleStatusData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                                    </Pie>
                                    <Tooltip contentStyle={{ background: tooltipBg, border: `1px solid ${tooltipBorder}`, borderRadius: "12px", fontSize: "12px" }} />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="w-full space-y-1">
                                {vehicleStatusData.map((item, i) => (
                                    <div key={i} className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2.5 h-2.5 rounded-full" style={{ background: item.color }} />
                                            <span className={`text-xs ${textSecondary}`}>{item.name}</span>
                                        </div>
                                        <span className={`text-xs font-bold ${textPrimary}`}>{item.value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Pie documents */}
                <div className={`rounded-2xl border p-5 ${cardBg}`}>
                    <SectionTitle icon={DocumentTextIcon} title="Statuts documents" />
                    {docStatusData.length === 0 ? (
                        <div className={`flex flex-col items-center justify-center h-40 ${textSecondary}`}>
                            <DocumentTextIcon className="h-10 w-10 mb-2 opacity-30" />
                            <p className="text-sm">Aucun document</p>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-3">
                            <ResponsiveContainer width="100%" height={150}>
                                <PieChart>
                                    <Pie data={docStatusData} cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={4} dataKey="value">
                                        {docStatusData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                                    </Pie>
                                    <Tooltip contentStyle={{ background: tooltipBg, border: `1px solid ${tooltipBorder}`, borderRadius: "12px", fontSize: "12px" }} />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="w-full space-y-1">
                                {docStatusData.map((item, i) => (
                                    <div key={i} className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2.5 h-2.5 rounded-full" style={{ background: item.color }} />
                                            <span className={`text-xs ${textSecondary}`}>{item.name}</span>
                                        </div>
                                        <span className={`text-xs font-bold ${textPrimary}`}>{item.value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* ── Tableau véhicules ── */}
            <div className={`rounded-2xl border p-5 ${cardBg}`}>
                <SectionTitle icon={TruckIcon} title="Détail de la flotte" sub={`${totalVehicles} véhicule(s)`} />
                {vehicles.length === 0 ? (
                    <div className={`flex flex-col items-center justify-center py-12 ${textSecondary}`}>
                        <TruckIcon className="h-10 w-10 mb-2 opacity-30" />
                        <p className="text-sm">Aucun véhicule enregistré</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                            <tr className={`text-xs border-b ${isLight ? "border-slate-200" : "border-slate-800"}`}>
                                {["Véhicule", "Type", "Carburant", "Kilométrage", "Prix/jour", "Statut", "CA estimé/mois"].map(h => (
                                    <th key={h} className={`pb-3 text-left font-semibold ${textSecondary}`}>{h}</th>
                                ))}
                            </tr>
                            </thead>
                            <tbody>
                            {vehicles.map((v, i) => {
                                const s = v.status?.toLowerCase();
                                const statusColor = s === "disponible"
                                    ? "text-emerald-500 bg-emerald-500/10"
                                    : s === "reserve"
                                        ? "text-orange-500 bg-orange-500/10"
                                        : s === "en_revision"
                                            ? "text-amber-500 bg-amber-500/10"
                                            : "text-slate-500 bg-slate-500/10";
                                return (
                                    <tr key={v.id || i} className={`text-xs border-b ${isLight ? "border-slate-100 hover:bg-slate-50" : "border-slate-800 hover:bg-slate-800/30"} transition-colors`}>
                                        <td className={`py-3 font-medium ${textPrimary}`}>{v.brand} {v.model}</td>
                                        <td className={textSecondary}>{v.type || "—"}</td>
                                        <td className={textSecondary}>{v.fuel || "—"}</td>
                                        <td className={textSecondary}>{v.mileage ? `${Number(v.mileage).toLocaleString("fr-FR")} km` : "—"}</td>
                                        <td className={`font-medium ${textPrimary}`}>{v.baseDailyPrice ? `${v.baseDailyPrice}€` : "—"}</td>
                                        <td>
                                                <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${statusColor}`}>
                                                    {v.status || "—"}
                                                </span>
                                        </td>
                                        <td className="font-bold text-orange-500">
                                            {v.baseDailyPrice ? `${(Number(v.baseDailyPrice) * 20).toLocaleString("fr-FR")}€` : "—"}
                                        </td>
                                    </tr>
                                );
                            })}
                            </tbody>
                            <tfoot>
                            <tr className={`border-t ${isLight ? "border-slate-200" : "border-slate-800"}`}>
                                <td colSpan={6} className={`pt-3 text-xs font-bold ${textPrimary}`}>Total CA estimé</td>
                                <td className="pt-3 font-bold text-orange-500">{caEstime.toLocaleString("fr-FR")}€</td>
                            </tr>
                            <tr>
                                <td colSpan={6} className={`pt-1 text-xs font-bold ${textPrimary}`}>Total CA réel</td>
                                <td className="pt-1 font-bold text-emerald-500">{caReel.toLocaleString("fr-FR")}€</td>
                            </tr>
                            </tfoot>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}