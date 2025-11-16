import React from "react";
import { Button } from "@heroui/react";

const STEPS = [
    {
        step: 1,
        title: "Évaluation Gratuite",
        text: "Répondez à notre questionnaire pour évaluer votre profil et vos objectifs entrepreneuriaux.",
    },
    {
        step: 2,
        title: "Entretien Conseil",
        text: "Échange personnalisé avec un expert pour valider votre projet et choisir le programme adapté.",
    },
    {
        step: 3,
        title: "Inscription Sécurisée",
        text: "Finalisez votre inscription avec paiement sécurisé et possibilité de financement.",
    },
    {
        step: 4,
        title: "Démarrage Formation",
        text: "Accès immédiat à votre espace personnel et première session avec votre mentor.",
    },
];

const HowToApplySection = () => {
    return (
        <section className="bg-white py-20">
            <div className="mx-auto max-w-6xl px-4 text-center">
                <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900">
                    Comment s'inscrire ?
                </h2>
                <p className="mt-4 max-w-3xl mx-auto text-slate-600">
                    Un processus simple et personnalisé pour commencer votre formation dans
                    les meilleures conditions.
                </p>

                <div className="mt-12 grid gap-8 md:grid-cols-4">
                    {STEPS.map((s) => (
                        <div key={s.step} className="flex flex-col items-center text-center">
                            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-lg font-bold text-white shadow-lg">
                                {s.step}
                            </div>
                            <h3 className="mt-4 text-sm font-semibold text-slate-900">
                                {s.title}
                            </h3>
                            <p className="mt-2 text-xs text-slate-600">{s.text}</p>
                        </div>
                    ))}
                </div>

                <Button
                    color="warning"
                    size="lg"
                    className="mt-10 font-semibold"
                >
                    Commencer l'évaluation gratuite
                </Button>
            </div>
        </section>
    );
};

export default HowToApplySection;
