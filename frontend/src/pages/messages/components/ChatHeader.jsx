import React from "react";
import { Avatar, Chip, Tooltip } from "@heroui/react";
import { Phone, ChevronLeft } from "lucide-react";
import OptionsMenu from "./OptionsMenu";

export default function ChatHeader({ conversation, messages, onShowPinned, onBack, isDark }) {
    const bg = isDark ? "#0f172a" : "#ffffff";
    const border = isDark ? "#1e293b" : "#e2e8f0";

    return (
        <div style={{ flexShrink: 0, borderBottom: `1px solid ${border}`, background: bg, padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div className="flex gap-2 items-center">
                {/* Bouton retour mobile */}
                <button
                    onClick={onBack}
                    className={`md:hidden p-1.5 rounded-lg mr-1 transition-colors ${isDark ? "text-slate-400 hover:bg-slate-800" : "text-slate-500 hover:bg-slate-100"}`}
                    aria-label="Retour"
                >
                    <ChevronLeft size={20} />
                </button>
                <div className="relative">
                    <Avatar name={conversation.initials} className="bg-orange-500/20 text-[#ff922b] font-bold border border-orange-500/30" size="md" />
                    <span className={`absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 ${isDark ? "border-slate-900" : "border-white"}`} />
                </div>
                <div>
                    <p className={`font-bold text-sm ${isDark ? "text-slate-100" : "text-slate-800"}`}>{conversation.conversation_name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                        <span className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>{conversation.otherUserType}</span>
                        <span className={isDark ? "text-slate-700" : "text-slate-300"}>•</span>
                        <Chip size="sm" variant="flat" className={`text-[10px] h-4 ${conversation.status === "ACTIVE" ? "bg-green-500/10 text-green-400 border border-green-500/20" : isDark ? "bg-slate-700/50 text-slate-400" : "bg-slate-100 text-slate-400"}`}>
                            {conversation.status}
                        </Chip>
                    </div>
                </div>
            </div>
            <div className="flex gap-1 items-center">
                {conversation.otherUserPhone ? (
                    <Tooltip content={conversation.otherUserPhone} placement="bottom">
                        <a href={`tel:${conversation.otherUserPhone}`} className={`inline-flex items-center justify-center w-8 h-8 rounded-lg border transition-colors hover:text-green-400 hover:border-green-500/40 ${isDark ? "bg-slate-800 border-slate-700 text-slate-400" : "bg-slate-100 border-slate-200 text-slate-500"}`}>
                            <Phone size={15} />
                        </a>
                    </Tooltip>
                ) : (
                    <span className={`inline-flex items-center justify-center w-8 h-8 rounded-lg border cursor-not-allowed ${isDark ? "bg-slate-800 border-slate-700 text-slate-600" : "bg-slate-100 border-slate-200 text-slate-300"}`}>
                        <Phone size={15} />
                    </span>
                )}
                <OptionsMenu pinnedCount={messages.filter(m => m.pinned && !m.deleted).length} onShowPinned={onShowPinned} isDark={isDark} />
            </div>
        </div>
    );
}