import React from "react";
import { Pin, X } from "lucide-react";

export default function PinnedPanel({ messages, onClose, onScrollTo }) {
    const pinned = messages.filter((m) => m.pinned && !m.deleted);
    return (
        <div style={{ position: "absolute", inset: 0, zIndex: 40, background: "rgba(2,6,23,0.95)", display: "flex", flexDirection: "column" }}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900 flex-shrink-0">
                <div className="flex items-center gap-2">
                    <Pin size={16} className="text-[#ff922b]" />
                    <span className="font-bold text-slate-100 text-sm">Messages épinglés</span>
                    <span className="text-xs text-slate-500">({pinned.length})</span>
                </div>
                <button onClick={onClose} className="text-slate-400 hover:text-white"><X size={18} /></button>
            </div>
            <div style={{ flex: 1, overflowY: "auto" }} className="px-6 py-4 space-y-3">
                {pinned.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center py-16">
                        <Pin size={24} className="text-slate-600 mb-3" />
                        <p className="text-slate-500 text-sm">Aucun message épinglé</p>
                    </div>
                ) : pinned.map((m) => (
                    <div key={m.id} onClick={() => { onScrollTo(m.id); onClose(); }}
                         className="bg-slate-800/60 border border-slate-700 rounded-xl px-4 py-3 cursor-pointer hover:bg-slate-800 transition-colors group">
                        <div className="flex items-center gap-2 mb-1.5">
                            <Pin size={11} className="text-yellow-400" />
                            <span className="text-[10px] text-slate-500">
                                {m.sentAt ? new Date(m.sentAt).toLocaleString("fr-FR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }) : ""}
                            </span>
                            <span className="ml-auto text-[10px] text-[#ff922b] opacity-0 group-hover:opacity-100 transition-opacity">Voir →</span>
                        </div>
                        <p className="text-sm text-slate-200 break-words line-clamp-3">{m.content}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}