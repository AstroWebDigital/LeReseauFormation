import React from "react";
import { Avatar } from "@heroui/react";
import { Clock, Archive } from "lucide-react";

const ONE_YEAR_MS = 365 * 24 * 60 * 60 * 1000;

export default function ConversationItem({ conversation_name, last_message, last_message_time, initials, active, onClick, formatTime, status, isDark }) {
    const archived = status === "ARCHIVED" || (last_message_time && (Date.now() - new Date(last_message_time).getTime()) > ONE_YEAR_MS);
    const activeBg = isDark ? "rgba(30,41,59,0.8)" : "rgba(255,146,43,0.08)";
    const hoverBg = isDark ? "rgba(30,41,59,0.4)" : "rgba(0,0,0,0.04)";
    const borderColor = active ? "#ff922b" : "transparent";

    return (
        <div onClick={onClick}
             style={{ borderLeft: `2px solid ${borderColor}`, background: active ? activeBg : "transparent", cursor: "pointer", padding: "12px 16px", display: "flex", gap: "12px", transition: "all 0.15s" }}
             onMouseEnter={e => { if (!active) e.currentTarget.style.background = hoverBg; }}
             onMouseLeave={e => { if (!active) e.currentTarget.style.background = "transparent"; }}>
            <div className="relative flex-shrink-0">
                <Avatar name={initials} size="sm" className={`font-bold text-sm border ${active ? "bg-orange-500/20 text-[#ff922b] border-orange-500/40" : isDark ? "bg-slate-800 text-slate-400 border-slate-700" : "bg-slate-100 text-slate-500 border-slate-300"}`} />
                {status === "ACTIVE" && <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 ${isDark ? "border-slate-900" : "border-white"}`} />}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
                <div className="flex justify-between items-start">
                    <p className={`font-semibold truncate text-sm ${active ? isDark ? "text-slate-100" : "text-slate-800" : isDark ? "text-slate-300" : "text-slate-600"}`}>{conversation_name}</p>
                    <span className={`text-[10px] whitespace-nowrap ml-2 flex items-center gap-1 flex-shrink-0 ${isDark ? "text-slate-600" : "text-slate-400"}`}>
                        <Clock size={9} />{formatTime(last_message_time)}
                    </span>
                </div>
                <p className={`text-xs truncate mt-0.5 ${isDark ? "text-slate-500" : "text-slate-400"}`}>{last_message}</p>
                <div className="flex items-center gap-1.5 mt-1">
                    {archived && (
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full inline-flex items-center gap-1 font-medium ${isDark ? "bg-slate-800 text-slate-500" : "bg-slate-100 text-slate-400"}`}>
                            <Archive size={8} />Archivée
                        </span>
                    )}
                    {status && !archived && <span className={`text-[10px] px-1.5 py-0.5 rounded-full inline-block font-medium ${status === "ACTIVE" ? "bg-green-500/10 text-green-400" : isDark ? "bg-slate-800 text-slate-500" : "bg-slate-100 text-slate-400"}`}>{status}</span>}
                </div>
            </div>
        </div>
    );
}