import { useState, useRef } from "react";
import { Modal, ModalContent, Button } from "@heroui/react";
import { XMarkIcon, IdentificationIcon, CameraIcon, CheckCircleIcon } from "@heroicons/react/24/outline";
import api from "@/services/auth/client";

function PhotoUploadZone({ label, file, preview, onFileChange, isDark, error }) {
    const inputRef = useRef(null);
    const isLight = !isDark;

    return (
        <div className="flex flex-col gap-1.5">
            <span className={`text-[11px] font-semibold uppercase tracking-wider ${isLight ? "text-slate-500" : "text-slate-400"}`}>
                {label}
            </span>
            <div
                onClick={() => inputRef.current?.click()}
                className={`relative flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed cursor-pointer transition-all min-h-[110px] overflow-hidden
                    ${error
                        ? "border-red-400 bg-red-500/5"
                        : preview
                            ? isLight ? "border-orange-300 bg-orange-50" : "border-orange-500/40 bg-orange-500/8"
                            : isLight ? "border-slate-200 hover:border-orange-300 bg-slate-50 hover:bg-orange-50/50" : "border-white/10 hover:border-orange-500/40 bg-white/3 hover:bg-orange-500/5"
                    }`}
            >
                {preview ? (
                    <>
                        <img src={preview} alt={label} className="w-full h-full object-cover absolute inset-0 rounded-2xl" />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-2xl opacity-0 hover:opacity-100 transition-opacity">
                            <span className="text-white text-xs font-semibold">Changer</span>
                        </div>
                        <CheckCircleIcon className="absolute top-2 right-2 h-5 w-5 text-emerald-400 drop-shadow" />
                    </>
                ) : (
                    <>
                        <CameraIcon className={`h-7 w-7 ${isLight ? "text-slate-300" : "text-slate-600"}`} />
                        <span className={`text-xs text-center px-2 ${isLight ? "text-slate-400" : "text-slate-500"}`}>
                            Cliquer pour ajouter
                        </span>
                    </>
                )}
            </div>
            {error && <p className="text-red-500 text-xs">{error}</p>}
            <input ref={inputRef} type="file" accept="image/*" hidden onChange={e => onFileChange(e.target.files?.[0] || null)} />
        </div>
    );
}

export function LicenseModal({ isOpen, onOpenChange, onSuccess, isDark }) {
    const isLight = !isDark;

    const [licenseNumber, setLicenseNumber] = useState("");
    const [expiryDate, setExpiryDate] = useState("");
    const [photoFront, setPhotoFront] = useState(null);
    const [previewFront, setPreviewFront] = useState(null);
    const [photoBack, setPhotoBack] = useState(null);
    const [previewBack, setPreviewBack] = useState(null);
    const [errors, setErrors] = useState({});
    const [isSaving, setIsSaving] = useState(false);

    const handlePhotoFront = (file) => {
        setPhotoFront(file);
        setPreviewFront(file ? URL.createObjectURL(file) : null);
        setErrors(e => ({ ...e, photoFront: undefined }));
    };

    const handlePhotoBack = (file) => {
        setPhotoBack(file);
        setPreviewBack(file ? URL.createObjectURL(file) : null);
        setErrors(e => ({ ...e, photoBack: undefined }));
    };

    const validate = () => {
        const e = {};
        if (!licenseNumber.trim()) e.licenseNumber = "Numéro de permis requis";
        if (!photoFront) e.photoFront = "Photo recto requise";
        if (!photoBack)  e.photoBack  = "Photo verso requise";
        return e;
    };

    const handleSubmit = async () => {
        const e = validate();
        if (Object.keys(e).length > 0) { setErrors(e); return; }

        setIsSaving(true);
        try {
            const formData = new FormData();
            formData.append("licenseNumber", licenseNumber.trim());
            if (expiryDate) formData.append("expiryDate", expiryDate);
            formData.append("photoFront", photoFront);
            formData.append("photoBack",  photoBack);

            const { data } = await api.post("/api/profile/license", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            onSuccess(data);
        } catch (err) {
            const msg = err.response?.data?.message || err.response?.data || "Erreur lors de l'enregistrement.";
            setErrors({ global: msg });
        } finally {
            setIsSaving(false);
        }
    };

    const handleClose = (onClose) => {
        setLicenseNumber("");
        setExpiryDate("");
        setPhotoFront(null);
        setPreviewFront(null);
        setPhotoBack(null);
        setPreviewBack(null);
        setErrors({});
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="md" hideCloseButton
            classNames={{ base: `${isLight ? "bg-white" : "bg-[#080f28]"} shadow-2xl`, wrapper: "items-center" }}>
            <ModalContent>
                {(onClose) => (
                    <div className="rounded-2xl overflow-hidden">
                        {/* Bandeau haut */}
                        <div className="h-1.5 bg-gradient-to-r from-orange-500 to-amber-400" />

                        <div className="flex flex-col gap-5 p-6">
                            {/* Header */}
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isLight ? "bg-orange-50" : "bg-orange-500/10"}`}>
                                        <IdentificationIcon className="h-5 w-5 text-orange-500" />
                                    </div>
                                    <div>
                                        <h2 className={`font-bold text-base ${isLight ? "text-slate-800" : "text-white"}`}>
                                            Permis de conduire requis
                                        </h2>
                                        <p className={`text-xs mt-0.5 ${isLight ? "text-slate-400" : "text-slate-500"}`}>
                                            Renseignez vos informations une seule fois
                                        </p>
                                    </div>
                                </div>
                                <button onClick={() => handleClose(onClose)}
                                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${isLight ? "bg-black/5 hover:bg-black/10" : "bg-white/10 hover:bg-white/20"}`}>
                                    <XMarkIcon className={`h-4 w-4 ${isLight ? "text-slate-600" : "text-white/70"}`} />
                                </button>
                            </div>

                            {/* Numéro */}
                            <div className="flex flex-col gap-1.5">
                                <span className={`text-[11px] font-semibold uppercase tracking-wider ${isLight ? "text-slate-500" : "text-slate-400"}`}>
                                    Numéro de permis
                                </span>
                                <div className={`flex items-center gap-2 rounded-2xl border px-3 py-2.5 transition-all ${
                                    errors.licenseNumber
                                        ? "border-red-500 bg-red-500/5"
                                        : isLight ? "border-slate-200 focus-within:border-orange-400 bg-white" : "border-white/10 focus-within:border-orange-400 bg-white/3"
                                }`}>
                                    <IdentificationIcon className={`h-4 w-4 shrink-0 ${isLight ? "text-slate-400" : "text-slate-500"}`} />
                                    <input
                                        type="text"
                                        value={licenseNumber}
                                        onChange={e => { setLicenseNumber(e.target.value); setErrors(v => ({ ...v, licenseNumber: undefined })); }}
                                        placeholder="ex: 12AB12345"
                                        className={`flex-1 bg-transparent text-sm focus:outline-none ${isLight ? "text-slate-800 placeholder:text-slate-400" : "text-white placeholder:text-slate-500"}`}
                                    />
                                </div>
                                {errors.licenseNumber && <p className="text-red-500 text-xs">{errors.licenseNumber}</p>}
                            </div>

                            {/* Date d'expiration */}
                            <div className="flex flex-col gap-1.5">
                                <span className={`text-[11px] font-semibold uppercase tracking-wider ${isLight ? "text-slate-500" : "text-slate-400"}`}>
                                    Date d'expiration <span className={`font-normal normal-case tracking-normal ${isLight ? "text-slate-400" : "text-slate-600"}`}>(optionnel)</span>
                                </span>
                                <div className={`flex items-center gap-2 rounded-2xl border px-3 py-2.5 transition-all ${
                                    isLight ? "border-slate-200 focus-within:border-orange-400 bg-white" : "border-white/10 focus-within:border-orange-400 bg-white/3"
                                }`}>
                                    <input
                                        type="date"
                                        value={expiryDate}
                                        onChange={e => setExpiryDate(e.target.value)}
                                        className={`flex-1 bg-transparent text-sm focus:outline-none ${isLight ? "text-slate-800" : "text-white"}`}
                                    />
                                </div>
                            </div>

                            {/* Photos */}
                            <div className="grid grid-cols-2 gap-3">
                                <PhotoUploadZone
                                    label="Recto"
                                    file={photoFront}
                                    preview={previewFront}
                                    onFileChange={handlePhotoFront}
                                    isDark={isDark}
                                    error={errors.photoFront}
                                />
                                <PhotoUploadZone
                                    label="Verso"
                                    file={photoBack}
                                    preview={previewBack}
                                    onFileChange={handlePhotoBack}
                                    isDark={isDark}
                                    error={errors.photoBack}
                                />
                            </div>

                            {errors.global && (
                                <p className="text-red-500 text-xs text-center">{errors.global}</p>
                            )}

                            {/* Boutons */}
                            <div className="flex gap-3">
                                <Button variant="flat" onPress={() => handleClose(onClose)}
                                    className={`flex-1 rounded-xl font-semibold ${isLight ? "bg-slate-100 text-slate-600 hover:bg-slate-200" : "bg-white/8 text-white/70 hover:bg-white/12"}`}>
                                    Annuler
                                </Button>
                                <Button onPress={handleSubmit} isLoading={isSaving}
                                    startContent={!isSaving && <IdentificationIcon className="h-4 w-4" />}
                                    className="flex-1 rounded-xl font-bold bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/30">
                                    Enregistrer et continuer
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </ModalContent>
        </Modal>
    );
}
