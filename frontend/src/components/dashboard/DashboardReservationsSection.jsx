import React from "react";

const reservations = [
    {
        name: "Marie Dubois",
        vehicle: "Renault Clio",
        dates: "22-25 Nov",
        price: "180€",
        status: "En attente",
        progress: 25,
    },
    {
        name: "Pierre Martin",
        vehicle: "Peugeot 3008",
        dates: "23-30 Nov",
        price: "420€",
        status: "En cours",
        progress: 60,
    },
    {
        name: "Sophie Laurent",
        vehicle: "Volkswagen Golf",
        dates: "25-27 Nov",
        price: "165€",
        status: "Confirmée",
        progress: 100,
    },
    {
        name: "Lucas Bernard",
        vehicle: "Volkswagen Golf",
        dates: "26-28 Nov",
        price: "135€",
        status: "En attente",
        progress: 10,
    },
];

const badgeColor = (status) => {
    if (status.includes("confirm")) return "bg-emerald-500/90";
    if (status.includes("cours")) return "bg-sky-500/90";
    return "bg-amber-400/90";
};

const DashboardReservationsSection = () => {
    return (
        <section className="mt-4">
            <div className="flex items-center justify-between mb-3">
                <div>
                    <h3 className="text-sm lg:text-base font-semibold text-white flex items-center gap-2">
                        <span>📅</span>
                        <span>Réservations récentes</span>
                    </h3>
                    <p className="text-xs text-slate-300/80">
                        Suivi en temps réel de vos locations
                    </p>
                </div>
                <button className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-1.5 text-xs font-medium text-slate-100 hover:bg-white/10">
                    Voir toutes les réservations →
                </button>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
                {reservations.map((r, idx) => (
                    <article
                        key={idx}
                        className="rounded-3xl bg-gradient-to-br from-[#181e45] via-[#151b3a] to-[#090d23] p-4 shadow-[0_24px_55px_rgba(0,0,0,0.85)]"
                    >
                        <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-slate-400 overflow-hidden">
                                    {/* Placeholder avatar */}
                                    <div className="h-full w-full bg-gradient-to-br from-slate-500 to-slate-300" />
                                </div>
                                <div className="text-xs text-slate-100">
                                    <p className="text-sm font-semibold">{r.name}</p>
                                    <p className="text-[0.7rem] text-slate-300">
                                        {r.vehicle}
                                    </p>
                                    <p className="mt-1 text-[0.7rem] text-slate-300 flex items-center gap-1">
                                        📅 {r.dates}
                                    </p>
                                </div>
                            </div>

                            <div className="text-right text-xs">
                                <p className="text-orange-300 font-semibold text-sm">
                                    {r.price}
                                </p>
                                <span
                                    className={`mt-1 inline-flex justify-center rounded-full px-2 py-0.5 text-[0.65rem] text-white ${badgeColor(
                                        r.status.toLowerCase()
                                    )}`}
                                >
                  {r.status}
                </span>
                            </div>
                        </div>

                        {/* Progression */}
                        <div className="mt-4 space-y-2">
                            <div className="flex items-center justify-between text-[0.7rem] text-slate-300">
                                <span>Progression</span>
                                <span>{r.progress}%</span>
                            </div>
                            <div className="h-1.5 rounded-full bg-slate-700/80">
                                <div
                                    className="h-1.5 rounded-full bg-[#ff922b]"
                                    style={{ width: `${r.progress}%` }}
                                />
                            </div>
                        </div>

                        {/* Boutons */}
                        <div className="mt-3 flex gap-2 text-[0.7rem]">
                            <button className="flex-1 rounded-full border border-white/10 bg-white/5 py-1.5 text-slate-100 hover:bg-white/10">
                                👁️ Détails
                            </button>
                            <button className="flex-1 rounded-full border border-white/10 bg-white/5 py-1.5 text-slate-100 hover:bg-white/10">
                                📝 Contrat
                            </button>
                        </div>
                    </article>
                ))}
            </div>
        </section>
    );
};

export default DashboardReservationsSection;
