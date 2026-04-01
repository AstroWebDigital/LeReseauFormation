import { Card, CardHeader, CardBody, Button, Chip, Divider } from "@heroui/react";
import { Fuel, Settings2, Gauge, MapPin, Car, LockKeyhole } from "lucide-react";
import { useTheme } from "@/theme/ThemeProvider";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

function resolveUrl(url) {
    if (!url) return null;
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    return API_BASE_URL + (url.startsWith("/") ? url : "/" + url);
}

export function VehicleCard({ vehicle, onBook, isOwned = false }) {
    const { isDark } = useTheme();

    const cardClass = isDark
        ? "bg-slate-900 border-slate-800 border shadow-md"
        : "bg-white border-slate-200 border shadow-md";

    const textPrimary = isDark ? "text-white" : "text-slate-800";
    const textMuted   = isDark ? "text-default-400" : "text-slate-500";
    const codeBg      = isDark ? "bg-primary/10 text-primary" : "bg-orange-50 text-orange-600";
    const dividerClass = isDark ? "bg-slate-800" : "bg-slate-200";

    const firstImage = resolveUrl(vehicle.profilPhoto || vehicle.photo || vehicle.images?.[0]);

    return (
        <Card className={cardClass}>
            {/* Image */}
            {firstImage ? (
                <div className="w-full h-40 overflow-hidden rounded-t-xl relative">
                    <img
                        src={firstImage}
                        alt={`${vehicle.brand} ${vehicle.model}`}
                        className="w-full h-full object-cover"
                    />
                    {isOwned && (
                        <div className="absolute inset-0 bg-blue-900/20 flex items-center justify-center">
                            <span className="flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-lg bg-blue-500/90 text-white backdrop-blur-sm">
                                <LockKeyhole size={12} />
                                Votre véhicule
                            </span>
                        </div>
                    )}
                </div>
            ) : (
                <div className={`w-full h-40 flex items-center justify-center rounded-t-xl relative ${isDark ? "bg-slate-800" : "bg-slate-100"}`}>
                    <Car size={40} className={textMuted} />
                    {isOwned && (
                        <div className="absolute inset-0 bg-blue-900/10 flex items-center justify-center">
                            <span className="flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-lg bg-blue-500/90 text-white">
                                <LockKeyhole size={12} />
                                Votre véhicule
                            </span>
                        </div>
                    )}
                </div>
            )}

            <CardHeader className="flex justify-between items-start px-5 pt-4">
                <div>
                    <p className={`text-tiny uppercase font-bold ${textMuted}`}>{vehicle.type}</p>
                    <h2 className={`text-xl font-bold ${textPrimary}`}>{vehicle.brand} {vehicle.model}</h2>
                    {vehicle.plateNumber && (
                        <code className={`text-xs font-mono px-2 py-0.5 rounded ${codeBg}`}>{vehicle.plateNumber}</code>
                    )}
                </div>
                {!isOwned && (
                    <Chip color="success" variant="flat" size="sm">Disponible</Chip>
                )}
            </CardHeader>

            <CardBody className="px-5 py-4">
                <div className={`grid grid-cols-2 gap-4 mb-4 ${textMuted}`}>
                    {vehicle.fuel && (
                        <div className="flex items-center gap-2"><Fuel size={16} /> {vehicle.fuel}</div>
                    )}
                    {vehicle.transmission && (
                        <div className="flex items-center gap-2"><Settings2 size={16} /> {vehicle.transmission}</div>
                    )}
                    {vehicle.mileage != null && (
                        <div className="flex items-center gap-2"><Gauge size={16} /> {vehicle.mileage} km</div>
                    )}
                    {vehicle.defaultParkingLocation && (
                        <div className="flex items-center gap-2 truncate"><MapPin size={16} /> {vehicle.defaultParkingLocation}</div>
                    )}
                </div>

                <Divider className={`my-3 ${dividerClass}`} />

                <div className="flex justify-between items-center">
                    <p className={`text-2xl font-bold ${textPrimary}`}>
                        {Number(vehicle.baseDailyPrice).toFixed(0)}€{" "}
                        <span className={`text-tiny ${textMuted}`}>/ jour</span>
                    </p>
                    {isOwned ? (
                        <div className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl
                            ${isDark ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" : "bg-blue-50 text-blue-500 border border-blue-100"}`}>
                            <LockKeyhole size={13} />
                            Votre flotte
                        </div>
                    ) : (
                        <Button
                            size="sm"
                            className="bg-[#ff922b] text-white font-bold shadow-lg shadow-orange-500/30 hover:brightness-110"
                            onPress={() => onBook(vehicle)}
                        >
                            Réserver
                        </Button>
                    )}
                </div>
            </CardBody>
        </Card>
    );
}
