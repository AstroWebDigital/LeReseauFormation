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

export function VehicleCard({ vehicle, onBook, isDark }) {
    const isLight = !isDark;
    const photo = resolvePhotoUrl(vehicle.profilPhoto || vehicle.photo);

    return (
        <div className={`group relative rounded-2xl overflow-hidden border transition-all duration-300 hover:shadow-xl flex flex-col
            ${isLight
            ? "border-slate-200 bg-white hover:border-orange-500/40 hover:shadow-orange-500/10"
            : "border-white/10 bg-gradient-to-b from-[#111936] to-[#0b1025] hover:border-orange-500/40 hover:shadow-orange-500/10"
        }`}
        >
            {/* Image */}
            <div className={`relative h-44 flex items-center justify-center overflow-hidden
                ${isLight ? "bg-slate-100" : "bg-gradient-to-br from-slate-800 to-slate-900"}`}>
                {photo ? (
                    <img
                        src={photo}
                        alt={`${vehicle.brand} ${vehicle.model}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                ) : (
                    <TruckIcon className={`h-16 w-16 ${isLight ? "text-slate-300" : "text-white/20"}`} />
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
                <h3 className={`font-bold text-lg leading-tight ${isLight ? "text-slate-800" : "text-white"}`}>
                    {vehicle.brand} <span className="text-orange-400">{vehicle.model}</span>
                </h3>

                <div className={`flex flex-wrap gap-2 text-xs ${isLight ? "text-slate-500" : "text-white/60"}`}>
                    <span className="flex items-center gap-1">
                        <span>{fuelIcon(vehicle.fuel)}</span>
                        {vehicle.fuel}
                    </span>
                    <span className={isLight ? "text-slate-300" : "text-white/20"}>•</span>
                    <span className="flex items-center gap-1">
                        <WrenchScrewdriverIcon className="h-3 w-3" />
                        {vehicle.transmission}
                    </span>
                    {vehicle.defaultParkingLocation && (
                        <>
                            <span className={isLight ? "text-slate-300" : "text-white/20"}>•</span>
                            <span className="flex items-center gap-1">
                                <MapPinIcon className="h-3 w-3" />
                                {vehicle.defaultParkingLocation}
                            </span>
                        </>
                    )}
                </div>

                <div className={`mt-auto flex items-center justify-between pt-3 border-t
                    ${isLight ? "border-slate-100" : "border-white/10"}`}>
                    <div>
                        <span className={`text-2xl font-bold ${isLight ? "text-slate-800" : "text-white"}`}>
                            {Number(vehicle.baseDailyPrice).toFixed(0)}€
                        </span>
                        <span className={`text-xs ml-1 ${isLight ? "text-slate-400" : "text-white/40"}`}>/ jour</span>
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
