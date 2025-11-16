// src/components/sections/TimelineSection.jsx
import React from "react";
import { Card, CardBody } from "@heroui/react";

const EVENTS = [
    {
        year: "2018",
        title: "Création de Le Réseau Formation",
        text: "Lancement de notre première formation en création d'agence de location avec 12 entrepreneurs pionniers.",
    },
    {
        year: "2019",
        title: "Certification DATADOCK",
        text: "Obtention de la certification qualité et lancement du programme de formation avancée en gestion de flotte.",
    },
    {
        year: "2020",
        title: "Digitalisation complète",
        text: "Adaptation rapide au contexte sanitaire avec le lancement de notre plateforme de formation 100% digitale.",
    },
    {
        year: "2022",
        title: "100ème entreprise créée",
        text: "Franchissement du cap symbolique des 100 agences créées par nos diplômés avec un CA cumulé de 8M€.",
    },
    {
        year: "2024",
        title: "Partenariats stratégiques",
        text: "Signature d'accords avec Renault, Peugeot et BNP Paribas pour faciliter l'accès au financement de nos diplômés.",
    },
    {
        year: "2025",
        title: "Leadership confirmé",
        text: "247 entreprises créées, 18,5M€ de CA généré et reconnaissance comme leader français de la formation entrepreneuriale mobilité.",
    },
];

// Couleurs des pastilles années (proche Figma)
const YEAR_COLORS = {
    2018: "bg-[#1e40af]",
    2019: "bg-[#f59e0b]",
    2020: "bg-[#22c55e]",
    2022: "bg-[#f97316]",
    2024: "bg-[#1e40af]",
    2025: "bg-[#f59e0b]",
};

const TimelineSection = () => {
    return (
        <section id="apropos" className="bg-white py-20">
            <div className="mx-auto max-w-6xl px-4">
                {/* Header */}
                <div className="text-center mb-14">
                    <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900">
                        Notre parcours d&apos;excellence
                    </h2>
                    <p className="mt-4 text-slate-600 max-w-2xl mx-auto">
                        7 années d&apos;innovation et de croissance au service de
                        l&apos;entrepreneuriat français.
                    </p>
                </div>

                {/* Timeline */}
                <div className="relative mt-6">
                    {/* Ligne verticale centrale */}
                    <div className="pointer-events-none absolute left-1/2 top-0 bottom-0 -translate-x-1/2 w-px bg-[#dbeafe]" />

                    <div className="space-y-14 md:space-y-20">
                        {EVENTS.map((evt, index) => {
                            const isLeft = index % 2 === 0;
                            const yearColor = YEAR_COLORS[evt.year] || "bg-[#1e40af]";

                            return (
                                <div
                                    key={evt.year}
                                    className="relative flex flex-col md:flex-row md:items-center md:justify-between"
                                >
                                    {/* Colonne gauche (desktop) */}
                                    <div
                                        className={`hidden md:flex w-[45%] ${
                                            isLeft ? "justify-end" : "justify-start"
                                        }`}
                                    >
                                        {isLeft && (
                                            <Card
                                                shadow="sm"
                                                radius="lg"
                                                className="max-w-md rounded-2xl border border-slate-100 shadow-[0_16px_40px_rgba(15,23,42,0.06)]"
                                            >
                                                <CardBody className="px-8 py-6">
                                                    <h3 className="text-sm font-semibold text-slate-900">
                                                        {evt.title}
                                                    </h3>
                                                    <p className="mt-3 text-xs leading-relaxed text-slate-600">
                                                        {evt.text}
                                                    </p>
                                                </CardBody>
                                            </Card>
                                        )}
                                    </div>

                                    {/* Pastille année au centre */}
                                    <div className="order-first md:order-none flex justify-center md:w-[10%] mb-4 md:mb-0">
                                        <div className="flex flex-col items-center">
                                            <div
                                                className={`flex h-11 w-11 items-center justify-center rounded-full ${yearColor} text-[11px] font-semibold text-white shadow-[0_12px_30px_rgba(15,23,42,0.25)] ring-4 ring-[#f5f7fb]`}
                                            >
                                                {evt.year}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Colonne droite (desktop) */}
                                    <div
                                        className={`hidden md:flex w-[45%] ${
                                            isLeft ? "justify-start" : "justify-end"
                                        }`}
                                    >
                                        {!isLeft && (
                                            <Card
                                                shadow="sm"
                                                radius="lg"
                                                className="max-w-md rounded-2xl border border-slate-100 shadow-[0_16px_40px_rgba(15,23,42,0.06)]"
                                            >
                                                <CardBody className="px-8 py-6">
                                                    <h3 className="text-sm font-semibold text-slate-900">
                                                        {evt.title}
                                                    </h3>
                                                    <p className="mt-3 text-xs leading-relaxed text-slate-600">
                                                        {evt.text}
                                                    </p>
                                                </CardBody>
                                            </Card>
                                        )}
                                    </div>

                                    {/* Version mobile : carte pleine largeur sous la pastille */}
                                    <div className="md:hidden w-full">
                                        <Card
                                            shadow="sm"
                                            radius="lg"
                                            className="rounded-2xl border border-slate-100 shadow-[0_16px_40px_rgba(15,23,42,0.06)]"
                                        >
                                            <CardBody className="px-6 py-5">
                                                <h3 className="text-sm font-semibold text-slate-900">
                                                    {evt.title}
                                                </h3>
                                                <p className="mt-3 text-xs leading-relaxed text-slate-600">
                                                    {evt.text}
                                                </p>
                                            </CardBody>
                                        </Card>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default TimelineSection;
