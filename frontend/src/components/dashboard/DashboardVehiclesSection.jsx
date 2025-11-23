import React from "react";

const vehicles = [
    {
        status: "Disponible",
        statusColor: "bg-emerald-500",
        city: "Paris 15e",
        name: "Renault Clio",
        year: "2023",
        plate: "AB-123-CD",
        occupation: "88%",
        revenue: "1250€",
        fuel: "Essence",
        km: "12 500 km",
        price: "45€",
        assurance: "OK",
        cg: "OK",
        nextService: "15/02/2025",
        lastService: "15/11/2024",
    },
    // ... ajoute d'autres véhicules si tu veux
];

const DashboardVehiclesSection = () => {
    return (
        <section className="mt-4">
            <div className="flex items-center justify-between mb-3">
                <div>
                    <h3 className="text-sm lg:text-base font-semibold text-white flex items-center gap-2">
                        <span>🚗</span>
                        <span>Mes véhicules en détail</span>
                    </h3>
                    <p className="text-xs text-slate-300/80">
                        Vue d’ensemble de votre flotte et performances
                    </p>
                </div>
                <button className="inline-flex items-center gap-2 rounded-full bg-[#ff922b] px-4 py-2 text-xs font-semibold text-white shadow-[0_18px_40px_rgba(255,146,43,0.9)] hover:brightness-105">
                    <span>＋</span>
                    <span>Ajouter un véhicule</span>
                </button>
            </div>

            <div className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-4">
                {vehicles.map((v, idx) => (
                    <article
                        key={idx}
                        className="overflow-hidden rounded-3xl bg-gradient-to-b from-[#191f46] via-[#151b3a] to-[#0b0f26] shadow-[0_26px_60px_rgba(0,0,0,0.8)] border border-white/5"
                    >
                        {/* Image placeholder */}
                        <div className="relative h-32 w-full bg-gradient-to-tr from-slate-700 via-slate-500 to-slate-400">
                            <div className="absolute left-4 top-4 flex items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-black/35 px-2 py-0.5 text-[0.65rem] text-white">
                  <span
                      className={`h-2 w-2 rounded-full ${v.statusColor}`}
                  />
                    {v.status}
                </span>
                            </div>
                            <div className="absolute right-4 top-4 flex gap-1">
                                {"★★★★★".split("").map((s, i) => (
                                    <span key={i} className="text-yellow-300 text-xs">
                    ★
                  </span>
                                ))}
                            </div>
                        </div>

                        <div className="p-4 space-y-3 text-xs text-slate-100">
                            <div>
                                <h4 className="text-sm font-semibold">{v.name}</h4>
                                <p className="text-[0.7rem] text-slate-300">
                                    {v.year} · {v.plate}
                                </p>
                            </div>

                            <p className="flex items-center gap-1 text-[0.7rem] text-slate-300">
                                📍 {v.city}
                            </p>

                            {/* Occupation / CA */}
                            <div className="grid grid-cols-2 gap-2 text-[0.7rem]">
                                <div className="rounded-2xl bg-white/5 px-3 py-2">
                                    <p className="text-slate-400">Occupation</p>
                                    <p className="mt-1 text-sm font-semibold">{v.occupation}</p>
                                </div>
                                <div className="rounded-2xl bg-white/5 px-3 py-2">
                                    <p className="text-slate-400">CA/mois</p>
                                    <p className="mt-1 text-sm font-semibold">{v.revenue}</p>
                                </div>
                            </div>

                            {/* Carburant / km / tarif */}
                            <div className="grid grid-cols-2 gap-2 text-[0.7rem]">
                                <div className="space-y-1">
                                    <p className="flex justify-between text-slate-400">
                                        <span>Carburant</span>
                                        <span className="text-slate-200">{v.fuel}</span>
                                    </p>
                                    <p className="flex justify-between text-slate-400">
                                        <span>Kilométrage</span>
                                        <span className="text-slate-200">{v.km}</span>
                                    </p>
                                    <p className="flex justify-between text-slate-400">
                                        <span>Tarif/jour</span>
                                        <span className="text-slate-200">{v.price}</span>
                                    </p>
                                </div>
                            </div>

                            {/* Badges */}
                            <div className="flex gap-2 text-[0.65rem]">
                <span className="rounded-full bg-emerald-500/90 px-2 py-0.5 text-white">
                  Assurance {v.assurance}
                </span>
                                <span className="rounded-full bg-emerald-500/90 px-2 py-0.5 text-white">
                  CG {v.cg}
                </span>
                            </div>

                            {/* Révisions */}
                            <div className="grid gap-1 text-[0.7rem] text-slate-300">
                                <p className="flex justify-between">
                                    <span>Prochaine révision</span>
                                    <span className="font-medium">{v.nextService}</span>
                                </p>
                                <p className="flex justify-between">
                                    <span>Dernier entretien</span>
                                    <span>{v.lastService}</span>
                                </p>
                            </div>

                            <div className="mt-3 flex gap-2">
                                <button className="flex-1 rounded-full bg-[#ff922b] py-2 text-xs font-semibold text-white shadow-[0_18px_35px_rgba(255,146,43,0.9)] hover:brightness-110">
                                    Voir tous les détails
                                </button>
                            </div>
                        </div>
                    </article>
                ))}
            </div>
        </section>
    );
};

export default DashboardVehiclesSection;
