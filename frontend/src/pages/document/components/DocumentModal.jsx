import React, { useState, useEffect, useRef } from "react";
import { Modal, ModalContent, Button } from "@heroui/react";
import {
    CloudArrowUpIcon, DocumentIcon, XMarkIcon,
    CalendarDaysIcon, TruckIcon
} from "@heroicons/react/24/outline";
import { FileText, Tag, Car } from "lucide-react";
import { useTheme } from "@/theme/ThemeProvider";
import api from "@/services/auth/client";

function FieldLabel({ children, isDark }) {
    return (
        <span className={`text-[11px] font-semibold uppercase tracking-wider ${isDark ? "text-slate-400" : "text-slate-500"}`}>
            {children}
        </span>
    );
}

function SelectInput({ icon: Icon, value, onChange, options, error, isDark, disabled, placeholder }) {
    const isLight = !isDark;
    return (
        <div className="flex flex-col gap-1.5">
            <div className={`flex items-center gap-2 rounded-2xl border px-3 py-2.5 transition-all
                ${disabled ? "opacity-50 cursor-not-allowed" : ""}
                ${error
                    ? "border-red-500"
                    : isLight
                        ? "border-slate-200 focus-within:border-orange-400 bg-white"
                        : "border-white/10 focus-within:border-orange-400 bg-white/3"
                }`}>
                {Icon && <Icon className={`h-4 w-4 shrink-0 ${isLight ? "text-slate-400" : "text-slate-500"}`} />}
                <select
                    value={value}
                    onChange={onChange}
                    disabled={disabled}
                    className={`flex-1 bg-transparent text-sm focus:outline-none appearance-none cursor-pointer disabled:cursor-not-allowed
                        ${isLight ? "text-slate-800" : "text-white"} ${!value ? (isLight ? "text-slate-400" : "text-slate-500") : ""}`}
                >
                    <option value="">{placeholder || "Choisir..."}</option>
                    {options.map(o => (
                        <option key={o.value} value={o.value}
                            className={isLight ? "bg-white text-slate-800" : "bg-[#0e1535] text-white"}>
                            {o.label}
                        </option>
                    ))}
                </select>
            </div>
            {error && <p className="text-red-500 text-xs">{error}</p>}
        </div>
    );
}

function DateInput({ icon: Icon, value, onChange, error, isDark, min }) {
    const isLight = !isDark;
    return (
        <div className="flex flex-col gap-1.5">
            <div className={`flex items-center gap-2 rounded-2xl border px-3 py-2.5 transition-all
                ${error
                    ? "border-red-500"
                    : isLight
                        ? "border-slate-200 focus-within:border-orange-400 bg-white"
                        : "border-white/10 focus-within:border-orange-400 bg-white/3"
                }`}>
                {Icon && <Icon className={`h-4 w-4 shrink-0 ${isLight ? "text-slate-400" : "text-slate-500"}`} />}
                <input
                    type="date"
                    value={value}
                    onChange={onChange}
                    min={min}
                    className={`flex-1 bg-transparent text-sm focus:outline-none
                        ${isLight ? "text-slate-800 [color-scheme:light]" : "text-white [color-scheme:dark]"}`}
                />
            </div>
            {error && <p className="text-red-500 text-xs">{error}</p>}
        </div>
    );
}

const DOC_TYPE_LABEL = {
    permis:                "Permis de conduire",
    piece_identite:        "Pièce d'identité",
    justificatif_domicile: "Justificatif de domicile",
    facture:               "Facture",
    carte_grise:           "Carte grise",
    assurance:             "Assurance véhicule",
    contrat:               "Contrat",
    etat_des_lieux:        "État des lieux",
    photo_checklist:       "Photo checklist",
};

export const DocumentModal = ({ isOpen, onOpenChange, formData, setFormData, onSave, isEdit, isAdvancedUser = true }) => {
    const { isDark } = useTheme();
    const isLight = !isDark;
    const [errors, setErrors]         = useState({});
    const [vehicles, setVehicles]     = useState([]);
    const [selectedFile, setSelectedFile] = useState(null);
    const [saving, setSaving]         = useState(false);
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (isOpen) {
            api.get("/api/vehicles/my-fleet")
                .then(res => setVehicles(Array.isArray(res.data.content || res.data) ? (res.data.content || res.data) : []))
                .catch(() => setVehicles([]));
        }
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen) { setSelectedFile(null); setErrors({}); setSaving(false); }
    }, [isOpen]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.type !== "application/pdf") {
            setErrors(prev => ({ ...prev, file: "Seuls les fichiers PDF sont acceptés" }));
            return;
        }
        setSelectedFile(file);
        setFormData(prev => ({ ...prev, file }));
        setErrors(prev => ({ ...prev, file: undefined }));
    };

    const validate = () => {
        const e = {};
        if (isAdvancedUser && !formData.scope)           e.scope          = "Requis";
        if (!formData.type)                              e.type           = "Requis";
        if (!isEdit && !selectedFile)                    e.file           = "Le fichier PDF est requis";
        if (!formData.issueDate)                         e.issueDate      = "Requis";
        if (formData.expirationDate && formData.issueDate && formData.expirationDate < formData.issueDate)
                                                         e.expirationDate = "Doit être après l'émission";
        if (isAdvancedUser && formData.scope === "vehicule" && !formData.vehicleId)
                                                         e.vehicleId      = "Requis";
        return e;
    };

    const validateAndSave = async () => {
        const e = validate();
        if (Object.keys(e).length > 0) { setErrors(e); return; }
        setErrors({});
        setSaving(true);
        try { await onSave(); } finally { setSaving(false); }
    };

    const clearError = (field) => setErrors(prev => ({ ...prev, [field]: undefined }));

    const scopeOptions = [
        { value: "utilisateur", label: "Utilisateur" },
        { value: "vehicule",    label: "Véhicule" },
        { value: "reservation", label: "Réservation" },
    ];

    const typeOptionsBase = [
        { value: "permis",                label: "Permis de conduire" },
        { value: "piece_identite",        label: "Pièce d'identité" },
        { value: "justificatif_domicile", label: "Justificatif de domicile" },
        { value: "facture",               label: "Facture" },
    ];
    const typeOptionsAdvanced = [
        { value: "carte_grise",    label: "Carte grise" },
        { value: "assurance",      label: "Assurance véhicule" },
        { value: "contrat",        label: "Contrat" },
        { value: "etat_des_lieux", label: "État des lieux" },
        { value: "photo_checklist",label: "Photo checklist" },
    ];
    const typeOptions = isAdvancedUser
        ? [...typeOptionsBase, ...typeOptionsAdvanced]
        : typeOptionsBase;

    const vehicleOptions = vehicles.map(v => ({ value: String(v.id), label: `${v.brand} ${v.model}` }));

    const typeLabel = formData.type ? DOC_TYPE_LABEL[formData.type] : null;

    return (
        <Modal
            isOpen={isOpen}
            onOpenChange={onOpenChange}
            size="xl"
            hideCloseButton
            scrollBehavior="inside"
            classNames={{
                base: `${isLight ? "bg-white" : "bg-[#080f28]"} shadow-2xl`,
                wrapper: "items-center",
            }}
        >
            <ModalContent>
                {(onClose) => (
                    <div className="flex flex-col overflow-hidden rounded-2xl">

                        {/* ── Bannière ── */}
                        <div className={`relative h-36 overflow-hidden flex-shrink-0 flex items-center justify-center
                            ${isLight ? "bg-gradient-to-br from-slate-100 to-orange-50" : "bg-gradient-to-br from-[#0d1533] to-[#111a3a]"}`}>

                            {/* Cercles décoratifs */}
                            <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-orange-500/8 pointer-events-none" />
                            <div className="absolute -bottom-10 -left-10 w-48 h-48 rounded-full bg-orange-500/5 pointer-events-none" />

                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />

                            {/* Bouton fermer */}
                            <button
                                onClick={onClose}
                                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white/80 hover:text-white hover:bg-black/60 transition-all"
                            >
                                <XMarkIcon className="h-4 w-4" />
                            </button>

                            {/* Contenu bannière */}
                            <div className="absolute bottom-0 left-0 right-0 px-5 pb-4">
                                <div className="flex items-end gap-3">
                                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0
                                        ${isLight ? "bg-orange-100" : "bg-orange-500/20"}`}>
                                        <FileText size={20} className="text-orange-500" />
                                    </div>
                                    <div>
                                        <p className="text-white text-xl font-bold leading-tight drop-shadow">
                                            {isEdit ? "Modifier le document" : "Nouveau document"}
                                        </p>
                                        {typeLabel && (
                                            <p className="text-orange-400 text-sm font-semibold drop-shadow">{typeLabel}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ── Corps ── */}
                        <div className={`px-5 py-5 flex flex-col gap-4 overflow-y-auto ${isLight ? "bg-white" : "bg-[#080f28]"}`}>

                            {/* Zone upload PDF */}
                            <div className="flex flex-col gap-2">
                                <FieldLabel isDark={isDark}>Fichier PDF {!isEdit && "*"}</FieldLabel>
                                <div
                                    onClick={() => fileInputRef.current.click()}
                                    className={`rounded-2xl border-2 border-dashed transition-all cursor-pointer
                                        ${errors.file
                                            ? "border-red-500 bg-red-500/5"
                                            : isLight
                                                ? "border-slate-200 hover:border-orange-400 bg-slate-50 hover:bg-orange-50"
                                                : "border-white/10 hover:border-orange-500/50 bg-white/3 hover:bg-orange-500/5"
                                        }`}
                                >
                                    <input type="file" ref={fileInputRef} hidden accept="application/pdf" onChange={handleFileChange} />
                                    {selectedFile ? (
                                        <div className="flex items-center gap-3 px-4 py-3">
                                            <div className={`p-2.5 rounded-xl flex-shrink-0 ${isLight ? "bg-orange-100" : "bg-orange-500/15"}`}>
                                                <DocumentIcon className="h-6 w-6 text-orange-500" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className={`text-sm font-semibold truncate ${isLight ? "text-slate-800" : "text-white"}`}>
                                                    {selectedFile.name}
                                                </p>
                                                <p className={`text-xs ${isLight ? "text-slate-400" : "text-slate-500"}`}>
                                                    {(selectedFile.size / 1024).toFixed(1)} KB · PDF
                                                </p>
                                            </div>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); setSelectedFile(null); setFormData(p => ({ ...p, file: null })); }}
                                                className={`w-7 h-7 rounded-full flex items-center justify-center transition-all flex-shrink-0
                                                    ${isLight ? "bg-slate-100 hover:bg-red-100 text-slate-400 hover:text-red-500" : "bg-white/8 hover:bg-red-500/15 text-slate-500 hover:text-red-400"}`}
                                            >
                                                <XMarkIcon className="h-4 w-4" />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center py-6 gap-2">
                                            <CloudArrowUpIcon className={`h-9 w-9 ${isLight ? "text-slate-300" : "text-slate-600"}`} />
                                            <p className={`text-sm font-medium ${isLight ? "text-slate-500" : "text-slate-400"}`}>
                                                Cliquez pour sélectionner un PDF
                                            </p>
                                            <p className={`text-xs ${isLight ? "text-slate-400" : "text-slate-600"}`}>
                                                Fichier PDF uniquement
                                            </p>
                                        </div>
                                    )}
                                </div>
                                {errors.file && <p className="text-red-500 text-xs">{errors.file}</p>}
                            </div>

                            {/* Domaine + Type */}
                            {isAdvancedUser ? (
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="flex flex-col gap-2">
                                        <FieldLabel isDark={isDark}>Domaine *</FieldLabel>
                                        <SelectInput
                                            icon={Tag}
                                            value={formData.scope || ""}
                                            onChange={e => { setFormData(p => ({ ...p, scope: e.target.value, vehicleId: "" })); clearError("scope"); }}
                                            options={scopeOptions}
                                            error={errors.scope}
                                            isDark={isDark}
                                        />
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <FieldLabel isDark={isDark}>Type de document *</FieldLabel>
                                        <SelectInput
                                            icon={FileText}
                                            value={formData.type || ""}
                                            onChange={e => { setFormData(p => ({ ...p, type: e.target.value })); clearError("type"); }}
                                            options={typeOptions}
                                            error={errors.type}
                                            isDark={isDark}
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-2">
                                    <FieldLabel isDark={isDark}>Type de document *</FieldLabel>
                                    <SelectInput
                                        icon={FileText}
                                        value={formData.type || ""}
                                        onChange={e => { setFormData(p => ({ ...p, type: e.target.value })); clearError("type"); }}
                                        options={typeOptions}
                                        error={errors.type}
                                        isDark={isDark}
                                    />
                                </div>
                            )}

                            {/* Dates */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="flex flex-col gap-2">
                                    <FieldLabel isDark={isDark}>Date d'émission *</FieldLabel>
                                    <DateInput
                                        icon={CalendarDaysIcon}
                                        value={formData.issueDate || ""}
                                        onChange={e => { setFormData(p => ({ ...p, issueDate: e.target.value })); clearError("issueDate"); }}
                                        error={errors.issueDate}
                                        isDark={isDark}
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <FieldLabel isDark={isDark}>Date d'expiration</FieldLabel>
                                    <DateInput
                                        icon={CalendarDaysIcon}
                                        value={formData.expirationDate || ""}
                                        onChange={e => { setFormData(p => ({ ...p, expirationDate: e.target.value })); clearError("expirationDate"); }}
                                        error={errors.expirationDate}
                                        min={formData.issueDate || undefined}
                                        isDark={isDark}
                                    />
                                </div>
                            </div>

                            {/* Véhicule lié */}
                            {isAdvancedUser && (
                                <div className="flex flex-col gap-2">
                                    <FieldLabel isDark={isDark}>
                                        Véhicule lié {formData.scope === "vehicule" && "*"}
                                    </FieldLabel>
                                    <SelectInput
                                        icon={Car}
                                        value={formData.vehicleId ? String(formData.vehicleId) : ""}
                                        onChange={e => { setFormData(p => ({ ...p, vehicleId: e.target.value })); clearError("vehicleId"); }}
                                        options={vehicleOptions}
                                        error={errors.vehicleId}
                                        isDark={isDark}
                                        disabled={formData.scope !== "vehicule"}
                                        placeholder={vehicles.length === 0 ? "Aucun véhicule" : "Choisir un véhicule"}
                                    />
                                </div>
                            )}

                            {/* Récap info */}
                            <div className={`rounded-2xl p-4 border ${isLight ? "bg-orange-50 border-orange-100" : "bg-orange-500/8 border-orange-500/15"}`}>
                                <p className={`text-sm text-center ${isLight ? "text-slate-500" : "text-slate-400"}`}>
                                    Le document sera soumis à validation par un administrateur avant d'être accepté.
                                </p>
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
                                    onPress={validateAndSave}
                                    isLoading={saving}
                                    startContent={!saving && <DocumentIcon className="h-4 w-4" />}
                                    className="flex-1 rounded-xl font-bold bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/30"
                                >
                                    {isEdit ? "Enregistrer" : "Ajouter le document"}
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </ModalContent>
        </Modal>
    );
};
