import React from "react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Input, Select, SelectItem } from "@heroui/react";

export const DocumentModal = ({ isOpen, onOpenChange, formData, setFormData, onSave, isEdit, inputClasses }) => {

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

    // Gestion propre du changement de Select pour HeroUI
    const handleSelectChange = (name, keys) => {
        const value = Array.from(keys)[0];
        setFormData({ ...formData, [name]: value });
    };

    return (
        <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="2xl" className="bg-[#0f1129] text-white border border-slate-800">
            <ModalContent>
                {(onClose) => (
                    <>
                        <ModalHeader className="text-xl font-bold">{isEdit ? "Modifier le document" : "Nouveau document"}</ModalHeader>
                        <ModalBody className="grid grid-cols-1 md:grid-cols-2 gap-4 py-6">

                            <Select
                                label="Domaine (Scope)" variant="bordered" labelPlacement="outside" classNames={selectClasses}
                                selectedKeys={formData.scope ? [formData.scope] : []}
                                onSelectionChange={(keys) => handleSelectChange("scope", keys)}
                            >
                                {scopes.map((s) => <SelectItem key={s.key} textValue={s.label} className="text-white">{s.label}</SelectItem>)}
                            </Select>

                            <Select
                                label="Type de document" variant="bordered" labelPlacement="outside" classNames={selectClasses}
                                selectedKeys={formData.type ? [formData.type] : []}
                                onSelectionChange={(keys) => handleSelectChange("type", keys)}
                            >
                                {types.map((t) => <SelectItem key={t.key} textValue={t.label} className="text-white">{t.label}</SelectItem>)}
                            </Select>

                            <Input label="URL du fichier" variant="bordered" labelPlacement="outside" classNames={inputClasses}
                                   value={formData.fileUrl} onChange={(e) => setFormData({...formData, fileUrl: e.target.value})} placeholder="https://..." />

                            <Select
                                label="Statut" variant="bordered" labelPlacement="outside" classNames={selectClasses}
                                selectedKeys={formData.status ? [formData.status] : []}
                                onSelectionChange={(keys) => handleSelectChange("status", keys)}
                            >
                                {statuses.map((st) => <SelectItem key={st.key} textValue={st.label} className="text-white">{st.label}</SelectItem>)}
                            </Select>

                            <Input label="Date d'émission" type="date" variant="bordered" labelPlacement="outside" classNames={inputClasses}
                                   value={formData.issueDate} onChange={(e) => setFormData({...formData, issueDate: e.target.value})} />

                            <Input label="Date d'expiration" type="date" variant="bordered" labelPlacement="outside" classNames={inputClasses}
                                   value={formData.expirationDate} onChange={(e) => setFormData({...formData, expirationDate: e.target.value})} />

                            <Input label="ID Véhicule (Optionnel)" variant="bordered" labelPlacement="outside" classNames={inputClasses}
                                   value={formData.vehicleId} onChange={(e) => setFormData({...formData, vehicleId: e.target.value})} />
                        </ModalBody>
                        <ModalFooter className="border-t border-slate-800">
                            <Button variant="bordered" onPress={onClose} className="text-white border-slate-700">Annuler</Button>
                            <Button color="primary" onPress={onSave} className="font-bold bg-blue-600">Enregistrer</Button>
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    );
};