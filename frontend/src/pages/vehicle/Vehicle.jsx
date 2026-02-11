import React, { useState, useEffect } from "react";
import api from "@/services/auth/client";
import { Button, Spinner, useDisclosure } from "@heroui/react";
import { Car } from "lucide-react";

// Imports des composants découpés
import { VehicleGrid } from "./components/VehicleGrid";
import { VehicleModal } from "./components/VehicleModal";

const statusColorMap = {
    "disponible": "success",
    "indisponible": "danger",
    "en maintenance": "warning",
};

export default function Vehicle() {
    const [vehicles, setVehicles] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const [selectedVehicle, setSelectedVehicle] = useState(null);

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
            if (selectedVehicle) {
                // UPDATE
                await api.put(`/api/vehicles/${selectedVehicle.id}`, formData);
            } else {
                // CREATE - Nettoyage pour éviter la 403 (OnCreate validation)
                const payload = { ...formData };
                delete payload.status;
                delete payload.listingDate;
                delete payload.id;

                await api.post("/api/vehicles", payload);
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

    // Styles partagés pour les inputs et selects
    const sharedClasses = {
        label: "!text-white !opacity-100 font-bold text-sm",
        input: "!text-white",
        inputWrapper: "border-slate-700 bg-transparent group-data-[focus=true]:border-white transition-all",
        trigger: "border-slate-700 bg-transparent data-[focus=true]:border-white transition-all",
        value: "text-white",
    };

    if (isLoading) return (
        <div className="h-full flex items-center justify-center min-h-[400px]">
            <Spinner size="lg" label="Chargement..." color="primary" />
        </div>
    );

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-100">Mes Véhicules</h1>
                    <p className="text-default-500">{vehicles.length} véhicule(s) enregistré(s)</p>
                </div>
                <Button color="primary" onPress={() => openModal()} startContent={<Car size={18} />}>
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
                onOpenChange={onOpenChange}
                formData={formData}
                setFormData={setFormData}
                onSave={handleSave}
                isEdit={!!selectedVehicle}
                inputClasses={sharedClasses}
                selectClasses={sharedClasses}
            />
        </div>
    );
}