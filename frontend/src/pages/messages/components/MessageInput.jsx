import React, { useRef, useState } from "react";
import { Button } from "@heroui/react";
import { Send, Smile, CheckCheck, Reply, Pencil, X } from "lucide-react";
import EmojiPicker from "emoji-picker-react";

function truncate(str, max = 60) {
    if (!str) return "";
    return str.length > max ? str.slice(0, max) + "…" : str;
}

export default function MessageInput({ onSend, replyTo, onCancelReply, editingMessage, onCancelEdit, isDark }) {
    const [message, setMessage] = useState("");
    const [showEmoji, setShowEmoji] = useState(false);
    const textareaRef = useRef(null);

    const bg = isDark ? "#0f172a" : "#ffffff";
    const border = isDark ? "#1e293b" : "#e2e8f0";
    const wrapperBg = isDark ? "bg-slate-800/60 border-slate-700" : "bg-slate-50 border-slate-300";
    const textColor = isDark ? "#e2e8f0" : "#1e293b";
    const placeholderColor = isDark ? "placeholder:text-slate-600" : "placeholder:text-slate-400";

    const handleSend = () => {
        if (!message.trim()) return;
        onSend(message.trim());
        setMessage("");
        setShowEmoji(false);
        if (textareaRef.current) textareaRef.current.style.height = "auto";
    };

    React.useEffect(() => {
        if (editingMessage) {
            setMessage(editingMessage.content);
            setTimeout(() => textareaRef.current?.focus(), 50);
        } else {
            setMessage("");
        }
    }, [editingMessage]);

    return (
        <div style={{ flexShrink: 0, borderTop: `1px solid ${border}`, background: bg, padding: "12px 24px", position: "relative" }}>
            {showEmoji && (
                <div style={{ position: "absolute", bottom: "100%", left: "24px", marginBottom: "8px", zIndex: 50 }}>
                    <EmojiPicker onEmojiClick={(e) => setMessage(m => m + e.emoji)} theme={isDark ? "dark" : "light"} />
                </div>
            )}

            {replyTo && (
                <div style={{ marginBottom: "8px", display: "flex", alignItems: "center", gap: "12px", borderLeft: "2px solid #ff922b", paddingLeft: "12px" }}>
                    <Reply size={14} className="text-[#ff922b] flex-shrink-0" />
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <p className="text-[11px] text-[#ff922b] font-semibold mb-0.5">Répondre à</p>
                        <p className={`text-xs truncate ${isDark ? "text-slate-400" : "text-slate-500"}`}>{truncate(replyTo.content)}</p>
                    </div>
                    <button onClick={onCancelReply} className={isDark ? "text-slate-500 hover:text-slate-300" : "text-slate-400 hover:text-slate-600"}><X size={14} /></button>
                </div>
            )}

            {editingMessage && (
                <div style={{ marginBottom: "8px", display: "flex", alignItems: "center", gap: "12px", borderLeft: "2px solid #3b82f6", paddingLeft: "12px" }}>
                    <Pencil size={14} className="text-blue-400 flex-shrink-0" />
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <p className="text-[11px] text-blue-400 font-semibold mb-0.5">Modifier</p>
                        <p className={`text-xs truncate ${isDark ? "text-slate-400" : "text-slate-500"}`}>{truncate(editingMessage.content)}</p>
                    </div>
                    <button onClick={onCancelEdit} className={isDark ? "text-slate-500 hover:text-slate-300" : "text-slate-400 hover:text-slate-600"}><X size={14} /></button>
                </div>
            )}

            <div className={`flex gap-2 items-end rounded-2xl border focus-within:border-orange-500/50 transition-all p-2 ${wrapperBg}`}>
                <Button isIconOnly variant="light" size="sm"
                        className={`flex-shrink-0 self-end mb-0.5 ${isDark ? "text-slate-500 hover:text-[#ff922b]" : "text-slate-400 hover:text-[#ff922b]"}`}
                        onClick={() => setShowEmoji(v => !v)}>
                    <Smile size={18} />
                </Button>
                <textarea
                    ref={textareaRef}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={editingMessage ? "Modifier le message..." : "Écrire un message..."}
                    rows={1}
                    style={{ flex: 1, background: "transparent", color: textColor, fontSize: "14px", outline: "none", resize: "none", padding: "6px 4px", lineHeight: "1.5", maxHeight: "120px", overflowY: "auto" }}
                    className={placeholderColor}
                    onInput={(e) => { e.target.style.height = "auto"; e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px"; }}
                    onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
                        if (e.key === "Escape") {
                            setShowEmoji(false);
                            if (editingMessage) onCancelEdit();
                            if (replyTo) onCancelReply();
                        }
                    }}
                />
                <Button isIconOnly size="sm"
                        style={{ flexShrink: 0, alignSelf: "flex-end" }}
                        className={`transition-all ${message.trim() ? editingMessage ? "bg-blue-500 text-white shadow-lg shadow-blue-500/20" : "bg-[#ff922b] text-white shadow-lg shadow-orange-500/20" : isDark ? "bg-slate-700 text-slate-500" : "bg-slate-200 text-slate-400"}`}
                        onClick={handleSend} isDisabled={!message.trim()}>
                    {editingMessage ? <CheckCheck size={15} /> : <Send size={15} />}
                </Button>
            </div>
            <p style={{ fontSize: "10px", color: isDark ? "#334155" : "#94a3b8", marginTop: "6px", marginLeft: "8px" }}>
                Entrée pour envoyer • Maj+Entrée pour nouvelle ligne • Échap pour annuler
            </p>
        </div>
    );
}