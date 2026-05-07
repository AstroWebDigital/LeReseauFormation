import React, { useState, useEffect } from "react";
import api from "@/services/auth/client";
import { Spinner, Input } from "@heroui/react";
import { useDisclosure } from "@heroui/react";
import { useTheme } from "@/theme/ThemeProvider";
import { useAuth } from "@/auth/AuthContext";

import { VehicleGrid } from "./components/VehicleGrid";
import { BookingModal } from "./components/BookingModal";
import { PaymentModal } from "./components/PaymentModal";

export default function ReservationPage() {
    const { isDark } = useTheme();
    const isLight = !isDark;
    const { user } = useAuth();

    const getUserRoles = () => {
        if (!user?.roles) return [];
        if (Array.isArray(user.roles)) return user.roles.map(r => r.toUpperCase());
        return String(user.roles).toUpperCase().split(",").map(r => r.trim());
    };
    const isLoueur = getUserRoles().some(r => ["ADMIN", "ALP", "PARTENAIRE"].includes(r));

    const [vehicles, setVehicles] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedVehicle, setSelectedVehicle] = useState(null);
    const [search, setSearch] = useState("");

    // Données de réservation en attente de paiement
    const [pendingBooking, setPendingBooking] = useState(null); // { startDate, endDate, pickupLocation, returnLocation, totalAmount }
    const [clientSecret, setClientSecret] = useState(null);
    const [isCreatingIntent, setIsCreatingIntent] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successMsg, setSuccessMsg] = useState(null);

    const bookingDisclosure = useDisclosure();
    const paymentDisclosure = useDisclosure();

    const fetchVehicles = async () => {
        try {
            setIsLoading(true);
            const { data } = await api.get("/api/vehicles/available");
            const available = (data.content || data || []).map(v => ({ ...v, isOwned: false }));

            if (isLoueur) {
                try {
                    const { data: myData } = await api.get("/api/vehicles/my-fleet");
                    const myFleet = (myData.content || myData || []);
                    const myIds = new Set(myFleet.map(v => v.id));
                    setVehicles(available.map(v => myIds.has(v.id) ? { ...v, isOwned: true } : v));
                } catch {
                    setVehicles(available);
                }
            } else {
                setVehicles(available);
            }
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
        setPendingBooking(null);
        setClientSecret(null);
        bookingDisclosure.onOpen();
    };

    // Étape 1 : l'utilisateur valide les dates → on crée le PaymentIntent
    const handleProceedToPayment = async (bookingForm) => {
        if (!selectedVehicle) return;
        setIsCreatingIntent(true);

        try {
            const { data } = await api.post("/api/payments/create-intent", {
                amount: bookingForm.totalAmount,
                currency: "eur",
            });

            setPendingBooking({ ...bookingForm, paymentIntentId: data.paymentIntentId });
            setClientSecret(data.clientSecret);
            bookingDisclosure.onClose();
            paymentDisclosure.onOpen();
        } catch (err) {
            const msg = err.response?.data?.message || err.response?.data || "Erreur lors de la création du paiement.";
            alert(msg);
        } finally {
            setIsCreatingIntent(false);
        }
    };

    // Étape 2 : Stripe confirme le paiement → on crée la réservation
    const handlePaymentSuccess = async (paymentIntentId) => {
        if (!selectedVehicle || !pendingBooking) return;
        setIsSubmitting(true);

        try {
            await api.post("/api/reservations", {
                vehicleId: selectedVehicle.id,
                startDate: new Date(pendingBooking.startDate).toISOString(),
                endDate: new Date(pendingBooking.endDate).toISOString(),
                pickupLocation: pendingBooking.pickupLocation,
                returnLocation: pendingBooking.returnLocation,
                paymentIntentId,
            });
            paymentDisclosure.onClose();
            setSuccessMsg(`Réservation confirmée pour ${selectedVehicle.brand} ${selectedVehicle.model} !`);
            fetchVehicles();
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

    const availableCount = filtered.filter(v => !v.isOwned).length;
    const ownedCount = filtered.filter(v => v.isOwned).length;

    if (isLoading) return (
        <div className="h-full flex items-center justify-center min-h-[400px]">
            <Spinner size="lg" color="warning" label="Chargement des véhicules..." />
        </div>
    );

    return (
        <div className={`p-6 min-h-screen ${isLight ? "bg-slate-50" : ""}`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className={`text-2xl font-bold ${isLight ? "text-slate-800" : "text-slate-100"}`}>
                        Réserver un véhicule
                    </h1>
                    <p className={`text-sm mt-1 ${isLight ? "text-slate-500" : "text-default-500"}`}>
                        {availableCount} disponible{availableCount !== 1 ? "s" : ""}
                        {ownedCount > 0 && <span className={`ml-2 ${isLight ? "text-slate-400" : "text-slate-600"}`}>· {ownedCount} de votre flotte</span>}
                    </p>
                </div>
                <Input
                    placeholder="Rechercher (marque, type, lieu...)"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="max-w-xs"
                    classNames={{
                        input: isLight
                            ? "!text-slate-800 !placeholder-slate-400 bg-transparent text-sm"
                            : "!text-white !placeholder-slate-500 bg-transparent text-sm",
                        inputWrapper: isLight
                            ? "border border-slate-300 bg-white hover:border-orange-400/50 focus-within:!border-orange-400 rounded-xl transition-all"
                            : "border border-white/10 bg-white/5 hover:border-orange-400/50 focus-within:!border-orange-400 rounded-xl transition-all",
                    }}
                    variant="bordered"
                    isClearable
                    onClear={() => setSearch("")}
                />
            </div>

            {successMsg && (
                <div className="mb-6 rounded-xl bg-emerald-500/10 border border-emerald-500/30 px-4 py-3 text-emerald-600 text-sm flex items-center gap-2">
                    <span>✅</span> {successMsg}
                </div>
            )}
            {error && (
                <div className="mb-6 rounded-xl bg-red-500/10 border border-red-500/30 px-4 py-3 text-red-500 text-sm">
                    {error}
                </div>
            )}

            <VehicleGrid vehicles={filtered} onBook={handleBook} isDark={isDark} />

            {/* Modal 1 : sélection des dates */}
            <BookingModal
                isOpen={bookingDisclosure.isOpen}
                onOpenChange={bookingDisclosure.onOpenChange}
                vehicle={selectedVehicle}
                onProceedToPayment={handleProceedToPayment}
                isSubmitting={isCreatingIntent}
                isDark={isDark}
            />

            {/* Modal 2 : paiement Stripe */}
            <PaymentModal
                isOpen={paymentDisclosure.isOpen}
                onOpenChange={paymentDisclosure.onOpenChange}
                clientSecret={clientSecret}
                amountEuros={pendingBooking?.totalAmount ?? 0}
                vehicleName={selectedVehicle ? `${selectedVehicle.brand} ${selectedVehicle.model}` : ""}
                onPaymentSuccess={handlePaymentSuccess}
                isDark={isDark}
            />
        </div>
    );
}
