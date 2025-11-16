import React from "react";

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

const TimelineSection = () => {
    return (
        <section id="apropos" className="bg-[#f5f7fb] py-20">
            <div className="mx-auto max-w-5xl px-4">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900">
                        Notre parcours d'excellence
                    </h2>
                    <p className="mt-4 text-slate-600 max-w-2xl mx-auto">
                        7 années d'innovation et de croissance au service de l'entrepreneuriat français.
                    </p>
                </div>

                <div className="relative">
                    {/* Ligne verticale */}
                    <div className="absolute left-1/2 top-0 h-full w-[2px] -translate-x-1/2 bg-slate-200" />

                    <div className="space-y-10">
                        {EVENTS.map((evt, index) => {
                            const isLeft = index % 2 === 0;
                            return (
                                <div
                                    key={evt.year}
                                    className="flex items-center justify-between gap-6"
                                >
                                    {/* Colonne gauche */}
                                    <div
                                        className={`hidden md:flex w-5/12 ${
                                            isLeft ? "justify-end" : "justify-start"
                                        }`}
                                    >
                                        {isLeft && (
                                            <div className="max-w-sm rounded-2xl bg-white p-5 shadow-sm">
                                                <h3 className="text-sm font-semibold text-slate-900">
                                                    {evt.title}
                                                </h3>
                                                <p className="mt-2 text-xs text-slate-600">{evt.text}</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Point + année */}
                                    <div className="flex w-2/12 flex-col items-center justify-center gap-2">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white shadow-lg">
                                            {evt.year}
                                        </div>
                                    </div>

                                    {/* Colonne droite */}
                                    <div
                                        className={`w-full md:w-5/12 ${
                                            isLeft ? "md:justify-start" : "md:justify-end"
                                        } flex`}
                                    >
                                        {!isLeft && (
                                            <div className="hidden md:block max-w-sm rounded-2xl bg-white p-5 shadow-sm">
                                                <h3 className="text-sm font-semibold text-slate-900">
                                                    {evt.title}
                                                </h3>
                                                <p className="mt-2 text-xs text-slate-600">
                                                    {evt.text}
                                                </p>
                                            </div>
                                        )}

                                        {/* Version mobile : carte pleine largeur */}
                                        <div className="md:hidden max-w-full rounded-2xl bg-white p-5 shadow-sm">
                                            <h3 className="text-sm font-semibold text-slate-900">
                                                {evt.title}
                                            </h3>
                                            <p className="mt-2 text-xs text-slate-600">{evt.text}</p>
                                        </div>
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
