import React from "react";
import {
    Button,
    Card,
    CardBody,
    Input,
    DatePicker,
} from "@heroui/react";
import { MapPinIcon, CalendarDaysIcon } from "@heroicons/react/24/outline";

const HeroSection = () => {
    return (
        <section
            id="hero"
            className="relative overflow-hidden bg-white"
        >
            <div className="mx-auto flex max-w-6xl flex-col gap-12 px-4 py-16 md:flex-row md:items-center md:py-24">
                {/* Colonne gauche : texte + formulaire */}
                <div className="flex-1">
                    <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[52px] font-extrabold leading-tight tracking-tight text-[#241c4f]">
                        Louez une voiture
                        <br className="hidden sm:block" />
                        <span className="block">en quelques clics</span>
                    </h1>

                    <p className="mt-4 text-base md:text-lg text-[#241c4f]/80">
            <span className="font-semibold text-[#f400b4]">
              Déverrouillez-la 24h/24
            </span>{" "}
                        avec l&apos;appli et partez&nbsp;!
                    </p>

                    {/* Carte formulaire de recherche */}
                    <Card className="mt-10 border-none shadow-xl shadow-black/5">
                        <CardBody className="flex flex-col gap-4">
                            {/* Adresse */}
                            <Input
                                radius="full"
                                placeholder="Adresse précise, gare, métro…"
                                classNames={{
                                    inputWrapper: "bg-[#f5f5f7] h-14 px-4 shadow-none",
                                    input: "text-[15px] text-[#241c4f]",
                                }}
                                startContent={
                                    <MapPinIcon className="h-5 w-5 text-[#a0a0b5]" />
                                }
                            />

                            {/* Dates */}
                            <div className="grid gap-4 sm:grid-cols-2">
                                <DatePicker
                                    label="Début"
                                    labelPlacement="inside"
                                    radius="full"
                                    variant="flat"
                                    className="w-full"
                                    classNames={{
                                        base: "w-full",
                                        inputWrapper:
                                            "bg-[#f5f5f7] h-14 px-4 rounded-full shadow-none border-none",
                                        input: "text-[15px] text-[#241c4f]",
                                        label: "text-[15px] text-[#a0a0b5]",
                                    }}
                                    selectorIcon={
                                        <CalendarDaysIcon className="h-5 w-5 text-[#a0a0b5]" />
                                    }
                                />

                                <DatePicker
                                    label="Fin"
                                    labelPlacement="inside"
                                    radius="full"
                                    variant="flat"
                                    className="w-full"
                                    classNames={{
                                        base: "w-full",
                                        inputWrapper:
                                            "bg-[#f5f5f7] h-14 px-4 rounded-full shadow-none border-none",
                                        input: "text-[15px] text-[#241c4f]",
                                        label: "text-[15px] text-[#a0a0b5]",
                                    }}
                                    selectorIcon={
                                        <CalendarDaysIcon className="h-5 w-5 text-[#a0a0b5]" />
                                    }
                                />
                            </div>

                            {/* Bouton Rechercher */}
                            <Button
                                radius="full"
                                className="mt-2 h-14 w-full bg-gradient-to-r from-[#f400b4] to-[#7c3aed] text-base font-semibold text-white shadow-lg shadow-[#f400b4]/40"
                            >
                                Rechercher
                            </Button>
                        </CardBody>
                    </Card>

                    {/* Texte AXA + stores */}
                    <div className="mt-6 space-y-4">
                        <p className="text-sm text-[#241c4f]/80">
                            Location de voiture entre particuliers et pros assurée par{" "}
                            <span className="inline-flex h-6 w-10 items-center justify-center rounded bg-[#001c71] text-[10px] font-extrabold text-white align-middle">
                AXA
              </span>
                        </p>

                        <div className="flex flex-wrap items-center gap-3">
                            <Button
                                radius="lg"
                                variant="bordered"
                                className="h-11 px-4 text-xs font-medium"
                            >
                                Télécharger dans l&apos;App Store
                            </Button>
                            <Button
                                radius="lg"
                                variant="bordered"
                                className="h-11 px-4 text-xs font-medium"
                            >
                                Disponible sur Google Play
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Colonne droite : visuel téléphone responsive */}
                <div className="relative hidden w-full flex-1 justify-center md:flex md:justify-end">
                    {/* Fonds décoratifs */}
                    <div className="pointer-events-none absolute -right-6 -top-6 hidden sm:block h-40 w-40 rounded-full bg-[#e6ebff]" />
                    <div className="pointer-events-none absolute -right-24 bottom-0 hidden sm:block h-64 w-64 rotate-6 rounded-[999px] bg-[#eef2ff]" />

                    <div className="relative w-52 xs:w-56 sm:w-64 md:w-72 lg:w-80">
                        <div className="relative w-full aspect-[9/18] overflow-hidden rounded-[2.5rem] border-[10px] border-black/90 bg-black shadow-[0_18px_50px_rgba(15,23,42,0.65)]">
                            <img
                                src="https://images.pexels.com/photos/799443/pexels-photo-799443.jpeg?auto=compress&cs=tinysrgb&w=800"
                                alt="Application de location de voiture sur smartphone"
                                className="h-full w-full object-cover"
                            />
                        </div>
                        <div className="pointer-events-none absolute inset-0 -z-10 rounded-[2.5rem] bg-white/40 blur-2xl" />
                    </div>
                </div>
            </div>
        </section>
    );
};

export default HeroSection;
