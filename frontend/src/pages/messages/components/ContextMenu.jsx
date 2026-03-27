import React, { useState, useEffect, useRef } from "react";
import { Reply, Pencil, Copy, Trash2, Pin } from "lucide-react";

const REACTIONS = ["❤️", "🔥", "😂", "👍", "😮", "😢"];

function CtxItem({ icon, label, onClick, danger }) {
    return (
        <button onClick={onClick} className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-slate-700/60 ${danger ? "text-red-400" : "text-slate-300 hover:text-slate-100"}`}>
            <span className={danger ? "text-red-400" : "text-slate-400"}>{icon}</span>
            {label}
        </button>
    );
}

export default function ContextMenu({ x, y, message, isOwn, onClose, onReply, onReact, onEdit, onCopy, onDelete, onPin }) {
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

    return (
        <div ref={menuRef} className="fixed z-[999] select-none" style={{ left: pos.x, top: pos.y }}>
            <div className="flex items-center gap-1 bg-slate-800 border border-slate-700 rounded-2xl px-3 py-2 mb-1.5 shadow-xl">
                {REACTIONS.map((emoji) => (
                    <button key={emoji} onClick={() => { onReact(emoji); onClose(); }}
                            className="text-xl hover:scale-125 transition-transform w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-700">
                        {emoji}
                    </button>
                ))}
            </div>
            <div className="bg-slate-800 border border-slate-700 rounded-xl shadow-xl overflow-hidden min-w-[200px]">
                <CtxItem icon={<Reply size={15} />} label="Répondre" onClick={() => { onReply(); onClose(); }} />
                {isOwn && !message.deleted && <CtxItem icon={<Pencil size={15} />} label="Modifier" onClick={() => { onEdit(); onClose(); }} />}
                {!message.deleted && <CtxItem icon={<Copy size={15} />} label="Copier" onClick={() => { onCopy(); onClose(); }} />}
                <CtxItem icon={<Pin size={15} />} label={message.pinned ? "Désépingler" : "Épingler"} onClick={() => { onPin(); onClose(); }} />
                <div className="border-t border-slate-700" />
                {isOwn && !message.deleted && <CtxItem icon={<Trash2 size={15} />} label="Supprimer" onClick={() => { onDelete(); onClose(); }} danger />}
            </div>
        </div>
    );
}