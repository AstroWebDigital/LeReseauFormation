import { useState, useEffect } from "react";
import {
    Modal, ModalContent, ModalHeader, ModalBody, ModalFooter,
    Button, Input
} from "@heroui/react";
import { MapPinIcon, ClockIcon } from "@heroicons/react/24/outline";

const HOURS = Array.from({ length: 24 }, (_, i) => {
    const h = String(i).padStart(2, "0");
    return { value: `${h}:00`, label: `${h}h00` };
});

function DateTimePicker({ label, dateValue, timeValue, onDateChange, onTimeChange, minDate, isDark }) {
    const isLight = !isDark;
    return (
        <div className="flex flex-col gap-1.5">
            <span className={`text-xs font-semibold ${isLight ? "text-slate-600" : "text-white/80"}`}>{label}</span>
            <div className="flex gap-2">
                <div className="flex-1">
                    <input
                        type="date"
                        value={dateValue}
                        min={minDate}
                        onChange={(e) => onDateChange(e.target.value)}
                        className={`w-full rounded-xl px-3 py-2 text-sm border transition-all focus:outline-none
                            ${isLight
                            ? "bg-white border-slate-300 text-slate-800 hover:border-orange-400/50 focus:border-orange-400 [color-scheme:light]"
                            : "bg-white/5 border-white/10 text-white hover:border-orange-400/50 focus:border-orange-400 [color-scheme:dark]"
                        }`}
                    />
                </div>
                <div className="relative w-28">
                    <ClockIcon className={`absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none z-10
                        ${isLight ? "text-slate-400" : "text-white/40"}`} />
                    <select
                        value={timeValue}
                        onChange={(e) => onTimeChange(e.target.value)}
                        className={`w-full rounded-xl pl-8 pr-6 py-2 text-sm border transition-all appearance-none cursor-pointer focus:outline-none
                            ${isLight
                            ? "bg-white border-slate-300 text-slate-800 hover:border-orange-400/50 focus:border-orange-400"
                            : "bg-[#0e1535] border-white/10 text-white hover:border-orange-400/50 focus:border-orange-400"
                        }`}
                    >
                        <option value="" disabled>Heure</option>
                        {HOURS.map(({ value, label }) => (
                            <option key={value} value={value}
                                    className={isLight ? "bg-white text-slate-800" : "bg-[#0e1535] text-white"}>
                                {label}
                            </option>
                        ))}
                    </select>
                    <svg className={`absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 pointer-events-none
                        ${isLight ? "text-slate-400" : "text-white/40"}`}
                         fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
            </div>
        </div>
    );
}

export function BookingModal({ isOpen, onOpenChange, vehicle, onConfirm, isSubmitting, isDark }) {
    const isLight = !isDark;
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

    const startISO = form.startDate && form.startTime
        ? new Date(`${form.startDate}T${form.startTime}:00`).toISOString() : null;
    const endISO = form.endDate && form.endTime
        ? new Date(`${form.endDate}T${form.endTime}:00`).toISOString() : null;

    const nbDays = (() => {
        if (!startISO || !endISO) return 0;
        const diff = (new Date(endISO) - new Date(startISO)) / (1000 * 60 * 60 * 24);
        return diff > 0 ? Math.ceil(diff) : 0;
    })();

    const totalAmount = vehicle ? (nbDays * Number(vehicle.baseDailyPrice)).toFixed(2) : "0.00";
    const canSubmit = startISO && endISO && form.pickupLocation && form.returnLocation && nbDays > 0;

    const inputClasses = {
        label: isDark
            ? "!text-white !opacity-100 font-bold text-sm"
            : "!text-slate-700 !opacity-100 font-bold text-sm",
        input: isDark
            ? "!text-white !placeholder-slate-500"
            : "!text-slate-900 !placeholder-slate-400",
        inputWrapper: isDark
            ? "border-slate-700 bg-transparent group-data-[focus=true]:border-orange-500 transition-all"
            : "border-slate-300 bg-white group-data-[focus=true]:border-orange-500 transition-all",
        innerWrapper: isDark ? "bg-transparent" : "bg-white",
    };

    return (
        <Modal
            isOpen={isOpen}
            onOpenChange={onOpenChange}
            size="lg"
            classNames={{
                base: isLight
                    ? "bg-white border border-slate-200 text-slate-800"
                    : "bg-[#0e1535] border border-white/10 text-white",
                header: isLight ? "border-b border-slate-200" : "border-b border-white/10",
                footer: isLight ? "border-t border-slate-200" : "border-t border-white/10",
                closeButton: isLight ? "text-slate-400 hover:text-slate-700" : "text-white/50 hover:text-white",
            }}
        >
            <ModalContent>
                {(onClose) => (
                    <>
                        <ModalHeader className="flex flex-col gap-1">
                            <p className="text-lg font-bold">
                                Réserver — <span className="text-orange-400">{vehicle?.brand} {vehicle?.model}</span>
                            </p>
                            <p className={`text-xs font-normal ${isLight ? "text-slate-400" : "text-white/40"}`}>
                                {Number(vehicle?.baseDailyPrice).toFixed(2)} € / jour
                            </p>
                        </ModalHeader>

                        <ModalBody className="gap-5 py-5">
                            <div className="grid grid-cols-2 gap-4">
                                <DateTimePicker
                                    label="Date de début"
                                    dateValue={form.startDate} timeValue={form.startTime}
                                    minDate={todayStr} isDark={isDark}
                                    onDateChange={(v) => setForm({ ...form, startDate: v })}
                                    onTimeChange={(v) => setForm({ ...form, startTime: v })}
                                />
                                <DateTimePicker
                                    label="Date de fin"
                                    dateValue={form.endDate} timeValue={form.endTime}
                                    minDate={form.startDate || todayStr} isDark={isDark}
                                    onDateChange={(v) => setForm({ ...form, endDate: v })}
                                    onTimeChange={(v) => setForm({ ...form, endTime: v })}
                                />
                            </div>

                            <Input
                                label="Lieu de prise en charge"
                                placeholder="ex: Niort, Parking A"
                                value={form.pickupLocation}
                                onChange={(e) => setForm({ ...form, pickupLocation: e.target.value })}
                                classNames={inputClasses}
                                variant="bordered"
                                startContent={<MapPinIcon className={`h-4 w-4 ${isLight ? "text-slate-400" : "text-white/40"}`} />}
                            />
                            <Input
                                label="Lieu de retour"
                                placeholder="ex: Niort, Parking A"
                                value={form.returnLocation}
                                onChange={(e) => setForm({ ...form, returnLocation: e.target.value })}
                                classNames={inputClasses}
                                variant="bordered"
                                startContent={<MapPinIcon className={`h-4 w-4 ${isLight ? "text-slate-400" : "text-white/40"}`} />}
                            />

                            {nbDays > 0 && (
                                <div className="rounded-xl bg-orange-500/10 border border-orange-500/20 px-4 py-3 flex items-center justify-between">
                                    <span className={`text-sm ${isLight ? "text-slate-600" : "text-white/70"}`}>
                                        {nbDays} jour{nbDays > 1 ? "s" : ""} × {Number(vehicle?.baseDailyPrice).toFixed(2)} €
                                    </span>
                                    <span className="text-orange-400 font-bold text-lg">{totalAmount} €</span>
                                </div>
                            )}
                        </ModalBody>

                        <ModalFooter>
                            <Button variant="flat"
                                    className={isLight ? "text-slate-500" : "text-white/60"}
                                    onPress={onClose}>
                                Annuler
                            </Button>
                            <Button
                                className="bg-[#ff922b] text-white font-bold shadow-lg shadow-orange-500/30"
                                isLoading={isSubmitting}
                                isDisabled={!canSubmit}
                                onPress={() => onConfirm({ startDate: startISO, endDate: endISO, pickupLocation: form.pickupLocation, returnLocation: form.returnLocation })}
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
