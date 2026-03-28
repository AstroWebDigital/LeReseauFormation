import React, { useState, useRef, useEffect } from "react";
import {
    Modal, ModalContent, ModalHeader, ModalBody, ModalFooter,
    Button, Input, Select, SelectItem
} from "@heroui/react";
import { useTheme } from "@/theme/ThemeProvider";
import { ImagePlus, X } from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

function resolveUrl(url) {
    if (!url) return null;
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    return API_BASE_URL + url;
}

export const VehicleModal = ({
    isOpen, onOpenChange, formData, setFormData,
    onSave, isEdit,
    selectedImages, setSelectedImages
}) => {
    const { isDark } = useTheme();
    const fileInputRef = useRef(null);
    const [errors, setErrors] = useState({});

    const vehicleTypes  = ["Compact", "Berline", "SUV", "Utilitaire", "Luxe"];
    const fuelTypes     = ["Essence", "Diesel", "Électrique", "Hybride"];
    const transmissions = ["Manuelle", "Automatique"];

    // Réinitialiser les erreurs à l'ouverture/fermeture
    useEffect(() => {
        if (!isOpen) setErrors({});
    }, [isOpen]);

    const validate = () => {
        const e = {};
        if (!formData.brand?.trim())                    e.brand               = "La marque est requise";
        if (!formData.model?.trim())                    e.model               = "Le modèle est requis";
        if (!formData.plateNumber?.trim())              e.plateNumber         = "La plaque d'immatriculation est requise";
        if (!formData.type)                             e.type                = "Le type de véhicule est requis";
        if (!formData.fuel)                             e.fuel                = "Le carburant est requis";
        if (!formData.transmission)                     e.transmission        = "La transmission est requise";
        if (!formData.baseDailyPrice || Number(formData.baseDailyPrice) <= 0)
                                                        e.baseDailyPrice      = "Le prix journalier doit être supérieur à 0";
        if (formData.mileage === "" || formData.mileage === undefined || formData.mileage === null || Number(formData.mileage) < 0)
                                                        e.mileage             = "Le kilométrage est requis (≥ 0)";
        return e;
    };

    const handleSave = () => {
        const e = validate();
        if (Object.keys(e).length > 0) { setErrors(e); return; }
        setErrors({});
        onSave();
    };

    const clearError = (field) => {
        if (errors[field]) setErrors(prev => ({ ...prev, [field]: undefined }));
    };

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        setSelectedImages(prev => [...prev, ...files]);
        e.target.value = "";
    };

    const removeNewImage      = (i)   => setSelectedImages(prev => prev.filter((_, idx) => idx !== i));
    const removeExistingImage = (url) => setFormData(prev => ({ ...prev, images: (prev.images || []).filter(img => img !== url) }));

    const existingImages = formData.images || [];

    // ── styles ──
    const inputBase = (field) => ({
        label: isDark ? "!text-white !opacity-100 font-bold text-sm" : "!text-slate-700 !opacity-100 font-bold text-sm",
        input: isDark ? "!text-white !placeholder-slate-500" : "!text-slate-900 !placeholder-slate-400",
        inputWrapper: errors[field]
            ? "border-red-500 bg-transparent transition-all"
            : isDark
                ? "border-slate-700 bg-transparent group-data-[focus=true]:border-orange-500 transition-all"
                : "border-slate-300 bg-white group-data-[focus=true]:border-orange-500 transition-all",
        innerWrapper: isDark ? "bg-transparent" : "bg-white",
        errorMessage: "text-red-500 text-xs mt-0.5",
    });

    const selectBase = (field) => ({
        label: isDark ? "!text-white !opacity-100 font-bold text-sm" : "!text-slate-700 !opacity-100 font-bold text-sm",
        trigger: errors[field]
            ? "border-red-500 bg-[#0f1129] transition-all min-h-[44px]"
            : isDark
                ? "border-slate-700 bg-[#0f1129] hover:border-orange-500 transition-all min-h-[44px]"
                : "border-slate-300 bg-white hover:border-orange-500 transition-all min-h-[44px]",
        value:        isDark ? "!text-white" : "!text-slate-900",
        innerWrapper: isDark ? "text-white" : "text-slate-900",
        popoverContent: isDark ? "bg-[#0f1129] border border-slate-800" : "bg-white border border-slate-200 shadow-lg",
        errorMessage: "text-red-500 text-xs mt-0.5",
    });

    const selectItemClass = isDark
        ? "text-white hover:bg-slate-800 focus:bg-slate-800"
        : "text-slate-800 hover:bg-slate-100 focus:bg-slate-100";

    const popoverClass = isDark
        ? { content: "bg-[#0f1129] border border-slate-800" }
        : { content: "bg-white border border-slate-200 shadow-lg" };

    return (
        <Modal
            isOpen={isOpen}
            onOpenChange={onOpenChange}
            size="2xl"
            scrollBehavior="inside"
            className={isDark ? "bg-[#0f1129] border border-slate-800" : "bg-white border border-slate-200"}
        >
            <ModalContent>
                {(onClose) => (
                    <>
                        <ModalHeader className={`text-xl font-bold ${isDark ? "text-white" : "text-slate-800"}`}>
                            {isEdit ? "Modifier le véhicule" : "Ajouter un véhicule"}
                        </ModalHeader>

                        <ModalBody className={`grid grid-cols-1 md:grid-cols-2 gap-4 py-6 ${isDark ? "" : "[&_input]:!text-slate-900"}`}>

                            {/* Marque */}
                            <Input label="Marque *" variant="bordered" labelPlacement="outside"
                                classNames={inputBase("brand")}
                                isInvalid={!!errors.brand} errorMessage={errors.brand}
                                value={formData.brand || ""}
                                onChange={(e) => { setFormData({ ...formData, brand: e.target.value }); clearError("brand"); }}
                            />

                            {/* Modèle */}
                            <Input label="Modèle *" variant="bordered" labelPlacement="outside"
                                classNames={inputBase("model")}
                                isInvalid={!!errors.model} errorMessage={errors.model}
                                value={formData.model || ""}
                                onChange={(e) => { setFormData({ ...formData, model: e.target.value }); clearError("model"); }}
                            />

                            {/* Plaque */}
                            <Input label="Plaque d'immatriculation *" variant="bordered" labelPlacement="outside"
                                classNames={inputBase("plateNumber")}
                                isInvalid={!!errors.plateNumber} errorMessage={errors.plateNumber}
                                value={formData.plateNumber || ""}
                                onChange={(e) => { setFormData({ ...formData, plateNumber: e.target.value }); clearError("plateNumber"); }}
                            />

                            {/* Type */}
                            <Select label="Type de véhicule *" variant="bordered" labelPlacement="outside"
                                classNames={selectBase("type")}
                                isInvalid={!!errors.type} errorMessage={errors.type}
                                selectedKeys={formData.type ? [formData.type] : []}
                                popoverProps={{ classNames: popoverClass }}
                                onChange={(e) => { setFormData({ ...formData, type: e.target.value }); clearError("type"); }}
                            >
                                {vehicleTypes.map(t => <SelectItem key={t} className={selectItemClass}>{t}</SelectItem>)}
                            </Select>

                            {/* Prix journalier */}
                            <Input label="Prix journalier (€) *" type="number" variant="bordered" labelPlacement="outside"
                                classNames={inputBase("baseDailyPrice")}
                                isInvalid={!!errors.baseDailyPrice} errorMessage={errors.baseDailyPrice}
                                value={formData.baseDailyPrice ?? ""}
                                min={0}
                                onChange={(e) => { setFormData({ ...formData, baseDailyPrice: e.target.value }); clearError("baseDailyPrice"); }}
                            />

                            {/* Kilométrage */}
                            <Input label="Kilométrage *" type="number" variant="bordered" labelPlacement="outside"
                                classNames={inputBase("mileage")}
                                isInvalid={!!errors.mileage} errorMessage={errors.mileage}
                                value={formData.mileage ?? ""}
                                min={0}
                                onChange={(e) => { setFormData({ ...formData, mileage: e.target.value }); clearError("mileage"); }}
                            />

                            {/* Parking */}
                            <Input label="Parking" variant="bordered" labelPlacement="outside"
                                classNames={inputBase("defaultParkingLocation")}
                                value={formData.defaultParkingLocation || ""}
                                onChange={(e) => setFormData({ ...formData, defaultParkingLocation: e.target.value })}
                            />

                            {/* Carburant */}
                            <Select label="Carburant *" variant="bordered" labelPlacement="outside"
                                classNames={selectBase("fuel")}
                                isInvalid={!!errors.fuel} errorMessage={errors.fuel}
                                selectedKeys={formData.fuel ? [formData.fuel] : []}
                                popoverProps={{ classNames: popoverClass }}
                                onChange={(e) => { setFormData({ ...formData, fuel: e.target.value }); clearError("fuel"); }}
                            >
                                {fuelTypes.map(f => <SelectItem key={f} className={selectItemClass}>{f}</SelectItem>)}
                            </Select>

                            {/* Transmission */}
                            <Select label="Transmission *" variant="bordered" labelPlacement="outside"
                                classNames={selectBase("transmission")}
                                isInvalid={!!errors.transmission} errorMessage={errors.transmission}
                                selectedKeys={formData.transmission ? [formData.transmission] : []}
                                popoverProps={{ classNames: popoverClass }}
                                onChange={(e) => { setFormData({ ...formData, transmission: e.target.value }); clearError("transmission"); }}
                            >
                                {transmissions.map(tr => <SelectItem key={tr} className={selectItemClass}>{tr}</SelectItem>)}
                            </Select>

                            {/* Photos */}
                            <div className="col-span-1 md:col-span-2">
                                <p className={`text-sm font-bold mb-2 ${isDark ? "text-white" : "text-slate-700"}`}>
                                    Photos du véhicule
                                </p>
                                <div className="flex flex-wrap gap-3 mb-3">
                                    {existingImages.map((url) => (
                                        <div key={url} className="relative w-24 h-24 rounded-xl overflow-hidden border border-slate-300 group">
                                            <img src={resolveUrl(url)} alt="photo" className="w-full h-full object-cover" />
                                            <button type="button" onClick={() => removeExistingImage(url)}
                                                className="absolute top-1 right-1 bg-black/60 rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <X size={12} className="text-white" />
                                            </button>
                                        </div>
                                    ))}
                                    {selectedImages.map((file, i) => (
                                        <div key={i} className="relative w-24 h-24 rounded-xl overflow-hidden border border-orange-400 group">
                                            <img src={URL.createObjectURL(file)} alt="preview" className="w-full h-full object-cover" />
                                            <button type="button" onClick={() => removeNewImage(i)}
                                                className="absolute top-1 right-1 bg-black/60 rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <X size={12} className="text-white" />
                                            </button>
                                        </div>
                                    ))}
                                    <button type="button" onClick={() => fileInputRef.current?.click()}
                                        className={`w-24 h-24 rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-1 transition-colors ${
                                            isDark ? "border-slate-600 hover:border-orange-500 text-slate-400 hover:text-orange-400"
                                                   : "border-slate-300 hover:border-orange-500 text-slate-400 hover:text-orange-500"
                                        }`}>
                                        <ImagePlus size={20} />
                                        <span className="text-xs">Ajouter</span>
                                    </button>
                                </div>
                                <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFileChange} />
                                {!isEdit && (
                                    <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                                        Le véhicule sera en attente de validation par un administrateur.
                                    </p>
                                )}
                            </div>
                        </ModalBody>

                        <ModalFooter className={`border-t ${isDark ? "border-slate-800" : "border-slate-200"}`}>
                            <Button variant="bordered" onPress={onClose}
                                className={isDark ? "text-white border-slate-700" : "text-slate-700 border-slate-300"}>
                                Annuler
                            </Button>
                            <Button onPress={handleSave}
                                className="font-bold bg-[#ff922b] text-white shadow-lg shadow-orange-500/20">
                                Enregistrer
                            </Button>
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    );
};
