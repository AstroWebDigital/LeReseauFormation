import React from "react";
import {
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Button,
    Chip,
} from "@heroui/react";
import { Car, Fuel, Settings2, Gauge, MapPin, Calendar, Euro, X } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8080";

const resolvePhoto = (url) => {
    if (!url) return null;
    if (url.startsWith("http")) return url;
    return `${API_BASE}${url.startsWith("/") ? url : "/" + url}`;
};

const statusLabels = {
    "en_attente": "En attente",
    "disponible": "Disponible",
    "indisponible": "Indisponible",
    "en_maintenance": "En maintenance",
    "en maintenance": "En maintenance",
    "rejete": "Rejeté",
    "reserve": "Réservé",
    "bloque": "Bloqué",
    "AVAILABLE": "Disponible",
    "RENTED": "Loué",
    "BLOCKED": "Bloqué",
    "MAINTENANCE": "Maintenance",
};

const statusColors = {
    "en_attente": "warning",
    "disponible": "success",
    "indisponible": "danger",
    "en_maintenance": "warning",
    "en maintenance": "warning",
    "rejete": "danger",
    "reserve": "primary",
    "bloque": "danger",
    "AVAILABLE": "success",
    "RENTED": "primary",
    "BLOCKED": "danger",
    "MAINTENANCE": "warning",
};

const VehicleDetailModal = ({ isOpen, onClose, vehicle, isDark }) => {
    if (!vehicle) return null;

    const isLight = !isDark;
    const photo = vehicle.images?.[0] ? resolvePhoto(vehicle.images[0]) : resolvePhoto(vehicle.profilPhoto);

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            size="2xl"
            scrollBehavior="inside"
            classNames={{
                base: isDark ? "bg-[#0d1533] border border-white/10" : "bg-white",
                header: isDark ? "border-b border-white/10" : "border-b border-slate-200",
                body: isDark ? "" : "",
                footer: isDark ? "border-t border-white/10" : "border-t border-slate-200",
            }}
        >
            <ModalContent>
                {(onClose) => (
                    <>
                        <ModalHeader className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-xl ${isDark ? "bg-orange-500/10" : "bg-orange-50"}`}>
                                    <Car size={24} className="text-orange-500" />
                                </div>
                                <div>
                                    <h2 className={`text-xl font-bold ${isDark ? "text-white" : "text-slate-800"}`}>
                                        {vehicle.brand} {vehicle.model}
                                    </h2>
                                    <p className={`text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                                        {vehicle.plateNumber || vehicle.licensePlate}
                                    </p>
                                </div>
                            </div>
                            <Chip
                                color={statusColors[vehicle.status] || "default"}
                                variant="flat"
                                size="sm"
                            >
                                {statusLabels[vehicle.status] || vehicle.status}
                            </Chip>
                        </ModalHeader>

                        <ModalBody className="py-6">
                            {/* Image du véhicule */}
                            <div className={`rounded-2xl overflow-hidden mb-6 ${isDark ? "bg-[#080f28]" : "bg-slate-100"}`}>
                                {photo ? (
                                    <img
                                        src={photo}
                                        alt={`${vehicle.brand} ${vehicle.model}`}
                                        className="w-full h-64 object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-64 flex items-center justify-center">
                                        <Car size={80} className={isDark ? "text-white/10" : "text-slate-300"} />
                                    </div>
                                )}
                            </div>

                            {/* Informations principales */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                <div className={`p-4 rounded-xl ${isDark ? "bg-white/5" : "bg-slate-50"}`}>
                                    <div className="flex items-center gap-2 mb-2">
                                        <Fuel size={16} className="text-orange-500" />
                                        <span className={`text-xs uppercase tracking-wider ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                                            Carburant
                                        </span>
                                    </div>
                                    <p className={`font-semibold ${isDark ? "text-white" : "text-slate-800"}`}>
                                        {vehicle.fuel || "—"}
                                    </p>
                                </div>

                                <div className={`p-4 rounded-xl ${isDark ? "bg-white/5" : "bg-slate-50"}`}>
                                    <div className="flex items-center gap-2 mb-2">
                                        <Settings2 size={16} className="text-orange-500" />
                                        <span className={`text-xs uppercase tracking-wider ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                                            Transmission
                                        </span>
                                    </div>
                                    <p className={`font-semibold ${isDark ? "text-white" : "text-slate-800"}`}>
                                        {vehicle.transmission || "—"}
                                    </p>
                                </div>

                                <div className={`p-4 rounded-xl ${isDark ? "bg-white/5" : "bg-slate-50"}`}>
                                    <div className="flex items-center gap-2 mb-2">
                                        <Gauge size={16} className="text-orange-500" />
                                        <span className={`text-xs uppercase tracking-wider ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                                            Kilométrage
                                        </span>
                                    </div>
                                    <p className={`font-semibold ${isDark ? "text-white" : "text-slate-800"}`}>
                                        {vehicle.mileage?.toLocaleString("fr-FR") || "—"} km
                                    </p>
                                </div>

                                <div className={`p-4 rounded-xl ${isDark ? "bg-white/5" : "bg-slate-50"}`}>
                                    <div className="flex items-center gap-2 mb-2">
                                        <Euro size={16} className="text-orange-500" />
                                        <span className={`text-xs uppercase tracking-wider ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                                            Tarif/jour
                                        </span>
                                    </div>
                                    <p className={`font-semibold text-orange-500`}>
                                        {vehicle.baseDailyPrice || vehicle.dailyPrice || "—"}€
                                    </p>
                                </div>
                            </div>

                            {/* Détails supplémentaires */}
                            <div className={`rounded-xl p-5 ${isDark ? "bg-white/5" : "bg-slate-50"}`}>
                                <h3 className={`font-semibold mb-4 ${isDark ? "text-white" : "text-slate-800"}`}>
                                    Détails du véhicule
                                </h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="flex justify-between">
                                        <span className={isDark ? "text-slate-400" : "text-slate-500"}>Type</span>
                                        <span className={`font-medium ${isDark ? "text-white" : "text-slate-800"}`}>
                                            {vehicle.type || "—"}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className={isDark ? "text-slate-400" : "text-slate-500"}>Année</span>
                                        <span className={`font-medium ${isDark ? "text-white" : "text-slate-800"}`}>
                                            {vehicle.year || "—"}
                                        </span>
                                    </div>
                                    {vehicle.defaultParkingLocation && (
                                        <div className="flex justify-between col-span-2">
                                            <span className={`flex items-center gap-1 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                                                <MapPin size={14} />
                                                Localisation
                                            </span>
                                            <span className={`font-medium ${isDark ? "text-white" : "text-slate-800"}`}>
                                                {vehicle.defaultParkingLocation}
                                            </span>
                                        </div>
                                    )}
                                    {vehicle.lastMaintenanceDate && (
                                        <div className="flex justify-between col-span-2">
                                            <span className={`flex items-center gap-1 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                                                <Calendar size={14} />
                                                Dernier entretien
                                            </span>
                                            <span className={`font-medium ${isDark ? "text-white" : "text-slate-800"}`}>
                                                {new Date(vehicle.lastMaintenanceDate).toLocaleDateString("fr-FR")}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Stats si disponibles */}
                            {(vehicle.occupancyRate !== undefined || vehicle.monthlyRevenue !== undefined) && (
                                <div className="grid grid-cols-2 gap-4 mt-4">
                                    {vehicle.occupancyRate !== undefined && (
                                        <div className={`p-4 rounded-xl ${isDark ? "bg-emerald-500/10" : "bg-emerald-50"}`}>
                                            <p className={`text-xs uppercase tracking-wider mb-1 ${isDark ? "text-emerald-400" : "text-emerald-600"}`}>
                                                Taux d'occupation
                                            </p>
                                            <p className={`text-2xl font-bold ${isDark ? "text-emerald-400" : "text-emerald-600"}`}>
                                                {vehicle.occupancyRate}%
                                            </p>
                                            <div className={`h-2 rounded-full mt-2 ${isDark ? "bg-white/10" : "bg-emerald-200"}`}>
                                                <div
                                                    className="h-full rounded-full bg-emerald-500 transition-all"
                                                    style={{ width: `${vehicle.occupancyRate}%` }}
                                                />
                                            </div>
                                        </div>
                                    )}
                                    {vehicle.monthlyRevenue !== undefined && (
                                        <div className={`p-4 rounded-xl ${isDark ? "bg-orange-500/10" : "bg-orange-50"}`}>
                                            <p className={`text-xs uppercase tracking-wider mb-1 ${isDark ? "text-orange-400" : "text-orange-600"}`}>
                                                CA mensuel
                                            </p>
                                            <p className={`text-2xl font-bold ${isDark ? "text-orange-400" : "text-orange-600"}`}>
                                                {Number(vehicle.monthlyRevenue).toLocaleString("fr-FR")}€
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </ModalBody>

                        <ModalFooter>
                            <Button
                                variant="bordered"
                                onPress={onClose}
                                className={isDark ? "border-slate-700 text-white" : "border-slate-300 text-slate-700"}
                            >
                                Fermer
                            </Button>
                            <Button
                                className="bg-orange-500 text-white font-semibold"
                                onPress={() => {
                                    onClose();
                                    window.location.href = "/vehicles";
                                }}
                            >
                                Voir tous les véhicules
                            </Button>
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    );
};

export default VehicleDetailModal;
