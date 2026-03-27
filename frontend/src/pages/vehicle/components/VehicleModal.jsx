import React from "react";
import {
    Modal, ModalContent, ModalHeader, ModalBody, ModalFooter,
    Button, Input, Select, SelectItem
} from "@heroui/react";
import { useTheme } from "@/theme/ThemeProvider";

export const VehicleModal = ({ isOpen, onOpenChange, formData, setFormData, onSave, isEdit }) => {
    const { isDark } = useTheme();

    const vehicleTypes = ["Compact", "Berline", "SUV", "Utilitaire", "Luxe"];
    const fuelTypes = ["Essence", "Diesel", "Électrique", "Hybride"];
    const transmissions = ["Manuelle", "Automatique"];

    const inputClasses = {
        label: isDark
            ? "!text-white !opacity-100 font-bold text-sm"
            : "!text-slate-700 !opacity-100 font-bold text-sm",
        input: isDark
            ? "!text-white !placeholder-slate-500"
            : "!text-slate-900 !placeholder-slate-400",
        inputWrapper: isDark
            ? "border-slate-700 bg-transparent group-data-[focus=true]:border-orange-500 transition-all"
            : "border-slate-300 bg-white group-data-[focus=true]:border-orange-500 transition-all",
        innerWrapper: isDark ? "bg-transparent" : "bg-white",
    };

    const selectClasses = {
        label: isDark
            ? "!text-white !opacity-100 font-bold text-sm"
            : "!text-slate-700 !opacity-100 font-bold text-sm",
        trigger: isDark
            ? "border-slate-700 bg-[#0f1129] hover:border-orange-500 transition-all min-h-[44px]"
            : "border-slate-300 bg-white hover:border-orange-500 transition-all min-h-[44px]",
        value: isDark ? "!text-white" : "!text-slate-900",
        innerWrapper: isDark ? "text-white" : "text-slate-900",
        popoverContent: isDark
            ? "bg-[#0f1129] border border-slate-800"
            : "bg-white border border-slate-200 shadow-lg",
    };

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
            className={isDark
                ? "bg-[#0f1129] border border-slate-800"
                : "bg-white border border-slate-200"
            }
        >
            <ModalContent>
                {(onClose) => (
                    <>
                        <ModalHeader className={`text-xl font-bold ${isDark ? "text-white" : "text-slate-800"}`}>
                            {isEdit ? "Modifier le véhicule" : "Ajouter un véhicule"}
                        </ModalHeader>

                        <ModalBody className={`grid grid-cols-1 md:grid-cols-2 gap-4 py-6 ${
                            isDark ? "" : "[&_input]:!text-slate-900 [&_input]:placeholder:!text-slate-400"
                        }`}>
                            <Input
                                label="Marque"
                                variant="bordered"
                                labelPlacement="outside"
                                classNames={inputClasses}
                                value={formData.brand}
                                onChange={(e) => setFormData({...formData, brand: e.target.value})}
                            />
                            <Input
                                label="Modèle"
                                variant="bordered"
                                labelPlacement="outside"
                                classNames={inputClasses}
                                value={formData.model}
                                onChange={(e) => setFormData({...formData, model: e.target.value})}
                            />
                            <Input
                                label="Plaque"
                                variant="bordered"
                                labelPlacement="outside"
                                classNames={inputClasses}
                                value={formData.plateNumber}
                                onChange={(e) => setFormData({...formData, plateNumber: e.target.value})}
                            />

                            <Select
                                label="Type"
                                variant="bordered"
                                labelPlacement="outside"
                                classNames={selectClasses}
                                selectedKeys={[formData.type]}
                                popoverProps={{ classNames: popoverClass }}
                                onChange={(e) => setFormData({...formData, type: e.target.value})}
                            >
                                {vehicleTypes.map((t) => (
                                    <SelectItem key={t} className={selectItemClass}>{t}</SelectItem>
                                ))}
                            </Select>

                            <Input
                                label="Prix journalier (€)"
                                type="number"
                                variant="bordered"
                                labelPlacement="outside"
                                classNames={inputClasses}
                                value={formData.baseDailyPrice}
                                onChange={(e) => setFormData({...formData, baseDailyPrice: e.target.value})}
                            />
                            <Input
                                label="Kilométrage"
                                type="number"
                                variant="bordered"
                                labelPlacement="outside"
                                classNames={inputClasses}
                                value={formData.mileage}
                                onChange={(e) => setFormData({...formData, mileage: e.target.value})}
                            />
                            <Input
                                label="Parking"
                                variant="bordered"
                                labelPlacement="outside"
                                classNames={inputClasses}
                                value={formData.defaultParkingLocation}
                                onChange={(e) => setFormData({...formData, defaultParkingLocation: e.target.value})}
                            />

                            <Select
                                label="Carburant"
                                variant="bordered"
                                labelPlacement="outside"
                                classNames={selectClasses}
                                selectedKeys={[formData.fuel]}
                                popoverProps={{ classNames: popoverClass }}
                                onChange={(e) => setFormData({...formData, fuel: e.target.value})}
                            >
                                {fuelTypes.map((f) => (
                                    <SelectItem key={f} className={selectItemClass}>{f}</SelectItem>
                                ))}
                            </Select>

                            <Select
                                label="Transmission"
                                variant="bordered"
                                labelPlacement="outside"
                                classNames={selectClasses}
                                selectedKeys={[formData.transmission]}
                                popoverProps={{ classNames: popoverClass }}
                                onChange={(e) => setFormData({...formData, transmission: e.target.value})}
                            >
                                {transmissions.map((tr) => (
                                    <SelectItem key={tr} className={selectItemClass}>{tr}</SelectItem>
                                ))}
                            </Select>
                        </ModalBody>

                        <ModalFooter className={`border-t ${isDark ? "border-slate-800" : "border-slate-200"}`}>
                            <Button
                                variant="bordered"
                                onPress={onClose}
                                className={isDark ? "text-white border-slate-700" : "text-slate-700 border-slate-300"}
                            >
                                Annuler
                            </Button>
                            <Button
                                onPress={onSave}
                                className="font-bold bg-[#ff922b] text-white shadow-lg shadow-orange-500/20"
                            >
                                Enregistrer
                            </Button>
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    );
};