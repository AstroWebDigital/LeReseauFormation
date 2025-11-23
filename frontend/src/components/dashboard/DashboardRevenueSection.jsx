import React from "react";
import {
    ChartBarSquareIcon,
    ArrowPathIcon,
    DocumentTextIcon,
    BellAlertIcon,
    CheckCircleIcon,
} from "@heroicons/react/24/outline";
import {
    ArrowTrendingUpIcon,
    ArrowTrendingDownIcon,
    ExclamationTriangleIcon,
} from "@heroicons/react/24/solid";

const months = [
    { label: "Jan", value: 4.1, trend: "+8",  height: 140 },
    { label: "Fév", value: 5.2, trend: "+18", height: 200 },
    { label: "Mar", value: 5.0, trend: "+7",  height: 190 },
    { label: "Avr", value: 3.8, trend: "-5",  height: 150 },
    { label: "Mai", value: 5.4, trend: "+15", height: 210 },
    { label: "Juin", value: 5.8, trend: "+15", height: 230 },
];


const alerts = [
    {
        label: "Révision Citroën C3 dépassée",
        date: "10/11/2024",
        color: "from-amber-500 to-orange-500",
    },
    {
        label: "Assurance Citroën C3 expirée",
        date: "08/11/2024",
        color: "from-red-500 to-rose-500",
    },
    {
        label: "Nouvelle réservation reçue",
        date: "20/11/2024",
        color: "from-sky-500 to-indigo-500",
    },
    {
        label: "Paiement de 420€ reçu",
        date: "19/11/2024",
        color: "from-emerald-500 to-teal-400",
    },
];

const tasks = [
    { label: "Répondre à Marie Dubois", priority: "high" },
    { label: "Planifier révision Golf", priority: "medium" },
    { label: "Renouveler assurance C3", priority: "high" },
    { label: "Nettoyage complet Peugeot", priority: "low", disabled: true },
];

const pillClass = (priority) => {
    switch (priority) {
        case "high":
            return "bg-gradient-to-r from-red-500 to-rose-500";
        case "medium":
            return "bg-gradient-to-r from-amber-400 to-orange-400";
        case "low":
        default:
            return "bg-gradient-to-r from-emerald-400 to-teal-400";
    }
};

const DashboardRevenueSection = () => {


    return (
        <div className="grid gap-4 xl:grid-cols-[2fr_1.2fr]">
            {/* Bloc graph CA */}
            <div className="rounded-[32px] bg-gradient-to-br from-[#171c42] via-[#141937] to-[#090d23] p-6 lg:p-7 border border-white/5">
                {/* Header */}
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h3 className="text-sm lg:text-base font-semibold text-white flex items-center gap-2">
                            <ChartBarSquareIcon className="h-5 w-5 text-orange-400" />
                            <span>Évolution du chiffre d’affaires</span>
                        </h3>
                        <p className="mt-1 text-xs text-slate-300/80">
                            Analyse des 6 derniers mois avec tendances
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <button className="inline-flex items-center gap-1.5 rounded-full bg-white/5 px-3.5 py-1.5 text-xs text-slate-100 hover:bg-white/10 border border-white/10">
                            <ArrowPathIcon className="h-3.5 w-3.5" />
                            Actualiser
                        </button>
                        <button className="inline-flex items-center gap-1.5 rounded-full bg-white/5 px-3.5 py-1.5 text-xs text-slate-100 hover:bg-white/10 border border-white/15">
                            <DocumentTextIcon className="h-3.5 w-3.5" />
                            Rapport détaillé
                        </button>
                    </div>
                </div>

                {/* Graph sans blur */}
                {/* Graph sans blur, barres à hauteur fixe comme la maquette */}
                <div className="mt-6 lg:mt-7 flex items-end justify-between gap-6 h-64">
                    {months.map((m) => {
                        const isPositive = m.trend.startsWith("+");
                        const TrendIcon = isPositive
                            ? ArrowTrendingUpIcon
                            : ArrowTrendingDownIcon;
                        const trendColor = isPositive ? "text-emerald-400" : "text-rose-400";

                        return (
                            <div
                                key={m.label}
                                className="flex flex-1 flex-col items-center"
                            >
                                <div className="flex items-end justify-center h-full w-full">
                                    <div
                                        className="w-16 rounded-[28px] bg-[#ff922b]"
                                        style={{ height: `${m.height}px` }}
                                    />
                                </div>
                                <div className="mt-3 text-[0.7rem] text-slate-200 text-center">
                                    {m.label}
                                </div>
                                <div
                                    className={`mt-0.5 flex items-center gap-1 text-[0.65rem] ${trendColor}`}
                                >
                                    <TrendIcon className="h-3 w-3" />
                                    <span>{m.trend} %</span>
                                </div>
                            </div>
                        );
                    })}
                </div>


                {/* Ligne de séparation */}
                <div className="mt-5 h-px w-full bg-slate-600/40" />

                {/* Stats sous le graph */}
                <div className="mt-5 grid gap-3 sm:grid-cols-4 text-[0.75rem] text-slate-200">
                    <div className="rounded-2xl bg-white/5 px-3 py-2.5 text-center">
                        <p className="text-slate-400">Moyenne mensuelle</p>
                        <p className="mt-1 text-sm font-semibold text-white">4,117€</p>
                    </div>
                    <div className="rounded-2xl bg-white/5 px-3 py-2.5 text-center">
                        <p className="text-slate-400">Meilleur mois</p>
                        <p className="mt-1 text-sm font-semibold text-emerald-400">
                            5,200€
                        </p>
                    </div>
                    <div className="rounded-2xl bg-white/5 px-3 py-2.5 text-center">
                        <p className="text-slate-400">Croissance totale</p>
                        <p className="mt-1 text-sm font-semibold text-sky-400">
                            +62.5%
                        </p>
                    </div>
                    <div className="rounded-2xl bg-white/5 px-3 py-2.5 text-center">
                        <p className="text-slate-400">Prévision Nov</p>
                        <p className="mt-1 text-sm font-semibold text-violet-300">
                            5,800€
                        </p>
                    </div>
                </div>
            </div>

            {/* Colonne droite : alertes + tâches */}
            <div className="flex flex-col gap-4">
                {/* Alertes importantes */}
                <div className="rounded-[28px] bg-gradient-to-br from-[#171c42] via-[#141937] to-[#090d23] p-5 border border-white/5">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                            <BellAlertIcon className="h-4 w-4 text-amber-400" />
                            <span>Alertes importantes</span>
                        </h3>
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-xs font-semibold text-white">
              3
            </span>
                    </div>

                    <div className="mt-4 space-y-2.5">
                        {alerts.map((a, idx) => (
                            <div
                                key={idx}
                                className="rounded-2xl bg-white/3 px-3.5 py-2.5 text-xs text-slate-100 border border-white/5 flex items-center gap-3"
                            >
                                <div
                                    className={`flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br ${a.color}`}
                                >
                                    <ExclamationTriangleIcon className="h-4 w-4 text-white" />
                                </div>
                                <div className="flex-1">
                                    <p className="font-medium text-[0.8rem]">{a.label}</p>
                                    <p className="text-[0.7rem] text-slate-300/80">
                                        {a.date}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Tâches du jour */}
                <div className="rounded-[28px] bg-gradient-to-br from-[#171c42] via-[#141937] to-[#090d23] p-5 border border-white/5">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                            <CheckCircleIcon className="h-4 w-4 text-emerald-400" />
                            <span>Tâches du jour</span>
                        </h3>
                        <span className="text-[0.7rem] text-slate-300/80">
              1/4
            </span>
                    </div>

                    <div className="mt-4 space-y-2.5">
                        {tasks.map((t, idx) => (
                            <div
                                key={idx}
                                className={`flex items-center justify-between rounded-2xl px-3.5 py-2.5 text-xs ${
                                    t.disabled
                                        ? "bg-white/2 text-slate-500/60"
                                        : "bg-white/5 text-slate-100"
                                }`}
                            >
                <span
                    className={`truncate ${
                        t.disabled ? "line-through" : "font-medium"
                    }`}
                >
                  {t.label}
                </span>
                                <span
                                    className={`ml-3 inline-flex min-w-[70px] justify-center rounded-full px-2 py-0.5 text-[0.65rem] font-semibold text-white ${pillClass(
                                        t.priority
                                    )} ${t.disabled ? "opacity-40" : ""}`}
                                >
                  {t.priority}
                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardRevenueSection;
