import React, { useState, useEffect } from "react";
import api from "@/services/auth/client";
import { Button, Spinner, useDisclosure } from "@heroui/react";
import { Plus } from "lucide-react";
import { useAuth } from "@/auth/AuthContext";
import { useTheme } from "@/theme/ThemeProvider";

import { DocumentGrid } from "./components/DocumentGrid";
import { DocumentModal } from "./components/DocumentModal";

const statusColorMap = {
    "valide": "success",
    "expire": "danger",
    "en_attente": "warning",
};

export default function DocumentPage() {
    const { user } = useAuth();
    const { isDark } = useTheme();

    const [documents, setDocuments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const [selectedDoc, setSelectedDoc] = useState(null);

    const [formData, setFormData] = useState({
        scope: "vehicule",
        type: "assurance",
        file: null,
        issueDate: "",
        expirationDate: "",
        status: "en_attente",
        vehicleId: ""
    });

    const fetchDocuments = async () => {
        try {
            setIsLoading(true);
            const { data } = await api.get("/api/documents");
            setDocuments(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("ERREUR API:", err);
            setError("Impossible de charger les documents.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { fetchDocuments(); }, []);

    const handleDownload = async (fileUrl) => {
        if (!fileUrl) return alert("Pas de fichier associé");
        try {
            const filename = fileUrl.split('/').pop();
            const response = await api.get(`/api/documents/download/${filename}`, { responseType: 'blob' });
            const blob = new Blob([response.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (err) {
            alert("Erreur lors du téléchargement du fichier.");
        }
    };

    const handleSave = async () => {
        try {
            const data = new FormData();
            const documentPayload = {
                scope: formData.scope,
                type: formData.type,
                issueDate: formData.issueDate || null,
                expirationDate: formData.expirationDate || null,
                status: formData.status,
                vehicle: formData.vehicleId ? { id: formData.vehicleId } : null,
            };
            data.append("document", JSON.stringify(documentPayload));
            if (formData.file) data.append("file", formData.file);

            const config = { headers: { "Content-Type": "multipart/form-data" } };
            if (selectedDoc) {
                await api.put(`/api/documents/${selectedDoc.id}`, data, config);
            } else {
                await api.post("/api/documents", data, config);
            }
            onOpenChange(false);
            fetchDocuments();
        } catch (err) {
            console.error("Erreur sauvegarde:", err);
            alert("Erreur lors de l'enregistrement.");
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
            setFormData({ ...doc, file: null, vehicleId: doc.vehicleId || "" });
        } else {
            setSelectedDoc(null);
            setFormData({ scope: "vehicule", type: "assurance", file: null, issueDate: "", expirationDate: "", status: "en_attente", vehicleId: "" });
        }
        onOpen();
    };

    // Classes adaptées au thème
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

    if (isLoading) return (
        <div className="h-full flex items-center justify-center min-h-[400px]">
            <Spinner size="lg" color="warning" />
        </div>
    );

    return (
        <div className={`p-6 min-h-screen ${isDark ? "" : "bg-slate-50"}`}>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className={`text-2xl font-bold ${isDark ? "text-slate-100" : "text-slate-800"}`}>
                        Mes Documents
                    </h1>
                    <p className="text-default-500">{documents.length} document(s) enregistré(s)</p>
                </div>
                <Button
                    className="bg-[#ff922b] text-white font-bold shadow-lg shadow-orange-500/20"
                    onPress={() => openModal()}
                    startContent={<Plus size={18} />}
                >
                    Ajouter un document
                </Button>
            </div>

            <DocumentGrid
                documents={documents}
                onEdit={openModal}
                onDelete={handleDelete}
                onDownload={handleDownload}
                statusColorMap={statusColorMap}
                isDark={isDark}
            />

            <DocumentModal
                isOpen={isOpen}
                onOpenChange={onOpenChange}
                formData={formData}
                setFormData={setFormData}
                onSave={handleSave}
                isEdit={!!selectedDoc}
            />
        </div>
    );
}
