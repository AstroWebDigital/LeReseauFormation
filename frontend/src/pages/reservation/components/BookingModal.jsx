import { useState, useEffect } from "react";
import { Modal, ModalContent, Button } from "@heroui/react";
import {
    MapPinIcon, CalendarDaysIcon, ClockIcon, CreditCardIcon,
    XMarkIcon, TruckIcon, ChevronLeftIcon, ChevronRightIcon,
} from "@heroicons/react/24/outline";
import { Fuel, Gauge } from "lucide-react";
import api from "@/services/auth/client";

// ── Helpers ────────────────────────────────────────────────────────────────────
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

const DAYS_FR   = ["Lu","Ma","Me","Je","Ve","Sa","Di"];
const MONTHS_FR = ["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"];
const HOURS     = Array.from({length:24},(_,i)=>{ const h=String(i).padStart(2,"0"); return {value:`${h}:00`,label:`${h}h00`}; });

function resolvePhoto(url) {
    if (!url) return null;
    if (url.startsWith("http")) return url;
    return `${API_BASE_URL}${url.startsWith("/") ? url : "/"+url}`;
}
function toStr(date) {
    return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,"0")}-${String(date.getDate()).padStart(2,"0")}`;
}
function calDays(year, month) {
    const first = new Date(year, month, 1);
    const last  = new Date(year, month+1, 0);
    const pad   = (first.getDay()+6) % 7;
    const days  = [];
    for (let i = 0; i < pad; i++) days.push(null);
    for (let d = 1; d <= last.getDate(); d++) days.push(new Date(year, month, d));
    while (days.length % 7 !== 0) days.push(null);
    return days;
}
function formatShort(ds) {
    if (!ds) return "";
    const [y,m,d] = ds.split("-").map(Number);
    return new Date(y,m-1,d).toLocaleDateString("fr-FR",{day:"2-digit",month:"short",year:"numeric"});
}
function isInSlot(ds, slots) {
    return slots.some(s => ds >= s.startDate && ds <= s.endDate);
}
// Ajoute un jour à une date string "yyyy-MM-dd"
function addOneDay(ds) {
    const [y, m, d] = ds.split("-").map(Number);
    const next = new Date(y, m - 1, d + 1);
    return toStr(next);
}

// Vérifie que [start, end] est entièrement couvert par l'union des slots
// (slots consécutifs et chevauchants fusionnés à la volée, triés par startDate)
function isRangeInSlot(start, end, slots) {
    if (!slots || slots.length === 0) return true;
    const sorted = [...slots].sort((a, b) => a.startDate.localeCompare(b.startDate));
    let covEnd = null;
    for (const slot of sorted) {
        if (slot.endDate < start) continue; // slot avant le range
        if (covEnd === null) {
            if (slot.startDate > start) return false; // trou au début
            covEnd = slot.endDate;
        } else {
            if (slot.startDate > addOneDay(covEnd)) return false; // trou entre slots
            if (slot.endDate > covEnd) covEnd = slot.endDate;
        }
        if (covEnd >= end) return true;
    }
    return covEnd !== null && covEnd >= end;
}

// ── Sous-composants ────────────────────────────────────────────────────────────
function FieldLabel({ children, isDark }) {
    return <span className={`text-[11px] font-semibold uppercase tracking-wider ${isDark?"text-slate-400":"text-slate-500"}`}>{children}</span>;
}

function LocationInput({ label, icon: Icon, value, onChange, placeholder, isDark, error }) {
    const isLight = !isDark;
    return (
        <div className="flex flex-col gap-1.5">
            <FieldLabel isDark={isDark}>{label}</FieldLabel>
            <div className={`flex items-center gap-2 rounded-2xl border px-3 py-2.5 transition-all ${
                error ? "border-red-500"
                    : isLight ? "border-slate-200 focus-within:border-orange-400 bg-white"
                              : "border-white/10 focus-within:border-orange-400 bg-white/3"
            }`}>
                <Icon className={`h-4 w-4 shrink-0 ${isLight?"text-slate-400":"text-slate-500"}`} />
                <input type="text" value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}
                    className={`flex-1 bg-transparent text-sm focus:outline-none ${isLight?"text-slate-800 placeholder:text-slate-400":"text-white placeholder:text-slate-500"}`} />
            </div>
            {error && <p className="text-red-500 text-xs">{error}</p>}
        </div>
    );
}

// ── Composant principal ────────────────────────────────────────────────────────
export function BookingModal({ isOpen, onOpenChange, vehicle, onProceedToPayment, isSubmitting, isDark }) {
    const isLight = !isDark;
    const now     = new Date();
    const todayStr = toStr(now);
    const photo   = resolvePhoto(vehicle?.profilPhoto || vehicle?.photo);

    // Calendrier
    const [calYear,  setCalYear]  = useState(now.getFullYear());
    const [calMonth, setCalMonth] = useState(now.getMonth());
    const [hover,    setHover]    = useState(null);

    // Formulaire
    const [form, setForm] = useState({ startDate:"", endDate:"", startTime:"09:00", endTime:"18:00", pickupLocation:"", returnLocation:"" });
    const [errors, setErrors]             = useState({});
    const [availabilitySlots, setSlots]   = useState([]);
    const [reservedRanges, setReserved]   = useState([]); // plages déjà réservées

    useEffect(() => {
        if (!isOpen) return;
        setForm({ startDate:"", endDate:"", startTime:"09:00", endTime:"18:00",
            pickupLocation: vehicle?.defaultParkingLocation||"",
            returnLocation: vehicle?.defaultParkingLocation||"" });
        setErrors({});
        setHover(null);
        setReserved([]);
        if (vehicle?.id) {
            Promise.all([
                api.get(`/api/vehicles/${vehicle.id}/availability`).catch(() => ({ data: [] })),
                api.get(`/api/vehicles/${vehicle.id}/reserved-dates`).catch(() => ({ data: [] })),
            ]).then(([availRes, reservedRes]) => {
                const slots = availRes.data || [];
                setSlots(slots);
                setReserved(reservedRes.data || []);
                // Naviguer vers le premier slot futur
                const future = slots.find(s => s.endDate >= todayStr);
                if (future) {
                    const d = new Date(future.startDate+"T00:00:00");
                    setCalYear(d.getFullYear());
                    setCalMonth(d.getMonth());
                }
            });
        } else {
            setSlots([]);
        }
    }, [isOpen, vehicle]);

    const prevMonth = () => calMonth===0 ? (setCalMonth(11), setCalYear(y=>y-1)) : setCalMonth(m=>m-1);
    const nextMonth = () => calMonth===11 ? (setCalMonth(0), setCalYear(y=>y+1)) : setCalMonth(m=>m+1);

    // Jours du mois
    const days = calDays(calYear, calMonth);

    // Range effectif (avec hover)
    const effEnd = form.startDate && !form.endDate && hover && hover > form.startDate ? hover : form.endDate;

    // Click sur un jour
    const handleDayClick = (ds) => {
        const restricted = availabilitySlots.length > 0 && !isInSlot(ds, availabilitySlots);
        if (ds < todayStr || restricted || isReservedDay(ds)) return;

        if (!form.startDate || form.endDate || ds < form.startDate) {
            setForm(f => ({...f, startDate: ds, endDate: ""}));
            setErrors(e => ({...e, startDate: undefined, endDate: undefined}));
        } else if (ds === form.startDate) {
            setForm(f => ({...f, startDate: "", endDate: ""}));
        } else {
            setForm(f => ({...f, endDate: ds}));
            setErrors(e => ({...e, endDate: undefined}));
        }
    };

    // État visuel d'un jour
    const dayState = (ds) => {
        const isPast   = ds < todayStr;
        const notAvail = availabilitySlots.length > 0 && !isInSlot(ds, availabilitySlots);
        const reserved = isReservedDay(ds);
        if (isPast || notAvail) return "disabled";
        if (reserved) return "reserved";
        if (!form.startDate && !effEnd)  return "normal";
        const isStart = ds === form.startDate;
        const isEnd   = ds === effEnd;
        const inRange = form.startDate && effEnd && ds > form.startDate && ds < effEnd;
        if (isStart && !effEnd) return "single";
        if (isStart) return "start";
        if (isEnd)   return "end";
        if (inRange) return "mid";
        return "normal";
    };

    // Classes CSS d'un jour
    const dayClass = (ds, state) => {
        const base = "relative flex items-center justify-center h-9 w-full text-xs font-medium select-none transition-colors";
        const isToday   = ds === todayStr;
        const todayRing = isToday ? " ring-1 ring-orange-400" : "";

        switch (state) {
            case "disabled": return `${base} opacity-25 cursor-not-allowed rounded-full ${isLight?"text-slate-400":"text-slate-600"}`;
            case "reserved": return `${base} cursor-not-allowed rounded-full line-through ${isLight?"text-red-400 bg-red-50":"text-red-400/70 bg-red-500/10"}`;
            case "single":   return `${base} cursor-pointer bg-orange-500 text-white rounded-full shadow-lg shadow-orange-500/30`;
            case "start":    return `${base} cursor-pointer bg-orange-500 text-white rounded-l-full shadow-lg shadow-orange-500/20`;
            case "end":      return `${base} cursor-pointer bg-orange-500 text-white rounded-r-full shadow-lg shadow-orange-500/20`;
            case "mid":      return `${base} cursor-pointer ${isLight?"bg-orange-100 text-orange-700":"bg-orange-500/20 text-orange-300"}`;
            default: {
                const avail = availabilitySlots.length > 0 && isInSlot(ds, availabilitySlots);
                return `${base} cursor-pointer rounded-full${todayRing} ${
                    avail
                        ? isLight ? "text-green-700 hover:bg-green-100" : "text-green-400 hover:bg-green-500/15"
                        : isLight ? "text-slate-700 hover:bg-slate-100" : "text-slate-300 hover:bg-white/10"
                }`;
            }
        }
    };

    // Indicateur de disponibilité dans le coin du chiffre
    const isAvailDay = (ds) => availabilitySlots.length > 0 && isInSlot(ds, availabilitySlots);

    // Vérifie si un jour tombe dans une réservation existante
    const isReservedDay = (ds) => reservedRanges.some(r => ds >= r.startDate && ds <= r.endDate);

    // Calcul prix
    const startISO = form.startDate && form.startTime ? new Date(`${form.startDate}T${form.startTime}:00`).toISOString() : null;
    const endISO   = form.endDate   && form.endTime   ? new Date(`${form.endDate}T${form.endTime}:00`).toISOString()   : null;
    const nbDays   = (() => {
        if (!startISO || !endISO) return 0;
        const diff = (new Date(endISO)-new Date(startISO)) / 86400000;
        return diff > 0 ? Math.ceil(diff) : 0;
    })();
    const pricePerDay  = Number(vehicle?.baseDailyPrice || 0);
    const totalAmount  = (nbDays * pricePerDay).toFixed(2);

    // Validation
    const validate = () => {
        const e = {};
        if (!form.startDate)   e.startDate = "Sélectionnez une date de début";
        if (!form.endDate)     e.endDate   = "Sélectionnez une date de fin";
        if (!form.pickupLocation)  e.pickupLocation  = "Lieu requis";
        if (!form.returnLocation)  e.returnLocation  = "Lieu requis";
        if (startISO && endISO && new Date(endISO) <= new Date(startISO)) e.endDate = "La date de fin doit être après le début";
        if (form.startDate && form.endDate && availabilitySlots.length > 0 && !isRangeInSlot(form.startDate, form.endDate, availabilitySlots))
            e.startDate = "Ces dates ne correspondent pas aux disponibilités du véhicule.";
        if (form.startDate && form.endDate && reservedRanges.some(r => form.startDate <= r.endDate && form.endDate >= r.startDate))
            e.startDate = "Ces dates incluent une période déjà réservée.";
        return e;
    };

    const handleConfirm = () => {
        const e = validate();
        if (Object.keys(e).length > 0) { setErrors(e); return; }
        onProceedToPayment({ startDate:startISO, endDate:endISO, pickupLocation:form.pickupLocation, returnLocation:form.returnLocation, totalAmount:parseFloat(totalAmount), nbDays });
    };

    // ── Rendu ──────────────────────────────────────────────────────────────────
    return (
        <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="xl" hideCloseButton
            classNames={{ base:`${isLight?"bg-white":"bg-[#080f28]"} shadow-2xl`, wrapper:"items-center" }}>
            <ModalContent>
                {(onClose) => (
                    <div className="flex flex-col overflow-hidden rounded-2xl">

                        {/* ── Bannière véhicule ── */}
                        <div className="relative h-36 overflow-hidden shrink-0">
                            {photo
                                ? <img src={photo} alt={`${vehicle?.brand} ${vehicle?.model}`} className="w-full h-full object-cover" />
                                : <div className={`w-full h-full flex items-center justify-center ${isLight?"bg-slate-100":"bg-[#0d1533]"}`}>
                                    <TruckIcon className={`h-14 w-14 ${isLight?"text-slate-300":"text-white/10"}`} />
                                  </div>
                            }
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                            <button onClick={onClose} className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white/80 hover:text-white transition-all">
                                <XMarkIcon className="h-4 w-4" />
                            </button>
                            <div className="absolute bottom-0 left-0 right-0 px-5 pb-3">
                                <p className="text-white text-lg font-bold leading-tight drop-shadow">
                                    {vehicle?.brand} <span className="text-orange-400">{vehicle?.model}</span>
                                </p>
                                <div className="flex items-center gap-4 mt-0.5">
                                    {vehicle?.fuel && <span className="flex items-center gap-1 text-white/70 text-xs"><Fuel size={11}/> {vehicle.fuel}</span>}
                                    {vehicle?.mileage && <span className="flex items-center gap-1 text-white/70 text-xs"><Gauge size={11}/> {vehicle.mileage?.toLocaleString("fr-FR")} km</span>}
                                    <span className="ml-auto text-orange-400 font-bold text-sm">{pricePerDay.toFixed(2)} € / jour</span>
                                </div>
                            </div>
                        </div>

                        {/* ── Corps scrollable ── */}
                        <div className={`flex flex-col gap-4 px-5 py-4 overflow-y-auto ${isLight?"bg-white":"bg-[#080f28]"}`} style={{maxHeight:"60vh"}}>

                            {/* ── Calendrier ── */}
                            <div>
                                {/* Nav mois */}
                                <div className="flex items-center justify-between mb-2">
                                    <button onClick={prevMonth} className={`w-7 h-7 flex items-center justify-center rounded-lg transition-colors ${isLight?"bg-slate-100 hover:bg-slate-200 text-slate-600":"bg-white/8 hover:bg-white/15 text-white/70"}`}>
                                        <ChevronLeftIcon className="h-3.5 w-3.5" />
                                    </button>
                                    <span className={`font-bold text-sm ${isLight?"text-slate-800":"text-white"}`}>
                                        {MONTHS_FR[calMonth]} {calYear}
                                    </span>
                                    <button onClick={nextMonth} className={`w-7 h-7 flex items-center justify-center rounded-lg transition-colors ${isLight?"bg-slate-100 hover:bg-slate-200 text-slate-600":"bg-white/8 hover:bg-white/15 text-white/70"}`}>
                                        <ChevronRightIcon className="h-3.5 w-3.5" />
                                    </button>
                                </div>

                                {/* Jours semaine */}
                                <div className="grid grid-cols-7 mb-0.5">
                                    {DAYS_FR.map(d => (
                                        <div key={d} className={`text-center text-[10px] font-bold uppercase py-1 ${isLight?"text-slate-400":"text-slate-600"}`}>{d}</div>
                                    ))}
                                </div>

                                {/* Grille */}
                                <div className="grid grid-cols-7">
                                    {days.map((day, idx) => {
                                        if (!day) return <div key={`p${idx}`} />;
                                        const ds    = toStr(day);
                                        const state = dayState(ds);
                                        const avail = state !== "disabled" && isAvailDay(ds);
                                        return (
                                            <div key={ds}
                                                className={dayClass(ds, state)}
                                                onClick={() => handleDayClick(ds)}
                                                onMouseEnter={() => state !== "disabled" && setHover(ds)}
                                                onMouseLeave={() => setHover(null)}
                                            >
                                                {day.getDate()}
                                                {/* Pastille verte de dispo */}
                                                {avail && state === "normal" && (
                                                    <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-green-500" />
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Légende */}
                                <div className="flex flex-wrap items-center gap-3 mt-2 pt-2 border-t border-dashed border-slate-300/30">
                                    {availabilitySlots.length > 0 && (
                                        <div className="flex items-center gap-1.5">
                                            <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
                                            <span className={`text-[10px] ${isLight?"text-slate-400":"text-slate-600"}`}>Disponible</span>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-1.5">
                                        <span className="w-2 h-2 rounded-full bg-orange-500 inline-block" />
                                        <span className={`text-[10px] ${isLight?"text-slate-400":"text-slate-600"}`}>Sélectionné</span>
                                    </div>
                                    {reservedRanges.length > 0 && (
                                        <div className="flex items-center gap-1.5">
                                            <span className="w-2 h-2 rounded-full bg-red-400 inline-block" />
                                            <span className={`text-[10px] ${isLight?"text-slate-400":"text-slate-600"}`}>Déjà réservé</span>
                                        </div>
                                    )}
                                    {availabilitySlots.length > 0 && (
                                        <div className="flex items-center gap-1.5">
                                            <span className={`w-2 h-2 rounded-full inline-block opacity-30 ${isLight?"bg-slate-500":"bg-slate-400"}`} />
                                            <span className={`text-[10px] ${isLight?"text-slate-400":"text-slate-600"}`}>Hors dispo</span>
                                        </div>
                                    )}
                                    {errors.startDate && <p className="text-red-500 text-[10px] ml-auto">{errors.startDate}</p>}
                                </div>
                            </div>

                            {/* ── Récap dates sélectionnées ── */}
                            {(form.startDate || form.endDate) && (
                                <div className={`grid grid-cols-2 gap-2 rounded-2xl p-3 border ${isLight?"bg-slate-50 border-slate-200":"bg-white/3 border-white/10"}`}>
                                    <div>
                                        <p className={`text-[10px] font-bold uppercase tracking-wider mb-0.5 ${isLight?"text-slate-400":"text-slate-600"}`}>Début</p>
                                        <p className={`text-sm font-semibold ${form.startDate ? isLight?"text-slate-800":"text-white" : isLight?"text-slate-300":"text-slate-600"}`}>
                                            {form.startDate ? formatShort(form.startDate) : "—"}
                                        </p>
                                    </div>
                                    <div>
                                        <p className={`text-[10px] font-bold uppercase tracking-wider mb-0.5 ${isLight?"text-slate-400":"text-slate-600"}`}>Fin</p>
                                        <p className={`text-sm font-semibold ${form.endDate ? isLight?"text-slate-800":"text-white" : isLight?"text-slate-300":"text-slate-600"}`}>
                                            {form.endDate ? formatShort(form.endDate) : "—"}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* ── Horaires ── */}
                            <div className="grid grid-cols-2 gap-3">
                                {[
                                    { label:"Heure de début", key:"startTime" },
                                    { label:"Heure de fin",   key:"endTime"   },
                                ].map(({ label, key }) => (
                                    <div key={key} className="flex flex-col gap-1.5">
                                        <FieldLabel isDark={isDark}>{label}</FieldLabel>
                                        <div className={`flex items-center gap-2 rounded-2xl border px-3 py-2 ${isLight?"border-slate-200 bg-white":"border-white/10 bg-white/3"}`}>
                                            <ClockIcon className={`h-4 w-4 shrink-0 ${isLight?"text-slate-400":"text-slate-500"}`} />
                                            <select value={form[key]} onChange={e=>setForm(f=>({...f,[key]:e.target.value}))}
                                                className={`flex-1 bg-transparent text-sm focus:outline-none appearance-none cursor-pointer ${isLight?"text-slate-800":"text-white"}`}>
                                                {HOURS.map(({ value, label:l }) => (
                                                    <option key={value} value={value} className={isLight?"bg-white text-slate-800":"bg-[#0e1535] text-white"}>{l}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* ── Lieux ── */}
                            <div className="grid grid-cols-2 gap-3">
                                <LocationInput label="Lieu de prise en charge" icon={MapPinIcon}
                                    value={form.pickupLocation} onChange={v=>{ setForm(f=>({...f,pickupLocation:v})); setErrors(e=>({...e,pickupLocation:undefined})); }}
                                    placeholder="ex: Niort, Parking A" isDark={isDark} error={errors.pickupLocation} />
                                <LocationInput label="Lieu de retour" icon={MapPinIcon}
                                    value={form.returnLocation} onChange={v=>{ setForm(f=>({...f,returnLocation:v})); setErrors(e=>({...e,returnLocation:undefined})); }}
                                    placeholder="ex: Niort, Parking A" isDark={isDark} error={errors.returnLocation} />
                            </div>

                            {/* ── Récap tarif ── */}
                            <div className={`rounded-2xl p-4 border ${isLight?"bg-orange-50 border-orange-100":"bg-orange-500/8 border-orange-500/15"}`}>
                                {nbDays > 0 ? (
                                    <>
                                        <div className="flex items-center justify-between mb-2">
                                            <span className={`text-sm ${isLight?"text-slate-600":"text-slate-300"}`}>
                                                {nbDays} jour{nbDays>1?"s":""} × {pricePerDay.toFixed(2)} €
                                            </span>
                                            <span className="text-orange-500 font-bold text-xl">{totalAmount} €</span>
                                        </div>
                                        <div className={`h-1.5 rounded-full ${isLight?"bg-orange-100":"bg-white/10"}`}>
                                            <div className="h-full rounded-full bg-gradient-to-r from-orange-500 to-amber-400 transition-all duration-500" style={{width:`${Math.min((nbDays/30)*100,100)}%`}} />
                                        </div>
                                        <p className={`text-xs mt-1.5 ${isLight?"text-slate-400":"text-slate-500"}`}>Durée : {nbDays} jour{nbDays>1?"s":""}</p>
                                    </>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <CalendarDaysIcon className={`h-4 w-4 ${isLight?"text-slate-300":"text-slate-600"}`} />
                                        <p className={`text-sm ${isLight?"text-slate-400":"text-slate-500"}`}>
                                            Sélectionnez vos dates sur le calendrier
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* ── Actions ── */}
                            <div className="flex gap-3">
                                <Button variant="flat" onPress={onClose}
                                    className={`flex-1 rounded-xl font-semibold ${isLight?"bg-slate-100 text-slate-600 hover:bg-slate-200":"bg-white/8 text-white/70 hover:bg-white/12"}`}>
                                    Annuler
                                </Button>
                                <Button onPress={handleConfirm} isLoading={isSubmitting} isDisabled={nbDays===0}
                                    startContent={!isSubmitting && <CreditCardIcon className="h-4 w-4" />}
                                    className="flex-1 rounded-xl font-bold bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/30 disabled:opacity-40">
                                    Procéder au paiement
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </ModalContent>
        </Modal>
    );
}
