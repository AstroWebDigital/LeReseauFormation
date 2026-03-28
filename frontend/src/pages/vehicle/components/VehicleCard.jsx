import { Card, CardHeader, CardBody, Button, Chip, Divider } from "@heroui/react";
import { Fuel, Settings2, Gauge, MapPin, Edit, Trash2, Car, AlertCircle } from "lucide-react";
import { useTheme } from "@/theme/ThemeProvider";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

function resolveUrl(url) {
    if (!url) return null;
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    return API_BASE_URL + url;
}

const statusLabels = {
    "en_attente":     "En attente",
    "disponible":     "Disponible",
    "indisponible":   "Indisponible",
    "en maintenance": "En maintenance",
    "en_maintenance": "En maintenance",
    "rejete":         "Rejeté",
    "reserve":        "Réservé",
    "bloque":         "Bloqué",
};

export const VehicleCard = ({ vehicle, onEdit, onDelete, statusColorMap }) => {
    const { isDark } = useTheme();

    const cardClass = isDark
        ? "bg-slate-900 border-slate-800 border shadow-md"
        : "bg-white border-slate-200 border shadow-md";

    const textPrimary = isDark ? "text-white" : "text-slate-800";
    const textMuted = isDark ? "text-default-400" : "text-slate-500";
    const codeBg = isDark ? "bg-primary/10 text-primary" : "bg-orange-50 text-orange-600";
    const dividerClass = isDark ? "bg-slate-800" : "bg-slate-200";

    const firstImage = vehicle.images?.[0] ? resolveUrl(vehicle.images[0]) : null;

    return (
        <Card className={cardClass}>
            {/* Image */}
            {firstImage ? (
                <div className="w-full h-40 overflow-hidden rounded-t-xl">
                    <img src={firstImage} alt={`${vehicle.brand} ${vehicle.model}`} className="w-full h-full object-cover" />
                </div>
            ) : (
                <div className={`w-full h-40 flex items-center justify-center rounded-t-xl ${isDark ? "bg-slate-800" : "bg-slate-100"}`}>
                    <Car size={40} className={textMuted} />
                </div>
            )}

            <CardHeader className="flex justify-between items-start px-5 pt-4">
                <div>
                    <p className={`text-tiny uppercase font-bold ${textMuted}`}>{vehicle.type}</p>
                    <h2 className={`text-xl font-bold ${textPrimary}`}>{vehicle.brand} {vehicle.model}</h2>
                    <code className={`text-xs font-mono px-2 py-0.5 rounded ${codeBg}`}>{vehicle.plateNumber}</code>
                </div>
                <div className="flex gap-1">
                    <Button isIconOnly size="sm" variant="light" className={textMuted} onPress={() => onEdit(vehicle)}>
                        <Edit size={14} />
                    </Button>
                    <Button isIconOnly size="sm" variant="light" color="danger" onPress={() => onDelete(vehicle.id)}>
                        <Trash2 size={14} />
                    </Button>
                </div>
            </CardHeader>
            <CardBody className="px-5 py-4">
                <div className={`grid grid-cols-2 gap-4 mb-4 ${textMuted}`}>
                    <div className="flex items-center gap-2"><Fuel size={16} /> {vehicle.fuel}</div>
                    <div className="flex items-center gap-2"><Settings2 size={16} /> {vehicle.transmission}</div>
                    <div className="flex items-center gap-2"><Gauge size={16} /> {vehicle.mileage} km</div>
                    <div className="flex items-center gap-2 truncate"><MapPin size={16} /> {vehicle.defaultParkingLocation || "N/A"}</div>
                </div>
                <Divider className={`my-3 ${dividerClass}`} />
                <div className="flex justify-between items-center">
                    <p className={`text-2xl font-bold ${textPrimary}`}>
                        {vehicle.baseDailyPrice}€ <span className={`text-tiny ${textMuted}`}>/ jour</span>
                    </p>
                    <Chip color={statusColorMap[vehicle.status] || "default"} variant="flat" size="sm">
                        {statusLabels[vehicle.status] || vehicle.status}
                    </Chip>
                </div>

                {vehicle.status === "rejete" && vehicle.rejectionReason && (
                    <div className={`mt-3 rounded-xl p-2.5 flex items-start gap-2 ${isDark ? "bg-red-500/10 border border-red-500/20" : "bg-red-50 border border-red-200"}`}>
                        <AlertCircle size={14} className="text-danger flex-shrink-0 mt-0.5" />
                        <p className={`text-xs ${isDark ? "text-red-300" : "text-red-700"}`}>
                            <span className="font-semibold">Motif : </span>{vehicle.rejectionReason}
                        </p>
                    </div>
                )}
            </CardBody>
        </Card>
    );
};
