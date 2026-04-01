import React, { useState, useEffect, useRef } from "react";
import { Switch, Spinner } from "@heroui/react";
import {
    User, Save, Mail, Shield, LogOut, AlertCircle, CheckCircle2,
    Sun, Moon, Palette, Trash2, CalendarCheck, Clock, Car,
    History, ArrowRight, X, Camera, Bell, Eye, EyeOff,
    Phone, Briefcase, Lock
} from "lucide-react";

import { useAuth } from "@/auth/AuthContext";
import { AuthAPI } from "@/services/auth";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@/theme/ThemeProvider";

// ── Helpers ───────────────────────────────────────────────────────────────────
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

const resolvePhotoUrl = (url) => {
    if (!url) return null;
    if (url.startsWith("http")) return url;
    return `${API_BASE_URL}${url.startsWith("/") ? "" : "/"}${url}`;
};

const fmtDate = (d) => d
    ? new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" })
    : "—";
const fmtCurrency = (n) => n != null ? `${Number(n).toLocaleString("fr-FR")}€` : "—";

const resStatusLabel = (s) => {
    const m = { EN_COURS: "En cours", EN_ATTENTE: "En attente", CONFIRME: "Confirmée", ANNULE: "Annulée", TERMINE: "Terminée", accepte: "Confirmée" };
    return m[s] || s;
};
const resStatusStyle = (s) => {
    const m = {
        EN_COURS:   "text-blue-400 bg-blue-400/10 border border-blue-400/20",
        EN_ATTENTE: "text-orange-400 bg-orange-400/10 border border-orange-400/20",
        CONFIRME:   "text-emerald-400 bg-emerald-400/10 border border-emerald-400/20",
        accepte:    "text-emerald-400 bg-emerald-400/10 border border-emerald-400/20",
        ANNULE:     "text-red-400 bg-red-400/10 border border-red-400/20",
        TERMINE:    "text-slate-400 bg-slate-400/10 border border-slate-400/20",
    };
    return m[s] || "text-slate-400 bg-slate-400/10 border border-slate-400/20";
};

const NAV_TABS = [
    { key: "profile",       label: "Profil",        icon: User },
    { key: "security",      label: "Sécurité",      icon: Shield },
    { key: "history",       label: "Historique",    icon: History },
    { key: "notifications", label: "Notifications", icon: Bell },
    { key: "appearance",    label: "Apparence",     icon: Palette },
];

// ── Delete Modal ──────────────────────────────────────────────────────────────
function DeleteAccountModal({ isOpen, onClose, onConfirm, isDeleting, isLight }) {
    const [val, setVal] = useState("");
    useEffect(() => { if (!isOpen) setVal(""); }, [isOpen]);
    if (!isOpen) return null;
    const confirmed = val === "SUPPRIMER";
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={onClose} />
            <div className={`relative w-full max-w-md rounded-3xl overflow-hidden shadow-2xl border
                ${isLight ? "bg-white border-slate-200" : "bg-[#0d1533] border-white/10"}`}>
                <div className="h-1 bg-gradient-to-r from-red-500 to-rose-600" />
                <div className="p-7">
                    <div className="flex items-start justify-between mb-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                                <Trash2 size={22} className="text-red-500" />
                            </div>
                            <div>
                                <h2 className={`font-black text-lg ${isLight ? "text-slate-800" : "text-white"}`}>Supprimer le compte</h2>
                                <p className={`text-xs mt-0.5 ${isLight ? "text-slate-500" : "text-slate-400"}`}>Action irréversible</p>
                            </div>
                        </div>
                        <button onClick={onClose} className={`p-2 rounded-xl ${isLight ? "hover:bg-slate-100 text-slate-400" : "hover:bg-white/5 text-slate-500"}`}>
                            <X size={18} />
                        </button>
                    </div>
                    <div className={`rounded-2xl p-4 mb-5 border ${isLight ? "bg-red-50 border-red-100" : "bg-red-500/8 border-red-500/20"}`}>
                        <p className={`text-sm font-bold mb-2 ${isLight ? "text-red-700" : "text-red-400"}`}>Données supprimées définitivement :</p>
                        <ul className={`text-xs space-y-1.5 ${isLight ? "text-red-600" : "text-red-400/80"}`}>
                            {["Profil et informations personnelles", "Historique de réservations", "Documents enregistrés"].map((t, i) => (
                                <li key={i} className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-current shrink-0" />{t}</li>
                            ))}
                        </ul>
                    </div>
                    <div className="mb-6">
                        <p className={`text-sm mb-2 ${isLight ? "text-slate-600" : "text-slate-300"}`}>
                            Tapez <span className={`font-black font-mono ${isLight ? "text-red-600" : "text-red-400"}`}>SUPPRIMER</span> pour confirmer
                        </p>
                        <input type="text" value={val} onChange={(e) => setVal(e.target.value)} placeholder="SUPPRIMER"
                            className={`w-full px-4 py-3 rounded-xl border text-sm font-mono transition-all focus:outline-none
                                ${confirmed
                                    ? isLight ? "border-red-400 bg-red-50 text-red-700" : "border-red-500/50 bg-red-500/10 text-red-400"
                                    : isLight ? "border-slate-200 bg-slate-50 text-slate-800 focus:border-red-400" : "border-white/10 bg-white/5 text-white focus:border-red-500/50"}`} />
                    </div>
                    <div className="flex gap-3">
                        <button onClick={onClose} className={`flex-1 py-3 rounded-xl font-bold text-sm ${isLight ? "bg-slate-100 text-slate-600 hover:bg-slate-200" : "bg-white/5 text-slate-300 hover:bg-white/10"}`}>
                            Annuler
                        </button>
                        <button onClick={onConfirm} disabled={!confirmed || isDeleting}
                            className={`flex-1 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all
                                ${confirmed && !isDeleting ? "bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-lg shadow-red-500/30 hover:brightness-110" : "bg-red-500/20 text-red-400/40 cursor-not-allowed"}`}>
                            {isDeleting ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Trash2 size={15} />}
                            {isDeleting ? "Suppression..." : "Supprimer"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ── Composants de champ ───────────────────────────────────────────────────────
function FieldInput({ label, value, onChange, icon: Icon, type = "text", isLight, disabled }) {
    return (
        <div className="flex flex-col gap-1.5">
            <label className={`text-xs font-bold uppercase tracking-wider ${isLight ? "text-slate-400" : "text-slate-500"}`}>{label}</label>
            <div className={`flex items-center gap-3 rounded-xl border px-4 py-3 transition-all focus-within:ring-2 focus-within:ring-orange-500/30
                ${disabled ? isLight ? "bg-slate-100 border-slate-200" : "bg-white/3 border-white/5" : isLight ? "bg-white border-slate-200 focus-within:border-orange-400" : "bg-white/5 border-white/10 focus-within:border-orange-500/60"}`}>
                {Icon && <Icon size={15} className={`shrink-0 ${isLight ? "text-slate-400" : "text-slate-500"}`} />}
                <input type={type} value={value} onChange={onChange} disabled={disabled}
                    className={`flex-1 bg-transparent text-sm focus:outline-none ${isLight ? "text-slate-800" : "text-white"} ${disabled ? "opacity-50 cursor-not-allowed" : ""}`} />
            </div>
        </div>
    );
}

function PasswordInput({ label, value, onChange, isLight }) {
    const [show, setShow] = useState(false);
    return (
        <div className="flex flex-col gap-1.5">
            <label className={`text-xs font-bold uppercase tracking-wider ${isLight ? "text-slate-400" : "text-slate-500"}`}>{label}</label>
            <div className={`flex items-center gap-3 rounded-xl border px-4 py-3 transition-all focus-within:ring-2 focus-within:ring-orange-500/30
                ${isLight ? "bg-white border-slate-200 focus-within:border-orange-400" : "bg-white/5 border-white/10 focus-within:border-orange-500/60"}`}>
                <Lock size={15} className={`shrink-0 ${isLight ? "text-slate-400" : "text-slate-500"}`} />
                <input type={show ? "text" : "password"} value={value} onChange={onChange}
                    className={`flex-1 bg-transparent text-sm focus:outline-none ${isLight ? "text-slate-800" : "text-white"}`} />
                <button type="button" onClick={() => setShow(s => !s)} className={`shrink-0 ${isLight ? "text-slate-400 hover:text-slate-600" : "text-slate-500 hover:text-slate-300"}`}>
                    {show ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
            </div>
        </div>
    );
}

function Card({ children, isLight, className = "" }) {
    return (
        <div className={`rounded-2xl border ${isLight ? "bg-white border-slate-100 shadow-sm" : "bg-[#0d1533] border-white/5"} ${className}`}>
            {children}
        </div>
    );
}

function CardSection({ title, sub, isLight, children }) {
    return (
        <Card isLight={isLight}>
            {(title || sub) && (
                <div className={`px-6 py-4 border-b ${isLight ? "border-slate-100" : "border-white/5"}`}>
                    {title && <p className={`font-black text-base ${isLight ? "text-slate-800" : "text-white"}`}>{title}</p>}
                    {sub && <p className={`text-xs mt-0.5 ${isLight ? "text-slate-400" : "text-slate-500"}`}>{sub}</p>}
                </div>
            )}
            <div className="p-6">{children}</div>
        </Card>
    );
}

function Alert({ type, text, isLight }) {
    const ok = type === "ok";
    return (
        <div className={`flex items-center gap-2.5 p-3.5 rounded-xl text-sm border
            ${ok
                ? isLight ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                : isLight ? "bg-red-50 border-red-200 text-red-700" : "bg-red-500/10 border-red-500/20 text-red-400"}`}>
            {ok ? <CheckCircle2 size={15} className="shrink-0" /> : <AlertCircle size={15} className="shrink-0" />}
            {text}
        </div>
    );
}

function OrangeBtn({ onClick, onPress, type = "button", loading, icon: Icon, children, disabled, className = "" }) {
    return (
        <button type={type} onClick={onClick ?? onPress} disabled={loading || disabled}
            className={`flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold rounded-xl shadow-lg shadow-orange-500/25 hover:brightness-110 transition-all disabled:opacity-60 disabled:cursor-not-allowed ${className}`}>
            {loading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : Icon ? <Icon size={16} /> : null}
            {children}
        </button>
    );
}

// ── Carte de réservation ──────────────────────────────────────────────────────
function ReservationCard({ r, isLight }) {
    const start = new Date(r.startDate), end = new Date(r.endDate), now = new Date();
    const duration = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));
    const isActive = start <= now && end >= now;
    const isPast = end < now;
    return (
        <div className={`rounded-2xl overflow-hidden border transition-all hover:-translate-y-0.5 duration-200
            ${isLight ? "bg-white border-slate-100 shadow-sm hover:shadow-md" : "bg-[#0a0f2e] border-white/5 hover:border-white/10"}`}>
            <div className={`h-0.5 ${isActive ? "bg-gradient-to-r from-blue-500 to-cyan-400" : isPast ? "bg-slate-300/40" : "bg-gradient-to-r from-orange-500 to-amber-400"}`} />
            <div className="p-4">
                <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${isLight ? "bg-orange-50" : "bg-orange-500/10"}`}>
                            <Car size={16} className="text-orange-500" />
                        </div>
                        <div className="min-w-0">
                            <p className={`font-black text-sm truncate ${isLight ? "text-slate-800" : "text-white"}`}>
                                {r.vehicleBrand} <span className="text-orange-400">{r.vehicleModel}</span>
                            </p>
                            <p className={`text-xs ${isLight ? "text-slate-400" : "text-slate-500"}`}>{duration}j · {fmtDate(r.startDate)}</p>
                        </div>
                    </div>
                    <span className={`text-[11px] font-bold px-2.5 py-1 rounded-lg shrink-0 ${resStatusStyle(r.status)}`}>{resStatusLabel(r.status)}</span>
                </div>
                <div className={`flex items-center justify-between pt-3 border-t ${isLight ? "border-slate-100" : "border-white/5"}`}>
                    <div className={`flex items-center gap-1.5 text-xs ${isLight ? "text-slate-400" : "text-slate-500"}`}>
                        <Clock size={11} /><span>{fmtDate(r.startDate)}</span><ArrowRight size={10} /><span>{fmtDate(r.endDate)}</span>
                    </div>
                    <span className={`font-black text-sm ${isLight ? "text-slate-800" : "text-white"}`}>{fmtCurrency(r.totalAmount ?? r.totalPrice)}</span>
                </div>
            </div>
        </div>
    );
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function SettingsPage() {
    const { user, token, logout, setUser } = useAuth();
    const navigate = useNavigate();
    const { theme, setTheme, isDark } = useTheme();
    const isLight = !isDark;

    const [tab, setTab] = useState("profile");
    const [isLoading, setIsLoading] = useState(!user && !!token);
    const photoInputRef = useRef(null);

    const [form, setForm] = useState({ firstname: "", lastname: "", email: "", phone: "", sector: "" });
    const [profileSaving, setProfileSaving] = useState(false);
    const [profileMsg, setProfileMsg] = useState(null);

    const [photoUploading, setPhotoUploading] = useState(false);
    const [localPhoto, setLocalPhoto] = useState(null);

    const [pwForm, setPwForm] = useState({ current: "", next: "", confirm: "" });
    const [pwLoading, setPwLoading] = useState(false);
    const [pwMsg, setPwMsg] = useState(null);

    const [showDelete, setShowDelete] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const [reservations, setReservations] = useState([]);
    const [resLoading, setResLoading] = useState(false);
    const [resError, setResError] = useState(null);

    useEffect(() => {
        if (user) {
            setForm({ firstname: user.firstname || "", lastname: user.lastname || "", email: user.email || "", phone: user.phone || "", sector: user.sector || "" });
            setIsLoading(false);
        }
    }, [user]);

    useEffect(() => {
        if (tab === "history" && reservations.length === 0 && !resLoading && !resError) fetchReservations();
    }, [tab]);

    const fetchReservations = async () => {
        setResLoading(true); setResError(null);
        try { const { data } = await AuthAPI.getMyReservations(); setReservations(Array.isArray(data) ? data : []); }
        catch { setResError("Impossible de charger l'historique."); }
        finally { setResLoading(false); }
    };

    const handlePhotoChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setLocalPhoto(URL.createObjectURL(file));
        setPhotoUploading(true);
        try { const updated = await AuthAPI.uploadProfilePhoto(file); if (setUser) setUser(updated); }
        catch { setLocalPhoto(null); }
        finally { setPhotoUploading(false); }
    };

    const handleSaveProfile = async () => {
        setProfileSaving(true); setProfileMsg(null);
        try { const updated = await AuthAPI.updateProfile(form); if (setUser) setUser(updated); setProfileMsg({ type: "ok", text: "Profil mis à jour." }); }
        catch (err) { setProfileMsg({ type: "err", text: err?.response?.data?.message || "Erreur de mise à jour." }); }
        finally { setProfileSaving(false); }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (pwForm.next !== pwForm.confirm) { setPwMsg({ type: "err", text: "Les mots de passe ne correspondent pas." }); return; }
        setPwLoading(true); setPwMsg(null);
        try { await AuthAPI.changePassword({ currentPassword: pwForm.current, newPassword: pwForm.next }); setPwMsg({ type: "ok", text: "Mot de passe mis à jour !" }); setPwForm({ current: "", next: "", confirm: "" }); }
        catch (err) { setPwMsg({ type: "err", text: err?.response?.data?.message || "Ancien mot de passe incorrect." }); }
        finally { setPwLoading(false); }
    };

    const handleDeleteAccount = async () => {
        setIsDeleting(true);
        try { await AuthAPI.deleteAccount(); logout(); navigate("/"); }
        catch (err) { setIsDeleting(false); setShowDelete(false); alert(err?.response?.data?.message || "Impossible de supprimer le compte."); }
    };

    if (!token) return (
        <div className={`flex items-center justify-center min-h-[400px]`}>
            <div className={`rounded-2xl p-8 text-center border ${isLight ? "bg-white border-slate-200 shadow-lg" : "bg-[#0d1533] border-white/10"}`}>
                <AlertCircle size={36} className="mx-auto mb-3 text-orange-500" />
                <p className={`font-bold mb-4 ${isLight ? "text-slate-800" : "text-white"}`}>Session expirée</p>
                <button onClick={() => navigate("/")} className="px-5 py-2.5 bg-orange-500 text-white font-bold rounded-xl hover:bg-orange-600 transition-colors text-sm">Retourner à l'accueil</button>
            </div>
        </div>
    );

    if (isLoading) return <div className="flex items-center justify-center min-h-[400px]"><Spinner color="warning" /></div>;

    const photoSrc = localPhoto || resolvePhotoUrl(user?.profilPhoto);
    const initials = `${(form.firstname || "U")[0]}${(form.lastname || "")[0] || ""}`.toUpperCase();

    const now = new Date();
    const activeRes   = reservations.filter(r => new Date(r.startDate) <= now && new Date(r.endDate) >= now);
    const upcomingRes = reservations.filter(r => new Date(r.startDate) > now);
    const pastRes     = reservations.filter(r => new Date(r.endDate) < now);
    const totalSpent  = reservations.reduce((s, r) => s + (Number(r.totalAmount ?? r.totalPrice) || 0), 0);

    const pwRules = [
        { label: "8 caractères min.", ok: pwForm.next.length >= 8 },
        { label: "Une majuscule", ok: /[A-Z]/.test(pwForm.next) },
        { label: "Une minuscule", ok: /[a-z]/.test(pwForm.next) },
        { label: "Un chiffre", ok: /\d/.test(pwForm.next) },
    ];

    return (
        <>
            <DeleteAccountModal isOpen={showDelete} onClose={() => setShowDelete(false)} onConfirm={handleDeleteAccount} isDeleting={isDeleting} isLight={isLight} />

            <div className={`min-h-screen p-5 lg:p-8 ${isLight ? "bg-slate-50" : ""}`}>

                {/* ── Header ───────────────────────────────────────────── */}
                <div className="flex items-center justify-between mb-7">
                    <div>
                        <h1 className={`text-2xl font-black ${isLight ? "text-slate-800" : "text-white"}`}>Paramètres</h1>
                        <p className={`text-sm mt-0.5 ${isLight ? "text-slate-400" : "text-slate-500"}`}>Gérez votre compte et vos préférences</p>
                    </div>
                    <button onClick={logout}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all border
                            ${isLight ? "border-slate-200 bg-white text-slate-600 hover:border-red-300 hover:text-red-600 hover:bg-red-50 shadow-sm" : "border-white/10 bg-white/5 text-slate-400 hover:border-red-500/30 hover:text-red-400 hover:bg-red-500/5"}`}>
                        <LogOut size={16} />
                        Déconnexion
                    </button>
                </div>

                {/* ── Tabs ─────────────────────────────────────────────── */}
                <div className={`flex items-center gap-1.5 p-1.5 rounded-2xl mb-7 overflow-x-auto scrollbar-hide
                    ${isLight ? "bg-slate-200/60" : "bg-white/5"}`}>
                    {NAV_TABS.map(({ key, label, icon: Icon }) => {
                        const active = tab === key;
                        return (
                            <button key={key} onClick={() => setTab(key)}
                                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all duration-200
                                    ${active
                                        ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/30"
                                        : isLight ? "text-slate-500 hover:text-slate-700 hover:bg-white/70" : "text-slate-500 hover:text-slate-300 hover:bg-white/5"}`}>
                                <Icon size={15} />
                                {label}
                            </button>
                        );
                    })}
                </div>

                {/* ── Contenu ──────────────────────────────────────────── */}
                <div className="max-w-2xl">

                    {/* Mon Profil */}
                    {tab === "profile" && (
                        <div className="space-y-5">
                            {/* Photo */}
                            <CardSection title="Photo de profil" sub="Cliquez sur l'image pour la modifier" isLight={isLight}>
                                <div className="flex items-center gap-5">
                                    <div className="relative group cursor-pointer shrink-0" onClick={() => photoInputRef.current?.click()}>
                                        {photoSrc
                                            ? <img src={photoSrc} alt="Avatar" className="w-20 h-20 rounded-2xl object-cover ring-4 ring-orange-500/20" />
                                            : <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-orange-500/30">{initials}</div>
                                        }
                                        <div className="absolute inset-0 rounded-2xl bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                                            {photoUploading
                                                ? <span className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                : <Camera size={20} className="text-white" />}
                                        </div>
                                        <input ref={photoInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
                                    </div>
                                    <div>
                                        <p className={`font-black text-lg ${isLight ? "text-slate-800" : "text-white"}`}>{form.firstname} {form.lastname}</p>
                                        <p className="text-orange-500 text-sm font-semibold">{form.sector || "Membre"}</p>
                                        <button onClick={() => photoInputRef.current?.click()}
                                            className={`mt-2.5 flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all border
                                                ${isLight ? "bg-orange-50 border-orange-200 text-orange-600 hover:bg-orange-100" : "bg-orange-500/10 border-orange-500/20 text-orange-400 hover:bg-orange-500/20"}`}>
                                            <Camera size={13} />
                                            {photoUploading ? "Envoi..." : "Changer la photo"}
                                        </button>
                                    </div>
                                </div>
                            </CardSection>

                            {/* Infos */}
                            <CardSection title="Informations personnelles" isLight={isLight}>
                                {profileMsg && <div className="mb-5"><Alert type={profileMsg.type} text={profileMsg.text} isLight={isLight} /></div>}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <FieldInput label="Prénom" value={form.firstname} onChange={(e) => setForm(f => ({...f, firstname: e.target.value}))} icon={User} isLight={isLight} />
                                    <FieldInput label="Nom" value={form.lastname} onChange={(e) => setForm(f => ({...f, lastname: e.target.value}))} icon={User} isLight={isLight} />
                                    <FieldInput label="Email" value={form.email} icon={Mail} type="email" isLight={isLight} disabled />
                                    <FieldInput label="Téléphone" value={form.phone} onChange={(e) => setForm(f => ({...f, phone: e.target.value}))} icon={Phone} isLight={isLight} />
                                    <div className="sm:col-span-2">
                                        <FieldInput label="Secteur / Agence" value={form.sector} onChange={(e) => setForm(f => ({...f, sector: e.target.value}))} icon={Briefcase} isLight={isLight} />
                                    </div>
                                </div>
                                <div className="flex justify-end mt-5">
                                    <OrangeBtn onClick={handleSaveProfile} loading={profileSaving} icon={Save}>Sauvegarder</OrangeBtn>
                                </div>
                            </CardSection>
                        </div>
                    )}

                    {/* Sécurité */}
                    {tab === "security" && (
                        <div className="space-y-5">
                            <CardSection title="Changer le mot de passe" isLight={isLight}>
                                <form onSubmit={handleChangePassword} className="space-y-4">
                                    <PasswordInput label="Mot de passe actuel" value={pwForm.current} onChange={(e) => setPwForm(f => ({...f, current: e.target.value}))} isLight={isLight} />
                                    <PasswordInput label="Nouveau mot de passe" value={pwForm.next} onChange={(e) => setPwForm(f => ({...f, next: e.target.value}))} isLight={isLight} />
                                    <PasswordInput label="Confirmer" value={pwForm.confirm} onChange={(e) => setPwForm(f => ({...f, confirm: e.target.value}))} isLight={isLight} />
                                    {pwForm.next && (
                                        <div className="grid grid-cols-2 gap-2">
                                            {pwRules.map((r, i) => (
                                                <div key={i} className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold border
                                                    ${r.ok
                                                        ? isLight ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                                                        : isLight ? "bg-slate-50 border-slate-200 text-slate-500" : "bg-white/3 border-white/8 text-slate-500"}`}>
                                                    {r.ok ? <CheckCircle2 size={13} /> : <div className={`w-3 h-3 rounded-full border ${isLight ? "border-slate-300" : "border-slate-600"}`} />}
                                                    {r.label}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    {pwMsg && <Alert type={pwMsg.type} text={pwMsg.text} isLight={isLight} />}
                                    <OrangeBtn type="submit" loading={pwLoading} icon={Shield} className="w-full mt-2">Mettre à jour</OrangeBtn>
                                </form>
                            </CardSection>

                            {/* Zone dangereuse */}
                            <div className={`rounded-2xl border-2 p-6 ${isLight ? "border-red-200 bg-red-50/40" : "border-red-500/20 bg-red-500/5"}`}>
                                <div className="flex items-start gap-4 mb-5">
                                    <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">
                                        <AlertCircle size={18} className="text-red-500" />
                                    </div>
                                    <div>
                                        <h3 className={`font-black text-base ${isLight ? "text-red-700" : "text-red-400"}`}>Zone dangereuse</h3>
                                        <p className={`text-xs mt-0.5 ${isLight ? "text-red-500/80" : "text-red-400/60"}`}>La suppression est définitive et ne peut pas être annulée.</p>
                                    </div>
                                </div>
                                <button onClick={() => setShowDelete(true)}
                                    className="flex items-center gap-2.5 px-5 py-2.5 rounded-xl font-bold text-sm bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-lg shadow-red-500/25 hover:brightness-110 active:scale-95 transition-all">
                                    <Trash2 size={16} /> Supprimer mon compte
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Historique */}
                    {tab === "history" && (
                        <div className="space-y-5">
                            {resLoading ? (
                                <div className="flex justify-center py-20"><Spinner color="warning" label="Chargement..." /></div>
                            ) : resError ? (
                                <CardSection isLight={isLight}>
                                    <div className="text-center py-6">
                                        <AlertCircle size={28} className={`mx-auto mb-2 ${isLight ? "text-red-500" : "text-red-400"}`} />
                                        <p className={`font-semibold ${isLight ? "text-slate-700" : "text-slate-300"}`}>{resError}</p>
                                        <button onClick={fetchReservations} className="mt-3 text-sm font-bold text-orange-400 hover:text-orange-300">Réessayer</button>
                                    </div>
                                </CardSection>
                            ) : reservations.length === 0 ? (
                                <CardSection isLight={isLight}>
                                    <div className="text-center py-8">
                                        <div className={`w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center ${isLight ? "bg-slate-100" : "bg-white/5"}`}>
                                            <CalendarCheck size={28} className={isLight ? "text-slate-300" : "text-slate-600"} />
                                        </div>
                                        <p className={`font-bold mb-1 ${isLight ? "text-slate-700" : "text-slate-200"}`}>Aucune réservation</p>
                                        <p className={`text-sm mb-5 ${isLight ? "text-slate-400" : "text-slate-500"}`}>Votre historique apparaîtra ici</p>
                                        <a href="/reservations" className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-sm font-bold rounded-xl shadow-lg shadow-orange-500/30 hover:brightness-110 transition-all">
                                            <CalendarCheck size={15} /> Réserver un véhicule
                                        </a>
                                    </div>
                                </CardSection>
                            ) : (
                                <>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                        {[
                                            { label: "Total", value: reservations.length, g: "from-orange-500 to-amber-500" },
                                            { label: "En cours", value: activeRes.length, g: "from-blue-500 to-cyan-400" },
                                            { label: "À venir", value: upcomingRes.length, g: "from-violet-500 to-purple-400" },
                                            { label: "Dépensé", value: fmtCurrency(totalSpent), g: "from-emerald-500 to-teal-400" },
                                        ].map((s, i) => (
                                            <div key={i} className={`relative rounded-2xl p-4 overflow-hidden border ${isLight ? "bg-white border-slate-100 shadow-sm" : "bg-[#0d1533] border-white/5"}`}>
                                                <div className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${s.g}`} />
                                                <p className={`text-[10px] font-bold uppercase tracking-widest mb-2 ${isLight ? "text-slate-400" : "text-slate-500"}`}>{s.label}</p>
                                                <p className={`font-black text-xl ${isLight ? "text-slate-800" : "text-white"}`}>{s.value}</p>
                                            </div>
                                        ))}
                                    </div>
                                    {[
                                        { items: activeRes, label: "EN COURS", dot: "bg-blue-400 animate-pulse" },
                                        { items: upcomingRes, label: "À VENIR", dot: "bg-orange-400" },
                                        { items: pastRes, label: `PASSÉES (${pastRes.length})`, dot: "bg-slate-400" },
                                    ].filter(g => g.items.length > 0).map((group) => (
                                        <div key={group.label}>
                                            <p className={`text-xs font-black uppercase tracking-widest mb-3 flex items-center gap-2 ${isLight ? "text-slate-400" : "text-slate-500"}`}>
                                                <span className={`w-2 h-2 rounded-full ${group.dot}`} />{group.label}
                                            </p>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                {group.items.map((r, i) => <ReservationCard key={i} r={r} isLight={isLight} />)}
                                            </div>
                                        </div>
                                    ))}
                                </>
                            )}
                        </div>
                    )}

                    {/* Notifications */}
                    {tab === "notifications" && (
                        <CardSection isLight={isLight}>
                            {[
                                { title: "Alertes par email", desc: "Recevoir les notifications importantes par courriel.", icon: Mail },
                                { title: "Documents expirés", desc: "Alerte 30 jours avant la fin d'un document.", icon: AlertCircle },
                                { title: "Nouvelle connexion", desc: "Être prévenu lors d'un nouvel accès au compte.", icon: Shield },
                            ].map((item, i, arr) => (
                                <div key={i} className={`flex items-center justify-between py-4 ${i > 0 ? `border-t ${isLight ? "border-slate-100" : "border-white/5"}` : ""}`}>
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-xl ${isLight ? "bg-orange-50" : "bg-orange-500/10"}`}>
                                            <item.icon size={16} className="text-orange-500" />
                                        </div>
                                        <div>
                                            <p className={`font-bold text-sm ${isLight ? "text-slate-800" : "text-white"}`}>{item.title}</p>
                                            <p className={`text-xs mt-0.5 ${isLight ? "text-slate-400" : "text-slate-500"}`}>{item.desc}</p>
                                        </div>
                                    </div>
                                    <Switch color="warning" defaultSelected size="sm" />
                                </div>
                            ))}
                        </CardSection>
                    )}

                    {/* Apparence */}
                    {tab === "appearance" && (
                        <CardSection title="Thème" sub="Choisissez l'apparence qui vous convient" isLight={isLight}>
                            <div className="grid grid-cols-2 gap-4 mb-5">
                                {[
                                    { value: "dark", label: "Sombre", icon: Moon, desc: "Idéal pour la nuit" },
                                    { value: "light", label: "Clair", icon: Sun, desc: "Lumineux et lisible" },
                                ].map(({ value, label, icon: Icon, desc }) => {
                                    const selected = theme === value;
                                    return (
                                        <button key={value} onClick={() => setTheme(value)}
                                            className={`relative p-5 rounded-2xl border-2 text-left transition-all duration-200
                                                ${selected
                                                    ? "border-orange-500 bg-gradient-to-br from-orange-500/10 to-orange-600/5 shadow-lg shadow-orange-500/15"
                                                    : isLight ? "border-slate-200 bg-slate-50 hover:border-slate-300" : "border-white/10 bg-white/3 hover:border-white/20"}`}>
                                            {selected && (
                                                <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-orange-500 flex items-center justify-center">
                                                    <CheckCircle2 size={11} className="text-white" />
                                                </div>
                                            )}
                                            <div className={`w-10 h-10 rounded-xl mb-3 flex items-center justify-center ${selected ? "bg-orange-500/20" : isLight ? "bg-slate-200" : "bg-white/10"}`}>
                                                <Icon size={20} className={selected ? "text-orange-500" : isLight ? "text-slate-600" : "text-slate-400"} />
                                            </div>
                                            <p className={`font-black text-base ${selected ? "text-orange-500" : isLight ? "text-slate-800" : "text-white"}`}>{label}</p>
                                            <p className={`text-xs mt-0.5 ${isLight ? "text-slate-400" : "text-slate-500"}`}>{desc}</p>
                                        </button>
                                    );
                                })}
                            </div>
                            <div className={`rounded-2xl p-4 border ${isLight ? "bg-slate-50 border-slate-100" : "bg-white/3 border-white/5"}`}>
                                <p className={`text-[10px] font-bold uppercase tracking-widest mb-3 ${isLight ? "text-slate-400" : "text-slate-500"}`}>Aperçu</p>
                                <div className={`rounded-xl p-4 border ${isLight ? "bg-white border-slate-200 shadow-sm" : "bg-[#0d1533] border-white/5"}`}>
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-xl bg-orange-500/20 flex items-center justify-center">
                                            <User size={14} className="text-orange-500" />
                                        </div>
                                        <div className="flex-1">
                                            <div className={`text-xs font-bold ${isLight ? "text-slate-800" : "text-white"}`}>{form.firstname || "Jean"} {form.lastname || "Dupont"}</div>
                                            <div className={`text-xs ${isLight ? "text-slate-400" : "text-slate-500"}`}>{form.email || "jean@exemple.fr"}</div>
                                        </div>
                                    </div>
                                    <div className={`mt-3 h-2 rounded-full ${isLight ? "bg-slate-100" : "bg-white/10"}`}>
                                        <div className="h-full w-2/3 rounded-full bg-gradient-to-r from-orange-500 to-amber-400" />
                                    </div>
                                </div>
                                <p className={`text-xs mt-3 text-center font-semibold ${isLight ? "text-slate-400" : "text-slate-500"}`}>
                                    Thème actuel : <span className="text-orange-500">{isLight ? "Clair ☀️" : "Sombre 🌙"}</span>
                                </p>
                            </div>
                        </CardSection>
                    )}
                </div>
            </div>
        </>
    );
}
