import React from "react";
import { Avatar, Chip, Tooltip } from "@heroui/react";
import { Phone } from "lucide-react";
import OptionsMenu from "./OptionsMenu";

export default function ChatHeader({ conversation, messages, onShowPinned }) {
    return (
        <div style={{ flexShrink: 0, borderBottom: "1px solid #1e293b", background: "#0f172a", padding: "16px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div className="flex gap-3 items-center">
                <div className="relative">
                    <Avatar name={conversation.initials} className="bg-orange-500/20 text-[#ff922b] font-bold border border-orange-500/30" size="md" />
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-slate-900" />
                </div>
                <div>
                    <p className="font-bold text-slate-100 text-sm">{conversation.conversation_name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-slate-400">{conversation.otherUserType}</span>
                        <span className="text-slate-700">•</span>
                        <Chip size="sm" variant="flat" className={`text-[10px] h-4 ${conversation.status === "ACTIVE" ? "bg-green-500/10 text-green-400 border border-green-500/20" : "bg-slate-700/50 text-slate-400"}`}>
                            {conversation.status}
                        </Chip>
                    </div>
                </div>
            </div>
            <div className="flex gap-1 items-center">
                {conversation.otherUserPhone ? (
                    <Tooltip content={conversation.otherUserPhone} placement="bottom">
                        <a href={`tel:${conversation.otherUserPhone}`} className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 hover:text-green-400 hover:border-green-500/40 transition-colors">
                            <Phone size={15} />
                        </a>
                    </Tooltip>
                ) : (
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 text-slate-600 cursor-not-allowed">
                        <Phone size={15} />
                    </span>
                )}
                <OptionsMenu
                    pinnedCount={messages.filter(m => m.pinned && !m.deleted).length}
                    onShowPinned={onShowPinned}
                />
            </div>
        </div>
    );
}