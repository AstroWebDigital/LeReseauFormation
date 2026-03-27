import React, { useState, useEffect, useRef } from "react";
import { Reply, Pencil, Copy, Trash2, Pin } from "lucide-react";

const REACTIONS = ["❤️", "🔥", "😂", "👍", "😮", "😢"];

function CtxItem({ icon, label, onClick, danger, isDark }) {
    return (
        <button onClick={onClick} className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
            danger
                ? "text-red-400 hover:bg-red-500/10"
                : isDark ? "text-slate-300 hover:bg-slate-700/60 hover:text-slate-100" : "text-slate-600 hover:bg-slate-100 hover:text-slate-800"
        }`}>
            <span className={danger ? "text-red-400" : isDark ? "text-slate-400" : "text-slate-500"}>{icon}</span>
            {label}
        </button>
    );
}

export default function ContextMenu({ x, y, message, isOwn, onClose, onReply, onReact, onEdit, onCopy, onDelete, onPin, isDark }) {
    const menuRef = useRef(null);
    const [pos, setPos] = useState({ x, y });

    useEffect(() => {
        const handler = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) onClose(); };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [onClose]);

    useEffect(() => {
        if (menuRef.current) {
            const rect = menuRef.current.getBoundingClientRect();
            setPos({
                x: x + rect.width > window.innerWidth ? window.innerWidth - rect.width - 8 : x,
                y: y + rect.height > window.innerHeight ? window.innerHeight - rect.height - 8 : y,
            });
        }
    }, [x, y]);

    const menuBg = isDark ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200";
    const reactionBg = isDark ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200";
    const reactionHover = isDark ? "hover:bg-slate-700" : "hover:bg-slate-100";
    const divider = isDark ? "border-slate-700" : "border-slate-200";

    return (
        <div ref={menuRef} className="fixed z-[999] select-none" style={{ left: pos.x, top: pos.y }}>
            <div className={`flex items-center gap-1 border rounded-2xl px-3 py-2 mb-1.5 shadow-xl ${reactionBg}`}>
                {REACTIONS.map((emoji) => (
                    <button key={emoji} onClick={() => { onReact(emoji); onClose(); }}
                            className={`text-xl transition-transform w-8 h-8 flex items-center justify-center rounded-full hover:scale-125 ${reactionHover}`}>
                        {emoji}
                    </button>
                ))}
            </div>
            <div className={`border rounded-xl shadow-xl overflow-hidden min-w-[200px] ${menuBg}`}>
                <CtxItem icon={<Reply size={15} />} label="Répondre" onClick={() => { onReply(); onClose(); }} isDark={isDark} />
                {isOwn && !message.deleted && <CtxItem icon={<Pencil size={15} />} label="Modifier" onClick={() => { onEdit(); onClose(); }} isDark={isDark} />}
                {!message.deleted && <CtxItem icon={<Copy size={15} />} label="Copier" onClick={() => { onCopy(); onClose(); }} isDark={isDark} />}
                <CtxItem icon={<Pin size={15} />} label={message.pinned ? "Désépingler" : "Épingler"} onClick={() => { onPin(); onClose(); }} isDark={isDark} />
                <div className={`border-t ${divider}`} />
                {isOwn && !message.deleted && <CtxItem icon={<Trash2 size={15} />} label="Supprimer" onClick={() => { onDelete(); onClose(); }} danger isDark={isDark} />}
            </div>
        </div>
    );
}