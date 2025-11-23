// src/components/dashboard/DashboardVehiclesSection.jsx
import React from "react";
import {
    TruckIcon,
    MapPinIcon,
    StarIcon,
    PlusIcon,
} from "@heroicons/react/24/solid";

const vehicles = [
    {
        status: "Disponible",
        statusColor: "bg-emerald-500",
        city: "Paris 15e",
        name: "Renault Clio",
        year: "2023",
        plate: "AB-123-CD",
        occupation: "88%",
        revenue: "1250€",
        fuel: "Essence",
        km: "12 500 km",
        price: "45€",
        assurance: "OK",
        cg: "OK",
        nextService: "15/02/2025",
        lastService: "15/11/2024",
        // https://unsplash.com/photos/white-and-black-car-on-road-surrounded-by-trees-during-daytime-Hkvh9pDAT3g
        imageUrl:
            "https://images.unsplash.com/photo-Hkvh9pDAT3g?auto=format&fit=crop&w=1200&q=80",
    },
    {
        status: "Loué",
        statusColor: "bg-sky-500",
        city: "Paris 15e",
        name: "Peugeot 3008",
        year: "2022",
        plate: "EF-456-GH",
        occupation: "95%",
        revenue: "1850€",
        fuel: "Diesel",
        km: "28 000 km",
        price: "65€",
        assurance: "OK",
        cg: "OK",
        nextService: "28/01/2025",
        lastService: "10/11/2024",
        // https://unsplash.com/photos/red-peugeot-suv-parked-beside-curb-G-MPRKFU8hA
        imageUrl:
            "https://images.unsplash.com/photo-G-MPRKFU8hA?auto=format&fit=crop&w=1200&q=80",
    },
    {
        status: "Bloqué",
        statusColor: "bg-rose-500",
        city: "Boulogne",
        name: "Citroën C3",
        year: "2021",
        plate: "IJ-789-KL",
        occupation: "54%",
        revenue: "650€",
        fuel: "Essence",
        km: "45 000 km",
        price: "40€",
        assurance: "À vérifier",
        cg: "OK",
        nextService: "10/11/2024",
        lastService: "05/10/2024",
        // https://unsplash.com/photos/red-citroen-car-parked-on-road-Wcs-zY60Yq4
        imageUrl:
            "https://images.unsplash.com/photo-Wcs-zY60Yq4?auto=format&fit=crop&w=1200&q=80",
    },
    {
        status: "Disponible",
        statusColor: "bg-emerald-500",
        city: "Paris 15e",
        name: "Volkswagen Golf",
        year: "2023",
        plate: "MN-012-OP",
        occupation: "86%",
        revenue: "1420€",
        fuel: "Essence",
        km: "8 500 km",
        price: "55€",
        assurance: "OK",
        cg: "OK",
        nextService: "05/03/2025",
        lastService: "18/11/2024",
        // https://unsplash.com/photos/a-blue-volkswagen-golf-car-is-parked-c21MBPgJDiY
        imageUrl:
            "https://images.unsplash.com/photo-c21MBPgJDiY?auto=format&fit=crop&w=1200&q=80",
    },
];

const DashboardVehiclesSection = () => {
    return (
        <section className="mt-8">
            {/* Titre + CTA */}
            <div className="flex items-center justify-between mb-4 gap-4">
                <div>
                    <h3 className="text-sm lg:text-base font-semibold text-white flex items-center gap-2">
                        <TruckIcon className="h-5 w-5 text-orange-400" />
                        <span>Mes véhicules en détail</span>
                    </h3>
                    <p className="text-xs text-slate-300/80">
                        Vue d’ensemble de votre flotte et performances
                    </p>
                </div>
                <button className="inline-flex items-center gap-2 rounded-full bg-[#ff922b] px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-black/40 hover:bg-[#ffa94d] transition-colors">
                    <PlusIcon className="h-4 w-4" />
                    <span>Ajouter un véhicule</span>
                </button>
            </div>

            {/* Cartes véhicules */}
            <div className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-4">
                {vehicles.map((v, idx) => (
                    <article
                        key={idx}
                        className="flex flex-col overflow-hidden rounded-[28px] bg-[#161b3b] border border-white/5 shadow-xl shadow-black/40"
                    >
                        {/* Image */}
                        <div className="relative h-40 w-full overflow-hidden">
                            <img
                                src={v.imageUrl}
                                alt={v.name}
                                className="h-full w-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#0b0f26] via-black/40 to-transparent" />

                            {/* Statut */}
                            <div className="absolute left-4 top-4 flex items-center gap-2">
                                <span className="inline-flex items-center gap-1 rounded-full bg-black/60 px-2.5 py-0.5 text-[0.65rem] text-white">
                                    <span
                                        className={`h-2 w-2 rounded-full ${v.statusColor}`}
                                    />
                                    {v.status}
                                </span>
                            </div>

                            {/* Étoiles */}
                            <div className="absolute right-4 top-4 flex gap-0.5">
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <StarIcon
                                        key={i}
                                        className="h-3.5 w-3.5 text-yellow-300"
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Contenu carte */}
                        <div className="p-4 space-y-3 text-xs text-slate-100">
                            <div>
                                <h4 className="text-sm font-semibold">{v.name}</h4>
                                <p className="text-[0.7rem] text-slate-300">
                                    {v.year} · {v.plate}
                                </p>
                            </div>

                            <p className="flex items-center gap-1 text-[0.7rem] text-slate-300">
                                <MapPinIcon className="h-3.5 w-3.5 text-orange-400" />
                                {v.city}
                            </p>

                            <div className="grid grid-cols-2 gap-2 text-[0.7rem]">
                                <div className="rounded-2xl bg-[#1f2547] px-3 py-2">
                                    <p className="text-slate-400">Occupation</p>
                                    <p className="mt-1 text-sm font-semibold">{v.occupation}</p>
                                </div>
                                <div className="rounded-2xl bg-[#1f2547] px-3 py-2">
                                    <p className="text-slate-400">CA/mois</p>
                                    <p className="mt-1 text-sm font-semibold">{v.revenue}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 text-[0.7rem]">
                                <div className="space-y-1">
                                    <p className="flex justify-between text-slate-400">
                                        <span>Carburant</span>
                                        <span className="text-slate-200">{v.fuel}</span>
                                    </p>
                                    <p className="flex justify-between text-slate-400">
                                        <span>Kilométrage</span>
                                        <span className="text-slate-200">{v.km}</span>
                                    </p>
                                    <p className="flex justify-between text-slate-400">
                                        <span>Tarif/jour</span>
                                        <span className="text-slate-200">{v.price}</span>
                                    </p>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-2 text-[0.65rem]">
                                <span className="rounded-full bg-emerald-600 px-2.5 py-0.5 text-white">
                                    Assurance {v.assurance}
                                </span>
                                <span className="rounded-full bg-emerald-600 px-2.5 py-0.5 text-white">
                                    CG {v.cg}
                                </span>
                            </div>

                            <div className="grid gap-1 text-[0.7rem] text-slate-300">
                                <p className="flex justify-between">
                                    <span>Prochaine révision</span>
                                    <span className="font-medium">{v.nextService}</span>
                                </p>
                                <p className="flex justify-between">
                                    <span>Dernier entretien</span>
                                    <span>{v.lastService}</span>
                                </p>
                            </div>

                            <div className="mt-3">
                                <button className="w-full rounded-full bg-[#ff922b] py-2 text-xs font-semibold text-white shadow-md shadow-black/40 hover:bg-[#ffa94d] transition-colors">
                                    Voir tous les détails
                                </button>
                            </div>
                        </div>
                    </article>
                ))}
            </div>
        </section>
    );
};

export default DashboardVehiclesSection;
