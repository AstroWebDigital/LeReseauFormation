import { useState, useEffect } from "react";
import { Modal, ModalContent, Button } from "@heroui/react";
import {
    MapPinIcon, CalendarDaysIcon, ClockIcon,
    CheckCircleIcon, XMarkIcon, TruckIcon
} from "@heroicons/react/24/outline";
import { Fuel, Gauge } from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";
const resolvePhoto = (url) => {
    if (!url) return null;
    if (url.startsWith("http")) return url;
    return `${API_BASE_URL}${url.startsWith("/") ? url : "/" + url}`;
};

const HOURS = Array.from({ length: 24 }, (_, i) => {
    const h = String(i).padStart(2, "0");
    return { value: `${h}:00`, label: `${h}h00` };
});

function FieldLabel({ children, isDark }) {
    return (
        <span className={`text-[11px] font-semibold uppercase tracking-wider ${isDark ? "text-slate-400" : "text-slate-500"}`}>
            {children}
        </span>
    );
}

function DateBlock({ label, dateValue, timeValue, onDateChange, onTimeChange, minDate, isDark, error }) {
    const isLight = !isDark;
    return (
        <div className="flex flex-col gap-2">
            <FieldLabel isDark={isDark}>{label}</FieldLabel>
            <div className={`rounded-2xl border overflow-hidden ${error ? "border-red-500" : isLight ? "border-slate-200" : "border-white/10"}`}>
                <div className={`flex items-center gap-2 px-3 py-2 border-b ${isLight ? "bg-slate-50 border-slate-200" : "bg-white/3 border-white/10"}`}>
                    <CalendarDaysIcon className={`h-4 w-4 shrink-0 ${isLight ? "text-slate-400" : "text-slate-500"}`} />
                    <input
                        type="date"
                        value={dateValue}
                        min={minDate}
                        onChange={(e) => onDateChange(e.target.value)}
                        className={`flex-1 bg-transparent text-sm focus:outline-none ${isLight ? "text-slate-800 [color-scheme:light]" : "text-white [color-scheme:dark]"}`}
                    />
                </div>
                <div className={`flex items-center gap-2 px-3 py-2 ${isLight ? "bg-white" : "bg-white/2"}`}>
                    <ClockIcon className={`h-4 w-4 shrink-0 ${isLight ? "text-slate-400" : "text-slate-500"}`} />
                    <select
                        value={timeValue}
                        onChange={(e) => onTimeChange(e.target.value)}
                        className={`flex-1 bg-transparent text-sm focus:outline-none appearance-none cursor-pointer ${isLight ? "text-slate-800" : "text-white"}`}
                    >
                        <option value="" disabled>Choisir une heure</option>
                        {HOURS.map(({ value, label }) => (
                            <option key={value} value={value}
                                className={isLight ? "bg-white text-slate-800" : "bg-[#0e1535] text-white"}>
                                {label}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
            {error && <p className="text-red-500 text-xs">{error}</p>}
        </div>
    );
}

function LocationInput({ label, icon: Icon, value, onChange, placeholder, isDark, error }) {
    const isLight = !isDark;
    return (
        <div className="flex flex-col gap-2">
            <FieldLabel isDark={isDark}>{label}</FieldLabel>
            <div className={`flex items-center gap-2 rounded-2xl border px-3 py-2.5 transition-all
                ${error ? "border-red-500" : isLight
                    ? "border-slate-200 focus-within:border-orange-400 bg-white"
                    : "border-white/10 focus-within:border-orange-400 bg-white/3"
                }`}>
                <Icon className={`h-4 w-4 shrink-0 ${isLight ? "text-slate-400" : "text-slate-500"}`} />
                <input
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    className={`flex-1 bg-transparent text-sm focus:outline-none ${isLight ? "text-slate-800 placeholder:text-slate-400" : "text-white placeholder:text-slate-500"}`}
                />
            </div>
            {error && <p className="text-red-500 text-xs">{error}</p>}
        </div>
    );
}

export function BookingModal({ isOpen, onOpenChange, vehicle, onConfirm, isSubmitting, isDark }) {
    const isLight = !isDark;
    const todayStr = new Date().toISOString().slice(0, 10);
    const photo = resolvePhoto(vehicle?.profilPhoto || vehicle?.photo);

    const [form, setForm] = useState({
        startDate: "", startTime: "09:00",
        endDate: "", endTime: "18:00",
        pickupLocation: vehicle?.defaultParkingLocation || "",
        returnLocation: vehicle?.defaultParkingLocation || "",
    });
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (isOpen) {
            setForm({
                startDate: "", startTime: "09:00",
                endDate: "", endTime: "18:00",
                pickupLocation: vehicle?.defaultParkingLocation || "",
                returnLocation: vehicle?.defaultParkingLocation || "",
            });
            setErrors({});
        }
    }, [isOpen, vehicle]);

    const startISO = form.startDate && form.startTime
        ? new Date(`${form.startDate}T${form.startTime}:00`).toISOString() : null;
    const endISO = form.endDate && form.endTime
        ? new Date(`${form.endDate}T${form.endTime}:00`).toISOString() : null;

    const nbDays = (() => {
        if (!startISO || !endISO) return 0;
        const diff = (new Date(endISO) - new Date(startISO)) / (1000 * 60 * 60 * 24);
        return diff > 0 ? Math.ceil(diff) : 0;
    })();

    const pricePerDay = Number(vehicle?.baseDailyPrice || 0);
    const totalAmount = (nbDays * pricePerDay).toFixed(2);

    const validate = () => {
        const e = {};
        if (!form.startDate) e.startDate = "Date requise";
        if (!form.startTime) e.startTime = "Heure requise";
        if (!form.endDate) e.endDate = "Date requise";
        if (!form.endTime) e.endTime = "Heure requise";
        if (!form.pickupLocation) e.pickupLocation = "Lieu requis";
        if (!form.returnLocation) e.returnLocation = "Lieu requis";
        if (startISO && endISO && new Date(endISO) <= new Date(startISO))
            e.endDate = "La date de fin doit être après le début";
        return e;
    };

    const handleConfirm = () => {
        const e = validate();
        if (Object.keys(e).length > 0) { setErrors(e); return; }
        onConfirm({ startDate: startISO, endDate: endISO, pickupLocation: form.pickupLocation, returnLocation: form.returnLocation });
    };

    return (
        <Modal
            isOpen={isOpen}
            onOpenChange={onOpenChange}
            size="xl"
            hideCloseButton
            classNames={{
                base: `${isLight ? "bg-white" : "bg-[#080f28]"} shadow-2xl`,
                wrapper: "items-center",
            }}
        >
            <ModalContent>
                {(onClose) => (
                    <div className="flex flex-col overflow-hidden rounded-2xl">

                        {/* ── Bannière véhicule ── */}
                        <div className="relative h-44 overflow-hidden">
                            {photo
                                ? <img src={photo} alt={`${vehicle?.brand} ${vehicle?.model}`} className="w-full h-full object-cover" />
                                : <div className={`w-full h-full flex items-center justify-center ${isLight ? "bg-slate-100" : "bg-[#0d1533]"}`}>
                                    <TruckIcon className={`h-16 w-16 ${isLight ? "text-slate-300" : "text-white/10"}`} />
                                  </div>
                            }
                            {/* Overlay gradient */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                            {/* Bouton fermer */}
                            <button
                                onClick={onClose}
                                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white/80 hover:text-white hover:bg-black/60 transition-all"
                            >
                                <XMarkIcon className="h-4 w-4" />
                            </button>

                            {/* Info véhicule */}
                            <div className="absolute bottom-0 left-0 right-0 px-5 pb-4">
                                <p className="text-white text-xl font-bold leading-tight drop-shadow">
                                    {vehicle?.brand} <span className="text-orange-400">{vehicle?.model}</span>
                                </p>
                                <div className="flex items-center gap-4 mt-1">
                                    {vehicle?.fuel && (
                                        <span className="flex items-center gap-1 text-white/70 text-xs">
                                            <Fuel size={11} /> {vehicle.fuel}
                                        </span>
                                    )}
                                    {vehicle?.mileage && (
                                        <span className="flex items-center gap-1 text-white/70 text-xs">
                                            <Gauge size={11} /> {vehicle.mileage?.toLocaleString("fr-FR")} km
                                        </span>
                                    )}
                                    <span className="ml-auto text-orange-400 font-bold text-sm drop-shadow">
                                        {pricePerDay.toFixed(2)} € / jour
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* ── Corps ── */}
                        <div className={`px-5 py-5 flex flex-col gap-5 ${isLight ? "bg-white" : "bg-[#080f28]"}`}>

                            {/* Dates */}
                            <div className="grid grid-cols-2 gap-3">
                                <DateBlock
                                    label="Début de location"
                                    dateValue={form.startDate} timeValue={form.startTime}
                                    minDate={todayStr} isDark={isDark}
                                    onDateChange={(v) => { setForm(f => ({ ...f, startDate: v })); setErrors(e => ({ ...e, startDate: undefined })); }}
                                    onTimeChange={(v) => setForm(f => ({ ...f, startTime: v }))}
                                    error={errors.startDate}
                                />
                                <DateBlock
                                    label="Fin de location"
                                    dateValue={form.endDate} timeValue={form.endTime}
                                    minDate={form.startDate || todayStr} isDark={isDark}
                                    onDateChange={(v) => { setForm(f => ({ ...f, endDate: v })); setErrors(e => ({ ...e, endDate: undefined })); }}
                                    onTimeChange={(v) => setForm(f => ({ ...f, endTime: v }))}
                                    error={errors.endDate}
                                />
                            </div>

                            {/* Lieux */}
                            <div className="grid grid-cols-2 gap-3">
                                <LocationInput
                                    label="Lieu de prise en charge"
                                    icon={MapPinIcon}
                                    value={form.pickupLocation}
                                    onChange={(v) => { setForm(f => ({ ...f, pickupLocation: v })); setErrors(e => ({ ...e, pickupLocation: undefined })); }}
                                    placeholder="ex: Niort, Parking A"
                                    isDark={isDark}
                                    error={errors.pickupLocation}
                                />
                                <LocationInput
                                    label="Lieu de retour"
                                    icon={MapPinIcon}
                                    value={form.returnLocation}
                                    onChange={(v) => { setForm(f => ({ ...f, returnLocation: v })); setErrors(e => ({ ...e, returnLocation: undefined })); }}
                                    placeholder="ex: Niort, Parking A"
                                    isDark={isDark}
                                    error={errors.returnLocation}
                                />
                            </div>

                            {/* Récap tarif */}
                            <div className={`rounded-2xl p-4 border ${isLight ? "bg-orange-50 border-orange-100" : "bg-orange-500/8 border-orange-500/15"}`}>
                                {nbDays > 0 ? (
                                    <>
                                        <div className="flex items-center justify-between mb-2">
                                            <span className={`text-sm ${isLight ? "text-slate-600" : "text-slate-300"}`}>
                                                {nbDays} jour{nbDays > 1 ? "s" : ""} × {pricePerDay.toFixed(2)} €
                                            </span>
                                            <span className="text-orange-500 font-bold text-xl">{totalAmount} €</span>
                                        </div>
                                        <div className={`h-1.5 rounded-full ${isLight ? "bg-orange-100" : "bg-white/10"}`}>
                                            <div
                                                className="h-full rounded-full bg-gradient-to-r from-orange-500 to-amber-400 transition-all duration-500"
                                                style={{ width: `${Math.min((nbDays / 30) * 100, 100)}%` }}
                                            />
                                        </div>
                                        <p className={`text-xs mt-1.5 ${isLight ? "text-slate-400" : "text-slate-500"}`}>
                                            Durée : {nbDays} jour{nbDays > 1 ? "s" : ""}
                                        </p>
                                    </>
                                ) : (
                                    <p className={`text-sm text-center ${isLight ? "text-slate-400" : "text-slate-500"}`}>
                                        Sélectionnez vos dates pour voir le tarif
                                    </p>
                                )}
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3 pt-1">
                                <Button
                                    variant="flat"
                                    onPress={onClose}
                                    className={`flex-1 rounded-xl font-semibold ${isLight ? "bg-slate-100 text-slate-600 hover:bg-slate-200" : "bg-white/8 text-white/70 hover:bg-white/12"}`}
                                >
                                    Annuler
                                </Button>
                                <Button
                                    onPress={handleConfirm}
                                    isLoading={isSubmitting}
                                    isDisabled={nbDays === 0}
                                    startContent={!isSubmitting && <CheckCircleIcon className="h-4 w-4" />}
                                    className="flex-1 rounded-xl font-bold bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/30 disabled:opacity-40"
                                >
                                    Confirmer la réservation
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </ModalContent>
        </Modal>
    );
}
