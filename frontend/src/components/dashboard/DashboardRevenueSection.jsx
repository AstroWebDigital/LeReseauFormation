import React from "react";

const months = [
    { label: "Jan", value: 4.1, trend: "+8" },
    { label: "Fév", value: 5.2, trend: "+18" },
    { label: "Mar", value: 5.0, trend: "+7" },
    { label: "Avr", value: 3.8, trend: "-5" },
    { label: "Mai", value: 5.4, trend: "+15" },
    { label: "Juin", value: 5.8, trend: "+15" },
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
    const maxValue = Math.max(...months.map((m) => m.value));

    return (
        <div className="grid gap-4 xl:grid-cols-[2fr,1.2fr]">
            {/* Bloc graph CA */}
            <div className="rounded-3xl bg-gradient-to-br from-[#171c42] via-[#141937] to-[#090d23] p-6 shadow-[0_30px_60px_rgba(0,0,0,0.75)]">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                            <span>📊</span>
                            <span>Évolution du chiffre d’affaires</span>
                        </h3>
                        <p className="mt-1 text-xs text-slate-300/80">
                            Analyse des 6 derniers mois avec tendances
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <button className="rounded-full bg-white/5 px-3 py-1.5 text-xs text-slate-200 hover:bg-white/10">
                            Actualiser
                        </button>
                        <button className="rounded-full bg-white/8 px-3 py-1.5 text-xs text-slate-200 border border-white/10 hover:bg-white/10">
                            Rapport détaillé
                        </button>
                    </div>
                </div>

                {/* Graph */}
                <div className="mt-6 h-60 flex items-end justify-between gap-4">
                    {months.map((m) => (
                        <div key={m.label} className="flex flex-1 flex-col items-center">
                            <div className="flex flex-col-reverse items-center justify-end h-44 w-full">
                                <div className="w-full rounded-2xl bg-gradient-to-t from-[#ff7a1a] via-[#ff922b] to-[#ffc857] shadow-[0_24px_40px_rgba(255,146,43,0.8)]"
                                     style={{ height: `${(m.value / maxValue) * 100}%` }}
                                />
                            </div>
                            <div className="mt-2 text-[0.7rem] text-slate-300 text-center">
                                {m.label}
                            </div>
                            <div className="text-[0.65rem] text-emerald-400">
                                {m.trend} %
                            </div>
                        </div>
                    ))}
                </div>

                {/* Stats sous le graph */}
                <div className="mt-6 grid gap-3 sm:grid-cols-4 text-[0.75rem] text-slate-200">
                    <div>
                        <p className="text-slate-400">Moyenne mensuelle</p>
                        <p className="mt-1 text-sm font-semibold text-white">4,117€</p>
                    </div>
                    <div>
                        <p className="text-slate-400">Meilleur mois</p>
                        <p className="mt-1 text-sm font-semibold text-emerald-400">
                            5,200€
                        </p>
                    </div>
                    <div>
                        <p className="text-slate-400">Croissance totale</p>
                        <p className="mt-1 text-sm font-semibold text-sky-400">
                            +62.5%
                        </p>
                    </div>
                    <div>
                        <p className="text-slate-400">Prévision Nov</p>
                        <p className="mt-1 text-sm font-semibold text-violet-300">
                            5,800€
                        </p>
                    </div>
                </div>
            </div>

            {/* Colonne droite : alertes + tâches */}
            <div className="flex flex-col gap-4">
                {/* Alertes */}
                <div className="rounded-3xl bg-gradient-to-br from-[#171c42] via-[#141937] to-[#090d23] p-5 shadow-[0_26px_55px_rgba(0,0,0,0.8)]">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                            <span>🔔</span>
                            <span>Alertes importantes</span>
                        </h3>
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-xs font-semibold">
              3
            </span>
                    </div>

                    <div className="mt-4 space-y-3">
                        {alerts.map((a, idx) => (
                            <div
                                key={idx}
                                className="flex items-center justify-between rounded-2xl bg-white/5 px-3.5 py-3 text-xs text-slate-100 border border-white/10"
                            >
                                <div className="flex items-center gap-3">
                                    <div
                                        className={`h-8 w-8 rounded-xl bg-gradient-to-br ${a.color} flex items-center justify-center text-white text-lg`}
                                    >
                                        !
                                    </div>
                                    <div>
                                        <p className="font-medium">{a.label}</p>
                                        <p className="text-[0.7rem] text-slate-300/80">
                                            {a.date}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Tâches du jour */}
                <div className="rounded-3xl bg-gradient-to-br from-[#171c42] via-[#141937] to-[#090d23] p-5 shadow-[0_26px_55px_rgba(0,0,0,0.8)]">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                            <span>✅</span>
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
                                    )} ${
                                        t.disabled ? "opacity-40" : ""
                                    }`}
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
