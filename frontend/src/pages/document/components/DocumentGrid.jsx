import React from "react";
import { DocumentCard } from "./DocumentCard";

export const DocumentGrid = ({ documents, onEdit, onDelete, statusColorMap }) => {
    // Affichage d'un état vide si aucun document n'est trouvé
    if (!documents || documents.length === 0) {
        return (
            <div className="text-center py-20 bg-slate-900/50 rounded-xl border border-dashed border-slate-800">
                <p className="text-slate-500">Aucun document enregistré.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {documents.map((doc) => (
                <DocumentCard
                    key={doc.id}
                    doc={doc}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    statusColorMap={statusColorMap}
                />
            ))}
        </div>
    );
};