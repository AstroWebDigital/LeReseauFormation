import React, { useState, useEffect, useRef } from "react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Input, Select, SelectItem } from "@heroui/react";
import { CloudArrowUpIcon, DocumentIcon, XMarkIcon } from "@heroicons/react/24/outline";
import api from "@/services/auth/client";

export const DocumentModal = ({ isOpen, onOpenChange, formData, setFormData, onSave, isEdit, inputClasses }) => {
    const [errors, setErrors] = useState({});
    const [vehicles, setVehicles] = useState([]);
    const [selectedFile, setSelectedFile] = useState(null);
    const fileInputRef = useRef(null);

    // 1. Charger la liste des véhicules
    useEffect(() => {
        if (isOpen) {
            const fetchVehicles = async () => {
                try {
                    const response = await api.get("/api/vehicles/my-fleet");
                    const vehicleList = response.data.content || response.data;
                    setVehicles(Array.isArray(vehicleList) ? vehicleList : []);
                } catch (err) {
                    console.error("Erreur lors de la récupération :", err);
                    setVehicles([]);
                }
            };
            fetchVehicles();
        }
    }, [isOpen]);

    // Reset du fichier à la fermeture/ouverture
    useEffect(() => {
        if (!isOpen) {
            setSelectedFile(null);
            setErrors({});
        }
    }, [isOpen]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.type !== "application/pdf") {
                setErrors({ ...errors, file: "Seuls les fichiers PDF sont acceptés" });
                return;
            }
            setSelectedFile(file);
            setFormData({ ...formData, file: file }); // On stocke l'objet File
            if (errors.file) setErrors({ ...errors, file: null });
        }
    };

    const validateAndSave = () => {
        let newErrors = {};

        if (!formData.scope) newErrors.scope = "Le domaine est requis";
        if (!formData.type) newErrors.type = "Le type est requis";
        if (!isEdit && !selectedFile) newErrors.file = "Le fichier PDF est requis";
        if (!formData.status) newErrors.status = "Le statut est requis";
        if (!formData.issueDate) newErrors.issueDate = "La date d'émission est requise";

        if (formData.scope === "vehicule" && !formData.vehicleId) {
            newErrors.vehicleId = "Veuillez sélectionner un véhicule";
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setErrors({});
        onSave(); // Note : onSave devra envoyer un FormData
    };

    const handleSelectChange = (name, keys) => {
        const value = Array.from(keys)[0];
        setFormData({ ...formData, [name]: value });
        if (errors[name]) setErrors({ ...errors, [name]: null });
    };

    const selectClasses = {
        label: "!text-white !opacity-100 font-bold text-sm",
        trigger: "border-slate-700 bg-[#0f1129] hover:border-white transition-all min-h-[44px]",
        value: "!text-white",
        popoverContent: "bg-[#0f1129] border border-slate-800 text-white",
    };

    return (
        <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="2xl" className="bg-[#0f1129] text-white border border-slate-800">
            <ModalContent>
                {(onClose) => (
                    <>
                        <ModalHeader className="text-xl font-bold">{isEdit ? "Modifier le document" : "Nouveau document"}</ModalHeader>
                        <ModalBody className="grid grid-cols-1 md:grid-cols-2 gap-4 py-6">

                            {/* ZONE UPLOAD PDF */}
                            <div className="md:col-span-2">
                                <label className="block text-white font-bold text-sm mb-2">Fichier PDF *</label>
                                <div
                                    onClick={() => fileInputRef.current.click()}
                                    className={`relative group border-2 border-dashed rounded-2xl p-4 transition-all cursor-pointer flex flex-col items-center justify-center min-h-[120px] 
                                    ${errors.file ? 'border-red-500 bg-red-500/5' : 'border-slate-700 hover:border-orange-500 bg-white/5'}`}
                                >
                                    <input type="file" ref={fileInputRef} hidden accept="application/pdf" onChange={handleFileChange} />

                                    {selectedFile ? (
                                        <div className="flex items-center gap-4 w-full px-4">
                                            <div className="p-3 bg-orange-500/20 rounded-xl text-orange-500">
                                                <DocumentIcon className="h-8 w-8" />
                                            </div>
                                            <div className="flex-1 overflow-hidden">
                                                <p className="text-sm font-medium truncate">{selectedFile.name}</p>
                                                <p className="text-xs text-slate-400">{(selectedFile.size / 1024).toFixed(1)} KB</p>
                                            </div>
                                            <Button isIconOnly variant="light" radius="full" onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedFile(null);
                                            }}>
                                                <XMarkIcon className="h-5 w-5 text-slate-400" />
                                            </Button>
                                        </div>
                                    ) : (
                                        <>
                                            <CloudArrowUpIcon className="h-10 w-10 text-slate-500 group-hover:text-orange-500 transition-colors" />
                                            <p className="mt-2 text-sm text-slate-400">Cliquez ou glissez le PDF ici</p>
                                        </>
                                    )}
                                </div>
                                {errors.file && <p className="text-red-500 text-[0.7rem] mt-1 ml-1">{errors.file}</p>}
                            </div>

                            {/* SELECTS & INPUTS */}
                            <Select
                                label="Domaine *" variant="bordered" labelPlacement="outside" classNames={selectClasses}
                                selectedKeys={formData.scope ? [formData.scope] : []}
                                onSelectionChange={(keys) => handleSelectChange("scope", keys)}
                                isInvalid={!!errors.scope} errorMessage={errors.scope}
                            >
                                <SelectItem key="utilisateur" textValue="Utilisateur">Utilisateur</SelectItem>
                                <SelectItem key="vehicule" textValue="Véhicule">Véhicule</SelectItem>
                                <SelectItem key="reservation" textValue="Réservation">Réservation</SelectItem>
                            </Select>

                            <Select
                                label="Type de document *" variant="bordered" labelPlacement="outside" classNames={selectClasses}
                                selectedKeys={formData.type ? [formData.type] : []}
                                onSelectionChange={(keys) => handleSelectChange("type", keys)}
                                isInvalid={!!errors.type} errorMessage={errors.type}
                            >
                                <SelectItem key="carte_grise" textValue="Carte Grise">Carte Grise</SelectItem>
                                <SelectItem key="assurance" textValue="Assurance">Assurance</SelectItem>
                                <SelectItem key="permis" textValue="Permis">Permis</SelectItem>
                            </Select>

                            <Select
                                label="Statut *" variant="bordered" labelPlacement="outside" classNames={selectClasses}
                                selectedKeys={formData.status ? [formData.status] : []}
                                onSelectionChange={(keys) => handleSelectChange("status", keys)}
                                isInvalid={!!errors.status} errorMessage={errors.status}
                            >
                                <SelectItem key="valide" textValue="Valide">Valide</SelectItem>
                                <SelectItem key="en_attente" textValue="En attente">En attente</SelectItem>
                                <SelectItem key="expire" textValue="Expiré">Expiré</SelectItem>
                            </Select>

                            <Input label="Date d'émission *" type="date" variant="bordered" labelPlacement="outside" classNames={inputClasses}
                                   value={formData.issueDate || ""}
                                   isInvalid={!!errors.issueDate} errorMessage={errors.issueDate}
                                   onChange={(e) => {
                                       setFormData({...formData, issueDate: e.target.value});
                                       if(errors.issueDate) setErrors({...errors, issueDate: null});
                                   }} />

                            <Input label="Date d'expiration" type="date" variant="bordered" labelPlacement="outside" classNames={inputClasses}
                                   value={formData.expirationDate || ""}
                                   onChange={(e) => setFormData({...formData, expirationDate: e.target.value})} />

                            <Select
                                label="Sélectionner le véhicule"
                                variant="bordered"
                                labelPlacement="outside"
                                classNames={selectClasses}
                                placeholder={vehicles.length === 0 ? "Aucun véhicule trouvé" : "Choisir un véhicule"}
                                selectedKeys={formData.vehicleId ? [String(formData.vehicleId)] : []}
                                onSelectionChange={(keys) => handleSelectChange("vehicleId", keys)}
                                isInvalid={!!errors.vehicleId}
                                errorMessage={errors.vehicleId}
                                isDisabled={formData.scope !== "vehicule"}
                            >
                                {vehicles.map((v) => (
                                    <SelectItem key={String(v.id)} textValue={`${v.brand} ${v.model}`}>
                                        {v.brand} {v.model}
                                    </SelectItem>
                                ))}
                            </Select>

                        </ModalBody>
                        <ModalFooter className="border-t border-slate-800">
                            <Button variant="bordered" onPress={onClose} className="text-white border-slate-700">Annuler</Button>
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