// src/components/sections/FlagshipProgramSection.jsx
import React from "react";
import { Card, CardBody, Button, Chip } from "@heroui/react";
import { CheckCircleIcon as CheckCircleSolidIcon } from "@heroicons/react/24/solid";
import {
    CheckCircleIcon,
    UserGroupIcon,
    ChartBarIcon,
} from "@heroicons/react/24/outline";

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
        buttonClass:
            "bg-[#020617] hover:bg-[#020617]/90 text-white font-semibold",
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
        buttonClass:
            "bg-[#1e40af] hover:bg-[#1e3a8a] text-white font-semibold",
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
        buttonClass:
            "bg-[#f59e0b] hover:bg-[#d97706] text-white font-semibold",
    },
];

const FlagshipProgramSection = () => {
    return (
        <section className="bg-white py-20">
            <div className="mx-auto max-w-6xl px-4">
                {/* Titre centré */}
                <div className="text-center max-w-3xl mx-auto mb-12">
                    <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900">
                        Formation Entrepreneur Location Pro
                    </h2>
                    <p className="mt-4 text-slate-600">
                        Notre programme phare vous accompagne de l&apos;idée à la
                        rentabilité avec des méthodes éprouvées et un suivi
                        personnalisé.
                    </p>
                </div>

                {/* Bénéfices (gauche) + vidéo (droite) */}
                <div className="grid gap-10 md:grid-cols-2 md:items-center mb-16">
                    {/* Bénéfices à gauche */}
                    <div className="space-y-5">
                        <FeatureItem
                            bg="bg-[#dbeafe]"
                            Icon={CheckCircleIcon}
                            iconColor="text-[#1e40af]"
                            title="Certification DATADOCK"
                            text="Formation certifiée éligible aux financements CPF, OPCO et Pôle Emploi."
                        />
                        <FeatureItem
                            bg="bg-[#fef3c7]"
                            Icon={UserGroupIcon}
                            iconColor="text-[#f59f0b]"
                            title="Accompagnement Personnalisé"
                            text="Mentorat individuel avec un expert pendant 6 mois après la formation."
                        />
                        <FeatureItem
                            bg="bg-[#dcfce7]"
                            Icon={ChartBarIcon}
                            iconColor="text-[#16a34a]"
                            title="Garantie de Résultats"
                            text="94% de nos diplômés créent leur entreprise dans les 12 mois."
                        />
                    </div>

                    {/* Visuel vidéo à droite */}
                    <Card
                        shadow="lg"
                        className="relative h-64 md:h-72 overflow-hidden border-none rounded-3xl shadow-[0_30px_80px_rgba(15,23,42,0.22)]"
                    >
                        <CardBody className="p-0">
                            <div className="relative h-full w-full bg-[url('https://images.pexels.com/photos/256559/pexels-photo-256559.jpeg?auto=compress&cs=tinysrgb&w=1600')] bg-cover bg-center">
                                <div className="absolute inset-0 bg-black/20" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-[0_20px_50px_rgba(15,23,42,0.35)]">
                                        <div className="ml-1 text-3xl text-[#1e40af] leading-none">
                                            ▶
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardBody>
                    </Card>
                </div>

                {/* Cartes de pricing */}
                <div className="grid gap-6 md:grid-cols-3">
                    {PLANS.map((plan) => (
                        <Card
                            key={plan.name}
                            shadow={plan.highlighted ? "lg" : "sm"}
                            className={`relative flex flex-col rounded-3xl border bg-white overflow-visible ${
                                plan.highlighted
                                    ? "border-[#1e40af] shadow-[0_30px_80px_rgba(15,23,42,0.18)] md:-mt-4"
                                    : "border-slate-100 shadow-[0_18px_50px_rgba(15,23,42,0.06)]"
                            }`}
                        >
                            {plan.highlighted && (
                                <div className="absolute -top-4 inset-x-0 flex justify-center">
                                    <Chip
                                        size="sm"
                                        radius="full"
                                        className="bg-[#1e40af] text-[11px] font-semibold text-white px-4 py-1 shadow-md"
                                    >
                                        Plus populaire
                                    </Chip>
                                </div>
                            )}

                            <CardBody
                                className={`flex flex-col gap-4 pb-6 px-8 ${
                                    plan.highlighted ? "pt-9" : "pt-7"
                                }`}
                            >
                                <div className="mt-1">
                                    <h3 className="text-sm font-semibold text-slate-900">
                                        {plan.name}
                                    </h3>
                                    <div className="mt-4">
                                        <p className="text-3xl font-extrabold text-[#1e40af]">
                                            {plan.price}
                                        </p>
                                        <p className="mt-1 text-xs text-slate-500">{plan.sub}</p>
                                    </div>
                                </div>

                                <ul className="mt-3 flex flex-1 flex-col gap-2 text-sm text-slate-700">
                                    {plan.features.map((f) => (
                                        <li key={f} className="flex items-start gap-2">
                                            <CheckCircleSolidIcon className="mt-[2px] h-4 w-4 text-[#16a34a]" />
                                            <span>{f}</span>
                                        </li>
                                    ))}
                                </ul>

                                <Button
                                    fullWidth
                                    radius="md"
                                    className={`mt-4 h-11 text-sm ${plan.buttonClass}`}
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

/* Composant pour les 3 bénéfices */
const FeatureItem = ({ bg, Icon, iconColor, title, text }) => (
    <div className="flex gap-3">
        <div
            className={`flex h-11 w-11 items-center justify-center rounded-xl ${bg}`}
        >
            <Icon className={`h-5 w-5 ${iconColor}`} />
        </div>
        <div>
            <p className="text-sm font-semibold text-slate-900">{title}</p>
            <p className="mt-1 text-sm text-slate-600">{text}</p>
        </div>
    </div>
);

export default FlagshipProgramSection;
