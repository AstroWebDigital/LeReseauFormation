import React, { useState, useEffect, useRef } from "react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Input, Select, SelectItem } from "@heroui/react";
import { CloudArrowUpIcon, DocumentIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useTheme } from "@/theme/ThemeProvider";
import api from "@/services/auth/client";

export const DocumentModal = ({ isOpen, onOpenChange, formData, setFormData, onSave, isEdit }) => {
    const { isDark } = useTheme();
    const [errors, setErrors] = useState({});
    const [vehicles, setVehicles] = useState([]);
    const [selectedFile, setSelectedFile] = useState(null);
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (isOpen) {
            api.get("/api/vehicles/my-fleet")
                .then(res => setVehicles(Array.isArray(res.data.content || res.data) ? (res.data.content || res.data) : []))
                .catch(() => setVehicles([]));
        }
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen) { setSelectedFile(null); setErrors({}); }
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
        if (!formData.scope)                             e.scope     = "Le domaine est requis";
        if (!formData.type)                              e.type      = "Le type de document est requis";
        if (!isEdit && !selectedFile)                    e.file      = "Le fichier PDF est requis";
        if (!formData.issueDate)                         e.issueDate = "La date d'émission est requise";
        if (formData.expirationDate && formData.issueDate && formData.expirationDate < formData.issueDate)
                                                         e.expirationDate = "La date d'expiration doit être après la date d'émission";
        if (formData.scope === "vehicule" && !formData.vehicleId)
                                                         e.vehicleId = "Veuillez sélectionner un véhicule";
        return e;
    };

    const validateAndSave = () => {
        const e = validate();
        if (Object.keys(e).length > 0) { setErrors(e); return; }
        setErrors({});
        onSave();
    };

    const handleSelectChange = (name, keys) => {
        const value = Array.from(keys)[0];
        setFormData(prev => ({ ...prev, [name]: value }));
        setErrors(prev => ({ ...prev, [name]: undefined }));
    };

    const clearError = (field) => setErrors(prev => ({ ...prev, [field]: undefined }));

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
        value:        isDark ? "!text-white" : "!text-slate-800",
        popoverContent: isDark ? "bg-[#0f1129] border border-slate-800 text-white" : "bg-white border border-slate-200 text-slate-800",
        errorMessage: "text-red-500 text-xs mt-0.5",
    });

    const selectItemClass = isDark
        ? "text-white hover:bg-slate-800 focus:bg-slate-800"
        : "text-slate-800 hover:bg-slate-100 focus:bg-slate-100";

    const popoverClass = isDark
        ? { content: "bg-[#0f1129] border border-slate-800" }
        : { content: "bg-white border border-slate-200 shadow-lg" };

    const uploadZoneBase = isDark
        ? "border-slate-700 hover:border-orange-500 bg-white/5"
        : "border-slate-300 hover:border-orange-500 bg-slate-50";

    return (
        <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="2xl" scrollBehavior="inside"
            className={isDark ? "bg-[#0f1129] border border-slate-800" : "bg-white border border-slate-200"}>
            <ModalContent>
                {(onClose) => (
                    <>
                        <ModalHeader className={`text-xl font-bold ${isDark ? "text-white" : "text-slate-800"}`}>
                            {isEdit ? "Modifier le document" : "Nouveau document"}
                        </ModalHeader>

                        <ModalBody className={`grid grid-cols-1 md:grid-cols-2 gap-4 py-6 ${!isDark ? "[&_input]:!text-slate-900" : ""}`}>

                            {/* PDF upload */}
                            <div className="md:col-span-2">
                                <label className={`block font-bold text-sm mb-2 ${isDark ? "text-white" : "text-slate-700"}`}>
                                    Fichier PDF {!isEdit && "*"}
                                </label>
                                <div onClick={() => fileInputRef.current.click()}
                                    className={`relative group border-2 border-dashed rounded-2xl p-4 transition-all cursor-pointer flex flex-col items-center justify-center min-h-[120px] ${
                                        errors.file ? "border-red-500 bg-red-500/5" : uploadZoneBase
                                    }`}>
                                    <input type="file" ref={fileInputRef} hidden accept="application/pdf" onChange={handleFileChange} />
                                    {selectedFile ? (
                                        <div className="flex items-center gap-4 w-full px-4">
                                            <div className="p-3 bg-orange-500/20 rounded-xl text-orange-500">
                                                <DocumentIcon className="h-8 w-8" />
                                            </div>
                                            <div className="flex-1 overflow-hidden">
                                                <p className={`text-sm font-medium truncate ${isDark ? "text-white" : "text-slate-800"}`}>{selectedFile.name}</p>
                                                <p className="text-xs text-slate-400">{(selectedFile.size / 1024).toFixed(1)} KB</p>
                                            </div>
                                            <Button isIconOnly variant="light" radius="full" onClick={(e) => { e.stopPropagation(); setSelectedFile(null); }}>
                                                <XMarkIcon className="h-5 w-5 text-slate-400" />
                                            </Button>
                                        </div>
                                    ) : (
                                        <>
                                            <CloudArrowUpIcon className={`h-10 w-10 transition-colors group-hover:text-orange-500 ${isDark ? "text-slate-500" : "text-slate-400"}`} />
                                            <p className={`mt-2 text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>Cliquez ou glissez le PDF ici</p>
                                        </>
                                    )}
                                </div>
                                {errors.file && <p className="text-red-500 text-xs mt-1 ml-1">{errors.file}</p>}
                            </div>

                            {/* Domaine */}
                            <Select label="Domaine *" variant="bordered" labelPlacement="outside"
                                classNames={selectBase("scope")}
                                isInvalid={!!errors.scope} errorMessage={errors.scope}
                                selectedKeys={formData.scope ? [formData.scope] : []}
                                onSelectionChange={(keys) => handleSelectChange("scope", keys)}
                                popoverProps={{ classNames: popoverClass }}>
                                <SelectItem key="utilisateur" textValue="Utilisateur" className={selectItemClass}>Utilisateur</SelectItem>
                                <SelectItem key="vehicule"    textValue="Véhicule"    className={selectItemClass}>Véhicule</SelectItem>
                                <SelectItem key="reservation" textValue="Réservation" className={selectItemClass}>Réservation</SelectItem>
                            </Select>

                            {/* Type */}
                            <Select label="Type de document *" variant="bordered" labelPlacement="outside"
                                classNames={selectBase("type")}
                                isInvalid={!!errors.type} errorMessage={errors.type}
                                selectedKeys={formData.type ? [formData.type] : []}
                                onSelectionChange={(keys) => handleSelectChange("type", keys)}
                                popoverProps={{ classNames: popoverClass }}>
                                <SelectItem key="carte_grise"     textValue="Carte Grise"     className={selectItemClass}>Carte Grise</SelectItem>
                                <SelectItem key="assurance"       textValue="Assurance"       className={selectItemClass}>Assurance</SelectItem>
                                <SelectItem key="permis"          textValue="Permis"          className={selectItemClass}>Permis</SelectItem>
                                <SelectItem key="contrat"         textValue="Contrat"         className={selectItemClass}>Contrat</SelectItem>
                                <SelectItem key="facture"         textValue="Facture"         className={selectItemClass}>Facture</SelectItem>
                                <SelectItem key="etat_des_lieux"  textValue="État des lieux"  className={selectItemClass}>État des lieux</SelectItem>
                                <SelectItem key="photo_checklist" textValue="Photo checklist" className={selectItemClass}>Photo checklist</SelectItem>
                            </Select>

                            {/* Date émission */}
                            <Input label="Date d'émission *" type="date" variant="bordered" labelPlacement="outside"
                                classNames={inputBase("issueDate")}
                                isInvalid={!!errors.issueDate} errorMessage={errors.issueDate}
                                value={formData.issueDate || ""}
                                onChange={(e) => { setFormData(prev => ({ ...prev, issueDate: e.target.value })); clearError("issueDate"); }}
                            />

                            {/* Date expiration */}
                            <Input label="Date d'expiration" type="date" variant="bordered" labelPlacement="outside"
                                classNames={inputBase("expirationDate")}
                                isInvalid={!!errors.expirationDate} errorMessage={errors.expirationDate}
                                value={formData.expirationDate || ""}
                                onChange={(e) => { setFormData(prev => ({ ...prev, expirationDate: e.target.value })); clearError("expirationDate"); }}
                            />

                            {/* Véhicule lié */}
                            <Select label="Véhicule lié *" variant="bordered" labelPlacement="outside"
                                classNames={selectBase("vehicleId")}
                                isInvalid={!!errors.vehicleId} errorMessage={errors.vehicleId}
                                placeholder={vehicles.length === 0 ? "Aucun véhicule trouvé" : "Choisir un véhicule"}
                                selectedKeys={formData.vehicleId ? [String(formData.vehicleId)] : []}
                                onSelectionChange={(keys) => handleSelectChange("vehicleId", keys)}
                                popoverProps={{ classNames: popoverClass }}
                                isDisabled={formData.scope !== "vehicule"}>
                                {vehicles.map(v => (
                                    <SelectItem key={String(v.id)} textValue={`${v.brand} ${v.model}`} className={selectItemClass}>
                                        {v.brand} {v.model}
                                    </SelectItem>
                                ))}
                            </Select>
                        </ModalBody>

                        <ModalFooter className={`border-t ${isDark ? "border-slate-800" : "border-slate-200"}`}>
                            <Button variant="bordered" onPress={onClose}
                                className={isDark ? "text-white border-slate-700" : "text-slate-700 border-slate-300"}>
                                Annuler
                            </Button>
                            <Button className="bg-[#ff922b] text-white font-bold shadow-lg shadow-orange-500/20" onPress={validateAndSave}>
                                Enregistrer
                            </Button>
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    );
};
