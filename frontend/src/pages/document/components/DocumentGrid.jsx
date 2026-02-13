import React from "react";
import { Card, CardHeader, CardBody, CardFooter, Chip, Button, Tooltip, Divider } from "@heroui/react";
import {
    FileText, Calendar, Download, Edit2, Trash2,
    Car, User, Clock, ShieldCheck, Layers
} from "lucide-react";

export const DocumentGrid = ({ documents, onEdit, onDelete, onDownload, statusColorMap }) => {
    if (documents.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-slate-800 rounded-xl bg-slate-900/50">
                <FileText size={48} className="text-slate-700 mb-4" />
                <p className="text-slate-400">Aucun document trouvé</p>
            </div>
        );
    }

    const formatDate = (dateString) => {
        if (!dateString) return "Non définie";
        return new Date(dateString).toLocaleDateString('fr-FR');
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {documents.map((doc) => (
                <Card key={doc.id} className="bg-slate-900 border-slate-800 hover:border-orange-500/50 transition-all shadow-xl">
                    <CardHeader className="flex justify-between items-start pb-2">
                        <div className="flex gap-3">
                            <div className="p-2 bg-orange-500/10 rounded-lg">
                                <FileText className="text-[#ff922b]" size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-100 capitalize">
                                    {doc.type ? doc.type.replace('_', ' ') : "Document"}
                                </h3>
                                <p className="text-xs text-slate-500 italic">Document officiel</p>
                            </div>
                        </div>
                        <Chip
                            color={statusColorMap[doc.status]}
                            variant="flat"
                            size="sm"
                            className="capitalize"
                        >
                            {doc.status ? doc.status.replace('_', ' ') : "Statut inconnu"}
                        </Chip>
                    </CardHeader>

                    <Divider className="bg-slate-800 opacity-50" />

                    <CardBody className="py-4 space-y-4">
                        {/* Section Scope et Type (Mis en avant) */}
                        <div className="bg-slate-950/50 rounded-lg p-3 border border-slate-800/50 space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <span className="flex items-center gap-2 text-slate-500"><Layers size={14}/> Domaine</span>
                                <span className="text-orange-400 font-semibold capitalize">{doc.scope}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="flex items-center gap-2 text-slate-500"><ShieldCheck size={14}/> Type</span>
                                <span className="text-slate-200 capitalize">{doc.type ? doc.type.replace('_', ' ') : '-'}</span>
                            </div>
                        </div>

                        {/* Section Dates */}
                        <div className="grid grid-cols-2 gap-4 px-1">
                            <div className="space-y-1">
                                <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-slate-500">
                                    <Clock size={12} />
                                    <span>Émission</span>
                                </div>
                                <p className="text-sm text-slate-300">{formatDate(doc.issueDate)}</p>
                            </div>
                            <div className="space-y-1">
                                <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-slate-500">
                                    <Calendar size={12} />
                                    <span>Expiration</span>
                                </div>
                                <p className="text-sm text-slate-300">{formatDate(doc.expirationDate)}</p>
                            </div>
                        </div>
                    </CardBody>

                    <CardFooter className="flex justify-between border-t border-slate-800 bg-slate-950/30 gap-2">
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