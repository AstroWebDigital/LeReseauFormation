import React from "react";
import {
    Modal, ModalContent, ModalHeader, ModalBody, ModalFooter,
    Button, Input, Select, SelectItem
} from "@heroui/react";

export const VehicleModal = ({ isOpen, onOpenChange, formData, setFormData, onSave, isEdit, inputClasses }) => {

    const vehicleTypes = ["Compact", "Berline", "SUV", "Utilitaire", "Luxe"];
    const fuelTypes = ["Essence", "Diesel", "Électrique", "Hybride"];
    const transmissions = ["Manuelle", "Automatique"];

    // Style spécifique pour les dropdowns
    const selectClasses = {
        label: "!text-white !opacity-100 font-bold text-sm",
        trigger: "border-slate-700 bg-[#0f1129] hover:border-white transition-all min-h-[44px]",
        value: "!text-white", // Texte sélectionné en blanc
        innerWrapper: "text-white",
        popoverContent: "bg-[#0f1129] border border-slate-800", // Fond du menu déroulant
    };

    return (
        <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="2xl" className="bg-[#0f1129] text-white border border-slate-800">
            <ModalContent>
                {(onClose) => (
                    <>
                        <ModalHeader className="text-xl font-bold">
                            {isEdit ? "Modifier le véhicule" : "Ajouter un véhicule"}
                        </ModalHeader>
                        <ModalBody className="grid grid-cols-1 md:grid-cols-2 gap-4 py-6">
                            <Input label="Marque" variant="bordered" labelPlacement="outside" classNames={inputClasses} value={formData.brand} onChange={(e) => setFormData({...formData, brand: e.target.value})} />
                            <Input label="Modèle" variant="bordered" labelPlacement="outside" classNames={inputClasses} value={formData.model} onChange={(e) => setFormData({...formData, model: e.target.value})} />
                            <Input label="Plaque" variant="bordered" labelPlacement="outside" classNames={inputClasses} value={formData.plateNumber} onChange={(e) => setFormData({...formData, plateNumber: e.target.value})} />

                            <Select
                                label="Type" variant="bordered" labelPlacement="outside"
                                classNames={selectClasses}
                                selectedKeys={[formData.type]}
                                popoverProps={{ classNames: { content: "bg-[#0f1129] border border-slate-800" } }}
                                onChange={(e) => setFormData({...formData, type: e.target.value})}
                            >
                                {vehicleTypes.map((t) => (
                                    <SelectItem key={t} className="text-white hover:bg-slate-800 focus:bg-slate-800">
                                        {t}
                                    </SelectItem>
                                ))}
                            </Select>

                            <Input label="Prix journalier (€)" type="number" variant="bordered" labelPlacement="outside" classNames={inputClasses} value={formData.baseDailyPrice} onChange={(e) => setFormData({...formData, baseDailyPrice: e.target.value})} />
                            <Input label="Kilométrage" type="number" variant="bordered" labelPlacement="outside" classNames={inputClasses} value={formData.mileage} onChange={(e) => setFormData({...formData, mileage: e.target.value})} />
                            <Input label="Parking" variant="bordered" labelPlacement="outside" classNames={inputClasses} value={formData.defaultParkingLocation} onChange={(e) => setFormData({...formData, defaultParkingLocation: e.target.value})} />

                            <Select
                                label="Carburant" variant="bordered" labelPlacement="outside"
                                classNames={selectClasses}
                                selectedKeys={[formData.fuel]}
                                popoverProps={{ classNames: { content: "bg-[#0f1129] border border-slate-800" } }}
                                onChange={(e) => setFormData({...formData, fuel: e.target.value})}
                            >
                                {fuelTypes.map((f) => (
                                    <SelectItem key={f} className="text-white hover:bg-slate-800 focus:bg-slate-800">
                                        {f}
                                    </SelectItem>
                                ))}
                            </Select>

                            <Select
                                label="Transmission" variant="bordered" labelPlacement="outside"
                                classNames={selectClasses}
                                selectedKeys={[formData.transmission]}
                                popoverProps={{ classNames: { content: "bg-[#0f1129] border border-slate-800" } }}
                                onChange={(e) => setFormData({...formData, transmission: e.target.value})}
                            >
                                {transmissions.map((tr) => (
                                    <SelectItem key={tr} className="text-white hover:bg-slate-800 focus:bg-slate-800">
                                        {tr}
                                    </SelectItem>
                                ))}
                            </Select>
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