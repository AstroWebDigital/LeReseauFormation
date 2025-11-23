import React from "react";
import {
    ChartBarIcon,
    HandRaisedIcon,
    CalendarDaysIcon,
    BoltIcon,
    ArrowTrendingUpIcon,
    TrophyIcon,
} from "@heroicons/react/24/outline";

const DashboardWelcomeCard = () => {
    const today = new Date().toLocaleDateString("fr-FR", {
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric",
    });

    return (
        // Carte globale
        <div className="rounded-[32px] bg-gradient-to-br from-[#171c42] via-[#111632] to-[#090d23] p-6 lg:p-7 shadow-[0_26px_60px_rgba(0,0,0,0.7)] border border-white/5">
            {/* Layout interne : colonne en mobile, 2 colonnes en desktop */}
            <div className="flex flex-col lg:flex-row lg:items-stretch gap-6">
                {/* GAUCHE : Bonjour Jean */}
                <div className="flex-1 flex items-start gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#ff922b] shadow-[0_12px_30px_rgba(255,146,43,0.75)]">
                        <ChartBarIcon className="h-7 w-7 text-white" />
                    </div>
                    <div className="flex-1">
                        <h2 className="text-xl lg:text-2xl font-semibold text-white flex items-center gap-2">
                            <span>Bonjour Jean !</span>
                            <span>👋</span>
                        </h2>
                        <p className="mt-1 text-sm text-slate-200">
                            Content de vous revoir sur Le Réseau Location.
                        </p>

                        <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-slate-300/85">
                            <div className="inline-flex items-center gap-2">
                                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/5">
                                    <CalendarDaysIcon className="h-4 w-4 text-slate-100" />
                                </span>
                                <span>{today}</span>
                            </div>
                            <div className="inline-flex items-center gap-2">
                                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/5">
                                    <BoltIcon className="h-4 w-4 text-emerald-300" />
                                </span>
                                <span>Système opérationnel</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* DROITE : colonne Objectif + Score */}
                <div className="w-full lg:w-[340px] flex flex-col gap-4 lg:ml-auto">
                    {/* Objectif mensuel */}
                    <div className="rounded-2xl bg-gradient-to-br from-emerald-700/95 via-emerald-600/90 to-emerald-500/90 px-4 py-3.5 text-white shadow-[0_20px_40px_rgba(16,185,129,0.6)] border border-emerald-300/40">
                        <div className="flex items-center justify-between text-[0.75rem] font-medium">
                            <span>Objectif mensuel</span>
                            <ArrowTrendingUpIcon className="h-4 w-4 text-emerald-100" />
                        </div>

                        <div className="mt-2 flex items-baseline justify-between gap-2">
                            <p className="text-2xl font-semibold leading-none">87%</p>
                            <p className="text-[0.75rem] font-medium text-emerald-50">
                                +12% vs hier
                            </p>
                        </div>

                        <div className="mt-3 h-2 w-full rounded-full bg-emerald-900/50 overflow-hidden">
                            <div className="h-full w-[87%] rounded-full bg-emerald-300" />
                        </div>
                    </div>

                    {/* Score de performance */}
                    <div className="rounded-2xl bg-gradient-to-br from-orange-600/95 via-orange-500/90 to-amber-400/90 px-4 py-3.5 text-white shadow-[0_20px_40px_rgba(249,115,22,0.65)] border border-orange-300/40">
                        <div className="flex items-center justify-between text-[0.75rem] font-medium">
                            <span>Score de performance</span>
                            <span className="inline-flex items-center gap-1 text-[0.7rem]">
                                <TrophyIcon className="h-4 w-4 text-amber-100" />
                                <span>Top 5%</span>
                            </span>
                        </div>
                        <div className="mt-2 text-2xl font-semibold leading-none">
                            9.2/10
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardWelcomeCard;
