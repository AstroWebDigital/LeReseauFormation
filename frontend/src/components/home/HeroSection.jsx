import React from "react";
import { Button, Card, CardBody } from "@heroui/react";

const HeroSection = () => {
    return (
        <section
            id="hero"
            className="relative overflow-hidden bg-gradient-to-br from-[#161f52] via-[#111842] to-[#060a1f] text-white"
        >
            <div className="mx-auto flex max-w-6xl flex-col items-center px-4 py-24 text-center md:py-28">
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold leading-tight max-w-3xl">
                    Transformez votre vision entrepreneuriale
                    <br />
                    <span className="text-[#ff9c2f]">en réalité profitable</span>
                </h1>

                <p className="mt-6 max-w-2xl text-base md:text-lg text-white/80">
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

                {/* Boutons */}
                <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                    <Button
                        color="warning"
                        size="lg"
                        className="min-w-[230px] font-semibold text-base shadow-lg shadow-orange-500/30"
                    >
                        Démarrer ma consultation gratuite
                    </Button>

                    <Button
                        variant="bordered"
                        size="lg"
                        className="min-w-[210px] border-white/40 text-base font-semibold text-white hover:bg-white/10"
                    >
                        Découvrir nos formations
                    </Button>
                </div>
            </div>

            {/* Petite carte stats en bas pour rappeler la marque (optionnel) */}
            <div className="pointer-events-none absolute inset-x-0 bottom-[-120px] flex justify-center opacity-20">
                <Card className="w-[320px] max-w-full rounded-2xl bg-white/5 border border-white/10">
                    <CardBody className="text-center text-xs text-white/70">
                        247 entreprises créées – 18,5M€ de CA généré – 94% de réussite
                    </CardBody>
                </Card>
            </div>
        </section>
    );
};

export default HeroSection;
