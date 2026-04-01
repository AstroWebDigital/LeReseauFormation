import React, { useState, useEffect, useRef } from "react";
import api from "@/services/auth/client";
import {
    Button, Spinner, Chip,
    Modal, ModalContent, ModalHeader, ModalBody, ModalFooter,
    Textarea
} from "@heroui/react";
import {
    CheckCircle, XCircle, Car, Fuel, Settings2, Gauge,
    MapPin, ChevronDown, ChevronUp, FileText,
    ChevronLeft, ChevronRight, AlertCircle,
    UserPlus, Users, Mail, Phone, Briefcase, User,
    CheckCircle2, Shield, X, Lock, Unlock, MessageSquare, Send
} from "lucide-react";
import { useTheme } from "@/theme/ThemeProvider";
import { useNotifications } from "@/context/NotificationsContext";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

function resolveUrl(url) {
    if (!url) return null;
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    return API_BASE_URL + url;
}

const vehicleStatusColor = { "en_attente":"warning","disponible":"success","rejete":"danger","indisponible":"danger","reserve":"primary","bloque":"danger","en_maintenance":"warning" };
const vehicleStatusLabel = { "en_attente":"En attente","disponible":"Disponible","rejete":"Rejeté","indisponible":"Indisponible","reserve":"Réservé","bloque":"Bloqué","en_maintenance":"Maintenance" };
const docStatusColor     = { "en_attente":"warning","valide":"success","rejete":"danger","expire":"danger" };
const docStatusLabel     = { "en_attente":"En attente","valide":"Validé","rejete":"Rejeté","expire":"Expiré" };
const docTypeLabel       = { "carte_grise":"Carte grise","assurance":"Assurance","permis":"Permis","contrat":"Contrat","facture":"Facture","etat_des_lieux":"État des lieux","photo_checklist":"Photo checklist" };

/* ─── Modale de rejet (raison) ─── */
function RejectModal({ isOpen, title, onClose, onConfirm, isDark }) {
    const [reason, setReason] = useState("");

    const handleConfirm = () => {
        onConfirm(reason.trim());
        setReason("");
    };
    const handleClose = () => {
        setReason("");
        onClose();
    };

    return (
        <Modal
            isOpen={isOpen}
            onOpenChange={handleClose}
            size="md"
            className={isDark ? "bg-[#0f1129] border border-slate-800" : "bg-white border border-slate-200"}
        >
            <ModalContent>
                {(onCloseModal) => (
                    <>
                        <ModalHeader className={`flex items-center gap-2 ${isDark ? "text-white" : "text-slate-800"}`}>
                            <XCircle size={18} className="text-danger" />
                            {title}
                        </ModalHeader>
                        <ModalBody>
                            <p className={`text-sm mb-3 ${isDark ? "text-slate-300" : "text-slate-600"}`}>
                                Vous pouvez indiquer une raison (optionnel). Elle sera visible par le propriétaire.
                            </p>
                            <Textarea
                                placeholder="Ex : Documents manquants, photos insuffisantes..."
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                minRows={3}
                                maxRows={6}
                                classNames={{
                                    inputWrapper: isDark
                                        ? "border-slate-700 bg-slate-900 data-[focus=true]:border-orange-500"
                                        : "border-slate-300 bg-white data-[focus=true]:border-orange-500",
                                    input: isDark ? "text-white placeholder:text-slate-500" : "text-slate-900",
                                }}
                                variant="bordered"
                            />
                        </ModalBody>
                        <ModalFooter className={`border-t ${isDark ? "border-slate-800" : "border-slate-200"}`}>
                            <Button variant="bordered" onPress={handleClose}
                                className={isDark ? "text-slate-300 border-slate-700" : "text-slate-600 border-slate-300"}>
                                Annuler
                            </Button>
                            <Button color="danger" startContent={<XCircle size={15} />} onPress={handleConfirm}>
                                Confirmer le rejet
                            </Button>
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    );
}

/* ─── Modale galerie photos véhicule ─── */
function VehicleDetailModal({ vehicle, onClose, onApprove, onOpenReject, isDark }) {
    const [imgIndex, setImgIndex] = useState(0);
    if (!vehicle) return null;

    const images = vehicle.images || [];
    const textPrimary = isDark ? "text-white" : "text-slate-800";
    const textMuted   = isDark ? "text-slate-400" : "text-slate-500";

    return (
        <Modal isOpen onOpenChange={onClose} size="2xl" scrollBehavior="inside"
            className={isDark ? "bg-[#0f1129] border border-slate-800" : "bg-white border border-slate-200"}>
            <ModalContent>
                {(onCloseModal) => (
                    <>
                        <ModalHeader className={`text-xl font-bold ${textPrimary}`}>
                            {vehicle.brand} {vehicle.model}
                            <span className={`ml-2 text-sm font-normal ${textMuted}`}>{vehicle.plateNumber}</span>
                        </ModalHeader>
                        <ModalBody className="pb-4">
                            {images.length > 0 ? (
                                <div className="relative">
                                    <div className="w-full h-60 rounded-xl overflow-hidden bg-black">
                                        <img src={resolveUrl(images[imgIndex])} alt="" className="w-full h-full object-contain" />
                                    </div>
                                    {images.length > 1 && (
                                        <>
                                            <button onClick={() => setImgIndex(i => (i - 1 + images.length) % images.length)}
                                                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full p-1.5 hover:bg-black/80 transition">
                                                <ChevronLeft size={18} />
                                            </button>
                                            <button onClick={() => setImgIndex(i => (i + 1) % images.length)}
                                                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full p-1.5 hover:bg-black/80 transition">
                                                <ChevronRight size={18} />
                                            </button>
                                            <div className="flex justify-center gap-1.5 mt-2">
                                                {images.map((_, i) => (
                                                    <button key={i} onClick={() => setImgIndex(i)}
                                                        className={`w-2 h-2 rounded-full transition-all ${i === imgIndex ? "bg-orange-500 w-4" : (isDark ? "bg-slate-600" : "bg-slate-300")}`} />
                                                ))}
                                            </div>
                                            <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
                                                {images.map((url, i) => (
                                                    <button key={i} onClick={() => setImgIndex(i)}
                                                        className={`flex-shrink-0 w-16 h-12 rounded-lg overflow-hidden border-2 transition ${i === imgIndex ? "border-orange-500" : "border-transparent"}`}>
                                                        <img src={resolveUrl(url)} alt="" className="w-full h-full object-cover" />
                                                    </button>
                                                ))}
                                            </div>
                                        </>
                                    )}
                                </div>
                            ) : (
                                <div className={`w-full h-40 rounded-xl flex items-center justify-center ${isDark ? "bg-slate-800" : "bg-slate-100"}`}>
                                    <Car size={40} className={textMuted} />
                                </div>
                            )}

                            <div className={`grid grid-cols-2 gap-3 mt-4 text-sm ${textMuted}`}>
                                <div className="flex items-center gap-2"><Fuel size={14} />{vehicle.fuel}</div>
                                <div className="flex items-center gap-2"><Settings2 size={14} />{vehicle.transmission}</div>
                                <div className="flex items-center gap-2"><Gauge size={14} />{vehicle.mileage} km</div>
                                {vehicle.defaultParkingLocation && <div className="flex items-center gap-2"><MapPin size={14} />{vehicle.defaultParkingLocation}</div>}
                            </div>
                            <div className="flex items-center justify-between mt-3">
                                <p className={`text-2xl font-bold ${textPrimary}`}>
                                    {vehicle.baseDailyPrice}€ <span className={`text-sm font-normal ${textMuted}`}>/ jour</span>
                                </p>
                                <Chip size="sm" variant="flat" color={vehicleStatusColor[vehicle.status] || "default"}>
                                    {vehicleStatusLabel[vehicle.status] || vehicle.status}
                                </Chip>
                            </div>

                            {/* Raison de rejet existante */}
                            {vehicle.rejectionReason && (
                                <div className={`mt-3 rounded-xl p-3 flex gap-2 ${isDark ? "bg-red-500/10 border border-red-500/20" : "bg-red-50 border border-red-200"}`}>
                                    <AlertCircle size={16} className="text-danger flex-shrink-0 mt-0.5" />
                                    <p className={`text-sm ${isDark ? "text-red-300" : "text-red-700"}`}>
                                        <span className="font-semibold">Raison du rejet :</span> {vehicle.rejectionReason}
                                    </p>
                                </div>
                            )}
                        </ModalBody>

                        {vehicle.status === "en_attente" && (
                            <ModalFooter className={`border-t ${isDark ? "border-slate-800" : "border-slate-200"}`}>
                                <Button variant="bordered" onPress={onCloseModal}
                                    className={isDark ? "text-slate-300 border-slate-700" : "text-slate-600 border-slate-300"}>
                                    Fermer
                                </Button>
                                <Button color="danger" variant="flat" startContent={<XCircle size={15} />}
                                    onPress={() => { onCloseModal(); onOpenReject(vehicle); }}>
                                    Rejeter
                                </Button>
                                <Button className="bg-emerald-500 text-white font-semibold" startContent={<CheckCircle size={15} />}
                                    onPress={() => { onApprove(vehicle.id); onCloseModal(); }}>
                                    Approuver
                                </Button>
                            </ModalFooter>
                        )}
                    </>
                )}
            </ModalContent>
        </Modal>
    );
}

/* ─── Formulaire création ALP / ARC ─── */
function CreateAlpForm({ isDark, onCreated }) {
    const isLight = !isDark;
    const [role, setRole]     = useState("ALP"); // "ALP" | "ARC"
    const [form, setForm]     = useState({ firstname: "", lastname: "", email: "", phone: "", sector: "", alpId: "" });
    const [alpList, setAlpList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(null);
    const [error, setError]   = useState(null);

    // Charger les ALPs quand on passe en mode ARC
    useEffect(() => {
        if (role === "ARC") {
            api.get("/api/admin/users/alp-only")
                .then(r => setAlpList(r.data))
                .catch(() => setAlpList([]));
        }
    }, [role]);

    const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (role === "ARC" && !form.alpId) { setError("Sélectionnez un ALP référent."); return; }
        setLoading(true); setError(null); setSuccess(null);
        try {
            await api.post("/api/admin/users", { ...form, role });
            setSuccess(`Compte ${role} créé pour ${form.firstname} ${form.lastname}. Un email a été envoyé à ${form.email}.`);
            setForm({ firstname: "", lastname: "", email: "", phone: "", sector: "", alpId: "" });
            onCreated?.();
        } catch (err) {
            setError(err?.response?.data || "Erreur lors de la création.");
        } finally {
            setLoading(false);
        }
    };

    const fieldCls = (hasError) => `flex items-center gap-2 rounded-2xl border px-3 py-2.5 transition-all overflow-hidden
        ${hasError ? "border-red-500" : isLight ? "border-slate-200 focus-within:border-orange-400 bg-white" : "border-white/10 focus-within:border-orange-400 bg-white/3"}`;
    const inputCls = `flex-1 min-w-0 bg-transparent text-sm focus:outline-none ${isLight ? "text-slate-800 placeholder:text-slate-400" : "text-white placeholder:text-slate-500"}`;
    const iconCls  = `h-4 w-4 shrink-0 ${isLight ? "text-slate-400" : "text-slate-500"}`;
    const labelCls = `text-[11px] font-semibold uppercase tracking-wider mb-1.5 block ${isLight ? "text-slate-500" : "text-slate-400"}`;

    return (
        <form onSubmit={handleSubmit} className="space-y-4">

            {/* ── Toggle ALP / ARC ── */}
            <div className={`flex rounded-xl p-1 gap-1 ${isLight ? "bg-slate-100" : "bg-white/5"}`}>
                {["ALP", "ARC"].map(r => (
                    <button
                        key={r} type="button"
                        onClick={() => { setRole(r); setError(null); setSuccess(null); }}
                        className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${
                            role === r
                                ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md shadow-orange-500/25"
                                : isLight ? "text-slate-500 hover:text-slate-700" : "text-slate-500 hover:text-slate-300"
                        }`}
                    >
                        {r === "ALP" ? "👤 Apprenant ALP" : "🔗 Apprenant ARC"}
                    </button>
                ))}
            </div>

            {/* Description du rôle */}
            <div className={`px-4 py-2.5 rounded-xl text-xs border ${
                role === "ALP"
                    ? isLight ? "bg-blue-50 border-blue-100 text-blue-600" : "bg-blue-500/10 border-blue-500/20 text-blue-400"
                    : isLight ? "bg-purple-50 border-purple-100 text-purple-600" : "bg-purple-500/10 border-purple-500/20 text-purple-400"
            }`}>
                {role === "ALP"
                    ? "L'ALP est un apprenant autonome avec accès complet à la plateforme."
                    : "L'ARC est rattaché à un ALP et hérite de sa structure de suivi."}
            </div>

            {success && (
                <div className={`flex items-start gap-3 p-4 rounded-2xl border text-sm ${isLight ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"}`}>
                    <CheckCircle2 size={17} className="shrink-0 mt-0.5" /><span>{success}</span>
                </div>
            )}
            {error && (
                <div className={`flex items-center gap-3 p-4 rounded-2xl border text-sm ${isLight ? "bg-red-50 border-red-200 text-red-700" : "bg-red-500/10 border-red-500/20 text-red-400"}`}>
                    <AlertCircle size={17} className="shrink-0" /><span>{error}</span>
                </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                    <label className={labelCls}>Prénom *</label>
                    <div className={fieldCls(false)}>
                        <User className={iconCls} />
                        <input value={form.firstname} onChange={set("firstname")} required placeholder="Jean" className={inputCls} />
                    </div>
                </div>
                <div className="flex flex-col gap-1.5">
                    <label className={labelCls}>Nom *</label>
                    <div className={fieldCls(false)}>
                        <User className={iconCls} />
                        <input value={form.lastname} onChange={set("lastname")} required placeholder="Dupont" className={inputCls} />
                    </div>
                </div>
                <div className="sm:col-span-2 flex flex-col gap-1.5">
                    <label className={labelCls}>Email *</label>
                    <div className={fieldCls(false)}>
                        <Mail className={iconCls} />
                        <input type="email" value={form.email} onChange={set("email")} required placeholder="jean.dupont@exemple.fr" className={inputCls} />
                    </div>
                </div>
                <div className="flex flex-col gap-1.5">
                    <label className={labelCls}>Téléphone</label>
                    <div className={fieldCls(false)}>
                        <Phone className={iconCls} />
                        <input value={form.phone} onChange={set("phone")} placeholder="06 00 00 00 00" className={inputCls} />
                    </div>
                </div>
                <div className="flex flex-col gap-1.5">
                    <label className={labelCls}>Secteur / Agence</label>
                    <div className={fieldCls(false)}>
                        <Briefcase className={iconCls} />
                        <input value={form.sector} onChange={set("sector")} placeholder="Niort - Agence Nord" className={inputCls} />
                    </div>
                </div>

                {/* ALP référent — uniquement en mode ARC */}
                {role === "ARC" && (
                    <div className="sm:col-span-2 flex flex-col gap-1.5">
                        <label className={labelCls}>ALP référent *</label>
                        <div className={fieldCls(!form.alpId && !!error)}>
                            <Users className={iconCls} />
                            <select
                                value={form.alpId}
                                onChange={set("alpId")}
                                className={`flex-1 min-w-0 bg-transparent text-sm focus:outline-none appearance-none cursor-pointer
                                    ${!form.alpId ? (isLight ? "text-slate-400" : "text-slate-500") : (isLight ? "text-slate-800" : "text-white")}`}
                            >
                                <option value="">{alpList.length === 0 ? "Aucun ALP disponible" : "Choisir un ALP..."}</option>
                                {alpList.map(alp => (
                                    <option key={alp.id} value={alp.id}
                                        className={isLight ? "bg-white text-slate-800" : "bg-[#0e1535] text-white"}>
                                        {alp.firstname} {alp.lastname}{alp.sector ? ` — ${alp.sector}` : ""}
                                    </option>
                                ))}
                            </select>
                        </div>
                        {alpList.length === 0 && (
                            <p className={`text-xs ${isLight ? "text-slate-400" : "text-slate-500"}`}>
                                Créez d'abord un ALP avant d'ajouter un ARC.
                            </p>
                        )}
                    </div>
                )}
            </div>

            <button type="submit" disabled={loading}
                className="w-full flex items-center justify-center gap-2.5 py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/25 hover:brightness-110 transition-all disabled:opacity-60">
                {loading
                    ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    : <UserPlus size={16} />}
                {loading ? "Création en cours..." : `Créer le compte ${role} et envoyer l'email`}
            </button>

            <p className={`text-xs text-center ${isLight ? "text-slate-400" : "text-slate-500"}`}>
                Un mot de passe temporaire sera généré et envoyé par email à l'apprenant.
            </p>
        </form>
    );
}

/* ─── Page principale ─── */
export default function AdminVehiclesPage() {
    const { isDark } = useTheme();
    const { decrementPending } = useNotifications();
    const [adminTab, setAdminTab]         = useState("overview");
    const [users, setUsers]               = useState([]);
    const [isLoading, setIsLoading]       = useState(true);
    const [error, setError]               = useState(null);
    const [openUsers, setOpenUsers]       = useState({});
    const [filter, setFilter]             = useState("pending");
    const [selectedVehicle, setSelectedVehicle] = useState(null);

    // ALP users
    const [alpUsers, setAlpUsers]         = useState([]);
    const [alpLoading, setAlpLoading]     = useState(false);

    // Block modal
    const [blockTarget, setBlockTarget]   = useState(null); // { id, name }
    const [blockReason, setBlockReason]   = useState("");
    const [blockLoading, setBlockLoading] = useState(false);

    // Support chat (admin)
    const [supportChannels, setSupportChannels] = useState([]);
    const [supportLoading, setSupportLoading]   = useState(false);
    const [activeSupport, setActiveSupport]     = useState(null);
    const [supportMessages, setSupportMessages] = useState([]);
    const [supportInput, setSupportInput]       = useState("");
    const [supportSending, setSupportSending]   = useState(false);
    const supportEndRef = useRef(null);

    // Modale de rejet
    const [rejectTarget, setRejectTarget] = useState(null); // { type: "vehicle"|"document", id, title }

    const fetchOverview = async () => {
        try {
            setIsLoading(true);
            const { data } = await api.get("/api/admin/overview");
            setUsers(data);
            const initialOpen = {};
            data.forEach(u => {
                const hasPending =
                    u.vehicles?.some(v => v.status === "en_attente") ||
                    u.documents?.some(d => d.status === "en_attente");
                if (hasPending) initialOpen[u.id] = true;
            });
            setOpenUsers(initialOpen);
            setError(null);
        } catch {
            setError("Impossible de charger les données.");
        } finally {
            setIsLoading(false);
        }
    };

    const fetchAlpUsers = async () => {
        setAlpLoading(true);
        try { const { data } = await api.get("/api/admin/users/alp"); setAlpUsers(data); }
        catch { /* silently fail */ }
        finally { setAlpLoading(false); }
    };

    const handleBlockConfirm = async () => {
        if (!blockTarget) return;
        setBlockLoading(true);
        try {
            await api.put(`/api/admin/users/${blockTarget.id}/block`, { reason: blockReason });
            setBlockTarget(null);
            setBlockReason("");
            fetchAlpUsers();
        } catch { /* ignore */ }
        finally { setBlockLoading(false); }
    };

    const handleUnblock = async (userId) => {
        try {
            await api.put(`/api/admin/users/${userId}/unblock`);
            fetchAlpUsers();
        } catch { /* ignore */ }
    };

    const fetchSupportChannels = async () => {
        setSupportLoading(true);
        try { const { data } = await api.get("/api/admin/support/channels"); setSupportChannels(data); }
        catch { /* ignore */ }
        finally { setSupportLoading(false); }
    };

    const openSupportChannel = async (ch) => {
        setActiveSupport(ch);
        try {
            const { data } = await api.get(`/api/admin/support/channels/${ch.id}/messages`);
            setSupportMessages(data);
            setTimeout(() => supportEndRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
        } catch { /* ignore */ }
    };

    const sendSupportMessage = async () => {
        const text = supportInput.trim();
        if (!text || !activeSupport) return;
        setSupportSending(true);
        setSupportInput("");
        const temp = { id: Date.now(), content: text, isAdmin: true, sentAt: new Date().toISOString(), isTemp: true };
        setSupportMessages(prev => [...prev, temp]);
        try {
            const { data } = await api.post(`/api/support/channel/${activeSupport.id}/messages`, { content: text });
            setSupportMessages(prev => prev.map(m => m.id === temp.id ? data : m));
            setSupportChannels(prev => prev.map(c => c.id === activeSupport.id ? { ...c, lastMessage: text } : c));
        } catch {
            setSupportMessages(prev => prev.filter(m => m.id !== temp.id));
            setSupportInput(text);
        } finally { setSupportSending(false); }
    };

    useEffect(() => { supportEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [supportMessages]);

    useEffect(() => { fetchOverview(); }, []);
    useEffect(() => { if (adminTab === "alp") fetchAlpUsers(); }, [adminTab]);
    useEffect(() => { if (adminTab === "support") fetchSupportChannels(); }, [adminTab]);

    const toggleUser = (id) => setOpenUsers(prev => ({ ...prev, [id]: !prev[id] }));

    const handleVehicleApprove = async (id) => {
        decrementPending(1);
        await api.put(`/api/admin/vehicles/${id}/approve`);
        fetchOverview();
    };

    const handleRejectConfirm = async (reason) => {
        if (!rejectTarget) return;
        const { type, id } = rejectTarget;
        decrementPending(1);
        if (type === "vehicle") {
            await api.put(`/api/admin/vehicles/${id}/reject`, { reason });
        } else {
            await api.put(`/api/admin/documents/${id}/reject`, { reason });
        }
        setRejectTarget(null);
        fetchOverview();
    };

    const handleDocApprove = async (id) => {
        decrementPending(1);
        await api.put(`/api/admin/documents/${id}/approve`);
        fetchOverview();
    };

    const textPrimary = isDark ? "text-white" : "text-slate-800";
    const textMuted   = isDark ? "text-slate-400" : "text-slate-500";
    const cardBg      = isDark ? "bg-[#0f1129] border-slate-800" : "bg-white border-slate-200";
    const innerBg     = isDark ? "bg-slate-900/50" : "bg-slate-50";
    const divider     = isDark ? "border-slate-800" : "border-slate-200";

    const filteredUsers = users.map(u => ({
        ...u,
        vehicles:  filter === "pending" ? (u.vehicles||[]).filter(v => v.status==="en_attente") : (u.vehicles||[]),
        documents: filter === "pending" ? (u.documents||[]).filter(d => d.status==="en_attente") : (u.documents||[]),
    })).filter(u => u.vehicles.length > 0 || u.documents.length > 0);

    return (
        <div className={`p-6 min-h-screen ${isDark ? "" : "bg-slate-50"}`}>

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className={`text-2xl font-bold ${textPrimary}`}>Administration</h1>
                    <p className={textMuted}>Gestion des utilisateurs et des validations</p>
                </div>
            </div>

            {/* Tabs */}
            <div className={`flex items-center gap-1.5 p-1.5 rounded-2xl mb-6 w-fit ${isDark ? "bg-white/5" : "bg-slate-200/60"}`}>
                {[
                    { key: "overview", label: "Véhicules & Docs", icon: Car },
                    { key: "alp",      label: "Apprenants ALP/ARC", icon: Users },
                    { key: "support",  label: "Support", icon: MessageSquare },
                ].map(({ key, label, icon: Icon }) => (
                    <button key={key} onClick={() => setAdminTab(key)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-200
                            ${adminTab === key
                                ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/30"
                                : isDark ? "text-slate-500 hover:text-slate-300 hover:bg-white/5" : "text-slate-500 hover:text-slate-700 hover:bg-white/70"}`}>
                        <Icon size={15} />{label}
                    </button>
                ))}
            </div>

            {/* ── Onglet Overview : filtres ── */}
            {adminTab === "overview" && (
            <div className="flex gap-2 mb-6">
                {["pending","all"].map(f => (
                    <Button key={f} size="sm"
                        variant={filter===f ? "solid" : "bordered"}
                        className={filter===f ? "bg-[#ff922b] text-white font-semibold" : isDark ? "border-slate-600 text-slate-300" : "border-slate-300 text-slate-600"}
                        onPress={() => setFilter(f)}>
                        {f==="pending" ? "En attente" : "Tout voir"}
                    </Button>
                ))}
            </div>
            )}

            {/* ── Modal blocage ── */}
            {blockTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backdropFilter: "blur(6px)", backgroundColor: "rgba(0,0,0,0.6)" }}>
                    <div className={`w-full max-w-sm rounded-2xl border shadow-xl overflow-hidden ${isDark ? "bg-[#0f1129] border-slate-700" : "bg-white border-slate-200"}`}>
                        <div className={`px-5 py-4 border-b flex items-center gap-3 ${isDark ? "border-slate-700" : "border-slate-100"}`}>
                            <Lock size={16} className="text-red-500" />
                            <p className={`font-bold text-sm ${isDark ? "text-white" : "text-slate-800"}`}>Bloquer {blockTarget.name}</p>
                        </div>
                        <div className="p-5 space-y-3">
                            <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>Précisez la raison du blocage (visible par l'utilisateur) :</p>
                            <textarea
                                value={blockReason}
                                onChange={e => setBlockReason(e.target.value)}
                                rows={3}
                                placeholder="Ex : Non-respect des conditions d'utilisation..."
                                className={`w-full rounded-xl border px-3 py-2.5 text-sm resize-none focus:outline-none transition-all ${isDark ? "bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-red-500/50" : "bg-slate-50 border-slate-200 text-slate-800 placeholder:text-slate-400 focus:border-red-400"}`}
                            />
                            <div className="flex gap-2 pt-1">
                                <button onClick={() => { setBlockTarget(null); setBlockReason(""); }}
                                    className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-all ${isDark ? "border-slate-700 text-slate-400 hover:bg-white/5" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
                                    Annuler
                                </button>
                                <button onClick={handleBlockConfirm} disabled={blockLoading || !blockReason.trim()}
                                    className="flex-1 py-2.5 rounded-xl text-sm font-bold bg-red-500 text-white hover:bg-red-600 transition-all disabled:opacity-50">
                                    {blockLoading ? "..." : "Bloquer"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Onglet ALP ── */}
            {adminTab === "alp" && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-5xl">
                    {/* Formulaire création */}
                    <div className={`rounded-2xl border overflow-hidden ${isDark ? "bg-[#0f1129] border-slate-800" : "bg-white border-slate-200 shadow-sm"}`}>
                        <div className={`px-6 py-4 border-b ${isDark ? "border-slate-800 bg-white/2" : "border-slate-100 bg-slate-50/50"}`}>
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-xl ${isDark ? "bg-orange-500/10" : "bg-orange-50"}`}>
                                    <UserPlus size={18} className="text-orange-500" />
                                </div>
                                <div>
                                    <p className={`font-black text-base ${textPrimary}`}>Créer un apprenant</p>
                                    <p className={`text-xs mt-0.5 ${textMuted}`}>ALP autonome ou ARC rattaché à un ALP</p>
                                </div>
                            </div>
                        </div>
                        <div className="p-6">
                            <CreateAlpForm isDark={isDark} onCreated={fetchAlpUsers} />
                        </div>
                    </div>

                    {/* Liste des ALP */}
                    <div className={`rounded-2xl border overflow-hidden ${isDark ? "bg-[#0f1129] border-slate-800" : "bg-white border-slate-200 shadow-sm"}`}>
                        <div className={`px-6 py-4 border-b ${isDark ? "border-slate-800 bg-white/2" : "border-slate-100 bg-slate-50/50"}`}>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-xl ${isDark ? "bg-blue-500/10" : "bg-blue-50"}`}>
                                        <Users size={18} className="text-blue-500" />
                                    </div>
                                    <div>
                                        <p className={`font-black text-base ${textPrimary}`}>Apprenants</p>
                                        <p className={`text-xs mt-0.5 ${textMuted}`}>
                                            {alpUsers.filter(u => u.roles === "ALP").length} ALP · {alpUsers.filter(u => u.roles === "ARC").length} ARC
                                        </p>
                                    </div>
                                </div>
                                <button onClick={fetchAlpUsers} className={`text-xs font-semibold px-3 py-1.5 rounded-xl transition-all ${isDark ? "bg-white/5 text-slate-400 hover:bg-white/10" : "bg-slate-100 text-slate-500 hover:bg-slate-200"}`}>
                                    Actualiser
                                </button>
                            </div>
                        </div>
                        <div className="divide-y overflow-y-auto max-h-[480px]">
                            {alpLoading ? (
                                <div className="flex justify-center py-10"><Spinner size="sm" color="warning" /></div>
                            ) : alpUsers.length === 0 ? (
                                <div className={`flex flex-col items-center justify-center py-12 gap-2 ${textMuted}`}>
                                    <Users size={32} className="opacity-30" />
                                    <p className="text-sm">Aucun apprenant créé</p>
                                </div>
                            ) : (() => {
                                const alps = alpUsers.filter(u => u.roles === "ALP");
                                const arcs = alpUsers.filter(u => u.roles === "ARC");
                                const standalone = arcs.filter(a => !a.alpId);
                                return (
                                    <>
                                        {alps.map(alp => {
                                            const myArcs = arcs.filter(a => a.alpId === alp.id);
                                            return (
                                                <div key={alp.id}>
                                                    {/* Ligne ALP */}
                                                    <div className={`flex items-center gap-3 px-5 py-3.5 ${isDark ? "border-slate-800/80" : "border-slate-100"}`}>
                                                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white font-black text-sm shrink-0">
                                                            {((alp.firstname?.[0]||"")+(alp.lastname?.[0]||"")).toUpperCase()||"?"}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className={`font-bold text-sm truncate ${textPrimary}`}>{alp.firstname} {alp.lastname}</p>
                                                            <p className={`text-xs truncate ${textMuted}`}>{alp.email}</p>
                                                        </div>
                                                        <div className="flex items-center gap-1.5 shrink-0">
                                                            <span className={`text-[11px] font-bold px-2 py-1 rounded-lg ${isDark ? "bg-orange-500/10 text-orange-400 border border-orange-500/20" : "bg-orange-50 text-orange-600 border border-orange-200"}`}>ALP</span>
                                                            <span className={`text-[11px] font-bold px-2 py-1 rounded-lg ${alp.status === "ACTIF" ? isDark ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-emerald-50 text-emerald-600 border border-emerald-200" : isDark ? "bg-red-500/10 text-red-400 border border-red-500/20" : "bg-red-50 text-red-600 border border-red-200"}`}>
                                                                {alp.status === "ACTIF" ? "Actif" : "Bloqué"}
                                                            </span>
                                                            {alp.status === "SUSPENDU" ? (
                                                                <button onClick={() => handleUnblock(alp.id)} title="Débloquer"
                                                                    className={`p-1.5 rounded-lg transition-all ${isDark ? "text-emerald-400 hover:bg-emerald-500/10" : "text-emerald-600 hover:bg-emerald-50"}`}>
                                                                    <Unlock size={14} />
                                                                </button>
                                                            ) : (
                                                                <button onClick={() => setBlockTarget({ id: alp.id, name: `${alp.firstname} ${alp.lastname}` })} title="Bloquer"
                                                                    className={`p-1.5 rounded-lg transition-all ${isDark ? "text-red-400 hover:bg-red-500/10" : "text-red-500 hover:bg-red-50"}`}>
                                                                    <Lock size={14} />
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                    {/* ARCs rattachés */}
                                                    {myArcs.map(arc => (
                                                        <div key={arc.id} className={`flex items-center gap-3 pl-10 pr-5 py-3 ${isDark ? "bg-purple-500/3 border-slate-800/60" : "bg-purple-50/60 border-slate-100"}`}>
                                                            <div className="w-2 h-2 rounded-full bg-purple-400 shrink-0" />
                                                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-violet-500 flex items-center justify-center text-white font-black text-xs shrink-0">
                                                                {((arc.firstname?.[0]||"")+(arc.lastname?.[0]||"")).toUpperCase()||"?"}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className={`font-semibold text-sm truncate ${textPrimary}`}>{arc.firstname} {arc.lastname}</p>
                                                                <p className={`text-xs truncate ${textMuted}`}>{arc.email}</p>
                                                            </div>
                                                            <div className="flex items-center gap-1.5 shrink-0">
                                                                <span className={`text-[11px] font-bold px-2 py-1 rounded-lg ${isDark ? "bg-purple-500/10 text-purple-400 border border-purple-500/20" : "bg-purple-50 text-purple-600 border border-purple-200"}`}>ARC</span>
                                                                {arc.status === "SUSPENDU" ? (
                                                                    <>
                                                                        <span className={`text-[11px] font-bold px-2 py-1 rounded-lg ${isDark ? "bg-red-500/10 text-red-400 border border-red-500/20" : "bg-red-50 text-red-600 border border-red-200"}`}>Bloqué</span>
                                                                        <button onClick={() => handleUnblock(arc.id)} title="Débloquer"
                                                                            className={`p-1.5 rounded-lg transition-all ${isDark ? "text-emerald-400 hover:bg-emerald-500/10" : "text-emerald-600 hover:bg-emerald-50"}`}>
                                                                            <Unlock size={14} />
                                                                        </button>
                                                                    </>
                                                                ) : (
                                                                    <button onClick={() => setBlockTarget({ id: arc.id, name: `${arc.firstname} ${arc.lastname}` })} title="Bloquer"
                                                                        className={`p-1.5 rounded-lg transition-all ${isDark ? "text-red-400 hover:bg-red-500/10" : "text-red-500 hover:bg-red-50"}`}>
                                                                        <Lock size={14} />
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            );
                                        })}
                                        {/* ARCs sans ALP */}
                                        {standalone.map(arc => (
                                            <div key={arc.id} className={`flex items-center gap-3 px-5 py-3.5 ${isDark ? "border-slate-800/80" : "border-slate-100"}`}>
                                                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-violet-500 flex items-center justify-center text-white font-black text-sm shrink-0">
                                                    {((arc.firstname?.[0]||"")+(arc.lastname?.[0]||"")).toUpperCase()||"?"}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className={`font-bold text-sm truncate ${textPrimary}`}>{arc.firstname} {arc.lastname}</p>
                                                    <p className={`text-xs truncate ${textMuted}`}>{arc.email}</p>
                                                </div>
                                                <div className="flex items-center gap-1.5 shrink-0">
                                                    <span className={`text-[11px] font-bold px-2 py-1 rounded-lg ${isDark ? "bg-purple-500/10 text-purple-400 border border-purple-500/20" : "bg-purple-50 text-purple-600 border border-purple-200"}`}>ARC</span>
                                                    {arc.status === "SUSPENDU" ? (
                                                        <>
                                                            <span className={`text-[11px] font-bold px-2 py-1 rounded-lg ${isDark ? "bg-red-500/10 text-red-400 border border-red-500/20" : "bg-red-50 text-red-600 border border-red-200"}`}>Bloqué</span>
                                                            <button onClick={() => handleUnblock(arc.id)} title="Débloquer"
                                                                className={`p-1.5 rounded-lg transition-all ${isDark ? "text-emerald-400 hover:bg-emerald-500/10" : "text-emerald-600 hover:bg-emerald-50"}`}>
                                                                <Unlock size={14} />
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <button onClick={() => setBlockTarget({ id: arc.id, name: `${arc.firstname} ${arc.lastname}` })} title="Bloquer"
                                                            className={`p-1.5 rounded-lg transition-all ${isDark ? "text-red-400 hover:bg-red-500/10" : "text-red-500 hover:bg-red-50"}`}>
                                                            <Lock size={14} />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </>
                                );
                            })()}
                        </div>
                    </div>
                </div>
            )}

            {/* ── Onglet Support ── */}
            {adminTab === "support" && (
                <div className={`rounded-2xl border overflow-hidden flex ${isDark ? "bg-[#0f1129] border-slate-800" : "bg-white border-slate-200 shadow-sm"}`} style={{ height: 520 }}>
                    {/* Sidebar conversations */}
                    <div className={`w-64 shrink-0 border-r flex flex-col ${isDark ? "border-slate-800" : "border-slate-200"}`}>
                        <div className={`px-4 py-3.5 border-b flex items-center justify-between ${isDark ? "border-slate-800" : "border-slate-100"}`}>
                            <p className={`font-black text-sm ${isDark ? "text-white" : "text-slate-800"}`}>Demandes de support</p>
                            <button onClick={fetchSupportChannels} className={`text-xs px-2.5 py-1 rounded-lg ${isDark ? "bg-white/5 text-slate-400 hover:bg-white/10" : "bg-slate-100 text-slate-500 hover:bg-slate-200"}`}>↻</button>
                        </div>
                        <div className="flex-1 overflow-y-auto divide-y">
                            {supportLoading ? (
                                <div className="flex justify-center py-8"><Spinner size="sm" color="warning" /></div>
                            ) : supportChannels.length === 0 ? (
                                <div className={`flex flex-col items-center justify-center py-12 gap-2 ${textMuted}`}>
                                    <MessageSquare size={28} className="opacity-25" />
                                    <p className="text-xs">Aucune demande</p>
                                </div>
                            ) : supportChannels.map(ch => (
                                <button key={ch.id} onClick={() => openSupportChannel(ch)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-all ${
                                        activeSupport?.id === ch.id
                                            ? isDark ? "bg-orange-500/10 border-l-2 border-orange-500" : "bg-orange-50 border-l-2 border-orange-500"
                                            : isDark ? "hover:bg-white/3 border-slate-800" : "hover:bg-slate-50 border-slate-100"
                                    }`}>
                                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center text-white font-black text-xs shrink-0">
                                        {((ch.userFirstname?.[0]||"")+(ch.userLastname?.[0]||"")).toUpperCase()||"?"}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className={`font-bold text-xs truncate ${isDark ? "text-white" : "text-slate-800"}`}>{ch.userFirstname} {ch.userLastname}</p>
                                        <p className={`text-[11px] truncate ${isDark ? "text-slate-500" : "text-slate-400"}`}>{ch.lastMessage || "Nouveau"}</p>
                                    </div>
                                    {ch.unreadCount > 0 && (
                                        <span className="w-4 h-4 rounded-full bg-orange-500 text-white text-[10px] font-black flex items-center justify-center shrink-0">{ch.unreadCount}</span>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Zone messages */}
                    {activeSupport ? (
                        <div className="flex-1 flex flex-col min-w-0">
                            {/* Header */}
                            <div className={`px-5 py-3.5 border-b flex items-center gap-3 shrink-0 ${isDark ? "border-slate-800" : "border-slate-100"}`}>
                                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center text-white font-black text-xs shrink-0">
                                    {((activeSupport.userFirstname?.[0]||"")+(activeSupport.userLastname?.[0]||"")).toUpperCase()||"?"}
                                </div>
                                <div>
                                    <p className={`font-bold text-sm ${isDark ? "text-white" : "text-slate-800"}`}>{activeSupport.userFirstname} {activeSupport.userLastname}</p>
                                    <p className={`text-[11px] ${isDark ? "text-red-400" : "text-red-500"}`}>Compte suspendu · {activeSupport.userEmail}</p>
                                </div>
                            </div>
                            {/* Messages */}
                            <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-3">
                                {supportMessages.length === 0 ? (
                                    <div className={`flex flex-col items-center justify-center h-full gap-2 ${textMuted}`}>
                                        <MessageSquare size={24} className="opacity-25" />
                                        <p className="text-xs">Aucun message</p>
                                    </div>
                                ) : supportMessages.map(msg => (
                                    <div key={msg.id} className={`flex gap-2 ${msg.isAdmin ? "flex-row-reverse" : "flex-row"}`}>
                                        <div className={`w-7 h-7 rounded-xl flex items-center justify-center text-white font-black text-[10px] shrink-0 ${msg.isAdmin ? "bg-gradient-to-br from-orange-500 to-amber-500" : "bg-gradient-to-br from-red-500 to-rose-600"}`}>
                                            {msg.isAdmin ? "A" : ((activeSupport.userFirstname?.[0]||"")+(activeSupport.userLastname?.[0]||"")).toUpperCase()||"?"}
                                        </div>
                                        <div className={`max-w-[70%] flex flex-col gap-0.5 ${msg.isAdmin ? "items-end" : "items-start"}`}>
                                            <div className={`px-3.5 py-2.5 rounded-2xl text-sm ${msg.isAdmin ? "bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-tr-sm" : isDark ? "bg-white/8 text-slate-200 border border-white/8 rounded-tl-sm" : "bg-slate-100 text-slate-700 rounded-tl-sm"}`}>
                                                {msg.content}
                                            </div>
                                            <p className={`text-[10px] ${isDark ? "text-slate-600" : "text-slate-400"}`}>{msg.sentAt ? new Date(msg.sentAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }) : ""}</p>
                                        </div>
                                    </div>
                                ))}
                                <div ref={supportEndRef} />
                            </div>
                            {/* Input */}
                            <div className={`flex items-end gap-2 px-5 py-3.5 border-t shrink-0 ${isDark ? "border-slate-800" : "border-slate-100"}`}>
                                <textarea
                                    value={supportInput}
                                    onChange={e => setSupportInput(e.target.value)}
                                    onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendSupportMessage(); } }}
                                    rows={1}
                                    placeholder="Répondre..."
                                    className={`flex-1 resize-none rounded-xl px-3 py-2.5 text-sm focus:outline-none transition-all ${isDark ? "bg-white/8 border border-white/10 text-white placeholder:text-slate-600 focus:border-orange-500/40" : "bg-slate-50 border border-slate-200 text-slate-800 placeholder:text-slate-400 focus:border-orange-400"}`}
                                    style={{ fieldSizing: "content", minHeight: 40, maxHeight: 80 }}
                                />
                                <button onClick={sendSupportMessage} disabled={supportSending || !supportInput.trim()}
                                    className="w-9 h-9 shrink-0 flex items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 text-white disabled:opacity-40 hover:brightness-110 transition-all">
                                    {supportSending ? <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Send size={14} />}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className={`flex-1 flex flex-col items-center justify-center gap-3 ${textMuted}`}>
                            <MessageSquare size={36} className="opacity-20" />
                            <p className="text-sm">Sélectionnez une conversation</p>
                        </div>
                    )}
                </div>
            )}

            {adminTab === "overview" && (<>

            {error && <p className="text-danger mb-4">{error}</p>}

            {isLoading ? (
                <div className="flex justify-center items-center min-h-[300px]">
                    <Spinner size="lg" color="warning" label="Chargement..." />
                </div>
            ) : filteredUsers.length === 0 ? (
                <div className={`flex flex-col items-center justify-center min-h-[300px] gap-2 ${textMuted}`}>
                    <CheckCircle size={48} />
                    <p className="text-lg font-medium">Aucun élément en attente</p>
                </div>
            ) : (
                <div className="flex flex-col gap-4">
                    {filteredUsers.map(userRow => {
                        const isOpen = !!openUsers[userRow.id];
                        const pendingCount =
                            (userRow.vehicles?.filter(v=>v.status==="en_attente").length||0) +
                            (userRow.documents?.filter(d=>d.status==="en_attente").length||0);

                        return (
                            <div key={userRow.id} className={`rounded-2xl border ${cardBg} overflow-hidden`}>

                                {/* En-tête utilisateur */}
                                <button type="button" className="w-full flex items-center justify-between px-5 py-4 text-left"
                                    onClick={() => toggleUser(userRow.id)}>
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-orange-500 to-yellow-400 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                                            {((userRow.firstname?.[0]||"")+(userRow.lastname?.[0]||"")).toUpperCase()||"?"}
                                        </div>
                                        <div>
                                            <p className={`font-semibold ${textPrimary}`}>{userRow.firstname} {userRow.lastname}</p>
                                            <p className={`text-sm ${textMuted}`}>{userRow.email}</p>
                                        </div>
                                        {pendingCount > 0 && (
                                            <span className="ml-2 bg-orange-500 text-white text-xs font-bold rounded-full px-2 py-0.5">
                                                {pendingCount} en attente
                                            </span>
                                        )}
                                    </div>
                                    <div className={`flex items-center gap-3 ${textMuted}`}>
                                        <span className="text-sm">{userRow.vehicles?.length||0} véhicule(s) · {userRow.documents?.length||0} doc(s)</span>
                                        {isOpen ? <ChevronUp size={18}/> : <ChevronDown size={18}/>}
                                    </div>
                                </button>

                                {isOpen && (
                                    <div className={`px-5 pb-5 border-t ${divider}`}>

                                        {/* ── Véhicules ── */}
                                        {userRow.vehicles?.length > 0 && (
                                            <div className="mt-4">
                                                <p className={`text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-2 ${textMuted}`}>
                                                    <Car size={14}/> Véhicules
                                                </p>
                                                <div className="flex flex-col gap-3">
                                                    {userRow.vehicles.map(v => {
                                                        const firstImg = v.images?.[0] ? resolveUrl(v.images[0]) : null;
                                                        return (
                                                            <div key={v.id} className={`rounded-xl ${innerBg} overflow-hidden`}>
                                                                <button type="button" className="w-full flex gap-3 items-center p-3 text-left hover:opacity-80 transition"
                                                                    onClick={() => setSelectedVehicle(v)}>
                                                                    <div className="w-20 h-14 rounded-lg overflow-hidden flex-shrink-0">
                                                                        {firstImg
                                                                            ? <img src={firstImg} alt="" className="w-full h-full object-cover"/>
                                                                            : <div className={`w-full h-full flex items-center justify-center ${isDark?"bg-slate-800":"bg-slate-200"}`}><Car size={18} className={textMuted}/></div>
                                                                        }
                                                                    </div>
                                                                    <div className="flex-1 min-w-0">
                                                                        <div className="flex items-center gap-2 flex-wrap">
                                                                            <span className={`font-semibold ${textPrimary}`}>{v.brand} {v.model}</span>
                                                                            <code className={`text-xs px-1.5 py-0.5 rounded ${isDark?"bg-orange-500/10 text-orange-400":"bg-orange-50 text-orange-600"}`}>{v.plateNumber}</code>
                                                                            <Chip size="sm" variant="flat" color={vehicleStatusColor[v.status]||"default"}>
                                                                                {vehicleStatusLabel[v.status]||v.status}
                                                                            </Chip>
                                                                        </div>
                                                                        <div className={`flex gap-3 text-xs mt-1 ${textMuted}`}>
                                                                            <span className="flex items-center gap-1"><Fuel size={11}/>{v.fuel}</span>
                                                                            <span className="flex items-center gap-1"><Gauge size={11}/>{v.mileage} km</span>
                                                                            <span className="font-semibold">{v.baseDailyPrice}€/j</span>
                                                                            {v.images?.length > 0 && <span>{v.images.length} photo(s)</span>}
                                                                        </div>
                                                                        {/* Raison rejet */}
                                                                        {v.rejectionReason && (
                                                                            <p className={`text-xs mt-1 flex items-center gap-1 ${isDark?"text-red-400":"text-red-600"}`}>
                                                                                <AlertCircle size={11}/> {v.rejectionReason}
                                                                            </p>
                                                                        )}
                                                                    </div>
                                                                    <span className={`text-xs ${textMuted} flex-shrink-0`}>Voir →</span>
                                                                </button>

                                                                {v.status === "en_attente" && (
                                                                    <div className="flex gap-2 px-3 pb-3">
                                                                        <Button size="sm" className="bg-emerald-500 text-white font-semibold"
                                                                            startContent={<CheckCircle size={13}/>}
                                                                            onPress={() => handleVehicleApprove(v.id)}>
                                                                            Approuver
                                                                        </Button>
                                                                        <Button size="sm" color="danger" variant="flat"
                                                                            startContent={<XCircle size={13}/>}
                                                                            onPress={() => setRejectTarget({ type:"vehicle", id:v.id, title:`Rejeter ${v.brand} ${v.model}` })}>
                                                                            Rejeter
                                                                        </Button>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}

                                        {/* ── Documents ── */}
                                        {userRow.documents?.length > 0 && (
                                            <div className="mt-4">
                                                <p className={`text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-2 ${textMuted}`}>
                                                    <FileText size={14}/> Documents
                                                </p>
                                                <div className="flex flex-col gap-3">
                                                    {userRow.documents.map(d => (
                                                        <div key={d.id} className={`rounded-xl ${innerBg} overflow-hidden`}>
                                                            <a href={resolveUrl(d.fileUrl)} target="_blank" rel="noopener noreferrer"
                                                                className="flex items-center gap-3 p-3 hover:opacity-80 transition">
                                                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${isDark?"bg-slate-800":"bg-slate-200"}`}>
                                                                    <FileText size={18} className={textMuted}/>
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <div className="flex items-center gap-2 flex-wrap">
                                                                        <span className={`font-semibold ${textPrimary}`}>{docTypeLabel[d.type]||d.type}</span>
                                                                        <Chip size="sm" variant="flat" color={docStatusColor[d.status]||"default"}>
                                                                            {docStatusLabel[d.status]||d.status}
                                                                        </Chip>
                                                                    </div>
                                                                    <p className={`text-xs mt-0.5 ${textMuted}`}>
                                                                        {d.scope}{d.issueDate && ` · Émis le ${d.issueDate}`}{d.expirationDate && ` · Expire le ${d.expirationDate}`}
                                                                    </p>
                                                                    {/* Raison rejet */}
                                                                    {d.rejectionReason && (
                                                                        <p className={`text-xs mt-1 flex items-center gap-1 ${isDark?"text-red-400":"text-red-600"}`}>
                                                                            <AlertCircle size={11}/> {d.rejectionReason}
                                                                        </p>
                                                                    )}
                                                                </div>
                                                                <span className={`text-xs ${textMuted} flex-shrink-0`}>Ouvrir →</span>
                                                            </a>

                                                            {d.status === "en_attente" && (
                                                                <div className="flex gap-2 px-3 pb-3">
                                                                    <Button size="sm" className="bg-emerald-500 text-white font-semibold"
                                                                        startContent={<CheckCircle size={13}/>}
                                                                        onPress={() => handleDocApprove(d.id)}>
                                                                        Valider
                                                                    </Button>
                                                                    <Button size="sm" color="danger" variant="flat"
                                                                        startContent={<XCircle size={13}/>}
                                                                        onPress={() => setRejectTarget({ type:"document", id:d.id, title:`Rejeter « ${docTypeLabel[d.type]||d.type} »` })}>
                                                                        Rejeter
                                                                    </Button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Modale galerie véhicule */}
            {selectedVehicle && (
                <VehicleDetailModal
                    vehicle={selectedVehicle}
                    isDark={isDark}
                    onClose={() => setSelectedVehicle(null)}
                    onApprove={(id) => { handleVehicleApprove(id); setSelectedVehicle(null); }}
                    onOpenReject={(v) => setRejectTarget({ type:"vehicle", id:v.id, title:`Rejeter ${v.brand} ${v.model}` })}
                />
            )}

            {/* Modale de rejet avec raison */}
            <RejectModal
                isOpen={!!rejectTarget}
                title={rejectTarget?.title || "Rejeter"}
                isDark={isDark}
                onClose={() => setRejectTarget(null)}
                onConfirm={handleRejectConfirm}
            />
            </>)}
        </div>
    );
}
