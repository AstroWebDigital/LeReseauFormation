// src/components/dashboard/DashboardKpiRow.jsx
import React from "react";
import {
    CurrencyEuroIcon,
    TruckIcon,
    ArrowTrendingUpIcon,
    CalendarDaysIcon,
} from "@heroicons/react/24/solid";

const DashboardKpiRow = () => {
    return (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            {/* 1. Chiffre d’affaires mensuel */}
            <div className="rounded-3xl bg-gradient-to-br from-[#211c4d] via-[#181d42] to-[#0b0f26] p-5 shadow-[0_24px_55px_rgba(0,0,0,0.8)] border border-white/5">
                <div className="flex items-start justify-between">
                    <div>
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-purple-500 via-fuchsia-500 to-pink-500 shadow-[0_16px_30px_rgba(192,132,252,0.7)]">
                            <CurrencyEuroIcon className="h-6 w-6 text-white" />
                        </div>
                        <p className="mt-3 text-[0.8rem] text-slate-200/85">
                            Chiffre d’affaires mensuel
                        </p>
                    </div>
                    <span className="rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 px-3 py-1 text-[0.7rem] font-semibold text-white shadow-[0_0_18px_rgba(16,185,129,0.8)] whitespace-nowrap">
            +18.5% vs mois dernier
          </span>
                </div>

                <p className="mt-3 text-3xl font-semibold text-white leading-none">
                    5170€
                </p>
                <p className="mt-3 text-[0.75rem] text-slate-300">
                    Objectif:{" "}
                    <span className="font-semibold text-white">6000€</span> · Reste:{" "}
                    <span className="font-semibold text-[#ffb454]">830€</span>
                </p>
            </div>

            {/* 2. Véhicules */}
            <div className="rounded-3xl bg-gradient-to-br from-[#211c4d] via-[#181d42] to-[#0b0f26] p-5 shadow-[0_24px_55px_rgba(0,0,0,0.8)] border border-white/5">
                <div>
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-orange-400 to-amber-400 shadow-[0_16px_30px_rgba(251,146,60,0.8)]">
                        <TruckIcon className="h-6 w-6 text-white" />
                    </div>
                    <p className="mt-3 text-[0.8rem] text-slate-200/85">Véhicules</p>
                </div>

                <div className="mt-2 flex items-baseline gap-2">
                    <p className="text-2xl font-semibold text-white">4</p>
                    <span className="text-sm font-semibold text-emerald-400">+2</span>
                </div>

                <div className="mt-4 flex gap-2 text-[0.7rem]">
          <span className="rounded-full bg-emerald-500/90 px-3 py-1 text-white">
            2 dispo
          </span>
                    <span className="rounded-full bg-sky-600/90 px-3 py-1 text-white">
            2 loués
          </span>
                </div>
            </div>

            {/* 3. Taux occupation */}
            <div className="rounded-3xl bg-gradient-to-br from-[#211c4d] via-[#181d42] to-[#0b0f26] p-5 shadow-[0_24px_55px_rgba(0,0,0,0.8)] border border-white/5">
                <div>
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-500 to-lime-400 shadow-[0_16px_30px_rgba(34,197,94,0.8)]">
                        <ArrowTrendingUpIcon className="h-6 w-6 text-white" />
                    </div>
                    <p className="mt-3 text-[0.8rem] text-slate-200/85">
                        Taux occupation
                    </p>
                </div>

                <div className="mt-2 flex items-baseline gap-2">
                    <p className="text-2xl font-semibold text-white">81%</p>
                    <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/90 text-[0.65rem]">
            ↑
          </span>
                </div>

                <div className="mt-3 h-2 rounded-full bg-slate-700/80 overflow-hidden">
                    <div className="h-full w-[81%] rounded-full bg-emerald-400" />
                </div>
            </div>

            {/* 4. Réservations */}
            <div className="rounded-3xl bg-gradient-to-br from-[#211c4d] via-[#181d42] to-[#0b0f26] p-5 shadow-[0_24px_55px_rgba(0,0,0,0.8)] border border-white/5">
                <div>
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-500 shadow-[0_16px_30px_rgba(59,130,246,0.85)]">
                        <CalendarDaysIcon className="h-6 w-6 text-white" />
                    </div>
                    <p className="mt-3 text-[0.8rem] text-slate-200/85">
                        Réservations
                    </p>
                </div>

                <div className="mt-2 flex items-baseline gap-2">
                    <p className="text-2xl font-semibold text-white">4</p>
                    <span className="rounded-full bg-sky-500/95 px-2 py-0.5 text-[0.7rem] font-semibold text-white shadow-[0_0_14px_rgba(56,189,248,0.8)]">
            actives
          </span>
                </div>

                <div className="mt-3">
          <span className="inline-flex rounded-full bg-amber-500/90 px-3 py-1 text-[0.7rem] text-white">
            2 en attente
          </span>
                </div>
            </div>

            {/* 5. Tarif moyen */}
            <div className="rounded-3xl bg-gradient-to-br from-[#211c4d] via-[#181d42] to-[#0b0f26] p-5 shadow-[0_24px_55px_rgba(0,0,0,0.8)] border border-white/5">
                <div>
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-cyan-400 to-emerald-400 shadow-[0_16px_30px_rgba(45,212,191,0.85)]">
                        <CurrencyEuroIcon className="h-6 w-6 text-white" />
                    </div>
                    <p className="mt-3 text-[0.8rem] text-slate-200/85">
                        Tarif moyen
                    </p>
                </div>

                <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-2xl font-semibold text-white">51€</span>
                    <span className="text-sm text-slate-200">/jour</span>
                </div>

                <p className="mt-3 text-[0.75rem] text-emerald-300">
                    +5€ vs moyenne
                </p>
            </div>
        </div>
    );
};

export default DashboardKpiRow;
