import React from "react";
import { Button } from "@heroui/react";

const CommunitySection = () => {
    return (
        <section
            id="communaute"
            className="bg-[#161f52] text-white py-20"
        >
            <div className="mx-auto max-w-6xl px-4 text-center">
                <h2 className="text-3xl md:text-4xl font-extrabold">
                    Une communauté qui grandit chaque jour
                </h2>
                <p className="mt-4 max-w-3xl mx-auto text-white/80">
                    Rejoignez un réseau d'entrepreneurs passionnés et bénéficiez d'un
                    accompagnement continu.
                </p>

                <div className="mt-10 grid gap-8 sm:grid-cols-4 text-sm">
                    <div className="flex flex-col items-center">
                        <span className="text-3xl font-extrabold text-[#ff9c2f]">247</span>
                        <span className="mt-1 text-white/80">Entreprises créées</span>
                    </div>
                    <div className="flex flex-col items-center">
            <span className="text-3xl font-extrabold text-[#ff9c2f]">
              18.5M€
            </span>
                        <span className="mt-1 text-white/80">
              Chiffre d'affaires généré
            </span>
                    </div>
                    <div className="flex flex-col items-center">
            <span className="text-3xl font-extrabold text-[#ff9c2f]">
              1,247
            </span>
                        <span className="mt-1 text-white/80">Membres actifs</span>
                    </div>
                    <div className="flex flex-col items-center">
                        <span className="text-3xl font-extrabold text-[#ff9c2f]">94%</span>
                        <span className="mt-1 text-white/80">Taux de réussite</span>
                    </div>
                </div>

                <Button
                    color="warning"
                    size="lg"
                    className="mt-10 font-semibold"
                >
                    Rejoindre la communauté
                </Button>
            </div>
        </section>
    );
};

export default CommunitySection;
