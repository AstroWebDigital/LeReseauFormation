import { useState, useEffect } from "react";
import {
    Modal, ModalContent, ModalHeader, ModalBody, ModalFooter,
    Button, Input
} from "@heroui/react";
import { MapPinIcon, ClockIcon } from "@heroicons/react/24/outline";

// ─── Créneaux horaires fixes (00:00 → 23:00, tranche 1h) ─────────────────────
const HOURS = Array.from({ length: 24 }, (_, i) => {
    const h = String(i).padStart(2, "0");
    return { value: `${h}:00`, label: `${h}h00` };
});

const inputClasses = {
    label: "!text-white/80 !opacity-100 text-xs font-semibold",
    input: "!text-white bg-transparent",
    inputWrapper: "border border-white/10 bg-white/5 hover:border-orange-400/50 focus-within:!border-orange-400 transition-all rounded-xl",
};

// ─── Composant DateTimePicker (date + heure séparées) ────────────────────────
function DateTimePicker({ label, dateValue, timeValue, onDateChange, onTimeChange, minDate }) {
    return (
        <div className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-white/80">{label}</span>
            <div className="flex gap-2">
                {/* Date */}
                <div className="flex-1">
                    <input
                        type="date"
                        value={dateValue}
                        min={minDate}
                        onChange={(e) => onDateChange(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm
                                   hover:border-orange-400/50 focus:border-orange-400 focus:outline-none
                                   transition-all [color-scheme:dark]"
                    />
                </div>

                {/* Heure dropdown */}
                <div className="relative w-28">
                    <ClockIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40 pointer-events-none z-10" />
                    <select
                        value={timeValue}
                        onChange={(e) => onTimeChange(e.target.value)}
                        className="w-full bg-[#0e1535] border border-white/10 rounded-xl pl-8 pr-6 py-2 text-white text-sm
                                   hover:border-orange-400/50 focus:border-orange-400 focus:outline-none
                                   transition-all appearance-none cursor-pointer"
                    >
                        <option value="" disabled className="text-white/40">Heure</option>
                        {HOURS.map(({ value, label }) => (
                            <option key={value} value={value} className="bg-[#0e1535]">
                                {label}
                            </option>
                        ))}
                    </select>
                    {/* Chevron */}
                    <svg className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-white/40 pointer-events-none"
                         fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
            </div>
        </div>
    );
}

// ─── BookingModal ─────────────────────────────────────────────────────────────
export function BookingModal({ isOpen, onOpenChange, vehicle, onConfirm, isSubmitting }) {
    const todayStr = new Date().toISOString().slice(0, 10);

    const [form, setForm] = useState({
        startDate: "", startTime: "",
        endDate: "",   endTime: "",
        pickupLocation: "", returnLocation: "",
    });

    useEffect(() => {
        if (isOpen) setForm({
            startDate: "", startTime: "",
            endDate: "",   endTime: "",
            pickupLocation: "", returnLocation: "",
        });
    }, [isOpen]);

    // ISO strings reconstruits pour calcul + envoi
    const startISO = form.startDate && form.startTime
        ? new Date(`${form.startDate}T${form.startTime}:00`).toISOString()
        : null;
    const endISO = form.endDate && form.endTime
        ? new Date(`${form.endDate}T${form.endTime}:00`).toISOString()
        : null;

    const nbDays = (() => {
        if (!startISO || !endISO) return 0;
        const diff = (new Date(endISO) - new Date(startISO)) / (1000 * 60 * 60 * 24);
        return diff > 0 ? Math.ceil(diff) : 0;
    })();

    const totalAmount = vehicle ? (nbDays * Number(vehicle.baseDailyPrice)).toFixed(2) : "0.00";
    const canSubmit = startISO && endISO && form.pickupLocation && form.returnLocation && nbDays > 0;

    const handleConfirm = () => {
        onConfirm({
            startDate: startISO,
            endDate: endISO,
            pickupLocation: form.pickupLocation,
            returnLocation: form.returnLocation,
        });
    };

    return (
        <Modal
            isOpen={isOpen}
            onOpenChange={onOpenChange}
            size="lg"
            classNames={{
                base: "bg-[#0e1535] border border-white/10 text-white",
                header: "border-b border-white/10",
                footer: "border-t border-white/10",
                closeButton: "text-white/50 hover:text-white",
            }}
        >
            <ModalContent>
                {(onClose) => (
                    <>
                        <ModalHeader className="flex flex-col gap-1">
                            <p className="text-lg font-bold">
                                Réserver — <span className="text-orange-400">{vehicle?.brand} {vehicle?.model}</span>
                            </p>
                            <p className="text-xs text-white/40 font-normal">
                                {Number(vehicle?.baseDailyPrice).toFixed(2)} € / jour
                            </p>
                        </ModalHeader>

                        <ModalBody className="gap-5 py-5">
                            {/* Dates + heures */}
                            <div className="grid grid-cols-2 gap-4">
                                <DateTimePicker
                                    label="Date de début"
                                    dateValue={form.startDate}
                                    timeValue={form.startTime}
                                    minDate={todayStr}
                                    onDateChange={(v) => setForm({ ...form, startDate: v })}
                                    onTimeChange={(v) => setForm({ ...form, startTime: v })}
                                />
                                <DateTimePicker
                                    label="Date de fin"
                                    dateValue={form.endDate}
                                    timeValue={form.endTime}
                                    minDate={form.startDate || todayStr}
                                    onDateChange={(v) => setForm({ ...form, endDate: v })}
                                    onTimeChange={(v) => setForm({ ...form, endTime: v })}
                                />
                            </div>

                            {/* Lieux */}
                            <Input
                                label="Lieu de prise en charge"
                                placeholder="ex: Niort, Parking A"
                                value={form.pickupLocation}
                                onChange={(e) => setForm({ ...form, pickupLocation: e.target.value })}
                                classNames={inputClasses}
                                variant="bordered"
                                startContent={<MapPinIcon className="h-4 w-4 text-white/40" />}
                            />
                            <Input
                                label="Lieu de retour"
                                placeholder="ex: Niort, Parking A"
                                value={form.returnLocation}
                                onChange={(e) => setForm({ ...form, returnLocation: e.target.value })}
                                classNames={inputClasses}
                                variant="bordered"
                                startContent={<MapPinIcon className="h-4 w-4 text-white/40" />}
                            />

                            {/* Récap montant */}
                            {nbDays > 0 && (
                                <div className="rounded-xl bg-orange-500/10 border border-orange-500/20 px-4 py-3 flex items-center justify-between">
                                    <span className="text-sm text-white/70">
                                        {nbDays} jour{nbDays > 1 ? "s" : ""} × {Number(vehicle?.baseDailyPrice).toFixed(2)} €
                                    </span>
                                    <span className="text-orange-400 font-bold text-lg">{totalAmount} €</span>
                                </div>
                            )}
                        </ModalBody>

                        <ModalFooter>
                            <Button variant="flat" className="text-white/60" onPress={onClose}>
                                Annuler
                            </Button>
                            <Button
                                className="bg-[#ff922b] text-white font-bold shadow-lg shadow-orange-500/30"
                                isLoading={isSubmitting}
                                isDisabled={!canSubmit}
                                onPress={handleConfirm}
                            >
                                Confirmer la réservation
                            </Button>
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    );
}
