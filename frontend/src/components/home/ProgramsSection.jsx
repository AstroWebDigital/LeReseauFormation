import React from "react";
import { Card, CardBody, Button, Chip } from "@heroui/react";

const FEATURES = [
    {
        title: "Création d'entreprise complète",
        description:
            "Statuts juridiques, démarches administratives, financement et business plan personnalisé pour votre projet.",
        icon: "📄",
    },
    {
        title: "Gestion de flotte optimisée",
        description:
            "Stratégies d'achat, maintenance préventive, assurances et maximisation de la rentabilité de vos véhicules.",
        icon: "🚗",
    },
    {
        title: "Marketing digital performant",
        description:
            "Référencement local, publicités ciblées, gestion de la réputation en ligne et acquisition client automatisée.",
        icon: "📈",
    },
    {
        title: "Accompagnement personnalisé",
        description:
            "Mentorat individuel, suivi de performance et accès à notre réseau d'entrepreneurs expérimentés.",
        icon: "🤝",
    },
];

const ProgramsSection = () => {
    return (
        <section id="formations" className="bg-white py-20">
            <div className="mx-auto flex max-w-6xl flex-col gap-12 px-4 md:flex-row md:items-center">
                <div className="flex-1">
                    <div className="text-center md:text-left">
                        <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900">
                            Nos programmes de formation
                        </h2>
                        <p className="mt-4 text-slate-600 max-w-xl">
                            Des formations complètes conçues par des experts du secteur pour vous
                            accompagner à chaque étape de votre projet entrepreneurial.
                        </p>
                    </div>

                    <div className="mt-8 flex flex-col gap-5">
                        {FEATURES.map((f) => (
                            <div key={f.title} className="flex gap-4">
                                <div className="mt-1 flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-lg">
                                    <span>{f.icon}</span>
                                </div>
                                <div>
                                    <h3 className="text-sm font-semibold text-slate-900">
                                        {f.title}
                                    </h3>
                                    <p className="mt-1 text-sm text-slate-600">{f.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <Button color="primary" className="mt-8 font-semibold">
                        Découvrir nos formations
                    </Button>
                </div>

                {/* Image / Datadock badge */}
                <div className="flex-1 flex items-center justify-center">
                    <Card
                        shadow="lg"
                        className="relative h-[260px] w-full max-w-md overflow-hidden border-none"
                    >
                        <CardBody className="p-0">
                            <div className="h-full w-full bg-[url('https://images.pexels.com/photos/572056/pexels-photo-572056.jpeg?auto=compress&cs=tinysrgb&w=1200')] bg-cover bg-center" />
                        </CardBody>

                        <div className="absolute -bottom-6 right-6">
                            <Chip
                                size="lg"
                                radius="full"
                                className="shadow-xl bg-white text-blue-700 px-5 py-4 flex flex-col items-start gap-0"
                            >
                <span className="text-xs font-semibold tracking-wide">
                  DATADOCK
                </span>
                                <span className="text-[11px] text-slate-500">Certifié</span>
                            </Chip>
                        </div>
                    </Card>
                </div>
            </div>
        </section>
    );
};

export default ProgramsSection;
