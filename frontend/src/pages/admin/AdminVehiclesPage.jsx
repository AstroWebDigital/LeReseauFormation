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
    CheckCircle2, Shield, X, Lock, Unlock, MessageSquare, Send,
    ArrowRightLeft, CalendarCheck, RefreshCw,
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
                                Vous pouvez indiquer une raison (optionnel).
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

                            <div className={`grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 text-sm ${textMuted}`}>
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

/* ─── Sous-formulaire ALP / ARC (défini au niveau module pour éviter le remount) ─── */
function MiniForm({ role, form, setField, msg, loading, onSubmit, alpList, isLight }) {
    const fieldCls = (err) => `flex items-center gap-2 rounded-xl border px-3 py-2.5 transition-all ${
        err ? "border-red-500" : isLight ? "border-slate-200 focus-within:border-orange-400 bg-white" : "border-white/10 focus-within:border-orange-400 bg-white/3"
    }`;
    const inputCls = `flex-1 min-w-0 bg-transparent text-sm focus:outline-none ${isLight ? "text-slate-800 placeholder:text-slate-400" : "text-white placeholder:text-slate-500"}`;
    const iconCls  = `h-4 w-4 shrink-0 ${isLight ? "text-slate-400" : "text-slate-500"}`;
    const labelCls = `text-[10px] font-bold uppercase tracking-wider mb-1 block ${isLight ? "text-slate-500" : "text-slate-400"}`;

    return (
        <div className={`rounded-2xl border overflow-hidden ${isLight ? "border-slate-200" : "border-white/8"}`}>
            <div className={`flex items-center gap-3 px-4 py-3 border-b ${
                isLight ? "border-slate-100 bg-slate-50" : "border-white/8 bg-white/3"
            }`}>
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-black ${
                    role === "ALP" ? "bg-gradient-to-br from-orange-500 to-amber-500" : "bg-gradient-to-br from-purple-500 to-violet-500"
                }`}>{role}</div>
                <div>
                    <p className={`font-bold text-sm ${isLight ? "text-slate-800" : "text-white"}`}>
                        {role === "ALP" ? "Apprenant ALP" : "Apprenant ARC"}
                    </p>
                    <p className={`text-[10px] ${isLight ? "text-slate-400" : "text-slate-500"}`}>
                        {role === "ALP" ? "Autonome · accès complet à la plateforme" : "Rattaché à un ALP · hérite de sa structure"}
                    </p>
                </div>
            </div>

            <div className="p-4 space-y-3">
                {msg && (
                    <div className={`flex items-start gap-2 px-3 py-2.5 rounded-xl text-xs border ${
                        msg.type === "ok"
                            ? isLight ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                            : isLight ? "bg-red-50 border-red-200 text-red-700" : "bg-red-500/10 border-red-500/20 text-red-400"
                    }`}>
                        {msg.type === "ok" ? <CheckCircle2 size={13} className="shrink-0 mt-0.5" /> : <AlertCircle size={13} className="shrink-0 mt-0.5" />}
                        <span>{msg.text}</span>
                    </div>
                )}

                <div className="grid grid-cols-2 gap-2">
                    <div>
                        <label className={labelCls}>Prénom *</label>
                        <div className={fieldCls(false)}>
                            <User className={iconCls} size={14} />
                            <input value={form.firstname} onChange={setField("firstname")} required placeholder="Jean" className={inputCls} />
                        </div>
                    </div>
                    <div>
                        <label className={labelCls}>Nom *</label>
                        <div className={fieldCls(false)}>
                            <User className={iconCls} size={14} />
                            <input value={form.lastname} onChange={setField("lastname")} required placeholder="Dupont" className={inputCls} />
                        </div>
                    </div>
                    <div className="col-span-2">
                        <label className={labelCls}>Email *</label>
                        <div className={fieldCls(false)}>
                            <Mail className={iconCls} size={14} />
                            <input type="email" value={form.email} onChange={setField("email")} required placeholder="jean.dupont@exemple.fr" className={inputCls} />
                        </div>
                    </div>
                    <div>
                        <label className={labelCls}>Téléphone</label>
                        <div className={fieldCls(false)}>
                            <Phone className={iconCls} size={14} />
                            <input value={form.phone} onChange={setField("phone")} placeholder="06 00 00 00 00" className={inputCls} />
                        </div>
                    </div>
                    <div>
                        <label className={labelCls}>Secteur</label>
                        <div className={fieldCls(false)}>
                            <Briefcase className={iconCls} size={14} />
                            <input value={form.sector} onChange={setField("sector")} placeholder="Agence Nord" className={inputCls} />
                        </div>
                    </div>
                    {role === "ARC" && (
                        <div className="col-span-2">
                            <label className={labelCls}>ALP référent *</label>
                            <div className={fieldCls(!form.alpId && msg?.type === "err")}>
                                <Users className={iconCls} size={14} />
                                <select value={form.alpId} onChange={setField("alpId")}
                                    className={`flex-1 min-w-0 bg-transparent text-sm focus:outline-none appearance-none cursor-pointer ${
                                        !form.alpId ? isLight ? "text-slate-400" : "text-slate-500" : isLight ? "text-slate-800" : "text-white"
                                    }`}>
                                    <option value="">{alpList.length === 0 ? "Aucun ALP créé" : "Choisir un ALP..."}</option>
                                    {alpList.map(alp => (
                                        <option key={alp.id} value={alp.id} className={isLight ? "bg-white text-slate-800" : "bg-[#0e1535] text-white"}>
                                            {alp.firstname} {alp.lastname}{alp.sector ? ` — ${alp.sector}` : ""}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    )}
                </div>

                <button type="button" disabled={loading} onClick={onSubmit}
                    className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm text-white shadow-md transition-all disabled:opacity-60 ${
                        role === "ALP"
                            ? "bg-gradient-to-r from-orange-500 to-orange-600 shadow-orange-500/25"
                            : "bg-gradient-to-r from-purple-500 to-violet-600 shadow-purple-500/25"
                    }`}>
                    {loading
                        ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        : <UserPlus size={14} />}
                    {loading ? "Création..." : `Créer le compte ${role}`}
                </button>
            </div>
        </div>
    );
}

/* ─── Formulaire création ALP / ARC (deux sections empilées) ─── */
function CreateAlpForm({ isDark, onCreated }) {
    const isLight = !isDark;

    const emptyForm = { firstname: "", lastname: "", email: "", phone: "", sector: "", alpId: "" };
    const [alpForm,  setAlpForm]  = useState(emptyForm);
    const [arcForm,  setArcForm]  = useState(emptyForm);
    const [alpList,  setAlpList]  = useState([]);
    const [alpLoad,  setAlpLoad]  = useState(false);
    const [arcLoad,  setArcLoad]  = useState(false);
    const [alpMsg,   setAlpMsg]   = useState(null);
    const [arcMsg,   setArcMsg]   = useState(null);

    const loadAlpList = () => {
        api.get("/api/admin/users/alp-only")
            .then(r => setAlpList(r.data))
            .catch(() => setAlpList([]));
    };
    useEffect(() => { loadAlpList(); }, []);

    const setA = (setForm) => (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));
    const setAlp = setA(setAlpForm);
    const setArc = setA(setArcForm);

    const submit = async (role, form, setForm, setMsg, setLoad) => {
        if (role === "ARC" && !form.alpId) { setMsg({ type:"err", text:"Sélectionnez un ALP référent." }); return; }
        setLoad(true); setMsg(null);
        try {
            await api.post("/api/admin/users", { ...form, role });
            setMsg({ type:"ok", text:`Compte ${role} créé · email envoyé à ${form.email}` });
            setForm(emptyForm);
            onCreated?.();
            if (role === "ALP") loadAlpList();
        } catch (err) {
            setMsg({ type:"err", text: err?.response?.data || "Erreur lors de la création." });
        } finally {
            setLoad(false);
        }
    };

    return (
        <div className="space-y-4">
            <MiniForm role="ALP" form={alpForm} setField={setAlp} msg={alpMsg} loading={alpLoad} alpList={alpList} isLight={isLight}
                onSubmit={() => submit("ALP", alpForm, setAlpForm, setAlpMsg, setAlpLoad)} />
            <MiniForm role="ARC" form={arcForm} setField={setArc} msg={arcMsg} loading={arcLoad} alpList={alpList} isLight={isLight}
                onSubmit={() => submit("ARC", arcForm, setArcForm, setArcMsg, setArcLoad)} />
            <p className={`text-[10px] text-center ${isLight ? "text-slate-400" : "text-slate-500"}`}>
                Un mot de passe temporaire sera généré et envoyé par email à l'apprenant.
            </p>
        </div>
    );
}

/* ─── Page principale ─── */
export default function AdminVehiclesPage() {
    const { isDark } = useTheme();
    const { decrementPending, fetchUnreadSupport, unreadSupport } = useNotifications();
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

    // Transfer modal
    const [transferTarget,  setTransferTarget]  = useState(null); // { id, name, currentAlpId }
    const [transferAlpId,   setTransferAlpId]   = useState("");
    const [transferLoading, setTransferLoading] = useState(false);
    const [transferError,   setTransferError]   = useState("");

    // Support chat (admin)
    const [supportChannels, setSupportChannels] = useState([]);
    const [supportLoading, setSupportLoading]   = useState(false);
    const [activeSupport, setActiveSupport]     = useState(null);
    const [supportMessages, setSupportMessages] = useState([]);
    const [supportInput, setSupportInput]       = useState("");
    const [supportSending, setSupportSending]   = useState(false);
    const supportEndRef = useRef(null);

    // Modale de rejet
    const [rejectTarget, setRejectTarget] = useState(null); // { type: "vehicle"|"document"|"reservation", id, title }

    // Réservations en attente (admin)
    const [pendingReservations, setPendingReservations] = useState([]);
    const [resActionLoading, setResActionLoading] = useState({});

    const fetchPendingReservations = async () => {
        try {
            const { data } = await api.get("/api/admin/reservations/pending");
            setPendingReservations(data);
        } catch { /* silencieux */ }
    };

    const handleResApprove = async (id) => {
        setResActionLoading(prev => ({ ...prev, [id]: "approve" }));
        try {
            await api.put(`/api/admin/reservations/${id}/approve`);
            setPendingReservations(prev => prev.filter(r => r.id !== id));
            decrementPending(1);
        } catch { /* ignore */ }
        finally { setResActionLoading(prev => { const n = { ...prev }; delete n[id]; return n; }); }
    };

    const handleResReject = async (id, reason) => {
        setResActionLoading(prev => ({ ...prev, [id]: "reject" }));
        try {
            await api.put(`/api/admin/reservations/${id}/reject`, { reason });
            setPendingReservations(prev => prev.filter(r => r.id !== id));
            decrementPending(1);
        } catch { /* ignore */ }
        finally { setResActionLoading(prev => { const n = { ...prev }; delete n[id]; return n; }); }
    };

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

    const handleTransferConfirm = async () => {
        if (!transferTarget || !transferAlpId) return;
        setTransferLoading(true); setTransferError("");
        try {
            await api.put(`/api/admin/users/${transferTarget.id}/transfer`, { newAlpId: transferAlpId });
            setTransferTarget(null); setTransferAlpId("");
            fetchAlpUsers();
        } catch (e) {
            setTransferError(e?.response?.data || "Erreur lors du transfert.");
        } finally {
            setTransferLoading(false);
        }
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
            fetchUnreadSupport();
            setTimeout(() => supportEndRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
        } catch { /* ignore */ }
    };

    const sendSupportMessage = async () => {
        const text = supportInput.trim();
        if (!text || !activeSupport) return;
        setSupportSending(true);
        setSupportInput("");
        const temp = { id: Date.now(), content: text, fromAdmin: true, sentAt: new Date().toISOString(), isTemp: true };
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

    useEffect(() => { fetchOverview(); fetchPendingReservations(); }, []);
    useEffect(() => { if (adminTab === "alp") fetchAlpUsers(); }, [adminTab]);
    useEffect(() => { if (adminTab === "support") { fetchSupportChannels(); fetchUnreadSupport(); } }, [adminTab]);

    useEffect(() => {
        if (unreadSupport > 0) {
            document.title = `(${unreadSupport}) Demande${unreadSupport > 1 ? "s" : ""} de support — Administration`;
        } else {
            document.title = "Administration — Le Réseau Formation";
        }
        return () => { document.title = "Le Réseau Formation"; };
    }, [unreadSupport]);

    const toggleUser = (id) => setOpenUsers(prev => ({ ...prev, [id]: !prev[id] }));

    const handleVehicleApprove = async (id) => {
        decrementPending(1);
        await api.put(`/api/admin/vehicles/${id}/approve`);
        fetchOverview();
    };

    const handleRejectConfirm = async (reason) => {
        if (!rejectTarget) return;
        const { type, id } = rejectTarget;
        if (type === "vehicle") {
            decrementPending(1);
            await api.put(`/api/admin/vehicles/${id}/reject`, { reason });
            setRejectTarget(null);
            fetchOverview();
        } else if (type === "document") {
            decrementPending(1);
            await api.put(`/api/admin/documents/${id}/reject`, { reason });
            setRejectTarget(null);
            fetchOverview();
        } else if (type === "reservation") {
            setRejectTarget(null);
            await handleResReject(id, reason);
        }
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
        <div className={`p-3 md:p-6 min-h-screen ${isDark ? "" : "bg-slate-50"}`}>

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className={`text-2xl font-bold ${textPrimary}`}>Administration</h1>
                    <p className={textMuted}>Gestion des utilisateurs et des validations</p>
                </div>
            </div>

            {/* Tabs */}
            {(() => {
                const ADMIN_TABS = [
                    { key: "overview", label: "Véhicules & Docs",  icon: Car },
                    { key: "alp",      label: "Apprenants ALP/ARC", icon: Users },
                    { key: "support",  label: "Support",            icon: MessageSquare, badge: unreadSupport },
                ];
                const activeTabLabel = ADMIN_TABS.find(t => t.key === adminTab)?.label;
                return (
                    <>
                        <div className={`flex items-center gap-1 p-1 sm:p-1.5 rounded-2xl mb-3 ${isDark ? "bg-white/5" : "bg-slate-200/60"}`}>
                            {ADMIN_TABS.map(({ key, label, icon: Icon, badge }) => (
                                <button key={key} onClick={() => setAdminTab(key)} title={label}
                                    className={`relative flex items-center justify-center gap-2 flex-1 sm:flex-none sm:px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-200
                                        ${adminTab === key
                                            ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/30"
                                            : isDark ? "text-slate-500 hover:text-slate-300 hover:bg-white/5" : "text-slate-500 hover:text-slate-700 hover:bg-white/70"}`}>
                                    <Icon size={16} />
                                    <span className="hidden sm:inline whitespace-nowrap">{label}</span>
                                    {badge > 0 && (
                                        <span className={`text-[10px] font-black rounded-full px-1.5 py-0.5 min-w-[1.1rem] text-center leading-none ${
                                            adminTab === key ? "bg-white/30 text-white" : "bg-red-500 text-white"
                                        }`}>{badge > 99 ? "99+" : badge}</span>
                                    )}
                                </button>
                            ))}
                        </div>
                        {/* Label onglet actif — mobile uniquement */}
                        <p className={`sm:hidden text-xs font-bold uppercase tracking-widest mb-4 ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                            {activeTabLabel}
                        </p>
                    </>
                );
            })()}

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
                        {/* Modale transfert ARC */}
                        {transferTarget && (
                            <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backdropFilter:"blur(6px)", backgroundColor:"rgba(0,0,0,0.6)" }}>
                                <div className={`w-full max-w-sm rounded-2xl border shadow-xl overflow-hidden ${isDark ? "bg-[#0f1129] border-slate-700" : "bg-white border-slate-200"}`}>
                                    <div className={`px-5 py-4 border-b flex items-center gap-3 ${isDark ? "border-slate-700" : "border-slate-100"}`}>
                                        <ArrowRightLeft size={16} className="text-blue-500" />
                                        <p className={`font-bold text-sm ${isDark ? "text-white" : "text-slate-800"}`}>
                                            Transférer {transferTarget.name}
                                        </p>
                                    </div>
                                    <div className="p-5 space-y-3">
                                        <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>Choisissez le nouvel ALP référent :</p>
                                        <select value={transferAlpId} onChange={e => { setTransferAlpId(e.target.value); setTransferError(""); }}
                                            className={`w-full rounded-xl border px-3 py-2.5 text-sm focus:outline-none appearance-none cursor-pointer transition-all ${isDark ? "bg-white/5 border-white/10 text-white" : "bg-slate-50 border-slate-200 text-slate-800"}`}>
                                            <option value="">Sélectionner un ALP...</option>
                                            {alpUsers.filter(u => u.roles === "ALP" && u.id !== transferTarget.currentAlpId).map(alp => (
                                                <option key={alp.id} value={alp.id} className={isDark ? "bg-[#0e1535] text-white" : "bg-white text-slate-800"}>
                                                    {alp.firstname} {alp.lastname}{alp.sector ? ` — ${alp.sector}` : ""}
                                                </option>
                                            ))}
                                        </select>
                                        {transferError && <p className="text-red-400 text-xs">{transferError}</p>}
                                        <div className="flex gap-2 pt-1">
                                            <button onClick={() => { setTransferTarget(null); setTransferAlpId(""); setTransferError(""); }}
                                                className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-all ${isDark ? "border-slate-700 text-slate-400 hover:bg-white/5" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
                                                Annuler
                                            </button>
                                            <button onClick={handleTransferConfirm} disabled={transferLoading || !transferAlpId}
                                                className="flex-1 py-2.5 rounded-xl text-sm font-bold bg-blue-500 text-white hover:bg-blue-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                                                {transferLoading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <ArrowRightLeft size={14} />}
                                                {transferLoading ? "..." : "Transférer"}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="divide-y overflow-y-auto max-h-[520px]">
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

                                const ArcRow = ({ arc }) => (
                                    <div className={`flex items-center gap-2.5 pl-10 pr-4 py-3 ${isDark ? "bg-purple-500/3 border-slate-800/60" : "bg-purple-50/60 border-slate-100"}`}>
                                        <div className="w-1.5 h-1.5 rounded-full bg-purple-400 shrink-0 ml-1" />
                                        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-500 to-violet-500 flex items-center justify-center text-white font-black text-[10px] shrink-0">
                                            {((arc.firstname?.[0]||"")+(arc.lastname?.[0]||"")).toUpperCase()||"?"}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className={`font-semibold text-sm truncate ${textPrimary}`}>{arc.firstname} {arc.lastname}</p>
                                            <p className={`text-[11px] truncate ${textMuted}`}>{arc.email}</p>
                                        </div>
                                        <div className="flex items-center gap-1 shrink-0">
                                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${isDark ? "bg-purple-500/10 text-purple-400 border border-purple-500/20" : "bg-purple-50 text-purple-600 border border-purple-200"}`}>ARC</span>
                                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${arc.status === "ACTIF" ? isDark ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-emerald-50 text-emerald-600 border border-emerald-200" : isDark ? "bg-red-500/10 text-red-400 border border-red-500/20" : "bg-red-50 text-red-600 border border-red-200"}`}>
                                                {arc.status === "ACTIF" ? "Actif" : "Bloqué"}
                                            </span>
                                            <button onClick={() => { setTransferTarget({ id: arc.id, name: `${arc.firstname} ${arc.lastname}`, currentAlpId: arc.alpId }); setTransferAlpId(""); setTransferError(""); }}
                                                title="Transférer vers un autre ALP"
                                                className={`p-1 rounded-md transition-all ${isDark ? "text-blue-400 hover:bg-blue-500/10" : "text-blue-500 hover:bg-blue-50"}`}>
                                                <ArrowRightLeft size={13} />
                                            </button>
                                            {arc.status === "SUSPENDU" ? (
                                                <button onClick={() => handleUnblock(arc.id)} title="Débloquer"
                                                    className={`p-1 rounded-md transition-all ${isDark ? "text-emerald-400 hover:bg-emerald-500/10" : "text-emerald-600 hover:bg-emerald-50"}`}>
                                                    <Unlock size={13} />
                                                </button>
                                            ) : (
                                                <button onClick={() => setBlockTarget({ id: arc.id, name: `${arc.firstname} ${arc.lastname}` })} title="Bloquer"
                                                    className={`p-1 rounded-md transition-all ${isDark ? "text-red-400 hover:bg-red-500/10" : "text-red-500 hover:bg-red-50"}`}>
                                                    <Lock size={13} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );

                                return (
                                    <>
                                        {alps.map(alp => {
                                            const myArcs = arcs.filter(a => a.alpId === alp.id);
                                            return (
                                                <div key={alp.id}>
                                                    {/* Ligne ALP */}
                                                    <div className={`flex items-center gap-3 px-4 py-3.5 ${isDark ? "border-slate-800/80" : "border-slate-100"}`}>
                                                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white font-black text-sm shrink-0">
                                                            {((alp.firstname?.[0]||"")+(alp.lastname?.[0]||"")).toUpperCase()||"?"}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2">
                                                                <p className={`font-bold text-sm truncate ${textPrimary}`}>{alp.firstname} {alp.lastname}</p>
                                                                {myArcs.length > 0 && <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold shrink-0 ${isDark ? "bg-purple-500/10 text-purple-400" : "bg-purple-100 text-purple-600"}`}>{myArcs.length} ARC{myArcs.length>1?"s":""}</span>}
                                                            </div>
                                                            <p className={`text-xs truncate ${textMuted}`}>{alp.email}{alp.sector ? ` · ${alp.sector}` : ""}</p>
                                                        </div>
                                                        <div className="flex items-center gap-1 shrink-0">
                                                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${isDark ? "bg-orange-500/10 text-orange-400 border border-orange-500/20" : "bg-orange-50 text-orange-600 border border-orange-200"}`}>ALP</span>
                                                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${alp.status === "ACTIF" ? isDark ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-emerald-50 text-emerald-600 border border-emerald-200" : isDark ? "bg-red-500/10 text-red-400 border border-red-500/20" : "bg-red-50 text-red-600 border border-red-200"}`}>
                                                                {alp.status === "ACTIF" ? "Actif" : "Bloqué"}
                                                            </span>
                                                            {alp.status === "SUSPENDU" ? (
                                                                <button onClick={() => handleUnblock(alp.id)} title="Débloquer"
                                                                    className={`p-1 rounded-md transition-all ${isDark ? "text-emerald-400 hover:bg-emerald-500/10" : "text-emerald-600 hover:bg-emerald-50"}`}>
                                                                    <Unlock size={13} />
                                                                </button>
                                                            ) : (
                                                                <button onClick={() => setBlockTarget({ id: alp.id, name: `${alp.firstname} ${alp.lastname}` })} title="Bloquer"
                                                                    className={`p-1 rounded-md transition-all ${isDark ? "text-red-400 hover:bg-red-500/10" : "text-red-500 hover:bg-red-50"}`}>
                                                                    <Lock size={13} />
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                    {myArcs.map(arc => <ArcRow key={arc.id} arc={arc} />)}
                                                </div>
                                            );
                                        })}
                                        {standalone.length > 0 && (
                                            <div>
                                                <div className={`px-4 py-2 ${isDark ? "bg-white/2" : "bg-slate-50"}`}>
                                                    <p className={`text-[10px] font-bold uppercase tracking-wider ${textMuted}`}>ARCs sans ALP référent</p>
                                                </div>
                                                {standalone.map(arc => <ArcRow key={arc.id} arc={arc} />)}
                                            </div>
                                        )}
                                    </>
                                );
                            })()}
                        </div>
                    </div>
                </div>
            )}

            {/* ── Onglet Support ── */}
            {adminTab === "support" && (
                <div className={`rounded-2xl border overflow-hidden ${isDark ? "bg-[#0f1129] border-slate-800" : "bg-white border-slate-200 shadow-sm"}`}
                     style={{ height: "calc(100vh - 260px)", minHeight: 400 }}>
                    <div className="flex h-full">

                        {/* ── Liste conversations (gauche sur desktop, plein écran mobile si pas de conv active) ── */}
                        <div className={`${activeSupport ? "hidden md:flex" : "flex"} flex-col w-full md:w-72 md:flex-shrink-0 border-r ${isDark ? "border-slate-800" : "border-slate-200"}`}>
                            {/* Header liste */}
                            <div className={`px-4 py-3.5 border-b flex items-center justify-between shrink-0 ${isDark ? "border-slate-800" : "border-slate-100"}`}>
                                <div className="flex items-center gap-2.5">
                                    <div className={`p-1.5 rounded-lg ${isDark ? "bg-red-500/10" : "bg-red-50"}`}>
                                        <MessageSquare size={14} className="text-red-500" />
                                    </div>
                                    <p className={`font-black text-sm ${isDark ? "text-white" : "text-slate-800"}`}>Support</p>
                                    {unreadSupport > 0 && (
                                        <span className="bg-red-500 text-white text-[10px] font-black rounded-full px-1.5 py-0.5 min-w-[1.1rem] text-center leading-none">
                                            {unreadSupport > 99 ? "99+" : unreadSupport}
                                        </span>
                                    )}
                                </div>
                                <button onClick={fetchSupportChannels}
                                    className={`p-1.5 rounded-lg transition-colors ${isDark ? "bg-white/5 text-slate-400 hover:bg-white/10" : "bg-slate-100 text-slate-500 hover:bg-slate-200"}`}>
                                    <RefreshCw size={13} />
                                </button>
                            </div>

                            {/* Channels */}
                            <div className="flex-1 overflow-y-auto">
                                {supportLoading ? (
                                    <div className="flex justify-center py-8"><Spinner size="sm" color="warning" /></div>
                                ) : supportChannels.length === 0 ? (
                                    <div className={`flex flex-col items-center justify-center py-16 gap-3 ${textMuted}`}>
                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${isDark ? "bg-white/5" : "bg-slate-100"}`}>
                                            <MessageSquare size={24} className="opacity-30" />
                                        </div>
                                        <p className="text-sm font-medium">Aucune demande</p>
                                        <p className="text-xs opacity-60">Les utilisateurs bloqués apparaîtront ici</p>
                                    </div>
                                ) : supportChannels.map(ch => {
                                    const initials = ((ch.userFirstname?.[0]||"")+(ch.userLastname?.[0]||"")).toUpperCase()||"?";
                                    const active = activeSupport?.id === ch.id;
                                    return (
                                        <button key={ch.id} onClick={() => openSupportChannel(ch)}
                                            className={`w-full flex items-center gap-3 px-4 py-3.5 text-left transition-all border-b ${
                                                active
                                                    ? isDark ? "bg-orange-500/10 border-l-2 border-l-orange-500 border-slate-800" : "bg-orange-50 border-l-2 border-l-orange-500 border-slate-100"
                                                    : isDark ? "hover:bg-white/3 border-slate-800" : "hover:bg-slate-50 border-slate-100"
                                            }`}>
                                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center text-white font-black text-sm shrink-0 shadow-sm">
                                                {initials}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className={`font-bold text-sm truncate ${isDark ? "text-white" : "text-slate-800"}`}>{ch.userFirstname} {ch.userLastname}</p>
                                                <p className={`text-xs truncate mt-0.5 ${isDark ? "text-slate-500" : "text-slate-400"}`}>{ch.lastMessage || "Nouvelle demande"}</p>
                                            </div>
                                            {ch.unreadCount > 0 && (
                                                <span className="w-5 h-5 rounded-full bg-orange-500 text-white text-[10px] font-black flex items-center justify-center shrink-0">{ch.unreadCount}</span>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* ── Zone chat (droite sur desktop, plein écran mobile si conv active) ── */}
                        <div className={`${activeSupport ? "flex" : "hidden md:flex"} flex-1 flex-col min-w-0`}>
                            {activeSupport ? (
                                <>
                                    {/* Header chat */}
                                    <div className={`px-4 py-3.5 border-b flex items-center gap-3 shrink-0 ${isDark ? "border-slate-800" : "border-slate-100"}`}>
                                        {/* Bouton retour mobile */}
                                        <button
                                            onClick={() => setActiveSupport(null)}
                                            className={`md:hidden p-1.5 rounded-lg mr-1 transition-colors ${isDark ? "text-slate-400 hover:bg-white/5" : "text-slate-500 hover:bg-slate-100"}`}>
                                            <ChevronLeft size={18} />
                                        </button>
                                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center text-white font-black text-xs shrink-0 shadow-sm">
                                            {((activeSupport.userFirstname?.[0]||"")+(activeSupport.userLastname?.[0]||"")).toUpperCase()||"?"}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className={`font-bold text-sm truncate ${isDark ? "text-white" : "text-slate-800"}`}>{activeSupport.userFirstname} {activeSupport.userLastname}</p>
                                            <p className={`text-xs truncate ${isDark ? "text-red-400" : "text-red-500"}`}>Compte suspendu · {activeSupport.userEmail}</p>
                                        </div>
                                    </div>

                                    {/* Messages */}
                                    <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">
                                        {supportMessages.length === 0 ? (
                                            <div className={`flex flex-col items-center justify-center h-full gap-3 ${textMuted}`}>
                                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${isDark ? "bg-white/5" : "bg-slate-100"}`}>
                                                    <MessageSquare size={22} className="opacity-30" />
                                                </div>
                                                <p className="text-sm">Aucun message pour l'instant</p>
                                            </div>
                                        ) : supportMessages.map(msg => (
                                            <div key={msg.id} className={`flex gap-2.5 ${msg.fromAdmin ? "flex-row-reverse" : "flex-row"}`}>
                                                <div className={`w-7 h-7 rounded-xl flex items-center justify-center text-white font-black text-[10px] shrink-0 shadow-sm ${msg.fromAdmin ? "bg-gradient-to-br from-orange-500 to-amber-500" : "bg-gradient-to-br from-red-500 to-rose-600"}`}>
                                                    {msg.fromAdmin ? "A" : ((activeSupport.userFirstname?.[0]||"")+(activeSupport.userLastname?.[0]||"")).toUpperCase()||"?"}
                                                </div>
                                                <div className={`max-w-[75%] sm:max-w-[65%] flex flex-col gap-1 ${msg.fromAdmin ? "items-end" : "items-start"}`}>
                                                    <div className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                                                        msg.fromAdmin
                                                            ? "bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-tr-sm shadow-sm shadow-orange-500/20"
                                                            : isDark ? "bg-white/8 text-slate-200 border border-white/8 rounded-tl-sm" : "bg-slate-100 text-slate-700 rounded-tl-sm"
                                                    }`}>
                                                        {msg.content}
                                                    </div>
                                                    <p className={`text-[10px] px-1 ${isDark ? "text-slate-600" : "text-slate-400"}`}>
                                                        {msg.sentAt ? new Date(msg.sentAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }) : ""}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                        <div ref={supportEndRef} />
                                    </div>

                                    {/* Input */}
                                    <div className={`flex items-end gap-2 px-4 py-3.5 border-t shrink-0 ${isDark ? "border-slate-800" : "border-slate-100"}`}>
                                        <textarea
                                            value={supportInput}
                                            onChange={e => setSupportInput(e.target.value)}
                                            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendSupportMessage(); } }}
                                            rows={1}
                                            placeholder="Écrire une réponse..."
                                            className={`flex-1 resize-none rounded-xl px-4 py-2.5 text-sm focus:outline-none transition-all ${isDark ? "bg-white/8 border border-white/10 text-white placeholder:text-slate-600 focus:border-orange-500/40" : "bg-slate-50 border border-slate-200 text-slate-800 placeholder:text-slate-400 focus:border-orange-400"}`}
                                            style={{ fieldSizing: "content", minHeight: 42, maxHeight: 100 }}
                                        />
                                        <button onClick={sendSupportMessage} disabled={supportSending || !supportInput.trim()}
                                            className="w-10 h-10 shrink-0 flex items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 text-white disabled:opacity-40 hover:brightness-110 transition-all shadow-sm shadow-orange-500/20">
                                            {supportSending ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Send size={15} />}
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <div className={`flex-1 flex flex-col items-center justify-center gap-3 ${textMuted}`}>
                                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${isDark ? "bg-white/5" : "bg-slate-100"}`}>
                                        <MessageSquare size={28} className="opacity-25" />
                                    </div>
                                    <p className="text-sm font-medium">Sélectionnez une conversation</p>
                                    <p className="text-xs opacity-60">Choisissez un utilisateur dans la liste</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {adminTab === "overview" && (<>

            {error && <p className="text-danger mb-4">{error}</p>}

            {isLoading ? (
                <div className="flex justify-center items-center min-h-[300px]">
                    <Spinner size="lg" color="warning" label="Chargement..." />
                </div>
            ) : filter === "pending" ? (() => {
                // ── Vue liste plate des demandes en attente ──────────────────────────
                const pendingVehicles = users.flatMap(u =>
                    (u.vehicles||[]).filter(v => v.status === "en_attente").map(v => ({ ...v, _owner: u }))
                );
                const pendingDocs = users.flatMap(u =>
                    (u.documents||[]).filter(d => d.status === "en_attente").map(d => ({ ...d, _owner: u }))
                );
                const totalPending = pendingVehicles.length + pendingDocs.length + pendingReservations.length;

                if (totalPending === 0) return (
                    <div className={`flex flex-col items-center justify-center min-h-[300px] gap-3 ${textMuted}`}>
                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${isDark ? "bg-emerald-500/10" : "bg-emerald-50"}`}>
                            <CheckCircle size={32} className="text-emerald-500" />
                        </div>
                        <p className={`text-base font-bold ${textPrimary}`}>Tout est à jour !</p>
                        <p className="text-sm">Aucun véhicule ni document en attente de validation.</p>
                    </div>
                );

                const OwnerBadge = ({ owner }) => (
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-orange-500 to-yellow-400 flex items-center justify-center text-white font-bold text-[10px] shrink-0">
                            {((owner.firstname?.[0]||"")+(owner.lastname?.[0]||"")).toUpperCase()||"?"}
                        </div>
                        <span className={`text-xs font-semibold ${textMuted}`}>{owner.firstname} {owner.lastname}</span>
                        <span className={`text-[10px] ${textMuted}`}>·</span>
                        <span className={`text-[10px] ${textMuted}`}>{owner.email}</span>
                    </div>
                );

                return (
                    <div className="space-y-8">
                        {/* ── Véhicules en attente ── */}
                        {pendingVehicles.length > 0 && (
                            <div>
                                <div className="flex items-center gap-3 mb-4">
                                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl ${isDark ? "bg-orange-500/10" : "bg-orange-50"}`}>
                                        <Car size={15} className="text-orange-500" />
                                        <span className={`text-sm font-bold ${isDark ? "text-orange-400" : "text-orange-600"}`}>Véhicules en attente</span>
                                        <span className="bg-orange-500 text-white text-[10px] font-black rounded-full px-1.5 py-0.5 min-w-[1.1rem] text-center leading-none">
                                            {pendingVehicles.length}
                                        </span>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                    {pendingVehicles.map(v => {
                                        const firstImg = v.images?.[0] ? resolveUrl(v.images[0]) : null;
                                        return (
                                            <div key={v.id} className={`rounded-2xl border overflow-hidden ${cardBg}`}>
                                                {/* Photo + infos */}
                                                <button type="button" onClick={() => setSelectedVehicle(v)}
                                                    className="w-full flex gap-3 items-start p-4 text-left hover:opacity-90 transition group">
                                                    <div className="w-24 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-slate-100">
                                                        {firstImg
                                                            ? <img src={firstImg} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                                            : <div className={`w-full h-full flex items-center justify-center ${isDark ? "bg-slate-800" : "bg-slate-100"}`}><Car size={20} className={textMuted} /></div>
                                                        }
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 flex-wrap mb-1">
                                                            <span className={`font-bold text-sm ${textPrimary}`}>{v.brand} {v.model}</span>
                                                            <code className={`text-[11px] px-1.5 py-0.5 rounded-md font-mono ${isDark ? "bg-orange-500/10 text-orange-400" : "bg-orange-50 text-orange-600"}`}>{v.plateNumber}</code>
                                                        </div>
                                                        <div className={`flex flex-wrap gap-x-3 gap-y-0.5 text-xs mb-2 ${textMuted}`}>
                                                            {v.fuel && <span className="flex items-center gap-1"><Fuel size={10}/>{v.fuel}</span>}
                                                            {v.mileage && <span className="flex items-center gap-1"><Gauge size={10}/>{v.mileage?.toLocaleString("fr-FR")} km</span>}
                                                            {v.baseDailyPrice && <span className="font-semibold">{v.baseDailyPrice}€/j</span>}
                                                            {v.images?.length > 0 && <span>{v.images.length} photo{v.images.length > 1 ? "s" : ""}</span>}
                                                        </div>
                                                        <OwnerBadge owner={v._owner} />
                                                    </div>
                                                    <span className={`text-xs shrink-0 mt-1 ${isDark ? "text-orange-400" : "text-orange-500"}`}>Voir →</span>
                                                </button>
                                                {/* Actions */}
                                                <div className={`flex gap-2 px-4 pb-4 pt-0 border-t ${divider} mt-0 pt-3`}>
                                                    <Button size="sm" className="flex-1 bg-emerald-500 text-white font-bold"
                                                        startContent={<CheckCircle size={13}/>}
                                                        onPress={() => handleVehicleApprove(v.id)}>
                                                        Approuver
                                                    </Button>
                                                    <Button size="sm" color="danger" variant="flat" className="flex-1 font-bold"
                                                        startContent={<XCircle size={13}/>}
                                                        onPress={() => setRejectTarget({ type:"vehicle", id:v.id, title:`Rejeter ${v.brand} ${v.model}` })}>
                                                        Rejeter
                                                    </Button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* ── Réservations en attente ── */}
                        {pendingReservations.length > 0 && (
                            <div>
                                <div className="flex items-center gap-3 mb-4">
                                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl ${isDark ? "bg-purple-500/10" : "bg-purple-50"}`}>
                                        <CalendarCheck size={15} className="text-purple-500" />
                                        <span className={`text-sm font-bold ${isDark ? "text-purple-400" : "text-purple-600"}`}>Réservations en attente</span>
                                        <span className="bg-purple-500 text-white text-[10px] font-black rounded-full px-1.5 py-0.5 min-w-[1.1rem] text-center leading-none">
                                            {pendingReservations.length}
                                        </span>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                    {pendingReservations.map(r => {
                                        const actionKey = resActionLoading[r.id];
                                        const fmtDate = (d) => d ? new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" }) : "—";
                                        const nights = r.startDate && r.endDate
                                            ? Math.max(1, Math.round((new Date(r.endDate) - new Date(r.startDate)) / 86400000))
                                            : null;
                                        return (
                                            <div key={r.id} className={`rounded-2xl border overflow-hidden ${cardBg}`}>
                                                <div className="p-4">
                                                    {/* Client */}
                                                    <div className="flex items-start gap-3 mb-3">
                                                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center text-white font-black text-sm shrink-0">
                                                            {(r.customerName || "?").split(" ").map(p => p[0]).join("").toUpperCase().slice(0,2)}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className={`font-bold text-sm truncate ${textPrimary}`}>{r.customerName || "Client"}</p>
                                                            <p className={`text-xs truncate ${textMuted}`}>{r.customerEmail}</p>
                                                        </div>
                                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${isDark ? "bg-orange-500/10 text-orange-400 border border-orange-500/20" : "bg-orange-50 text-orange-600 border border-orange-200"}`}>
                                                            En attente
                                                        </span>
                                                    </div>
                                                    {/* Véhicule */}
                                                    <div className={`rounded-xl px-3 py-2.5 mb-3 ${isDark ? "bg-white/5" : "bg-slate-50"}`}>
                                                        <p className={`text-xs font-bold ${textPrimary}`}>{r.vehicleBrand} {r.vehicleModel}</p>
                                                        <p className={`text-xs mt-0.5 ${textMuted}`}>
                                                            {fmtDate(r.startDate)} → {fmtDate(r.endDate)}
                                                            {nights && <span className="ml-1.5 opacity-60">({nights} nuit{nights > 1 ? "s" : ""})</span>}
                                                        </p>
                                                    </div>
                                                    {/* Montant */}
                                                    {r.totalAmount && (
                                                        <p className={`text-base font-black mb-3 ${textPrimary}`}>
                                                            {Number(r.totalAmount).toLocaleString("fr-FR")} €
                                                            <span className={`text-xs font-normal ml-1 ${textMuted}`}>total</span>
                                                        </p>
                                                    )}
                                                </div>
                                                {/* Actions */}
                                                <div className={`flex gap-2 px-4 pb-4 border-t ${divider} pt-3`}>
                                                    <Button size="sm" className="flex-1 bg-emerald-500 text-white font-bold"
                                                        isLoading={actionKey === "approve"}
                                                        isDisabled={!!actionKey}
                                                        startContent={!actionKey && <CheckCircle size={13}/>}
                                                        onPress={() => handleResApprove(r.id)}>
                                                        Confirmer
                                                    </Button>
                                                    <Button size="sm" color="danger" variant="flat" className="flex-1 font-bold"
                                                        isLoading={actionKey === "reject"}
                                                        isDisabled={!!actionKey}
                                                        startContent={!actionKey && <XCircle size={13}/>}
                                                        onPress={() => setRejectTarget({ type: "reservation", id: r.id, title: `Refuser la réservation · ${r.vehicleBrand} ${r.vehicleModel}` })}>
                                                        Refuser
                                                    </Button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* ── Documents en attente ── */}
                        {pendingDocs.length > 0 && (
                            <div>
                                <div className="flex items-center gap-3 mb-4">
                                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl ${isDark ? "bg-blue-500/10" : "bg-blue-50"}`}>
                                        <FileText size={15} className="text-blue-500" />
                                        <span className={`text-sm font-bold ${isDark ? "text-blue-400" : "text-blue-600"}`}>Documents en attente</span>
                                        <span className="bg-blue-500 text-white text-[10px] font-black rounded-full px-1.5 py-0.5 min-w-[1.1rem] text-center leading-none">
                                            {pendingDocs.length}
                                        </span>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                    {pendingDocs.map(d => (
                                        <div key={d.id} className={`rounded-2xl border overflow-hidden ${cardBg}`}>
                                            <a href={resolveUrl(d.fileUrl)} target="_blank" rel="noopener noreferrer"
                                                className="flex items-start gap-3 p-4 hover:opacity-90 transition group">
                                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${isDark ? "bg-blue-500/10 border border-blue-500/20" : "bg-blue-50 border border-blue-100"}`}>
                                                    <FileText size={20} className={isDark ? "text-blue-400" : "text-blue-500"} />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className={`font-bold text-sm mb-1 ${textPrimary}`}>{docTypeLabel[d.type] || d.type}</p>
                                                    <p className={`text-xs mb-2 ${textMuted}`}>
                                                        {d.scope && <span>{d.scope} · </span>}
                                                        {d.issueDate && <span>Émis le {d.issueDate} · </span>}
                                                        {d.expirationDate && <span>Expire le {d.expirationDate}</span>}
                                                    </p>
                                                    <OwnerBadge owner={d._owner} />
                                                </div>
                                                <span className={`text-xs shrink-0 mt-1 ${isDark ? "text-blue-400" : "text-blue-500"}`}>Ouvrir →</span>
                                            </a>
                                            <div className={`flex gap-2 px-4 pb-4 border-t ${divider} pt-3`}>
                                                <Button size="sm" className="flex-1 bg-emerald-500 text-white font-bold"
                                                    startContent={<CheckCircle size={13}/>}
                                                    onPress={() => handleDocApprove(d.id)}>
                                                    Valider
                                                </Button>
                                                <Button size="sm" color="danger" variant="flat" className="flex-1 font-bold"
                                                    startContent={<XCircle size={13}/>}
                                                    onPress={() => setRejectTarget({ type:"document", id:d.id, title:`Rejeter « ${docTypeLabel[d.type]||d.type} »` })}>
                                                    Rejeter
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                );
            })() : (
                // ── Vue "Tout voir" : accordion par utilisateur ──────────────────────
                filteredUsers.length === 0 ? (
                    <div className={`flex flex-col items-center justify-center min-h-[300px] gap-2 ${textMuted}`}>
                        <CheckCircle size={48} />
                        <p className="text-lg font-medium">Aucun élément</p>
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
                                                                            <Chip size="sm" variant="flat" color={vehicleStatusColor[v.status]||"default"}>{vehicleStatusLabel[v.status]||v.status}</Chip>
                                                                        </div>
                                                                        <div className={`flex gap-3 text-xs mt-1 ${textMuted}`}>
                                                                            <span className="flex items-center gap-1"><Fuel size={11}/>{v.fuel}</span>
                                                                            <span className="flex items-center gap-1"><Gauge size={11}/>{v.mileage} km</span>
                                                                            <span className="font-semibold">{v.baseDailyPrice}€/j</span>
                                                                        </div>
                                                                        {v.rejectionReason && <p className={`text-xs mt-1 flex items-center gap-1 ${isDark?"text-red-400":"text-red-600"}`}><AlertCircle size={11}/> {v.rejectionReason}</p>}
                                                                    </div>
                                                                    <span className={`text-xs ${textMuted} flex-shrink-0`}>Voir →</span>
                                                                </button>
                                                                {v.status === "en_attente" && (
                                                                    <div className="flex gap-2 px-3 pb-3">
                                                                        <Button size="sm" className="bg-emerald-500 text-white font-semibold" startContent={<CheckCircle size={13}/>} onPress={() => handleVehicleApprove(v.id)}>Approuver</Button>
                                                                        <Button size="sm" color="danger" variant="flat" startContent={<XCircle size={13}/>} onPress={() => setRejectTarget({ type:"vehicle", id:v.id, title:`Rejeter ${v.brand} ${v.model}` })}>Rejeter</Button>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}
                                        {userRow.documents?.length > 0 && (
                                            <div className="mt-4">
                                                <p className={`text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-2 ${textMuted}`}>
                                                    <FileText size={14}/> Documents
                                                </p>
                                                <div className="flex flex-col gap-3">
                                                    {userRow.documents.map(d => (
                                                        <div key={d.id} className={`rounded-xl ${innerBg} overflow-hidden`}>
                                                            <a href={resolveUrl(d.fileUrl)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 hover:opacity-80 transition">
                                                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${isDark?"bg-slate-800":"bg-slate-200"}`}><FileText size={18} className={textMuted}/></div>
                                                                <div className="flex-1 min-w-0">
                                                                    <div className="flex items-center gap-2 flex-wrap">
                                                                        <span className={`font-semibold ${textPrimary}`}>{docTypeLabel[d.type]||d.type}</span>
                                                                        <Chip size="sm" variant="flat" color={docStatusColor[d.status]||"default"}>{docStatusLabel[d.status]||d.status}</Chip>
                                                                    </div>
                                                                    <p className={`text-xs mt-0.5 ${textMuted}`}>{d.scope}{d.issueDate && ` · Émis le ${d.issueDate}`}{d.expirationDate && ` · Expire le ${d.expirationDate}`}</p>
                                                                    {d.rejectionReason && <p className={`text-xs mt-1 flex items-center gap-1 ${isDark?"text-red-400":"text-red-600"}`}><AlertCircle size={11}/> {d.rejectionReason}</p>}
                                                                </div>
                                                                <span className={`text-xs ${textMuted} flex-shrink-0`}>Ouvrir →</span>
                                                            </a>
                                                            {d.status === "en_attente" && (
                                                                <div className="flex gap-2 px-3 pb-3">
                                                                    <Button size="sm" className="bg-emerald-500 text-white font-semibold" startContent={<CheckCircle size={13}/>} onPress={() => handleDocApprove(d.id)}>Valider</Button>
                                                                    <Button size="sm" color="danger" variant="flat" startContent={<XCircle size={13}/>} onPress={() => setRejectTarget({ type:"document", id:d.id, title:`Rejeter « ${docTypeLabel[d.type]||d.type} »` })}>Rejeter</Button>
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
                )
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
