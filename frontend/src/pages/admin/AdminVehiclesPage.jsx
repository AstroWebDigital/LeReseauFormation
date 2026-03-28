import React, { useState, useEffect } from "react";
import api from "@/services/auth/client";
import {
    Button, Spinner, Chip,
    Modal, ModalContent, ModalHeader, ModalBody, ModalFooter,
    Textarea
} from "@heroui/react";
import {
    CheckCircle, XCircle, Car, Fuel, Settings2, Gauge,
    MapPin, ChevronDown, ChevronUp, FileText,
    ChevronLeft, ChevronRight, AlertCircle
} from "lucide-react";
import { useTheme } from "@/theme/ThemeProvider";

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

/* ─── Page principale ─── */
export default function AdminVehiclesPage() {
    const { isDark } = useTheme();
    const [users, setUsers]               = useState([]);
    const [isLoading, setIsLoading]       = useState(true);
    const [error, setError]               = useState(null);
    const [openUsers, setOpenUsers]       = useState({});
    const [filter, setFilter]             = useState("pending");
    const [selectedVehicle, setSelectedVehicle] = useState(null);

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

    useEffect(() => { fetchOverview(); }, []);

    const toggleUser = (id) => setOpenUsers(prev => ({ ...prev, [id]: !prev[id] }));

    const handleVehicleApprove = async (id) => {
        await api.put(`/api/admin/vehicles/${id}/approve`);
        fetchOverview();
    };

    const handleRejectConfirm = async (reason) => {
        if (!rejectTarget) return;
        const { type, id } = rejectTarget;
        if (type === "vehicle") {
            await api.put(`/api/admin/vehicles/${id}/reject`, { reason });
        } else {
            await api.put(`/api/admin/documents/${id}/reject`, { reason });
        }
        setRejectTarget(null);
        fetchOverview();
    };

    const handleDocApprove = async (id) => {
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
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className={`text-2xl font-bold ${textPrimary}`}>Administration</h1>
                    <p className={textMuted}>Véhicules et documents par utilisateur</p>
                </div>
                <div className="flex gap-2">
                    {["pending","all"].map(f => (
                        <Button key={f} size="sm"
                            variant={filter===f ? "solid" : "bordered"}
                            className={filter===f ? "bg-[#ff922b] text-white font-semibold" : isDark ? "border-slate-600 text-slate-300" : "border-slate-300 text-slate-600"}
                            onPress={() => setFilter(f)}>
                            {f==="pending" ? "En attente" : "Tout voir"}
                        </Button>
                    ))}
                </div>
            </div>

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
        </div>
    );
}
