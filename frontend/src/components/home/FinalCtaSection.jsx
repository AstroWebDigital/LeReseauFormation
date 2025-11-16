import React from "react";
import { Button } from "@heroui/react";

const FinalCtaSection = () => {
    return (
        <section className="bg-white py-20">
            <div className="mx-auto max-w-4xl px-4 text-center">
                <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900">
                    Prêt à transformer votre avenir professionnel ?
                </h2>
                <p className="mt-4 text-slate-600">
                    Réservez votre consultation gratuite et découvrez comment créer votre agence de
                    location prospère.
                </p>

                <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
                    <Button color="primary" size="lg" className="min-w-[220px] font-semibold">
                        Consultation gratuite
                    </Button>
                    <Button
                        variant="flat"
                        size="lg"
                        className="min-w-[220px] bg-slate-900 text-white font-semibold"
                    >
                        Voir nos formations
                    </Button>
                </div>
            </div>
        </section>
    );
};

export default FinalCtaSection;
