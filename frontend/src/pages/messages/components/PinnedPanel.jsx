import React from "react";
import { Pin, X } from "lucide-react";

export default function PinnedPanel({ messages, onClose, onScrollTo, isDark }) {
    const pinned = messages.filter((m) => m.pinned && !m.deleted);
    const bg = isDark ? "rgba(2,6,23,0.95)" : "rgba(248,250,252,0.97)";
    const headerBg = isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200";

    return (
        <div style={{ position: "absolute", inset: 0, zIndex: 40, background: bg, display: "flex", flexDirection: "column" }}>
            <div className={`flex items-center justify-between px-6 py-4 border-b flex-shrink-0 ${headerBg}`}>
                <div className="flex items-center gap-2">
                    <Pin size={16} className="text-[#ff922b]" />
                    <span className={`font-bold text-sm ${isDark ? "text-slate-100" : "text-slate-800"}`}>Messages épinglés</span>
                    <span className={`text-xs ${isDark ? "text-slate-500" : "text-slate-400"}`}>({pinned.length})</span>
                </div>
                <button onClick={onClose} className={isDark ? "text-slate-400 hover:text-white" : "text-slate-400 hover:text-slate-700"}><X size={18} /></button>
            </div>
            <div style={{ flex: 1, overflowY: "auto" }} className="px-6 py-4 space-y-3">
                {pinned.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center py-16">
                        <Pin size={24} className={isDark ? "text-slate-600 mb-3" : "text-slate-300 mb-3"} />
                        <p className={`text-sm ${isDark ? "text-slate-500" : "text-slate-400"}`}>Aucun message épinglé</p>
                    </div>
                ) : pinned.map((m) => (
                    <div key={m.id} onClick={() => { onScrollTo(m.id); onClose(); }}
                         className={`border rounded-xl px-4 py-3 cursor-pointer transition-colors group ${isDark ? "bg-slate-800/60 border-slate-700 hover:bg-slate-800" : "bg-white border-slate-200 hover:bg-slate-50 shadow-sm"}`}>
                        <div className="flex items-center gap-2 mb-1.5">
                            <Pin size={11} className="text-yellow-400" />
                            <span className={`text-[10px] ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                                {m.sentAt ? new Date(m.sentAt).toLocaleString("fr-FR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }) : ""}
                            </span>
                            <span className="ml-auto text-[10px] text-[#ff922b] opacity-0 group-hover:opacity-100 transition-opacity">Voir →</span>
                        </div>
                        <p className={`text-sm break-words line-clamp-3 ${isDark ? "text-slate-200" : "text-slate-700"}`}>{m.content}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}