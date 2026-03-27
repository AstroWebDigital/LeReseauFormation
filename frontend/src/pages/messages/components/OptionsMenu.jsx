import React, { useState, useEffect, useRef } from "react";
import { Button } from "@heroui/react";
import { MoreVertical, Pin } from "lucide-react";

export default function OptionsMenu({ pinnedCount, onShowPinned }) {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    return (
        <div ref={ref} className="relative">
            <Button isIconOnly variant="flat" size="sm" className="bg-slate-800 text-slate-400 hover:text-white border border-slate-700" onClick={() => setOpen(v => !v)}>
                <MoreVertical size={16} />
            </Button>
            {open && (
                <div className="absolute right-0 top-full mt-2 bg-slate-800 border border-slate-700 rounded-xl shadow-xl overflow-hidden min-w-[210px] z-50">
                    <button onClick={() => { onShowPinned(); setOpen(false); }}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-700/60 transition-colors">
                        <Pin size={15} className="text-slate-400" />
                        Messages épinglés
                        {pinnedCount > 0 && <span className="ml-auto bg-orange-500/20 text-[#ff922b] text-[10px] font-bold px-1.5 py-0.5 rounded-full">{pinnedCount}</span>}
                    </button>
                </div>
            )}
        </div>
    );
}