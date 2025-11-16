import React from "react";
import { Card, CardBody, Button, Chip } from "@heroui/react";

const PLANS = [
    {
        name: "Formation Essentielle",
        price: "2 490€",
        sub: "ou 3× 830€",
        features: [
            "6 modules fondamentaux",
            "90h de contenu vidéo",
            "Outils et templates",
            "Accès communauté",
        ],
        highlighted: false,
        buttonColor: "default",
    },
    {
        name: "Formation Complète",
        price: "4 990€",
        sub: "ou 5× 998€",
        features: [
            "12 modules complets",
            "180h de contenu vidéo",
            "Mentorat personnalisé 6 mois",
            "Business plan personnalisé",
            "Réseau partenaires exclusif",
        ],
        highlighted: true,
        buttonColor: "primary",
    },
    {
        name: "Formation VIP",
        price: "9 990€",
        sub: "ou 10× 999€",
        features: [
            "Formation complète incluse",
            "Accompagnement 12 mois",
            "Coaching individuel hebdo",
            "Financement partenaire",
            "Garantie de réussite",
        ],
        highlighted: false,
        buttonColor: "warning",
    },
];

const FlagshipProgramSection = () => {
    return (
        <section className="bg-white py-20">
            <div className="mx-auto max-w-6xl px-4">
                {/* Header */}
                <div className="grid gap-10 md:grid-cols-[1.2fr,1fr] md:items-center mb-14">
                    <div>
                        <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900">
                            Formation Entrepreneur Location Pro
                        </h2>
                        <p className="mt-4 text-slate-600 max-w-xl">
                            Notre programme phare vous accompagne de l'idée à la rentabilité
                            avec des méthodes éprouvées et un suivi personnalisé.
                        </p>

                        <div className="mt-6 space-y-4 text-sm text-slate-700">
                            <div className="flex gap-3">
                                <span className="mt-1">📄</span>
                                <div>
                                    <p className="font-semibold">Certification DATADOCK</p>
                                    <p className="text-slate-600">
                                        Formation certifiée éligible aux financements CPF, OPCO et Pôle Emploi.
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <span className="mt-1">🤝</span>
                                <div>
                                    <p className="font-semibold">Accompagnement Personnalisé</p>
                                    <p className="text-slate-600">
                                        Mentorat individuel avec un expert pendant 6 mois après la formation.
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <span className="mt-1">✅</span>
                                <div>
                                    <p className="font-semibold">Garantie de Résultats</p>
                                    <p className="text-slate-600">
                                        94% de nos diplômés créent leur entreprise dans les 12 mois.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Visuel vidéo placeholder */}
                    <Card shadow="lg" className="overflow-hidden border-none">
                        <CardBody className="p-0">
                            <div className="relative h-64 w-full bg-[url('https://images.pexels.com/photos/256559/pexels-photo-256559.jpeg?auto=compress&cs=tinysrgb&w=1200')] bg-cover bg-center">
                                <div className="absolute inset-0 bg-black/25" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/90 shadow-xl">
                                        ▶
                                    </div>
                                </div>
                            </div>
                        </CardBody>
                    </Card>
                </div>

                {/* Pricing cards */}
                <div className="grid gap-6 md:grid-cols-3">
                    {PLANS.map((plan) => (
                        <Card
                            key={plan.name}
                            shadow={plan.highlighted ? "lg" : "sm"}
                            className={`flex flex-col border ${
                                plan.highlighted ? "border-blue-600" : "border-slate-100"
                            }`}
                        >
                            <CardBody className="flex flex-col gap-4">
                                {plan.highlighted && (
                                    <div className="flex justify-center -mt-2">
                                        <Chip
                                            size="sm"
                                            radius="full"
                                            className="bg-blue-600 text-[11px] font-semibold text-white"
                                        >
                                            Plus populaire
                                        </Chip>
                                    </div>
                                )}

                                <div className="mt-1">
                                    <h3 className="text-sm font-semibold text-slate-900">
                                        {plan.name}
                                    </h3>
                                    <div className="mt-3">
                                        <p className="text-3xl font-extrabold text-slate-900">
                                            {plan.price}
                                        </p>
                                        <p className="mt-1 text-xs text-slate-500">{plan.sub}</p>
                                    </div>
                                </div>

                                <ul className="mt-2 flex flex-1 list-disc flex-col gap-2 pl-5 text-sm text-slate-700">
                                    {plan.features.map((f) => (
                                        <li key={f}>{f}</li>
                                    ))}
                                </ul>

                                <Button
                                    color={plan.buttonColor}
                                    className="mt-4 font-semibold"
                                >
                                    Choisir ce programme
                                </Button>
                            </CardBody>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default FlagshipProgramSection;
