// src/components/sections/ProgramsSection.jsx
import React from "react";
import { Card, CardBody, Button, Chip } from "@heroui/react";
import {
    CheckBadgeIcon,
    BoltIcon,
    ChartBarIcon,
    UserGroupIcon,
} from "@heroicons/react/24/outline";

import flotilleImage from "@/assets/accueil/programs/image-flotille.jpg";

const FEATURES = [
    {
        title: "Création d'entreprise complète",
        description:
            "Statuts juridiques, démarches administratives, financement et business plan personnalisé pour votre projet.",
        icon: CheckBadgeIcon,
        bg: "bg-[#dbeafe]",
        iconColor: "text-[#1e40af]",
    },
    {
        title: "Gestion de flotte optimisée",
        description:
            "Stratégies d'achat, maintenance préventive, assurances et maximisation de la rentabilité de vos véhicules.",
        icon: BoltIcon,
        bg: "bg-[#fef3c7]",
        iconColor: "text-[#f59f0b]",
    },
    {
        title: "Marketing digital performant",
        description:
            "Référencement local, publicités ciblées, gestion de la réputation en ligne et acquisition client automatisée.",
        icon: ChartBarIcon,
        bg: "bg-[#dcfce7]",
        iconColor: "text-[#16a34a]",
    },
    {
        title: "Accompagnement personnalisé",
        description:
            "Mentorat individuel, suivi de performance et accès à notre réseau d'entrepreneurs expérimentés.",
        icon: UserGroupIcon,
        bg: "bg-[#ffe4e6]",
        iconColor: "text-[#e11d48]",
    },
];

const ProgramsSection = () => {
    return (
        <section id="formations" className="bg-white py-20">
            <div className="mx-auto max-w-6xl px-4">
                {/* Header */}
                <div className="text-center max-w-2xl mx-auto">
                    <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900">
                        Nos programmes de formation
                    </h2>
                    <p className="mt-4 text-slate-600">
                        Des formations complètes conçues par des experts du secteur pour
                        vous accompagner à chaque étape de votre projet entrepreneurial.
                    </p>
                </div>

                {/* 2 colonnes */}
                <div className="mt-10 flex flex-col gap-12 md:flex-row md:items-center">
                    {/* Colonne gauche */}
                    <div className="flex-1">
                        <div className="flex flex-col gap-6">
                            {FEATURES.map((f) => (
                                <div key={f.title} className="flex gap-4">
                                    <div
                                        className={`flex h-11 w-11 items-center justify-center rounded-xl ${f.bg}`}
                                    >
                                        <f.icon
                                            className={`h-5 w-5 ${f.iconColor}`}
                                            aria-hidden="true"
                                        />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-semibold text-slate-900">
                                            {f.title}
                                        </h3>
                                        <p className="mt-1 text-sm text-slate-600">
                                            {f.description}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Bouton HeroUI + couleur Figma */}
                        <Button
                            color="primary"
                            size="lg"
                            radius="sm"
                            className="mt-10 px-10 bg-[#1e40af] hover:bg-[#1d35a0] text-white font-semibold shadow-lg"
                        >
                            Découvrir nos formations
                        </Button>
                    </div>

                    {/* Colonne droite : image + DATADOCK */}
                    <div className="flex-1 flex items-center justify-center">
                        <Card
                            shadow="lg"
                            className="relative h-[260px] w-full max-w-md border-none rounded-3xl overflow-hidden bg-transparent"
                        >
                            <CardBody className="p-0">
                                <img
                                    src={flotilleImage}
                                    alt="Portail La Flottille"
                                    className="h-full w-full object-cover"
                                />
                            </CardBody>

                            {/* Badge DATADOCK au-dessus de l'image, en bas à droite */}
                            <div className="absolute bottom-4 right-4 md:bottom-6 md:right-6 z-10">
                                <Chip
                                    size="lg"
                                    radius="full"
                                    variant="shadow"
                                    className="bg-white px-6 py-2 flex flex-col items-start"
                                >
                  <span className="text-[13px] font-semibold tracking-wide text-[#1e40af]">
                    DATADOCK
                  </span>
                                    <span className="text-[11px] text-slate-500 leading-tight">
                    Certifié
                  </span>
                                </Chip>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ProgramsSection;
