import React, { useState, useEffect } from "react";
import api from "@/services/auth/client";
import { Button, Spinner, useDisclosure } from "@heroui/react";
import { Car } from "lucide-react";
import { useTheme } from "@/theme/ThemeProvider";

import { VehicleGrid } from "./components/VehicleGrid";
import { VehicleModal } from "./components/VehicleModal";

const statusColorMap = {
    "en_attente":    "warning",
    "disponible":    "success",
    "indisponible":  "danger",
    "en maintenance": "warning",
    "en_maintenance": "warning",
    "rejete":        "danger",
    "reserve":       "primary",
    "bloque":        "danger",
};

export default function Vehicle() {
    const { isDark } = useTheme();
    const [vehicles, setVehicles] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const [selectedVehicle, setSelectedVehicle] = useState(null);
    const [selectedImages, setSelectedImages] = useState([]);

    const [formData, setFormData] = useState({
        brand: "", model: "", plateNumber: "", type: "Compact",
        fuel: "Essence", transmission: "Manuelle",
        baseDailyPrice: "", mileage: "", defaultParkingLocation: ""
    });

    const fetchVehicles = async () => {
        try {
            setIsLoading(true);
            const { data } = await api.get("/api/vehicles/my-fleet");
            setVehicles(data.content || []);
            setError(null);
        } catch (err) {
            console.error("Erreur API:", err);
            setError("Impossible de charger votre flotte.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { fetchVehicles(); }, []);

    const handleSave = async () => {
        try {
            let vehicleId;

            if (selectedVehicle) {
                await api.put(`/api/vehicles/${selectedVehicle.id}`, formData);
                vehicleId = selectedVehicle.id;
            } else {
                const payload = { ...formData };
                delete payload.status;
                delete payload.listingDate;
                delete payload.id;
                delete payload.images;
                const { data } = await api.post("/api/vehicles", payload);
                vehicleId = data.id;
            }

            // Upload des images si présentes
            if (selectedImages.length > 0) {
                const form = new FormData();
                selectedImages.forEach(file => form.append("images", file));
                await api.post(`/api/vehicles/${vehicleId}/images`, form, {
                    headers: { "Content-Type": "multipart/form-data" }
                });
            }

            onOpenChange(false);
            fetchVehicles();
        } catch (err) {
            console.error("Erreur sauvegarde:", err);
            alert(err.response?.data?.message || "Erreur lors de l'enregistrement.");
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Voulez-vous vraiment supprimer ce véhicule ?")) {
            try {
                await api.delete(`/api/vehicles/${id}`);
                setVehicles(vehicles.filter(v => v.id !== id));
            } catch (err) {
                alert("Erreur lors de la suppression.");
            }
        }
    };

    const openModal = (vehicle = null) => {
        setSelectedImages([]);
        if (vehicle) {
            setSelectedVehicle(vehicle);
            setFormData({ ...vehicle });
        } else {
            setSelectedVehicle(null);
            setFormData({
                brand: "", model: "", plateNumber: "", type: "Compact",
                fuel: "Essence", transmission: "Manuelle",
                baseDailyPrice: "", mileage: "", defaultParkingLocation: ""
            });
        }
        onOpen();
    };

    if (isLoading) return (
        <div className="h-full flex items-center justify-center min-h-[400px]">
            <Spinner size="lg" label="Chargement..." color="warning" />
        </div>
    );

    return (
        <div className={`p-6 min-h-screen ${isDark ? "" : "bg-slate-50"}`}>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className={`text-2xl font-bold ${isDark ? "text-slate-100" : "text-slate-800"}`}>
                        Mes Véhicules
                    </h1>
                    <p className="text-default-500">{vehicles.length} véhicule(s) enregistré(s)</p>
                </div>
                <Button
                    className="bg-[#ff922b] text-white font-bold shadow-lg shadow-orange-500/20"
                    onPress={() => openModal()}
                    startContent={<Car size={18} />}
                >
                    Ajouter un véhicule
                </Button>
            </div>

            {error && <div className="text-danger mb-4">{error}</div>}

            <VehicleGrid
                vehicles={vehicles}
                onEdit={openModal}
                onDelete={handleDelete}
                statusColorMap={statusColorMap}
            />

            <VehicleModal
                isOpen={isOpen}
                onOpenChange={(open) => { if (!open) setSelectedImages([]); onOpenChange(open); }}
                formData={formData}
                setFormData={setFormData}
                onSave={handleSave}
                isEdit={!!selectedVehicle}
                selectedImages={selectedImages}
                setSelectedImages={setSelectedImages}
            />
        </div>
    );
}
