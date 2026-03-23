import { Chip, Button } from "@heroui/react";
import { TruckIcon, MapPinIcon, WrenchScrewdriverIcon } from "@heroicons/react/24/outline";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

const resolvePhotoUrl = (url) => {
    if (!url) return null;
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    return `${API_BASE_URL}${url.startsWith("/") ? url : "/" + url}`;
};

const fuelIcon = (fuel) => {
    if (!fuel) return "⛽";
    const f = fuel.toLowerCase();
    if (f.includes("électrique") || f.includes("electrique")) return "⚡";
    if (f.includes("hybride")) return "🔋";
    if (f.includes("diesel")) return "🛢️";
    return "⛽";
};

const typeColor = (type) => {
    const map = { compact: "primary", berline: "secondary", suv: "warning", utilitaire: "default" };
    return map[(type || "").toLowerCase()] || "default";
};

export function VehicleCard({ vehicle, onBook }) {
    const photo = resolvePhotoUrl(vehicle.profilPhoto || vehicle.photo);

    return (
        <div className="group relative rounded-2xl overflow-hidden border border-white/10 bg-gradient-to-b from-[#111936] to-[#0b1025] hover:border-orange-500/40 transition-all duration-300 hover:shadow-xl hover:shadow-orange-500/10 flex flex-col">

            {/* Image */}
            <div className="relative h-44 bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center overflow-hidden">
                {photo ? (
                    <img
                        src={photo}
                        alt={`${vehicle.brand} ${vehicle.model}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                ) : (
                    <TruckIcon className="h-16 w-16 text-white/20" />
                )}
                <div className="absolute top-3 right-3">
                    <Chip size="sm" color="success" variant="flat" className="font-semibold text-xs">
                        Disponible
                    </Chip>
                </div>
                <div className="absolute bottom-3 left-3">
                    <Chip size="sm" color={typeColor(vehicle.type)} variant="flat" className="text-xs">
                        {vehicle.type}
                    </Chip>
                </div>
            </div>

            {/* Content */}
            <div className="p-4 flex flex-col flex-1 gap-3">
                <h3 className="text-white font-bold text-lg leading-tight">
                    {vehicle.brand} <span className="text-orange-400">{vehicle.model}</span>
                </h3>

                {/* Specs */}
                <div className="flex flex-wrap gap-2 text-xs text-white/60">
                    <span className="flex items-center gap-1">
                        <span>{fuelIcon(vehicle.fuel)}</span>
                        {vehicle.fuel}
                    </span>
                    <span className="text-white/20">•</span>
                    <span className="flex items-center gap-1">
                        <WrenchScrewdriverIcon className="h-3 w-3" />
                        {vehicle.transmission}
                    </span>
                    {vehicle.defaultParkingLocation && (
                        <>
                            <span className="text-white/20">•</span>
                            <span className="flex items-center gap-1">
                                <MapPinIcon className="h-3 w-3" />
                                {vehicle.defaultParkingLocation}
                            </span>
                        </>
                    )}
                </div>

                {/* Price + CTA */}
                <div className="mt-auto flex items-center justify-between pt-3 border-t border-white/10">
                    <div>
                        <span className="text-2xl font-bold text-white">
                            {Number(vehicle.baseDailyPrice).toFixed(0)}€
                        </span>
                        <span className="text-white/40 text-xs ml-1">/ jour</span>
                    </div>
                    <Button
                        size="sm"
                        className="bg-[#ff922b] text-white font-bold shadow-lg shadow-orange-500/30 hover:brightness-110"
                        onPress={() => onBook(vehicle)}
                    >
                        Réserver
                    </Button>
                </div>
            </div>
        </div>
    );
}
