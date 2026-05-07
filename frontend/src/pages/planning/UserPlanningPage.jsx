import React, { useEffect, useMemo, useState } from "react";
import { Spinner } from "@heroui/react";
import {
    CalendarDaysIcon, MapPinIcon, CurrencyEuroIcon,
    ChevronLeftIcon, ChevronRightIcon, ClockIcon,
} from "@heroicons/react/24/outline";
import { CheckCircleIcon, XCircleIcon, ClockIcon as ClockSolid } from "@heroicons/react/24/solid";
import { useTheme } from "@/theme/ThemeProvider";
import api from "@/services/auth/client";

// ─── helpers ──────────────────────────────────────────────────────────────────
const STATUS_META = {
    en_attente: { label: "En attente",  color: "bg-amber-500",   text: "text-amber-400",  border: "border-amber-500/40",  bg: "bg-amber-500/10"  },
    accepte:    { label: "Confirmée",   color: "bg-emerald-500", text: "text-emerald-400", border: "border-emerald-500/40", bg: "bg-emerald-500/10" },
    refuse:     { label: "Refusée",     color: "bg-red-500",     text: "text-red-400",     border: "border-red-500/40",     bg: "bg-red-500/10"    },
    termine:    { label: "Terminée",    color: "bg-slate-400",   text: "text-slate-400",   border: "border-slate-400/40",   bg: "bg-slate-400/10"  },
    en_cours:   { label: "En cours",    color: "bg-blue-500",    text: "text-blue-400",    border: "border-blue-500/40",    bg: "bg-blue-500/10"   },
};

const meta = (s) => STATUS_META[s] || STATUS_META.en_attente;

const fmt = (dateStr) => {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
};

const daysBetween = (a, b) => {
    const ms = new Date(b) - new Date(a);
    return Math.max(1, Math.round(ms / 86_400_000));
};

const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

const addDays = (date, n) => {
    const d = new Date(date);
    d.setDate(d.getDate() + n);
    return d;
};

const isSameDay = (a, b) => startOfDay(a).getTime() === startOfDay(b).getTime();

const MONTHS_FR = ["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"];
const DAYS_FR   = ["Lun","Mar","Mer","Jeu","Ven","Sam","Dim"];

// Determine reservation status considering end date
const resolveStatus = (r) => {
    const now = new Date();
    if (r.status === "accepte") {
        if (new Date(r.endDate) < now)   return "termine";
        if (new Date(r.startDate) <= now) return "en_cours";
    }
    return r.status;
};

// ─── Calendar cell component ──────────────────────────────────────────────────
const CalendarCell = ({ date, reservations, isDark, onSelect }) => {
    const today = isSameDay(date, new Date());
    const weekend = date.getDay() === 0 || date.getDay() === 6;

    // Find reservation(s) that include this date
    const hits = reservations.filter((r) => {
        const s = startOfDay(new Date(r.startDate));
        const e = startOfDay(new Date(r.endDate));
        return date >= s && date <= e;
    });

    const cellBg = today
        ? "bg-orange-500/20 ring-1 ring-orange-500/60"
        : weekend
        ? isDark ? "bg-white/[0.02]" : "bg-slate-50"
        : "";

    return (
        <div
            className={`relative min-h-[80px] p-1 rounded-lg border transition-colors ${
                isDark ? "border-white/5 hover:border-white/10" : "border-slate-100 hover:border-slate-200"
            } ${cellBg} ${hits.length ? "cursor-pointer" : ""}`}
            onClick={() => hits.length && onSelect(hits[0])}
        >
            <span className={`text-[0.7rem] font-semibold ${
                today ? "text-orange-400" : weekend
                ? isDark ? "text-white/30" : "text-slate-400"
                : isDark ? "text-white/50" : "text-slate-500"
            }`}>
                {date.getDate()}
            </span>

            {hits.slice(0, 2).map((r, i) => {
                const m = meta(resolveStatus(r));
                return (
                    <div key={i} className={`mt-0.5 rounded px-1 py-0.5 text-[0.6rem] font-medium truncate ${m.color} text-white`}>
                        {r.vehicleBrand} {r.vehicleModel}
                    </div>
                );
            })}
            {hits.length > 2 && (
                <div className={`mt-0.5 text-[0.6rem] ${isDark ? "text-white/40" : "text-slate-400"}`}>+{hits.length - 2}</div>
            )}
        </div>
    );
};

// ─── Reservation detail card ──────────────────────────────────────────────────
const ReservationCard = ({ r, isDark, onSelect }) => {
    const status = resolveStatus(r);
    const m = meta(status);
    const nights = daysBetween(r.startDate, r.endDate);

    return (
        <button
            type="button"
            onClick={() => onSelect(r)}
            className={`w-full text-left rounded-2xl border p-4 transition-all hover:scale-[1.01] ${
                isDark
                    ? `bg-white/5 hover:bg-white/8 ${m.border}`
                    : `bg-white hover:bg-slate-50 ${m.border} shadow-sm`
            }`}
        >
            <div className="flex items-start justify-between gap-3">
                {/* Left */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <span className={`inline-flex items-center gap-1 text-[0.65rem] font-bold uppercase tracking-wider rounded-full px-2 py-0.5 ${m.bg} ${m.text}`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${m.color}`} />
                            {m.label}
                        </span>
                    </div>
                    <p className={`text-sm font-bold truncate ${isDark ? "text-white" : "text-slate-800"}`}>
                        {r.vehicleBrand} {r.vehicleModel}
                    </p>
                    <div className={`flex items-center gap-1 mt-1 text-xs ${isDark ? "text-white/50" : "text-slate-500"}`}>
                        <CalendarDaysIcon className="h-3.5 w-3.5 flex-shrink-0" />
                        {fmt(r.startDate)} → {fmt(r.endDate)}
                        <span className={`ml-1 text-[0.65rem] ${isDark ? "text-white/30" : "text-slate-400"}`}>({nights} nuit{nights > 1 ? "s" : ""})</span>
                    </div>
                    {r.pickupLocation && (
                        <div className={`flex items-center gap-1 mt-0.5 text-xs truncate ${isDark ? "text-white/40" : "text-slate-400"}`}>
                            <MapPinIcon className="h-3.5 w-3.5 flex-shrink-0" />
                            {r.pickupLocation}
                        </div>
                    )}
                    {status === "refuse" && r.rejectionReason && (
                        <p className={`mt-1 text-xs italic line-clamp-1 text-red-400`}>
                            Motif : {r.rejectionReason}
                        </p>
                    )}
                </div>

                {/* Right */}
                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    <span className={`text-sm font-bold ${isDark ? "text-orange-400" : "text-orange-500"}`}>
                        {r.totalAmount ? `${Number(r.totalAmount).toLocaleString("fr-FR")} €` : "—"}
                    </span>
                    {status === "accepte" && <CheckCircleIcon className="h-5 w-5 text-emerald-400" />}
                    {status === "en_attente" && <ClockSolid className="h-5 w-5 text-amber-400" />}
                    {status === "refuse" && <XCircleIcon className="h-5 w-5 text-red-400" />}
                    {status === "en_cours" && <ClockIcon className="h-5 w-5 text-blue-400" />}
                </div>
            </div>
        </button>
    );
};

// ─── Detail panel ─────────────────────────────────────────────────────────────
const DetailPanel = ({ r, isDark, onClose }) => {
    if (!r) return null;
    const status = resolveStatus(r);
    const m = meta(status);
    const nights = daysBetween(r.startDate, r.endDate);

    return (
        <div
            className={`fixed inset-0 z-40 flex items-end sm:items-center justify-center p-4`}
            onClick={onClose}
        >
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
            <div
                className={`relative z-50 w-full max-w-md rounded-2xl border p-6 ${
                    isDark ? "bg-[#0d1430] border-white/10" : "bg-white border-slate-200 shadow-2xl"
                }`}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between mb-5">
                    <div className={`inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider rounded-full px-3 py-1 ${m.bg} ${m.text}`}>
                        <span className={`h-2 w-2 rounded-full ${m.color}`} />
                        {m.label}
                    </div>
                    <button onClick={onClose} className={`text-xs px-3 py-1 rounded-lg border transition-colors ${isDark ? "border-white/15 text-white/50 hover:bg-white/10" : "border-slate-200 text-slate-500 hover:bg-slate-50"}`}>
                        Fermer
                    </button>
                </div>

                {/* Vehicle */}
                <div className={`rounded-xl p-3 mb-4 border ${isDark ? "bg-orange-500/10 border-orange-500/20" : "bg-orange-50 border-orange-100"}`}>
                    <p className={`text-xs uppercase tracking-widest font-semibold mb-0.5 ${isDark ? "text-orange-400/60" : "text-orange-500/60"}`}>Véhicule</p>
                    <p className={`text-base font-bold ${isDark ? "text-white" : "text-slate-800"}`}>{r.vehicleBrand} {r.vehicleModel}</p>
                </div>

                {/* Dates */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                    {[["Début", r.startDate], ["Fin", r.endDate]].map(([label, date]) => (
                        <div key={label} className={`rounded-xl p-3 border ${isDark ? "bg-white/5 border-white/10" : "bg-slate-50 border-slate-100"}`}>
                            <p className={`text-[0.65rem] uppercase tracking-widest font-semibold mb-0.5 ${isDark ? "text-white/40" : "text-slate-400"}`}>{label}</p>
                            <p className={`text-sm font-semibold ${isDark ? "text-white" : "text-slate-800"}`}>{fmt(date)}</p>
                        </div>
                    ))}
                </div>

                {/* Duration + total */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className={`rounded-xl p-3 border ${isDark ? "bg-white/5 border-white/10" : "bg-slate-50 border-slate-100"}`}>
                        <p className={`text-[0.65rem] uppercase tracking-widest font-semibold mb-0.5 ${isDark ? "text-white/40" : "text-slate-400"}`}>Durée</p>
                        <p className={`text-sm font-semibold ${isDark ? "text-white" : "text-slate-800"}`}>{nights} nuit{nights > 1 ? "s" : ""}</p>
                    </div>
                    <div className={`rounded-xl p-3 border ${isDark ? "bg-orange-500/10 border-orange-500/20" : "bg-orange-50 border-orange-100"}`}>
                        <p className={`text-[0.65rem] uppercase tracking-widest font-semibold mb-0.5 ${isDark ? "text-orange-400/60" : "text-orange-500/60"}`}>Total</p>
                        <p className={`text-sm font-bold ${isDark ? "text-orange-400" : "text-orange-600"}`}>
                            {r.totalAmount ? `${Number(r.totalAmount).toLocaleString("fr-FR")} €` : "—"}
                        </p>
                    </div>
                </div>

                {/* Locations */}
                {(r.pickupLocation || r.returnLocation) && (
                    <div className={`rounded-xl p-3 border mb-4 ${isDark ? "bg-white/5 border-white/10" : "bg-slate-50 border-slate-100"}`}>
                        {r.pickupLocation && (
                            <div className="flex items-center gap-2 mb-1">
                                <MapPinIcon className={`h-4 w-4 flex-shrink-0 ${isDark ? "text-white/40" : "text-slate-400"}`} />
                                <div>
                                    <span className={`text-[0.65rem] uppercase tracking-widest font-semibold ${isDark ? "text-white/40" : "text-slate-400"}`}>Prise en charge</span>
                                    <p className={`text-xs ${isDark ? "text-white/80" : "text-slate-700"}`}>{r.pickupLocation}</p>
                                </div>
                            </div>
                        )}
                        {r.returnLocation && (
                            <div className="flex items-center gap-2">
                                <MapPinIcon className={`h-4 w-4 flex-shrink-0 ${isDark ? "text-white/40" : "text-slate-400"}`} />
                                <div>
                                    <span className={`text-[0.65rem] uppercase tracking-widest font-semibold ${isDark ? "text-white/40" : "text-slate-400"}`}>Retour</span>
                                    <p className={`text-xs ${isDark ? "text-white/80" : "text-slate-700"}`}>{r.returnLocation}</p>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Rejection reason */}
                {status === "refuse" && r.rejectionReason && (
                    <div className="rounded-xl p-3 border border-red-500/30 bg-red-500/10">
                        <p className="text-[0.65rem] uppercase tracking-widest font-semibold text-red-400/70 mb-0.5">Motif de refus</p>
                        <p className="text-sm text-red-300">{r.rejectionReason}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function UserPlanningPage() {
    const { isDark } = useTheme();
    const [reservations, setReservations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState(null);
    const [view, setView] = useState("calendar"); // "calendar" | "list"
    const [filterStatus, setFilterStatus] = useState("tous");

    // Calendar month navigation
    const today = new Date();
    const [calMonth, setCalMonth] = useState(new Date(today.getFullYear(), today.getMonth(), 1));

    useEffect(() => {
        api.get("/api/reservations/my")
            .then((res) => setReservations(res.data || []))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    // ─── Stats ──────────────────────────────────────────────────────────────
    const stats = useMemo(() => {
        const pending    = reservations.filter((r) => r.status === "en_attente").length;
        const confirmed  = reservations.filter((r) => r.status === "accepte").length;
        const inProgress = reservations.filter((r) => resolveStatus(r) === "en_cours").length;
        const total      = reservations.reduce((s, r) => s + (r.status === "accepte" || resolveStatus(r) !== "refuse" ? (r.totalAmount || 0) : 0), 0);
        return { pending, confirmed, inProgress, total };
    }, [reservations]);

    // ─── Filtered list ───────────────────────────────────────────────────────
    const filtered = useMemo(() => {
        const sorted = [...reservations].sort((a, b) => new Date(b.startDate) - new Date(a.startDate));
        if (filterStatus === "tous") return sorted;
        return sorted.filter((r) => resolveStatus(r) === filterStatus);
    }, [reservations, filterStatus]);

    // ─── Calendar grid ───────────────────────────────────────────────────────
    const calendarDays = useMemo(() => {
        const year  = calMonth.getFullYear();
        const month = calMonth.getMonth();
        const first = new Date(year, month, 1);
        // Monday-based: getDay() 0=Sun→6, 1=Mon→0, …
        const startOffset = (first.getDay() + 6) % 7;
        const days = [];
        for (let i = 0; i < startOffset; i++) days.push(null);
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        for (let d = 1; d <= daysInMonth; d++) days.push(new Date(year, month, d));
        return days;
    }, [calMonth]);

    // ─── Theme vars ──────────────────────────────────────────────────────────
    const pageBg    = isDark ? "bg-[#060d33]"    : "bg-slate-50";
    const cardBg    = isDark ? "bg-white/5 border-white/8"  : "bg-white border-slate-200 shadow-sm";
    const titleText = isDark ? "text-white"       : "text-slate-800";
    const subText   = isDark ? "text-white/50"    : "text-slate-500";
    const tabActive = "bg-orange-500 text-white shadow-[0_6px_20px_rgba(255,146,43,0.35)]";
    const tabBase   = isDark ? "text-white/60 hover:bg-white/8" : "text-slate-500 hover:bg-slate-100";

    const FILTERS = [
        { key: "tous",       label: "Toutes" },
        { key: "en_attente", label: "En attente" },
        { key: "accepte",    label: "Confirmées" },
        { key: "en_cours",   label: "En cours" },
        { key: "refuse",     label: "Refusées" },
        { key: "termine",    label: "Terminées" },
    ];

    if (loading) {
        return (
            <div className={`min-h-screen flex items-center justify-center ${pageBg}`}>
                <Spinner color="warning" size="lg" />
            </div>
        );
    }

    return (
        <div className={`min-h-screen ${pageBg} p-4 md:p-6 lg:p-8`}>
            {/* Header */}
            <div className="mb-6">
                <h1 className={`text-2xl font-bold ${titleText}`}>Mon planning</h1>
                <p className={`text-sm mt-0.5 ${subText}`}>Toutes vos réservations en un coup d'œil</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                {[
                    { label: "En attente",  value: stats.pending,    color: "text-amber-400",   icon: "⏳" },
                    { label: "Confirmées",  value: stats.confirmed,  color: "text-emerald-400", icon: "✅" },
                    { label: "En cours",    value: stats.inProgress, color: "text-blue-400",    icon: "🚗" },
                    { label: "Total réservations", value: reservations.length, color: isDark ? "text-white" : "text-slate-800", icon: "📋" },
                ].map((s) => (
                    <div key={s.label} className={`rounded-2xl border p-4 ${cardBg}`}>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-lg">{s.icon}</span>
                            <span className={`text-xs font-medium ${subText}`}>{s.label}</span>
                        </div>
                        <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                    </div>
                ))}
            </div>

            {/* View toggle */}
            <div className={`flex items-center gap-1 rounded-2xl border p-1 mb-6 w-fit ${isDark ? "bg-white/5 border-white/8" : "bg-white border-slate-200 shadow-sm"}`}>
                {[{ key: "calendar", label: "Calendrier" }, { key: "list", label: "Liste" }].map((v) => (
                    <button
                        key={v.key}
                        onClick={() => setView(v.key)}
                        className={`px-4 py-1.5 rounded-xl text-sm font-semibold transition-all ${view === v.key ? tabActive : tabBase}`}
                    >
                        {v.label}
                    </button>
                ))}
            </div>

            {/* ── Calendar view ── */}
            {view === "calendar" && (
                <div className={`rounded-2xl border ${cardBg}`}>
                    {/* Month nav */}
                    <div className={`flex items-center justify-between px-6 py-4 border-b ${isDark ? "border-white/8" : "border-slate-100"}`}>
                        <button
                            onClick={() => setCalMonth(new Date(calMonth.getFullYear(), calMonth.getMonth() - 1, 1))}
                            className={`p-2 rounded-xl transition-colors ${isDark ? "hover:bg-white/10 text-white/60" : "hover:bg-slate-100 text-slate-500"}`}
                        >
                            <ChevronLeftIcon className="h-4 w-4" />
                        </button>
                        <h2 className={`text-sm font-bold ${titleText}`}>
                            {MONTHS_FR[calMonth.getMonth()]} {calMonth.getFullYear()}
                        </h2>
                        <button
                            onClick={() => setCalMonth(new Date(calMonth.getFullYear(), calMonth.getMonth() + 1, 1))}
                            className={`p-2 rounded-xl transition-colors ${isDark ? "hover:bg-white/10 text-white/60" : "hover:bg-slate-100 text-slate-500"}`}
                        >
                            <ChevronRightIcon className="h-4 w-4" />
                        </button>
                    </div>

                    {/* Day headers */}
                    <div className="grid grid-cols-7 px-4 pt-4 pb-2">
                        {DAYS_FR.map((d) => (
                            <div key={d} className={`text-center text-[0.65rem] font-bold uppercase tracking-widest ${subText}`}>{d}</div>
                        ))}
                    </div>

                    {/* Cells */}
                    <div className="grid grid-cols-7 gap-1 px-4 pb-4">
                        {calendarDays.map((date, i) =>
                            date ? (
                                <CalendarCell
                                    key={i}
                                    date={date}
                                    reservations={reservations}
                                    isDark={isDark}
                                    onSelect={setSelected}
                                />
                            ) : (
                                <div key={i} />
                            )
                        )}
                    </div>

                    {/* Legend */}
                    <div className={`flex flex-wrap gap-3 px-6 py-3 border-t ${isDark ? "border-white/8" : "border-slate-100"}`}>
                        {Object.values(STATUS_META).map((m) => (
                            <div key={m.label} className="flex items-center gap-1.5">
                                <span className={`h-2.5 w-2.5 rounded-full ${m.color}`} />
                                <span className={`text-[0.65rem] ${subText}`}>{m.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ── List view ── */}
            {view === "list" && (
                <>
                    {/* Filter chips */}
                    <div className="flex flex-wrap gap-2 mb-4">
                        {FILTERS.map((f) => {
                            const active = filterStatus === f.key;
                            return (
                                <button
                                    key={f.key}
                                    onClick={() => setFilterStatus(f.key)}
                                    className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                                        active
                                            ? "bg-orange-500 text-white border-orange-500 shadow-[0_4px_14px_rgba(255,146,43,0.3)]"
                                            : isDark
                                            ? "bg-white/5 border-white/10 text-white/60 hover:bg-white/10"
                                            : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"
                                    }`}
                                >
                                    {f.label}
                                    {f.key === "en_attente" && stats.pending > 0 && (
                                        <span className={`ml-1.5 rounded-full px-1.5 py-px text-[0.6rem] font-bold ${active ? "bg-white/30 text-white" : "bg-orange-500 text-white"}`}>
                                            {stats.pending}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {filtered.length === 0 ? (
                        <div className={`rounded-2xl border p-12 text-center ${cardBg}`}>
                            <CalendarDaysIcon className={`h-10 w-10 mx-auto mb-3 ${subText}`} />
                            <p className={`text-sm font-medium ${titleText}`}>Aucune réservation</p>
                            <p className={`text-xs mt-1 ${subText}`}>Vous n'avez pas encore de réservations dans cette catégorie.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {filtered.map((r) => (
                                <ReservationCard key={r.id} r={r} isDark={isDark} onSelect={setSelected} />
                            ))}
                        </div>
                    )}
                </>
            )}

            {/* Detail panel */}
            {selected && <DetailPanel r={selected} isDark={isDark} onClose={() => setSelected(null)} />}
        </div>
    );
}
