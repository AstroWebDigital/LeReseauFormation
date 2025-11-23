import React from "react";

const cards = [
    {
        id: 1,
        label: "Chiffre d’affaires mensuel",
        value: "5170€",
        sub: "Objectif: 6000€  ·  Reste: 830€",
        badge: "+18.5% vs mois dernier",
        badgeColor: "from-emerald-500 to-emerald-400",
        iconBg: "from-purple-500 to-fuchsia-500",
    },
    {
        id: 2,
        label: "Véhicules",
        value: "4",
        sub: "2 dispo · 2 loués",
        badge: "+2",
        badgeColor: "from-emerald-500 to-emerald-400",
        iconBg: "from-orange-400 to-amber-400",
    },
    {
        id: 3,
        label: "Taux occupation",
        value: "81%",
        sub: "Tendance en hausse",
        badge: "↗",
        badgeColor: "from-emerald-500 to-emerald-400",
        iconBg: "from-emerald-500 to-teal-400",
    },
    {
        id: 4,
        label: "Réservations",
        value: "4",
        sub: "2 en attente",
        badge: "actives",
        badgeColor: "from-sky-500 to-indigo-400",
        iconBg: "from-sky-500 to-indigo-400",
    },
    {
        id: 5,
        label: "Tarif moyen",
        value: "51€/jour",
        sub: "+5€ vs moyenne",
        badge: "",
        badgeColor: "from-emerald-500 to-emerald-400",
        iconBg: "from-cyan-400 to-emerald-400",
    },
];

const DashboardKpiRow = () => {
    return (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            {cards.map((card) => (
                <div
                    key={card.id}
                    className="rounded-3xl bg-gradient-to-br from-[#191f46] via-[#141936] to-[#090d23] p-4 shadow-[0_20px_45px_rgba(0,0,0,0.7)]"
                >
                    <div className="flex items-start justify-between gap-3">
                        <div className="flex flex-col gap-3">
                            <div className="flex items-center gap-2">
                                <div
                                    className={`flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-tr ${card.iconBg}`}
                                >
                                    <span className="text-white text-lg">€</span>
                                </div>
                                {card.badge && (
                                    <span
                                        className={`rounded-full bg-gradient-to-r ${card.badgeColor} bg-opacity-80 px-2 py-0.5 text-[0.65rem] font-semibold text-white shadow-[0_0_18px_rgba(16,185,129,0.7)]`}
                                    >
                    {card.badge}
                  </span>
                                )}
                            </div>
                            <p className="text-[0.75rem] text-slate-300/80">
                                {card.label}
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-2xl font-semibold text-white">
                                {card.value}
                            </p>
                        </div>
                    </div>
                    <p className="mt-3 text-[0.75rem] text-slate-400">{card.sub}</p>
                </div>
            ))}
        </div>
    );
};

export default DashboardKpiRow;
