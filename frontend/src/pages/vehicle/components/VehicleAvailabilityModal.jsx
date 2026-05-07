import React, { useState, useEffect, useCallback } from "react";
import { Modal, ModalContent, Button } from "@heroui/react";
import { ChevronLeftIcon, ChevronRightIcon, XMarkIcon, CalendarDaysIcon, TrashIcon } from "@heroicons/react/24/outline";
import api from "@/services/auth/client";

// ── Helpers ────────────────────────────────────────────────────────────────────
const DAYS_FR   = ["Lu", "Ma", "Me", "Je", "Ve", "Sa", "Di"];
const MONTHS_FR = ["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"];

function toStr(date) {
    return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,"0")}-${String(date.getDate()).padStart(2,"0")}`;
}
function shiftDay(ds, delta) {
    const [y,m,d] = ds.split("-").map(Number);
    return toStr(new Date(y, m-1, d+delta));
}
function isInSlots(ds, slots) {
    return slots.some(s => ds >= s.startDate && ds <= s.endDate);
}
function parseStr(s) {
    if (!s) return null;
    const [y,m,d] = s.split("-").map(Number);
    return new Date(y, m-1, d);
}
function formatFr(s) {
    if (!s) return "";
    return parseStr(s).toLocaleDateString("fr-FR", { day:"2-digit", month:"long", year:"numeric" });
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

// ── Composant ──────────────────────────────────────────────────────────────────
export function VehicleAvailabilityModal({ isOpen, onOpenChange, vehicle, isDark }) {
    const isLight = !isDark;

    const now = new Date();
    const todayStr = toStr(now);
    const [year,  setYear]  = useState(now.getFullYear());
    const [month, setMonth] = useState(now.getMonth());

    const [slots,       setSlots]       = useState([]);
    const [loading,     setLoading]     = useState(false);
    const [saving,      setSaving]      = useState(false);
    const [selectStart, setSelectStart] = useState(null); // 1ère date cliquée
    const [hoverDate,   setHoverDate]   = useState(null);
    const [error,       setError]       = useState("");

    const fetchSlots = useCallback(async () => {
        if (!vehicle?.id) return;
        setLoading(true);
        try {
            const { data } = await api.get(`/api/vehicles/${vehicle.id}/availability`);
            setSlots(data);
        } catch { /* ignore */ }
        finally { setLoading(false); }
    }, [vehicle?.id]);

    useEffect(() => {
        if (isOpen) {
            fetchSlots();
            setSelectStart(null);
            setHoverDate(null);
            setError("");
        }
    }, [isOpen, fetchSlots]);

    const prevMonth = () => month === 0 ? (setMonth(11), setYear(y=>y-1)) : setMonth(m=>m-1);
    const nextMonth = () => month === 11 ? (setMonth(0),  setYear(y=>y+1)) : setMonth(m=>m+1);

    // ── Clic sur un jour ───────────────────────────────────────────────────────
    const handleDayClick = async (ds) => {
        if (ds < todayStr) return;
        setError("");

        if (!selectStart) {
            setSelectStart(ds);
        } else {
            if (ds === selectStart) { setSelectStart(null); return; }
            const start = ds < selectStart ? ds : selectStart;
            const end   = ds < selectStart ? selectStart : ds;
            setSaving(true);
            try {
                const { data } = await api.post(`/api/vehicles/${vehicle.id}/availability`, { startDate: start, endDate: end });
                setSlots(prev => [...prev, data].sort((a,b) => a.startDate.localeCompare(b.startDate)));
            } catch (e) {
                setError(e.response?.data || "Erreur lors de l'ajout.");
            } finally {
                setSaving(false);
                setSelectStart(null);
                setHoverDate(null);
            }
        }
    };

    const handleDelete = async (slotId) => {
        try {
            await api.delete(`/api/vehicles/${vehicle.id}/availability/${slotId}`);
            setSlots(prev => prev.filter(s => s.id !== slotId));
        } catch { /* ignore */ }
    };

    // ── Calcul état visuel d'un jour ──────────────────────────────────────────
    const getDayState = (ds) => {
        const isPast = ds < todayStr;
        // plage sélection en cours
        const prevEnd = selectStart && hoverDate && hoverDate !== selectStart
            ? (hoverDate > selectStart ? hoverDate : selectStart)
            : null;
        const prevStart = selectStart && hoverDate && hoverDate !== selectStart
            ? (hoverDate > selectStart ? selectStart : hoverDate)
            : selectStart;

        const inPreview   = prevStart && prevEnd && ds >= prevStart && ds <= prevEnd;
        const isSelStart  = ds === prevStart && prevEnd;
        const isSelEnd    = ds === prevEnd;
        const isSingleSel = ds === selectStart && !hoverDate;

        // plages existantes — fusion visuelle des slots consécutifs
        const inSlot  = isInSlots(ds, slots);
        // Un jour est visuellement "début" si le jour précédent n'est PAS dans un slot
        const isStart = inSlot && !isInSlots(shiftDay(ds, -1), slots);
        // Un jour est visuellement "fin" si le jour suivant n'est PAS dans un slot
        const isEnd   = inSlot && !isInSlots(shiftDay(ds, +1), slots);

        return { isPast, inSlot, isStart, isEnd, inPreview, isSelStart, isSelEnd, isSingleSel };
    };

    // ── Classes CSS d'un jour ──────────────────────────────────────────────────
    const dayClass = (ds, st) => {
        const base = "relative flex items-center justify-center h-9 text-xs font-medium select-none transition-colors";
        if (st.isPast)      return `${base} opacity-25 cursor-not-allowed ${isLight?"text-slate-400":"text-slate-600"}`;
        if (st.isSingleSel) return `${base} cursor-pointer bg-orange-500 text-white rounded-full z-10`;
        if (st.isSelStart)  return `${base} cursor-pointer bg-orange-500 text-white rounded-l-full z-10`;
        if (st.isSelEnd)    return `${base} cursor-pointer bg-orange-400 text-white rounded-r-full z-10`;
        if (st.inPreview)   return `${base} cursor-pointer ${isLight?"bg-orange-100 text-orange-700":"bg-orange-500/20 text-orange-300"}`;
        if (st.isStart)     return `${base} cursor-pointer bg-green-500 text-white rounded-l-full`;
        if (st.isEnd)       return `${base} cursor-pointer bg-green-500 text-white rounded-r-full`;
        if (st.inSlot)      return `${base} cursor-pointer ${isLight?"bg-green-100 text-green-700":"bg-green-500/20 text-green-300"}`;
        return `${base} cursor-pointer ${isLight?"hover:bg-slate-100 text-slate-700":"hover:bg-white/10 text-slate-300"}`;
    };

    // ── Thème ──────────────────────────────────────────────────────────────────
    const bg      = isLight ? "bg-white"      : "bg-[#080f28]";
    const border  = isLight ? "border-slate-200" : "border-white/10";
    const textMain = isLight ? "text-slate-800" : "text-white";
    const textSub  = isLight ? "text-slate-500" : "text-slate-400";
    const btnNav   = isLight ? "bg-slate-100 hover:bg-slate-200 text-slate-600" : "bg-white/8 hover:bg-white/15 text-white/70";

    const days = calDays(year, month);

    return (
        <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="2xl" hideCloseButton
            classNames={{ base:`${bg} shadow-2xl`, wrapper:"items-center" }}>
            <ModalContent>
                {(onClose) => (
                    <div className={`flex flex-col rounded-2xl overflow-hidden ${bg}`}>

                        {/* Header */}
                        <div className={`flex items-center justify-between px-6 py-4 border-b ${border}`}>
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-orange-500/10 rounded-xl">
                                    <CalendarDaysIcon className="h-5 w-5 text-orange-500" />
                                </div>
                                <div>
                                    <p className={`font-bold text-base ${textMain}`}>Disponibilités du véhicule</p>
                                    <p className={`text-xs ${textSub}`}>
                                        {vehicle?.brand} {vehicle?.model} — cliquez sur le calendrier pour définir les périodes disponibles
                                    </p>
                                </div>
                            </div>
                            <button onClick={onClose} className={`w-8 h-8 flex items-center justify-center rounded-full transition-colors ${btnNav}`}>
                                <XMarkIcon className="h-4 w-4" />
                            </button>
                        </div>

                        <div className="flex flex-col md:flex-row overflow-hidden" style={{ maxHeight:"72vh" }}>

                            {/* ── Calendrier ─────────────────────────────────── */}
                            <div className={`flex-1 flex flex-col p-5 border-r ${border} overflow-y-auto`}>

                                {/* Instruction */}
                                <div className={`mb-4 rounded-xl px-4 py-2.5 text-xs font-medium flex items-center gap-2 ${
                                    selectStart
                                        ? isLight ? "bg-orange-50 border border-orange-200 text-orange-700" : "bg-orange-500/10 border border-orange-500/20 text-orange-300"
                                        : isLight ? "bg-slate-50  border border-slate-200  text-slate-500"  : "bg-white/5   border border-white/10  text-slate-400"
                                }`}>
                                    <span className={`w-2 h-2 rounded-full flex-shrink-0 ${selectStart ? "bg-orange-500" : isLight ? "bg-slate-300" : "bg-slate-600"}`} />
                                    {selectStart
                                        ? `Départ sélectionné : ${formatFr(selectStart)} — cliquez sur la date de fin`
                                        : "Cliquez sur une date de début pour sélectionner une période"}
                                </div>

                                {/* Nav mois */}
                                <div className="flex items-center justify-between mb-3">
                                    <button onClick={prevMonth} className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors ${btnNav}`}>
                                        <ChevronLeftIcon className="h-4 w-4" />
                                    </button>
                                    <span className={`font-bold text-sm ${textMain}`}>{MONTHS_FR[month]} {year}</span>
                                    <button onClick={nextMonth} className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors ${btnNav}`}>
                                        <ChevronRightIcon className="h-4 w-4" />
                                    </button>
                                </div>

                                {/* Jours semaine */}
                                <div className="grid grid-cols-7 mb-1">
                                    {DAYS_FR.map(d => (
                                        <div key={d} className={`text-center text-[10px] font-bold uppercase py-1 ${textSub}`}>{d}</div>
                                    ))}
                                </div>

                                {/* Grille */}
                                {loading || saving ? (
                                    <div className="flex items-center justify-center py-16">
                                        <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-7">
                                        {days.map((day, idx) => {
                                            if (!day) return <div key={`p${idx}`} />;
                                            const ds  = toStr(day);
                                            const st  = getDayState(ds);
                                            const isToday = ds === todayStr;
                                            return (
                                                <div key={ds}
                                                    className={dayClass(ds, st) + (isToday && !st.inSlot && !st.inPreview ? " ring-1 ring-orange-400 rounded-full" : "")}
                                                    onClick={() => handleDayClick(ds)}
                                                    onMouseEnter={() => !st.isPast && setHoverDate(ds)}
                                                    onMouseLeave={() => setHoverDate(null)}
                                                >
                                                    {day.getDate()}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}

                                {error && <p className="mt-3 text-red-400 text-xs text-center">{error}</p>}

                                {/* Légende */}
                                <div className="flex items-center gap-5 mt-4 pt-3 border-t border-dashed border-slate-300/30">
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-3 h-3 rounded-full bg-green-500" />
                                        <span className={`text-[10px] ${textSub}`}>Disponible</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-3 h-3 rounded-full bg-orange-500" />
                                        <span className={`text-[10px] ${textSub}`}>Sélection en cours</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <div className={`w-3 h-3 rounded-full opacity-30 ${isLight?"bg-slate-400":"bg-slate-600"}`} />
                                        <span className={`text-[10px] ${textSub}`}>Passé</span>
                                    </div>
                                </div>
                            </div>

                            {/* ── Panneau droite ─────────────────────────────── */}
                            <div className="w-full md:w-68 flex flex-col overflow-y-auto" style={{ minWidth:"240px" }}>

                                {/* Plages existantes */}
                                <div className="flex-1 p-5">
                                    <p className={`text-xs font-bold uppercase tracking-wider mb-3 ${textSub}`}>
                                        Plages définies ({slots.length})
                                    </p>
                                    {slots.length === 0 ? (
                                        <div className={`text-center py-10 rounded-xl border border-dashed ${isLight?"border-slate-200 text-slate-400":"border-white/10 text-slate-600"}`}>
                                            <CalendarDaysIcon className="h-8 w-8 mx-auto mb-2 opacity-30" />
                                            <p className="text-xs">Aucune disponibilité</p>
                                            <p className="text-[10px] mt-1 opacity-60">Le véhicule ne sera pas réservable</p>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col gap-2">
                                            {slots.map(slot => (
                                                <div key={slot.id}
                                                    className={`flex items-start gap-2 rounded-xl px-3 py-2.5 border ${
                                                        isLight ? "bg-green-50 border-green-100" : "bg-green-500/8 border-green-500/15"
                                                    }`}>
                                                    <div className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0 mt-1" />
                                                    <div className="flex-1 min-w-0">
                                                        <p className={`text-xs font-semibold ${isLight?"text-slate-700":"text-slate-300"}`}>
                                                            {formatFr(slot.startDate)}
                                                        </p>
                                                        <p className={`text-[10px] ${isLight?"text-slate-400":"text-slate-500"}`}>
                                                            → {formatFr(slot.endDate)}
                                                        </p>
                                                    </div>
                                                    <button onClick={() => handleDelete(slot.id)}
                                                        className={`w-6 h-6 flex items-center justify-center rounded-lg flex-shrink-0 transition-colors ${
                                                            isLight ? "text-red-400 hover:bg-red-50" : "text-red-400/60 hover:bg-red-500/10"
                                                        }`}>
                                                        <TrashIcon className="h-3.5 w-3.5" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Footer */}
                                <div className={`p-4 border-t ${border}`}>
                                    {selectStart && (
                                        <Button size="sm" variant="flat"
                                            onPress={() => { setSelectStart(null); setHoverDate(null); }}
                                            className={`w-full rounded-xl mb-2 font-medium ${isLight?"bg-slate-100 text-slate-600":"bg-white/8 text-white/60"}`}>
                                            Annuler la sélection
                                        </Button>
                                    )}
                                    <Button size="sm" onPress={onClose}
                                        className={`w-full rounded-xl font-semibold ${isLight?"bg-slate-100 text-slate-600 hover:bg-slate-200":"bg-white/8 text-white/70 hover:bg-white/12"}`}>
                                        Fermer
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </ModalContent>
        </Modal>
    );
}
