import React, { useState, useEffect, useCallback } from "react";
import api from "@/services/auth/client";
import { Spinner, Input, Avatar } from "@heroui/react";
import { useDisclosure } from "@heroui/react";
import { useTheme } from "@/theme/ThemeProvider";
import { useAuth } from "@/auth/AuthContext";
import { CheckIcon, XMarkIcon, ClockIcon, CalendarDaysIcon } from "@heroicons/react/24/outline";

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
    const [pendingBooking, setPendingBooking] = useState(null);
    const [clientSecret, setClientSecret] = useState(null);
    const [isCreatingIntent, setIsCreatingIntent] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successMsg, setSuccessMsg] = useState(null);

    // Demandes de réservation (côté loueur)
    const [ownerReservations, setOwnerReservations] = useState([]);
    const [actionLoading, setActionLoading] = useState(null); // id de la réservation en cours
    const [rejectModal, setRejectModal] = useState(null); // { id, vehicleName }
    const [rejectReason, setRejectReason] = useState("");

    const bookingDisclosure = useDisclosure();
    const paymentDisclosure = useDisclosure();

    const fetchVehicles = async () => {
        try {
            setIsLoading(true);
            const { data } = await api.get("/api/vehicles/bookable");
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

    const fetchOwnerReservations = useCallback(async () => {
        if (!isLoueur) return;
        try {
            const { data } = await api.get("/api/reservations/owner");
            setOwnerReservations(data || []);
        } catch { /* silencieux */ }
    }, [isLoueur]);

    useEffect(() => { fetchVehicles(); fetchOwnerReservations(); }, []);

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

    const handleApprove = async (id) => {
        setActionLoading(id);
        try {
            await api.put(`/api/reservations/${id}/approve`);
            await Promise.all([fetchOwnerReservations(), fetchVehicles()]);
        } catch (err) {
            alert(err.response?.data || "Erreur lors de l'approbation.");
        } finally {
            setActionLoading(null);
        }
    };

    const handleReject = async (id, reason) => {
        setActionLoading(id);
        try {
            await api.put(`/api/reservations/${id}/reject`, { reason });
            await fetchOwnerReservations();
        } catch (err) {
            alert(err.response?.data || "Erreur lors du refus.");
        } finally {
            setActionLoading(null);
        }
    };

    const handleRejectConfirm = async () => {
        if (!rejectModal) return;
        const { id } = rejectModal;
        setRejectModal(null);
        await handleReject(id, rejectReason.trim() || null);
        setRejectReason("");
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

            {/* ── Demandes de réservation (loueur uniquement) ── */}
            {isLoueur && ownerReservations.length > 0 && (() => {
                const pending = ownerReservations.filter(r => r.status === "en_attente");
                const others  = ownerReservations.filter(r => r.status !== "en_attente").slice(0, 5);
                const fmtDate = (d) => d ? new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" }) : "—";
                const fmtAmount = (n) => n != null ? `${Number(n).toLocaleString("fr-FR")} €` : "—";
                const statusBadge = (s) => {
                    const map = {
                        en_attente: { label: "En attente", cls: isLight ? "bg-orange-50 text-orange-600 border-orange-200" : "bg-orange-500/10 text-orange-400 border-orange-500/20" },
                        accepte:    { label: "Approuvée",  cls: isLight ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
                        refuse:     { label: "Refusée",    cls: isLight ? "bg-red-50 text-red-600 border-red-200" : "bg-red-500/10 text-red-400 border-red-500/20" },
                    };
                    return map[s] || { label: s, cls: isLight ? "bg-slate-100 text-slate-600 border-slate-200" : "bg-slate-700 text-slate-300 border-slate-600" };
                };

                const ReservationCard = ({ r, showActions }) => {
                    const badge = statusBadge(r.status);
                    const loading = actionLoading === r.id;
                    return (
                        <div className={`rounded-2xl border p-4 transition-all ${isLight ? "bg-white border-slate-100 shadow-sm" : "bg-[#0d1533] border-white/5"}`}>
                            <div className="flex items-start justify-between gap-3 mb-3">
                                <div className="flex items-center gap-3">
                                    <Avatar
                                        name={r.customerName || r.customerEmail || "C"}
                                        size="sm"
                                        classNames={{ base: `font-bold text-xs ${isLight ? "bg-orange-100 text-orange-600" : "bg-orange-500/20 text-orange-400"}` }}
                                    />
                                    <div>
                                        <p className={`font-bold text-sm ${isLight ? "text-slate-800" : "text-white"}`}>{r.customerName || "Client"}</p>
                                        <p className={`text-xs ${isLight ? "text-slate-400" : "text-slate-500"}`}>{r.customerEmail}</p>
                                    </div>
                                </div>
                                <span className={`text-[11px] font-bold px-2 py-1 rounded-lg border shrink-0 ${badge.cls}`}>{badge.label}</span>
                            </div>

                            <div className={`rounded-xl px-3 py-2 mb-3 ${isLight ? "bg-slate-50" : "bg-white/5"}`}>
                                <p className={`text-xs font-semibold ${isLight ? "text-slate-600" : "text-slate-300"}`}>
                                    {r.vehicleBrand} {r.vehicleModel}
                                </p>
                                <div className={`flex items-center gap-1.5 text-xs mt-1 ${isLight ? "text-slate-500" : "text-slate-400"}`}>
                                    <CalendarDaysIcon className="h-3 w-3 shrink-0" />
                                    {fmtDate(r.startDate)} → {fmtDate(r.endDate)}
                                </div>
                                <p className="text-orange-500 font-bold text-sm mt-1">{fmtAmount(r.totalAmount)}</p>
                            </div>

                            {showActions && (
                                <div className="flex gap-2">
                                    <button
                                        disabled={loading}
                                        onClick={() => { setRejectModal({ id: r.id, vehicleName: `${r.vehicleBrand} ${r.vehicleModel}` }); setRejectReason(""); }}
                                        className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold border transition-all
                                            ${isLight ? "border-slate-200 text-slate-600 hover:bg-red-50 hover:border-red-200 hover:text-red-600" : "border-white/10 text-slate-400 hover:bg-red-500/10 hover:text-red-400"}
                                            disabled:opacity-40`}
                                    >
                                        <XMarkIcon className="h-4 w-4" /> Refuser
                                    </button>
                                    <button
                                        disabled={loading}
                                        onClick={() => handleApprove(r.id)}
                                        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/20 hover:brightness-110 transition-all disabled:opacity-40"
                                    >
                                        {loading ? <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <CheckIcon className="h-4 w-4" />}
                                        Approuver
                                    </button>
                                </div>
                            )}
                        </div>
                    );
                };

                return (
                    <div className="mb-8 space-y-4">
                        {/* Demandes en attente */}
                        {pending.length > 0 && (
                            <div>
                                <div className="flex items-center gap-3 mb-3">
                                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-bold ${isLight ? "bg-orange-50 text-orange-600" : "bg-orange-500/10 text-orange-400"}`}>
                                        <ClockIcon className="h-4 w-4" />
                                        Demandes en attente
                                        <span className={`text-xs font-black px-1.5 py-0.5 rounded-full ${isLight ? "bg-orange-500 text-white" : "bg-orange-500 text-white"}`}>
                                            {pending.length}
                                        </span>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3">
                                    {pending.map(r => <ReservationCard key={r.id} r={r} showActions />)}
                                </div>
                            </div>
                        )}

                        {/* Historique récent */}
                        {others.length > 0 && (
                            <details className="group">
                                <summary className={`cursor-pointer text-sm font-semibold select-none list-none flex items-center gap-2 ${isLight ? "text-slate-500 hover:text-slate-700" : "text-slate-500 hover:text-slate-300"}`}>
                                    <span className={`transition-transform group-open:rotate-90 inline-block`}>▶</span>
                                    Historique récent ({others.length})
                                </summary>
                                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3 mt-3">
                                    {others.map(r => <ReservationCard key={r.id} r={r} showActions={false} />)}
                                </div>
                            </details>
                        )}

                        <div className={`border-b ${isLight ? "border-slate-200" : "border-white/5"}`} />
                    </div>
                );
            })()}

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

            {/* Modal : motif de refus */}
            {rejectModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backdropFilter: "blur(6px)", backgroundColor: "rgba(0,0,0,0.55)" }}>
                    <div className={`w-full max-w-sm rounded-2xl border shadow-2xl overflow-hidden ${isLight ? "bg-white border-slate-200" : "bg-[#0f1129] border-slate-700"}`}>
                        <div className={`px-5 py-4 border-b flex items-center gap-2.5 ${isLight ? "border-slate-100" : "border-slate-700"}`}>
                            <XMarkIcon className="h-4 w-4 text-red-500 shrink-0" />
                            <p className={`font-bold text-sm ${isLight ? "text-slate-800" : "text-white"}`}>
                                Refuser la réservation
                            </p>
                        </div>
                        <div className="p-5 space-y-3">
                            <p className={`text-xs ${isLight ? "text-slate-500" : "text-slate-400"}`}>
                                Véhicule : <span className="font-semibold">{rejectModal.vehicleName}</span>
                            </p>
                            <p className={`text-xs ${isLight ? "text-slate-500" : "text-slate-400"}`}>
                                Vous pouvez indiquer un motif (optionnel). Il sera visible par le client.
                            </p>
                            <textarea
                                value={rejectReason}
                                onChange={e => setRejectReason(e.target.value)}
                                rows={3}
                                placeholder="Ex : Dates déjà bloquées, véhicule indisponible..."
                                className={`w-full rounded-xl border px-3 py-2.5 text-sm resize-none focus:outline-none transition-all ${isLight ? "bg-slate-50 border-slate-200 text-slate-800 placeholder:text-slate-400 focus:border-red-400" : "bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-red-500/50"}`}
                            />
                            <div className="flex gap-2 pt-1">
                                <button onClick={() => { setRejectModal(null); setRejectReason(""); }}
                                    className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-all ${isLight ? "border-slate-200 text-slate-600 hover:bg-slate-50" : "border-slate-700 text-slate-400 hover:bg-white/5"}`}>
                                    Annuler
                                </button>
                                <button onClick={handleRejectConfirm}
                                    className="flex-1 py-2.5 rounded-xl text-sm font-bold bg-red-500 text-white hover:bg-red-600 transition-all">
                                    Confirmer le refus
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

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
