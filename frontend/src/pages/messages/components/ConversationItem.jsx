import React from "react";
import { Avatar } from "@heroui/react";
import { Clock } from "lucide-react";

export default function ConversationItem({ conversation_name, last_message, last_message_time, initials, active, onClick, formatTime, status }) {
    return (
        <div onClick={onClick}
             style={{ borderLeft: `2px solid ${active ? "#ff922b" : "transparent"}`, background: active ? "rgba(30,41,59,0.8)" : "transparent", cursor: "pointer", padding: "12px 16px", display: "flex", gap: "12px", transition: "all 0.15s" }}
             onMouseEnter={e => { if (!active) e.currentTarget.style.background = "rgba(30,41,59,0.4)"; }}
             onMouseLeave={e => { if (!active) e.currentTarget.style.background = "transparent"; }}>
            <div className="relative flex-shrink-0">
                <Avatar name={initials} size="sm" className={`font-bold text-sm border ${active ? "bg-orange-500/20 text-[#ff922b] border-orange-500/40" : "bg-slate-800 text-slate-400 border-slate-700"}`} />
                {status === "ACTIVE" && <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-slate-900" />}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
                <div className="flex justify-between items-start">
                    <p className={`font-semibold truncate text-sm ${active ? "text-slate-100" : "text-slate-300"}`}>{conversation_name}</p>
                    <span className="text-[10px] text-slate-600 whitespace-nowrap ml-2 flex items-center gap-1 flex-shrink-0">
                        <Clock size={9} />{formatTime(last_message_time)}
                    </span>
                </div>
                <p className="text-xs text-slate-500 truncate mt-0.5">{last_message}</p>
                {status && <span className={`text-[10px] px-1.5 py-0.5 rounded-full inline-block mt-1 font-medium ${status === "ACTIVE" ? "bg-green-500/10 text-green-400" : "bg-slate-800 text-slate-500"}`}>{status}</span>}
            </div>
        </div>
    );
}