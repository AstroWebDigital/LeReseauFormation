import React, { useState, useRef, useEffect } from "react";
import { Modal, ModalContent, Button } from "@heroui/react";
import { useTheme } from "@/theme/ThemeProvider";
import {
    Car, Fuel, Settings2, Gauge, MapPin, DollarSign,
    Hash, Tag, ImagePlus, X, CheckCircle, XMarkIcon
} from "lucide-react";
import { XMarkIcon as XMark } from "@heroicons/react/24/outline";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

function resolveUrl(url) {
    if (!url) return null;
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    return API_BASE_URL + url;
}

function FieldLabel({ children, isDark }) {
    return (
        <span className={`text-[11px] font-semibold uppercase tracking-wider ${isDark ? "text-slate-400" : "text-slate-500"}`}>
            {children}
        </span>
    );
}

function TextInput({ icon: Icon, value, onChange, placeholder, type = "text", min, endText, error, isDark }) {
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
                    type={type}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    min={min}
                    className={`flex-1 bg-transparent text-sm focus:outline-none ${isLight ? "text-slate-800 placeholder:text-slate-400" : "text-white placeholder:text-slate-500"}`}
                />
                {endText && <span className={`text-xs font-semibold shrink-0 ${isLight ? "text-slate-400" : "text-slate-500"}`}>{endText}</span>}
            </div>
            {error && <p className="text-red-500 text-xs">{error}</p>}
        </div>
    );
}

function SelectInput({ icon: Icon, value, onChange, options, error, isDark }) {
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
                <select
                    value={value}
                    onChange={onChange}
                    className={`flex-1 bg-transparent text-sm focus:outline-none appearance-none cursor-pointer ${isLight ? "text-slate-800" : "text-white"}`}
                >
                    <option value="">Choisir...</option>
                    {options.map(o => (
                        <option key={o} value={o} className={isLight ? "bg-white text-slate-800" : "bg-[#0e1535] text-white"}>{o}</option>
                    ))}
                </select>
            </div>
            {error && <p className="text-red-500 text-xs">{error}</p>}
        </div>
    );
}

export const VehicleModal = ({
    isOpen, onOpenChange, formData, setFormData,
    onSave, isEdit,
    selectedImages, setSelectedImages
}) => {
    const { isDark } = useTheme();
    const isLight = !isDark;
    const fileInputRef = useRef(null);
    const [errors, setErrors] = useState({});
    const [saving, setSaving] = useState(false);

    const vehicleTypes  = ["Compact", "Berline", "SUV", "Utilitaire", "Luxe"];
    const fuelTypes     = ["Essence", "Diesel", "Électrique", "Hybride"];
    const transmissions = ["Manuelle", "Automatique"];

    useEffect(() => {
        if (!isOpen) { setErrors({}); setSaving(false); }
    }, [isOpen]);

    const validate = () => {
        const e = {};
        if (!formData.brand?.trim())       e.brand          = "Requis";
        if (!formData.model?.trim())       e.model          = "Requis";
        if (!formData.plateNumber?.trim()) e.plateNumber    = "Requis";
        if (!formData.type)                e.type           = "Requis";
        if (!formData.fuel)                e.fuel           = "Requis";
        if (!formData.transmission)        e.transmission   = "Requis";
        if (!formData.baseDailyPrice || Number(formData.baseDailyPrice) <= 0)
                                           e.baseDailyPrice = "Prix > 0";
        if (formData.mileage === "" || formData.mileage == null || Number(formData.mileage) < 0)
                                           e.mileage        = "Requis ≥ 0";
        return e;
    };

    const handleSave = async () => {
        const e = validate();
        if (Object.keys(e).length > 0) { setErrors(e); return; }
        setErrors({});
        setSaving(true);
        try { await onSave(); } finally { setSaving(false); }
    };

    const clearError = (f) => { if (errors[f]) setErrors(p => ({ ...p, [f]: undefined })); };

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        setSelectedImages(prev => [...prev, ...files]);
        e.target.value = "";
    };

    const removeNewImage      = (i)   => setSelectedImages(prev => prev.filter((_, idx) => idx !== i));
    const removeExistingImage = (url) => setFormData(prev => ({ ...prev, images: (prev.images || []).filter(img => img !== url) }));

    const existingImages = formData.images || [];
    const allImages = [
        ...existingImages.map(resolveUrl),
        ...selectedImages.map(f => URL.createObjectURL(f)),
    ];
    const bannerImg = allImages[0] || null;
    const totalImages = existingImages.length + selectedImages.length;

    return (
        <Modal
            isOpen={isOpen}
            onOpenChange={onOpenChange}
            size="2xl"
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
                        <div className="relative h-40 overflow-hidden flex-shrink-0">
                            {bannerImg
                                ? <img src={bannerImg} alt="véhicule" className="w-full h-full object-cover" />
                                : (
                                    <div className={`w-full h-full flex items-center justify-center ${isLight ? "bg-slate-100" : "bg-[#0d1533]"}`}>
                                        <Car className={`h-16 w-16 ${isLight ? "text-slate-300" : "text-white/10"}`} />
                                    </div>
                                )
                            }
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                            {/* Bouton fermer */}
                            <button
                                onClick={onClose}
                                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white/80 hover:text-white hover:bg-black/60 transition-all"
                            >
                                <XMark className="h-4 w-4" />
                            </button>

                            {/* Info en bas de la bannière */}
                            <div className="absolute bottom-0 left-0 right-0 px-5 pb-4">
                                <p className="text-white text-xl font-bold leading-tight drop-shadow">
                                    {formData.brand
                                        ? <>{formData.brand} <span className="text-orange-400">{formData.model}</span></>
                                        : <span className="text-white/40">{isEdit ? "Modifier le véhicule" : "Nouveau véhicule"}</span>
                                    }
                                </p>
                                <div className="flex items-center gap-4 mt-1">
                                    {formData.fuel && (
                                        <span className="flex items-center gap-1 text-white/70 text-xs">
                                            <Fuel size={11} /> {formData.fuel}
                                        </span>
                                    )}
                                    {formData.mileage && (
                                        <span className="flex items-center gap-1 text-white/70 text-xs">
                                            <Gauge size={11} /> {Number(formData.mileage).toLocaleString("fr-FR")} km
                                        </span>
                                    )}
                                    {formData.baseDailyPrice && (
                                        <span className="ml-auto text-orange-400 font-bold text-sm drop-shadow">
                                            {formData.baseDailyPrice} € / jour
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* ── Corps ── */}
                        <div className={`px-5 py-5 flex flex-col gap-5 overflow-y-auto ${isLight ? "bg-white" : "bg-[#080f28]"}`}>

                            {/* Identité : Marque + Modèle */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="flex flex-col gap-2">
                                    <FieldLabel isDark={isDark}>Marque</FieldLabel>
                                    <TextInput
                                        icon={Tag}
                                        value={formData.brand || ""}
                                        onChange={e => { setFormData({ ...formData, brand: e.target.value }); clearError("brand"); }}
                                        placeholder="ex : Peugeot"
                                        error={errors.brand}
                                        isDark={isDark}
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <FieldLabel isDark={isDark}>Modèle</FieldLabel>
                                    <TextInput
                                        icon={Car}
                                        value={formData.model || ""}
                                        onChange={e => { setFormData({ ...formData, model: e.target.value }); clearError("model"); }}
                                        placeholder="ex : 308"
                                        error={errors.model}
                                        isDark={isDark}
                                    />
                                </div>
                            </div>

                            {/* Plaque + Type */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="flex flex-col gap-2">
                                    <FieldLabel isDark={isDark}>Plaque d'immatriculation</FieldLabel>
                                    <TextInput
                                        icon={Hash}
                                        value={formData.plateNumber || ""}
                                        onChange={e => { setFormData({ ...formData, plateNumber: e.target.value.toUpperCase() }); clearError("plateNumber"); }}
                                        placeholder="AB-123-CD"
                                        error={errors.plateNumber}
                                        isDark={isDark}
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <FieldLabel isDark={isDark}>Type de véhicule</FieldLabel>
                                    <SelectInput
                                        icon={Car}
                                        value={formData.type || ""}
                                        onChange={e => { setFormData({ ...formData, type: e.target.value }); clearError("type"); }}
                                        options={vehicleTypes}
                                        error={errors.type}
                                        isDark={isDark}
                                    />
                                </div>
                            </div>

                            {/* Carburant + Transmission + Kilométrage */}
                            <div className="grid grid-cols-3 gap-3">
                                <div className="flex flex-col gap-2">
                                    <FieldLabel isDark={isDark}>Carburant</FieldLabel>
                                    <SelectInput
                                        icon={Fuel}
                                        value={formData.fuel || ""}
                                        onChange={e => { setFormData({ ...formData, fuel: e.target.value }); clearError("fuel"); }}
                                        options={fuelTypes}
                                        error={errors.fuel}
                                        isDark={isDark}
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <FieldLabel isDark={isDark}>Transmission</FieldLabel>
                                    <SelectInput
                                        icon={Settings2}
                                        value={formData.transmission || ""}
                                        onChange={e => { setFormData({ ...formData, transmission: e.target.value }); clearError("transmission"); }}
                                        options={transmissions}
                                        error={errors.transmission}
                                        isDark={isDark}
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <FieldLabel isDark={isDark}>Kilométrage</FieldLabel>
                                    <TextInput
                                        icon={Gauge}
                                        type="number"
                                        value={formData.mileage ?? ""}
                                        onChange={e => { setFormData({ ...formData, mileage: e.target.value }); clearError("mileage"); }}
                                        placeholder="45 000"
                                        min={0}
                                        endText="km"
                                        error={errors.mileage}
                                        isDark={isDark}
                                    />
                                </div>
                            </div>

                            {/* Prix + Parking */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="flex flex-col gap-2">
                                    <FieldLabel isDark={isDark}>Prix journalier</FieldLabel>
                                    <TextInput
                                        icon={DollarSign}
                                        type="number"
                                        value={formData.baseDailyPrice ?? ""}
                                        onChange={e => { setFormData({ ...formData, baseDailyPrice: e.target.value }); clearError("baseDailyPrice"); }}
                                        placeholder="45"
                                        min={0}
                                        endText="€ / j"
                                        error={errors.baseDailyPrice}
                                        isDark={isDark}
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <FieldLabel isDark={isDark}>Lieu de stationnement</FieldLabel>
                                    <TextInput
                                        icon={MapPin}
                                        value={formData.defaultParkingLocation || ""}
                                        onChange={e => setFormData({ ...formData, defaultParkingLocation: e.target.value })}
                                        placeholder="ex : Parking Centre"
                                        isDark={isDark}
                                    />
                                </div>
                            </div>

                            {/* Photos */}
                            <div className="flex flex-col gap-2">
                                <FieldLabel isDark={isDark}>
                                    Photos du véhicule {totalImages > 0 && `(${totalImages})`}
                                </FieldLabel>
                                <div className={`rounded-2xl border p-3 ${isLight ? "border-slate-200 bg-slate-50" : "border-white/10 bg-white/3"}`}>
                                    <div className="flex flex-wrap gap-2">
                                        {existingImages.map((url) => (
                                            <div key={url} className="relative w-16 h-16 rounded-xl overflow-hidden group">
                                                <img src={resolveUrl(url)} alt="" className="w-full h-full object-cover" />
                                                <button
                                                    type="button"
                                                    onClick={() => removeExistingImage(url)}
                                                    className="absolute top-1 right-1 w-4 h-4 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
                                                >
                                                    <X size={9} />
                                                </button>
                                            </div>
                                        ))}
                                        {selectedImages.map((file, i) => (
                                            <div key={i} className="relative w-16 h-16 rounded-xl overflow-hidden group ring-2 ring-orange-400">
                                                <img src={URL.createObjectURL(file)} alt="" className="w-full h-full object-cover" />
                                                <button
                                                    type="button"
                                                    onClick={() => removeNewImage(i)}
                                                    className="absolute top-1 right-1 w-4 h-4 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
                                                >
                                                    <X size={9} />
                                                </button>
                                            </div>
                                        ))}
                                        <button
                                            type="button"
                                            onClick={() => fileInputRef.current?.click()}
                                            className={`w-16 h-16 rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-1 transition-all
                                                ${isLight
                                                    ? "border-slate-300 hover:border-orange-400 text-slate-400 hover:text-orange-400 hover:bg-orange-50"
                                                    : "border-white/15 hover:border-orange-500/60 text-slate-600 hover:text-orange-400 hover:bg-orange-500/5"
                                                }`}
                                        >
                                            <ImagePlus size={16} />
                                            <span className="text-[9px] font-bold">Ajouter</span>
                                        </button>
                                    </div>
                                    <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFileChange} />
                                </div>
                            </div>

                            {/* Récap / info */}
                            {!isEdit && (
                                <div className={`rounded-2xl p-4 border ${isLight ? "bg-orange-50 border-orange-100" : "bg-orange-500/8 border-orange-500/15"}`}>
                                    <p className={`text-sm text-center ${isLight ? "text-slate-500" : "text-slate-400"}`}>
                                        Le véhicule sera soumis à validation par un administrateur avant d'être publié.
                                    </p>
                                </div>
                            )}

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
                                    onPress={handleSave}
                                    isLoading={saving}
                                    startContent={!saving && <CheckCircle size={16} />}
                                    className="flex-1 rounded-xl font-bold bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/30"
                                >
                                    {isEdit ? "Enregistrer" : "Ajouter le véhicule"}
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </ModalContent>
        </Modal>
    );
};
