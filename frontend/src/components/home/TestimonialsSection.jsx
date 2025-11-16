import React from "react";
import { Card, CardBody, Avatar, Chip, Button } from "@heroui/react";
import { Star } from "lucide-react";

import MarcDubois from "@/assets/accueil/testimonials/mdubois.jpg";
import SophieMartin from "@/assets/accueil/testimonials/smartin.jpg";
import ThomasLeroy from "@/assets/accueil/testimonials/tleroy.jpg";

const testimonials = [
    {
        name: "Marc Dubois",
        city: "Lyon, France",
        badge: "€180K CA première année",
        text: "Grâce à Le Réseau Formation, j'ai quitté mon poste de cadre pour créer ma propre agence. Les méthodes enseignées m'ont permis d'atteindre la rentabilité en 8 mois.",
        avatar: MarcDubois,
    },
    {
        name: "Sophie Martin",
        city: "Marseille, France",
        badge: "€320K CA deuxième année",
        text: "L'accompagnement personnalisé et les outils fournis m'ont permis de développer une flotte de 25 véhicules en moins de 18 mois. Un investissement qui change la vie.",
        avatar: SophieMartin,
    },
    {
        name: "Thomas Leroy",
        city: "Toulouse, France",
        badge: "€450K CA troisième année",
        text: "De commercial à entrepreneur, Le Réseau Formation m'a donné toutes les clés pour réussir. Aujourd'hui, je gère 3 agences et forme d'autres entrepreneurs.",
        avatar: ThomasLeroy,
    },
];

const TestimonialsSection = () => {
    return (
        <section className="bg-[#f5f7fb] py-20">
            <div className="mx-auto max-w-6xl px-4">
                {/* Titre */}
                <div className="mb-12 text-center">
                    <h2 className="text-3xl font-extrabold text-slate-900 md:text-4xl">
                        Nos diplômés transforment leurs vies
                    </h2>
                    <p className="mx-auto mt-4 max-w-2xl text-slate-600">
                        Découvrez comment nos entrepreneurs ont créé des entreprises prospères
                        dans le secteur de la location de véhicules.
                    </p>
                </div>

                {/* Cards */}
                <div className="grid gap-8 md:grid-cols-3">
                    {testimonials.map((t) => (
                        <Card
                            key={t.name}
                            shadow="sm"
                            className="border-none bg-white"
                            radius="lg"
                        >
                            <CardBody className="flex flex-col gap-4 p-6">
                                {/* Avatar + nom */}
                                <div className="flex items-center gap-3">
                                    <Avatar
                                        src={t.avatar}
                                        name={t.name}
                                        size="md"
                                        radius="full"
                                    />
                                    <div className="flex flex-col">
                    <span className="font-semibold text-slate-900">
                      {t.name}
                    </span>
                                        <span className="text-xs text-slate-500">{t.city}</span>
                                    </div>
                                </div>

                                {/* Badge CA – pleine largeur */}
                                <Chip
                                    size="sm"
                                    variant="flat"
                                    radius="full"
                                    className="w-full justify-center bg-emerald-50 text-[13px] font-medium text-emerald-700"
                                >
                                    {t.badge}
                                </Chip>

                                {/* Texte */}
                                <p className="text-sm leading-relaxed text-slate-700">
                                    {t.text}
                                </p>

                                {/* Lien vidéo */}
                                <Button
                                    variant="light"
                                    size="sm"
                                    className="mt-1 inline-flex items-center gap-1 px-0 text-[13px] font-semibold text-[#f59e0b]"
                                >
                                    <Star className="h-3.5 w-3.5 fill-[#f59e0b] text-[#f59e0b]" />
                                    Voir le témoignage vidéo
                                </Button>
                            </CardBody>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default TestimonialsSection;
