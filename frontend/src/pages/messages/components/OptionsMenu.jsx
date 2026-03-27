import React, { useState, useEffect, useRef } from "react";
import { Button } from "@heroui/react";
import { MoreVertical, Pin } from "lucide-react";

export default function OptionsMenu({ pinnedCount, onShowPinned, isDark }) {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const menuBg = isDark ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200 shadow-lg";
    const itemClass = isDark ? "text-slate-300 hover:bg-slate-700/60" : "text-slate-600 hover:bg-slate-100";

    return (
        <div ref={ref} className="relative">
            <Button isIconOnly variant="flat" size="sm"
                    className={`border transition-colors ${isDark ? "bg-slate-800 text-slate-400 hover:text-white border-slate-700" : "bg-slate-100 text-slate-500 hover:text-slate-800 border-slate-200"}`}
                    onClick={() => setOpen(v => !v)}>
                <MoreVertical size={16} />
            </Button>
            {open && (
                <div className={`absolute right-0 top-full mt-2 border rounded-xl overflow-hidden min-w-[210px] z-50 ${menuBg}`}>
                    <button onClick={() => { onShowPinned(); setOpen(false); }}
                            className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${itemClass}`}>
                        <Pin size={15} className={isDark ? "text-slate-400" : "text-slate-500"} />
                        Messages épinglés
                        {pinnedCount > 0 && <span className="ml-auto bg-orange-500/20 text-[#ff922b] text-[10px] font-bold px-1.5 py-0.5 rounded-full">{pinnedCount}</span>}
                    </button>
                </div>
            )}
        </div>
    );
}