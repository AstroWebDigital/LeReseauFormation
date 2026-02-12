import React, { useState, useEffect } from "react";
import api from "@/services/auth/client";
import { Button, Spinner, useDisclosure } from "@heroui/react";
import { FileText, Plus } from "lucide-react";
import { useAuth } from "@/auth/AuthContext";

import { DocumentGrid } from "./components/DocumentGrid";
import { DocumentModal } from "./components/DocumentModal";

const statusColorMap = {
    "valide": "success",
    "expire": "danger",
    "en_attente": "warning",
};

export default function DocumentPage() {
    const { user } = useAuth();
    const [documents, setDocuments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const [selectedDoc, setSelectedDoc] = useState(null);

    const [formData, setFormData] = useState({
        scope: "vehicule",
        type: "assurance",
        fileUrl: "",
        issueDate: "",
        expirationDate: "",
        status: "en_attente",
        vehicleId: ""
    });

    const fetchDocuments = async () => {
        try {
            setIsLoading(true);
            const { data } = await api.get("/api/documents");

            // AJOUTE CE LOG ICI
            console.log("RÉPONSE API DOCUMENTS:", data);

            setDocuments(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("ERREUR API:", err.response);
            setError("Impossible de charger les documents.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { fetchDocuments(); }, []);

    const handleSave = async () => {
        try {
            // On récupère le profil client depuis l'utilisateur connecté
            const customerId = user?.customer?.id;

            if (!customerId) {
                alert("Erreur : Profil client non détecté. Essayez de vous reconnecter.");
                return;
            }

            const now = new Date().toISOString();

            // Construction du payload avec les dates pour passer la validation @NotNull du Backend
            const payload = {
                scope: formData.scope,
                type: formData.type,
                fileUrl: formData.fileUrl,
                issueDate: formData.issueDate || null,
                expirationDate: formData.expirationDate || null,
                status: formData.status,
                customer: { id: customerId },
                vehicle: formData.vehicleId ? { id: formData.vehicleId } : null,
                createdAt: selectedDoc ? selectedDoc.createdAt : now, // Indispensable pour le @Valid
                updatedAt: now
            };

            if (selectedDoc) {
                await api.put(`/api/documents/${selectedDoc.id}`, payload);
            } else {
                await api.post("/api/documents", payload);
            }

            onOpenChange(false);
            fetchDocuments();
        } catch (err) {
            console.error("Erreur sauvegarde:", err);
            // On affiche le message d'erreur précis renvoyé par le GlobalExceptionHandler
            const message = err.response?.data?.message || "Erreur lors de l'enregistrement.";
            alert(message);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Supprimer ce document ?")) {
            try {
                await api.delete(`/api/documents/${id}`);
                setDocuments(documents.filter(d => d.id !== id));
            } catch (err) {
                alert("Erreur lors de la suppression.");
            }
        }
    };

    const openModal = (doc = null) => {
        if (doc) {
            setSelectedDoc(doc);
            setFormData({
                ...doc,
                vehicleId: doc.vehicle?.id || ""
            });
        } else {
            setSelectedDoc(null);
            setFormData({
                scope: "vehicule",
                type: "assurance",
                fileUrl: "",
                issueDate: "",
                expirationDate: "",
                status: "en_attente",
                vehicleId: ""
            });
        }
        onOpen();
    };

    const sharedClasses = {
        label: "!text-white !opacity-100 font-bold text-sm",
        input: "!text-white",
        inputWrapper: "border-slate-700 bg-transparent group-data-[focus=true]:border-white transition-all",
    };

    if (isLoading) return <div className="h-full flex items-center justify-center min-h-[400px]"><Spinner size="lg" color="primary" /></div>;

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-100">Mes Documents</h1>
                    <p className="text-default-500">{documents.length} document(s) enregistré(s)</p>
                </div>
                <Button
                    color="primary"
                    onPress={() => openModal()}
                    startContent={<Plus size={18} />}
                    className="font-bold"
                >
                    Ajouter un document
                </Button>
            </div>

            <DocumentGrid
                documents={documents}
                onEdit={openModal}
                onDelete={handleDelete}
                statusColorMap={statusColorMap}
            />

            <DocumentModal
                isOpen={isOpen}
                onOpenChange={onOpenChange}
                formData={formData}
                setFormData={setFormData}
                onSave={handleSave}
                isEdit={!!selectedDoc}
                inputClasses={sharedClasses}
            />
        </div>
    );
}