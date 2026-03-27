import React from "react";
import { Card, CardHeader, CardBody, CardFooter, Chip, Button, Tooltip, Divider } from "@heroui/react";
import {
    FileText, Calendar, Download, Edit2, Trash2,
    Clock, ShieldCheck, Layers
} from "lucide-react";

export const DocumentGrid = ({ documents, onEdit, onDelete, onDownload, statusColorMap, isDark }) => {
    if (documents.length === 0) {
        return (
            <div className={`flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-xl
                ${isDark ? "border-slate-800 bg-slate-900/50" : "border-slate-200 bg-slate-100/50"}`}>
                <FileText size={48} className={isDark ? "text-slate-700 mb-4" : "text-slate-300 mb-4"} />
                <p className={isDark ? "text-slate-400" : "text-slate-500"}>Aucun document trouvé</p>
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
                <Card
                    key={doc.id}
                    className={`transition-all shadow-xl hover:border-orange-500/50
                        ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}
                >
                    <CardHeader className="flex justify-between items-start pb-2">
                        <div className="flex gap-3">
                            <div className="p-2 bg-orange-500/10 rounded-lg">
                                <FileText className="text-[#ff922b]" size={24} />
                            </div>
                            <div>
                                <h3 className={`font-bold capitalize ${isDark ? "text-slate-100" : "text-slate-800"}`}>
                                    {doc.type ? doc.type.replace('_', ' ') : "Document"}
                                </h3>
                                <p className={`text-xs italic ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                                    Document officiel
                                </p>
                            </div>
                        </div>
                        <Chip color={statusColorMap[doc.status]} variant="flat" size="sm" className="capitalize">
                            {doc.status ? doc.status.replace('_', ' ') : "Statut inconnu"}
                        </Chip>
                    </CardHeader>

                    <Divider className={isDark ? "bg-slate-800 opacity-50" : "bg-slate-100"} />

                    <CardBody className="py-4 space-y-4">
                        <div className={`rounded-lg p-3 border space-y-2
                            ${isDark ? "bg-slate-950/50 border-slate-800/50" : "bg-slate-50 border-slate-200"}`}>
                            <div className="flex items-center justify-between text-sm">
                                <span className={`flex items-center gap-2 ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                                    <Layers size={14} /> Domaine
                                </span>
                                <span className="text-orange-400 font-semibold capitalize">{doc.scope}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className={`flex items-center gap-2 ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                                    <ShieldCheck size={14} /> Type
                                </span>
                                <span className={`capitalize ${isDark ? "text-slate-200" : "text-slate-700"}`}>
                                    {doc.type ? doc.type.replace('_', ' ') : '-'}
                                </span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 px-1">
                            <div className="space-y-1">
                                <div className={`flex items-center gap-2 text-[10px] uppercase tracking-wider
                                    ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                                    <Clock size={12} /><span>Émission</span>
                                </div>
                                <p className={`text-sm ${isDark ? "text-slate-300" : "text-slate-600"}`}>
                                    {formatDate(doc.issueDate)}
                                </p>
                            </div>
                            <div className="space-y-1">
                                <div className={`flex items-center gap-2 text-[10px] uppercase tracking-wider
                                    ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                                    <Calendar size={12} /><span>Expiration</span>
                                </div>
                                <p className={`text-sm ${isDark ? "text-slate-300" : "text-slate-600"}`}>
                                    {formatDate(doc.expirationDate)}
                                </p>
                            </div>
                        </div>
                    </CardBody>

                    <CardFooter className={`flex justify-between gap-2 border-t
                        ${isDark ? "border-slate-800 bg-slate-950/30" : "border-slate-100 bg-slate-50/50"}`}>
                        <div className="flex gap-1">
                            <Tooltip content="Modifier">
                                <Button isIconOnly variant="light" size="sm" onPress={() => onEdit(doc)}
                                        className={isDark ? "text-slate-400 hover:text-white" : "text-slate-400 hover:text-slate-800"}>
                                    <Edit2 size={18} />
                                </Button>
                            </Tooltip>
                            <Tooltip content="Supprimer" color="danger">
                                <Button isIconOnly variant="light" size="sm" onPress={() => onDelete(doc.id)}
                                        className="text-slate-400 hover:text-danger">
                                    <Trash2 size={18} />
                                </Button>
                            </Tooltip>
                        </div>
                        <Button
                            size="sm" variant="flat"
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
