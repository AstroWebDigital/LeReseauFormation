import React, { useState, useEffect } from "react";
import api from "@/services/auth/client";
import { Spinner, Input } from "@heroui/react";
import { useDisclosure } from "@heroui/react";

import { VehicleGrid } from "./components/VehicleGrid";
import { BookingModal } from "./components/BookingModal";

export default function ReservationPage() {
    const [vehicles, setVehicles] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedVehicle, setSelectedVehicle] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successMsg, setSuccessMsg] = useState(null);
    const [search, setSearch] = useState("");

    const { isOpen, onOpen, onOpenChange } = useDisclosure();

    const fetchVehicles = async () => {
        try {
            setIsLoading(true);
            const { data } = await api.get("/api/vehicles?status=disponible");
            setVehicles(data.content || data || []);
        } catch (err) {
            console.error("Erreur API:", err);
            setError("Impossible de charger les véhicules disponibles.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { fetchVehicles(); }, []);

    const handleBook = (vehicle) => {
        setSelectedVehicle(vehicle);
        setSuccessMsg(null);
        onOpen();
    };

    const handleConfirm = async (form) => {
        if (!selectedVehicle) return;
        setIsSubmitting(true);
        try {
            await api.post("/api/reservations", {
                vehicleId: selectedVehicle.id,
                startDate: new Date(form.startDate).toISOString(),
                endDate: new Date(form.endDate).toISOString(),
                pickupLocation: form.pickupLocation,
                returnLocation: form.returnLocation,
            });
            onOpenChange(false);
            setSuccessMsg(`Réservation confirmée pour ${selectedVehicle.brand} ${selectedVehicle.model} !`);
            fetchVehicles(); // refresh pour retirer le véhicule réservé
        } catch (err) {
            const msg = err.response?.data?.message || err.response?.data || "Erreur lors de la réservation.";
            alert(msg);
        } finally {
            setIsSubmitting(false);
        }
    };

    const filtered = vehicles.filter((v) => {
        const q = search.toLowerCase();
        return (
            !q ||
            v.brand?.toLowerCase().includes(q) ||
            v.model?.toLowerCase().includes(q) ||
            v.type?.toLowerCase().includes(q) ||
            v.fuel?.toLowerCase().includes(q) ||
            v.defaultParkingLocation?.toLowerCase().includes(q)
        );
    });

    if (isLoading) return (
        <div className="h-full flex items-center justify-center min-h-[400px]">
            <Spinner size="lg" color="warning" label="Chargement des véhicules..." />
        </div>
    );

    return (
        <div className="p-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-100">Réserver un véhicule</h1>
                    <p className="text-default-500 text-sm mt-1">
                        {filtered.length} véhicule{filtered.length !== 1 ? "s" : ""} disponible{filtered.length !== 1 ? "s" : ""}
                    </p>
                </div>
                <Input
                    placeholder="Rechercher (marque, type, lieu...)"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="max-w-xs"
                    classNames={{
                        input: "!text-white bg-transparent text-sm",
                        inputWrapper: "border border-white/10 bg-white/5 hover:border-orange-400/50 focus-within:!border-orange-400 rounded-xl transition-all",
                    }}
                    variant="bordered"
                    isClearable
                    onClear={() => setSearch("")}
                />
            </div>

            {/* Success banner */}
            {successMsg && (
                <div className="mb-6 rounded-xl bg-emerald-500/10 border border-emerald-500/30 px-4 py-3 text-emerald-400 text-sm flex items-center gap-2">
                    <span>✅</span> {successMsg}
                </div>
            )}

            {/* Error */}
            {error && (
                <div className="mb-6 rounded-xl bg-red-500/10 border border-red-500/30 px-4 py-3 text-red-400 text-sm">
                    {error}
                </div>
            )}

            <VehicleGrid vehicles={filtered} onBook={handleBook} />

            <BookingModal
                isOpen={isOpen}
                onOpenChange={onOpenChange}
                vehicle={selectedVehicle}
                onConfirm={handleConfirm}
                isSubmitting={isSubmitting}
            />
        </div>
    );
}
