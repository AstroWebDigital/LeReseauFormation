import React from "react";
import { Card, CardHeader, CardBody, CardFooter, Chip, Button, Tooltip } from "@heroui/react";
import { FileText, Calendar, Download, Edit2, Trash2, Car, User } from "lucide-react";

export const DocumentGrid = ({ documents, onEdit, onDelete, onDownload, statusColorMap }) => {
    if (documents.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-slate-800 rounded-xl bg-slate-900/50">
                <FileText size={48} className="text-slate-700 mb-4" />
                <p className="text-slate-400">Aucun document trouvé</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {documents.map((doc) => (
                <Card key={doc.id} className="bg-slate-900 border-slate-800 hover:border-orange-500/50 transition-all shadow-xl">
                    <CardHeader className="flex justify-between items-start pb-0">
                        <div className="flex gap-3">
                            <div className="p-2 bg-orange-500/10 rounded-lg">
                                <FileText className="text-[#ff922b]" size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-100 capitalize">{doc.type.replace('_', ' ')}</h3>
                                <div className="flex items-center gap-2 text-xs text-slate-500">
                                    {doc.scope === "vehicule" ? <Car size={12} /> : <User size={12} />}
                                    <span className="capitalize">{doc.scope}</span>
                                </div>
                            </div>
                        </div>
                        <Chip
                            color={statusColorMap[doc.status]}
                            variant="flat"
                            size="sm"
                            className="capitalize"
                        >
                            {doc.status.replace('_', ' ')}
                        </Chip>
                    </CardHeader>

                    <CardBody className="py-4">
                        <div className="space-y-3">
                            <div className="flex items-center gap-3 text-sm text-slate-400">
                                <Calendar size={16} className="text-slate-600" />
                                <div>
                                    <p className="text-xs text-slate-500">Date d'expiration</p>
                                    <p className="text-slate-200">
                                        {doc.expirationDate
                                            ? new Date(doc.expirationDate).toLocaleDateString('fr-FR')
                                            : "Non définie"}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </CardBody>

                    <CardFooter className="flex justify-between border-t border-slate-800 gap-2">
                        <div className="flex gap-1">
                            <Tooltip content="Modifier">
                                <Button
                                    isIconOnly
                                    variant="light"
                                    size="sm"
                                    onPress={() => onEdit(doc)}
                                    className="text-slate-400 hover:text-white"
                                >
                                    <Edit2 size={18} />
                                </Button>
                            </Tooltip>
                            <Tooltip content="Supprimer" color="danger">
                                <Button
                                    isIconOnly
                                    variant="light"
                                    size="sm"
                                    onPress={() => onDelete(doc.id)}
                                    className="text-slate-400 hover:text-danger"
                                >
                                    <Trash2 size={18} />
                                </Button>
                            </Tooltip>
                        </div>

                        {/* BOUTON TÉLÉCHARGER MIS À JOUR */}
                        <Button
                            size="sm"
                            variant="flat"
                            className="bg-orange-500/10 text-[#ff922b] font-bold hover:bg-orange-500/20"
                            startContent={<Download size={16} />}
                            onPress={() => onDownload(doc.fileUrl)}
                        >
                            Télécharger
                        </Button>
                    </CardFooter>
                </Card>
            ))}
        </div>
    );
};