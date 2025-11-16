import React from "react";
import { Card, CardBody, Avatar, Chip, Button } from "@heroui/react";

const testimonials = [
    {
        name: "Marc Dubois",
        city: "Lyon, France",
        badge: "€180K CA première année",
        text: "Grâce à Le Réseau Formation, j'ai quitté mon poste de cadre pour créer ma propre agence. Les méthodes enseignées m'ont permis d'atteindre la rentabilité en 8 mois.",
    },
    {
        name: "Sophie Martin",
        city: "Marseille, France",
        badge: "€320K CA deuxième année",
        text: "L'accompagnement personnalisé et les outils fournis m'ont permis de développer une flotte de 25 véhicules en moins de 18 mois. Un investissement qui change la vie.",
    },
    {
        name: "Thomas Leroy",
        city: "Toulouse, France",
        badge: "€450K CA troisième année",
        text: "De commercial à entrepreneur, Le Réseau Formation m'a donné toutes les clés pour réussir. Aujourd'hui, je gère 3 agences et forme d'autres entrepreneurs.",
    },
];

const TestimonialsSection = () => {
    return (
        <section className="bg-[#f5f7fb] py-20">
            <div className="mx-auto max-w-6xl px-4">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900">
                        Nos diplômés transforment leurs vies
                    </h2>
                    <p className="mt-4 max-w-2xl mx-auto text-slate-600">
                        Découvrez comment nos entrepreneurs ont créé des entreprises prospères
                        dans le secteur de la location de véhicules.
                    </p>
                </div>

                <div className="grid gap-8 md:grid-cols-3">
                    {testimonials.map((t) => (
                        <Card key={t.name} shadow="sm" className="border-none">
                            <CardBody className="flex flex-col gap-4">
                                <div className="flex items-center gap-3">
                                    <Avatar
                                        name={t.name}
                                        size="md"
                                        className="bg-gradient-to-br from-blue-500 to-indigo-500 text-white"
                                    />
                                    <div className="flex flex-col">
                                        <span className="font-semibold text-slate-900">{t.name}</span>
                                        <span className="text-xs text-slate-500">{t.city}</span>
                                    </div>
                                </div>

                                <Chip
                                    size="sm"
                                    variant="flat"
                                    className="bg-emerald-50 text-emerald-700 w-full justify-center"
                                >
                                    {t.badge}
                                </Chip>

                                <p className="text-sm leading-relaxed text-slate-700">{t.text}</p>

                                <Button
                                    variant="light"
                                    size="sm"
                                    className="justify-start px-0 text-amber-600 font-medium"
                                >
                                    ⭐ Voir le témoignage vidéo
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
