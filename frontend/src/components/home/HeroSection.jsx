import React from "react";
import { Button, Card, CardBody } from "@heroui/react";

const HeroSection = () => {
    return (
        <section
            id="hero"
            className="relative overflow-hidden bg-gradient-to-br from-[#161f52] via-[#111842] to-[#060a1f] text-white"
        >
            <div className="mx-auto flex max-w-6xl flex-col items-center px-4 py-24 text-center md:py-28">
                {/* Titre */}
                <h1 className="max-w-4xl text-3xl sm:text-4xl md:text-5xl lg:text-[52px] font-extrabold leading-tight">
                    Transformez votre vision entrepreneuriale
                    <br />
                    <span className="text-[#ff9c2f]">en réalité profitable</span>
                </h1>

                {/* Sous-titre */}
                <p className="mt-6 max-w-3xl text-base md:text-lg text-white/80">
                    Construisez les bases solides de votre projet avec un accompagnement
                    sur mesure, des outils modernes et une stratégie adaptée à votre vision.
                </p>

                {/* Stats */}
                <div className="mt-10 grid w-full max-w-3xl grid-cols-1 gap-6 text-sm sm:grid-cols-3">
                    <div className="flex flex-col items-center">
                        <span className="text-3xl font-extrabold text-[#ff9c2f]">25</span>
                        <span className="mt-1 text-white/80">Entreprises créées</span>
                    </div>
                    <div className="flex flex-col items-center">
                        <span className="text-3xl font-extrabold text-[#ff9c2f]">1M€</span>
                        <span className="mt-1 text-white/80">€ de CA généré</span>
                    </div>
                    <div className="flex flex-col items-center">
                        <span className="text-3xl font-extrabold text-[#ff9c2f]">94%</span>
                        <span className="mt-1 text-white/80">% de réussite</span>
                    </div>
                </div>

                {/* Boutons CTA */}
                <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                    {/* Primary CTA – orange plein, radius important comme sur Figma */}
                    <Button
                        color="warning"
                        size="lg"
                        radius="sm"
                        className="min-w-[260px] text-base font-semibold shadow-lg shadow-orange-500/40"
                    >
                        Démarrer ma consultation gratuite
                    </Button>

                    {/* Secondary CTA – bouton blanc comme sur Figma */}
                    <Button
                        variant="solid"
                        color="default"
                        size="lg"
                        radius="sm"
                        className="
              min-w-[240px]
              bg-white
              text-[#111842]
              text-base
              font-semibold
              border
              border-white/80
              shadow-[0_10px_25px_rgba(0,0,0,0.25)]
              hover:bg-[#f5f7ff]
              hover:border-white
            "
                    >
                        Découvrir nos formations
                    </Button>
                </div>
            </div>

            {/* Bandeau stats en bas (optionnel, très léger) */}
            <div className="pointer-events-none absolute inset-x-0 bottom-[-120px] flex justify-center opacity-20">
                <Card className="w-[320px] max-w-full border border-white/10 bg-white/5">
                    <CardBody className="text-center text-xs text-white/70">
                        247 entreprises créées – 18,5M€ de CA généré – 94% de réussite
                    </CardBody>
                </Card>
            </div>
        </section>
    );
};

export default HeroSection;
