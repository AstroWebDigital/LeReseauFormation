import React, { useState, useEffect } from "react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Input, Select, SelectItem } from "@heroui/react";
import api from "@/services/auth/client";

export const DocumentModal = ({ isOpen, onOpenChange, formData, setFormData, onSave, isEdit, inputClasses }) => {
    const [errors, setErrors] = useState({});
    const [vehicles, setVehicles] = useState([]);

    // 1. Charger la liste des véhicules
    useEffect(() => {
        if (isOpen) {
            const fetchVehicles = async () => {
                try {
                    const response = await api.get("/api/vehicles/my-fleet");
                    const vehicleList = response.data.content || response.data;
                    setVehicles(Array.isArray(vehicleList) ? vehicleList : []);
                } catch (err) {
                    console.error("Erreur lors de la récupération de la flotte :", err);
                    setVehicles([]);
                }
            };
            fetchVehicles();
        }
    }, [isOpen]);

    // 2. Correction pour la pré-sélection lors de la modification
    useEffect(() => {
        if (isOpen && isEdit) {
            // Si le DTO nous donne vehicleId, on s'assure qu'il est dans le state
            // Si on a l'ancien format vehicle.id, on l'extrait pour le Select
            if (formData.vehicle?.id && !formData.vehicleId) {
                setFormData(prev => ({ ...prev, vehicleId: formData.vehicle.id }));
            }
        }
    }, [isOpen, isEdit, formData.vehicle]);

    const scopes = [
        {key: "utilisateur", label: "Utilisateur"},
        {key: "vehicule", label: "Véhicule"},
        {key: "reservation", label: "Réservation"}
    ];

    const types = [
        {key: "carte_grise", label: "Carte Grise"},
        {key: "assurance", label: "Assurance"},
        {key: "permis", label: "Permis de conduire"},
        {key: "contrat", label: "Contrat"},
        {key: "facture", label: "Facture"}
    ];

    const statuses = [
        {key: "valide", label: "Valide"},
        {key: "en_attente", label: "En attente"},
        {key: "expire", label: "Expiré"}
    ];

    const selectClasses = {
        label: "!text-white !opacity-100 font-bold text-sm",
        trigger: "border-slate-700 bg-[#0f1129] hover:border-white transition-all min-h-[44px]",
        value: "!text-white",
        popoverContent: "bg-[#0f1129] border border-slate-800",
    };

    const validateAndSave = () => {
        let newErrors = {};

        if (!formData.scope) newErrors.scope = "Le domaine est requis";
        if (!formData.type) newErrors.type = "Le type est requis";
        if (!formData.fileUrl?.trim()) newErrors.fileUrl = "L'URL est requise";
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
        onSave();
    };

    const handleSelectChange = (name, keys) => {
        const value = Array.from(keys)[0];
        setFormData({ ...formData, [name]: value });
        if (errors[name]) setErrors({ ...errors, [name]: null });
    };

    return (
        <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="2xl" className="bg-[#0f1129] text-white border border-slate-800">
            <ModalContent>
                {(onClose) => (
                    <>
                        <ModalHeader className="text-xl font-bold">{isEdit ? "Modifier le document" : "Nouveau document"}</ModalHeader>
                        <ModalBody className="grid grid-cols-1 md:grid-cols-2 gap-4 py-6">

                            <Select
                                label="Domaine (Scope) *" variant="bordered" labelPlacement="outside" classNames={selectClasses}
                                selectedKeys={formData.scope ? [formData.scope] : []}
                                onSelectionChange={(keys) => handleSelectChange("scope", keys)}
                                isInvalid={!!errors.scope} errorMessage={errors.scope}
                            >
                                {scopes.map((s) => <SelectItem key={s.key} textValue={s.label} className="text-white">{s.label}</SelectItem>)}
                            </Select>

                            <Select
                                label="Type de document *" variant="bordered" labelPlacement="outside" classNames={selectClasses}
                                selectedKeys={formData.type ? [formData.type] : []}
                                onSelectionChange={(keys) => handleSelectChange("type", keys)}
                                isInvalid={!!errors.type} errorMessage={errors.type}
                            >
                                {types.map((t) => <SelectItem key={t.key} textValue={t.label} className="text-white">{t.label}</SelectItem>)}
                            </Select>

                            <Input label="URL du fichier *" variant="bordered" labelPlacement="outside" classNames={inputClasses}
                                   value={formData.fileUrl || ""}
                                   isInvalid={!!errors.fileUrl} errorMessage={errors.fileUrl}
                                   onChange={(e) => {
                                       setFormData({...formData, fileUrl: e.target.value});
                                       if(errors.fileUrl) setErrors({...errors, fileUrl: null});
                                   }} placeholder="https://..." />

                            <Select
                                label="Statut *" variant="bordered" labelPlacement="outside" classNames={selectClasses}
                                selectedKeys={formData.status ? [formData.status] : []}
                                onSelectionChange={(keys) => handleSelectChange("status", keys)}
                                isInvalid={!!errors.status} errorMessage={errors.status}
                            >
                                {statuses.map((st) => <SelectItem key={st.key} textValue={st.label} className="text-white">{st.label}</SelectItem>)}
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
                                // Utilisation de String() pour garantir le match avec les clés de SelectItem
                                selectedKeys={formData.vehicleId ? [String(formData.vehicleId)] : []}
                                onSelectionChange={(keys) => handleSelectChange("vehicleId", keys)}
                                isInvalid={!!errors.vehicleId}
                                errorMessage={errors.vehicleId}
                                isDisabled={formData.scope !== "vehicule"}
                            >
                                {vehicles.map((v) => (
                                    <SelectItem key={String(v.id)} textValue={`${v.brand} ${v.model}`} className="text-white">
                                        {v.brand} {v.model} {v.licensePlate ? `(${v.licensePlate})` : ""}
                                    </SelectItem>
                                ))}
                            </Select>

                        </ModalBody>
                        <ModalFooter className="border-t border-slate-800">
                            <Button variant="bordered" onPress={onClose} className="text-white border-slate-700">Annuler</Button>
                            <Button color="primary" onPress={validateAndSave} className="font-bold bg-blue-600">Enregistrer</Button>
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    );
};