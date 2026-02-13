import { Card, CardHeader, CardBody, Button, Chip, Divider } from "@heroui/react";
import { FileText, Calendar, Link2, Edit, Trash2, User, Car, Eye } from "lucide-react";

export const DocumentCard = ({ doc, onEdit, onDelete, statusColorMap }) => {
    // 1. Définition de l'URL du Backend (Spring Boot)
    const API_BASE_URL = "http://localhost:8080";

    // Sécurité : si doc n'existe pas, on ne rend rien
    if (!doc) return null;

    // 2. Construction de l'URL complète pour le fichier
    const fullFileUrl = doc.fileUrl ? `${API_BASE_URL}${doc.fileUrl}` : null;

    return (
        <Card className="bg-slate-900 border-slate-800 border shadow-md">
            <CardHeader className="flex justify-between items-start px-5 pt-5 text-white">
                <div className="flex gap-3 items-center">
                    <div className="p-2 bg-primary/10 rounded-lg text-primary">
                        <FileText size={24} />
                    </div>
                    <div>
                        <p className="text-tiny uppercase font-bold text-default-400">
                            {doc.scope || "N/A"}
                        </p>
                        <h2 className="text-lg font-bold capitalize">
                            {doc.type ? doc.type.replace('_', ' ') : "Document sans type"}
                        </h2>
                    </div>
                </div>
                <div className="flex gap-1">
                    <Button isIconOnly size="sm" variant="light" className="text-default-400" onPress={() => onEdit(doc)}>
                        <Edit size={14} />
                    </Button>
                    <Button isIconOnly size="sm" variant="light" color="danger" onPress={() => onDelete(doc.id)}>
                        <Trash2 size={14} />
                    </Button>
                </div>
            </CardHeader>
            <CardBody className="px-5 py-4 text-white">
                <div className="space-y-3 mb-4 text-default-400 text-sm">
                    <div className="flex items-center gap-2">
                        <Calendar size={14} />
                        <span>Expire le : {doc.expirationDate || "N/A"}</span>
                    </div>

                    {/* Affichage des IDs liés */}
                    {doc.customerId && (
                        <div className="flex items-center gap-2 text-tiny">
                            <User size={14} />
                            <span className="truncate">Client: {doc.customerId.substring(0, 8)}...</span>
                        </div>
                    )}

                    {doc.vehicleId && (
                        <div className="flex items-center gap-2 text-tiny">
                            <Car size={14} />
                            <span className="truncate">Véhicule: {doc.vehicleId.substring(0, 8)}...</span>
                        </div>
                    )}
                </div>

                {/* 3. Bouton d'accès au fichier PDF mis à jour */}
                {fullFileUrl && (
                    <Button
                        as="a"
                        href={fullFileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        variant="flat"
                        color="primary"
                        className="w-full bg-blue-500/10 text-blue-400 font-semibold mb-2"
                        startContent={<Eye size={16} />}
                    >
                        Consulter le PDF
                    </Button>
                )}

                <Divider className="my-3 bg-slate-800" />
                <div className="flex justify-end">
                    <Chip
                        color={statusColorMap[doc.status] || "default"}
                        variant="flat"
                        size="sm"
                        className="capitalize"
                    >
                        {doc.status ? doc.status.replace('_', ' ') : "En attente"}
                    </Chip>
                </div>
            </CardBody>
        </Card>
    );
}