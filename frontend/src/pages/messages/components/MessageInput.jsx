import React, { useRef, useState } from "react";
import { Button } from "@heroui/react";
import { Send, Smile, CheckCheck, Reply, Pencil, X } from "lucide-react";
import EmojiPicker from "emoji-picker-react";

function truncate(str, max = 60) {
    if (!str) return "";
    return str.length > max ? str.slice(0, max) + "…" : str;
}

export default function MessageInput({ onSend, replyTo, onCancelReply, editingMessage, onCancelEdit }) {
    const [message, setMessage] = useState("");
    const [showEmoji, setShowEmoji] = useState(false);
    const textareaRef = useRef(null);

    const handleSend = () => {
        if (!message.trim()) return;
        onSend(message.trim());
        setMessage("");
        setShowEmoji(false);
        if (textareaRef.current) textareaRef.current.style.height = "auto";
    };

    // Sync message when editing
    React.useEffect(() => {
        if (editingMessage) {
            setMessage(editingMessage.content);
            setTimeout(() => textareaRef.current?.focus(), 50);
        } else {
            setMessage("");
        }
    }, [editingMessage]);

    return (
        <div style={{ flexShrink: 0, borderTop: "1px solid #1e293b", background: "#0f172a", padding: "12px 24px", position: "relative" }}>
            {showEmoji && (
                <div style={{ position: "absolute", bottom: "100%", left: "24px", marginBottom: "8px", zIndex: 50 }}>
                    <EmojiPicker onEmojiClick={(e) => setMessage(m => m + e.emoji)} theme="dark" />
                </div>
            )}

            {/* Reply bar */}
            {replyTo && (
                <div style={{ marginBottom: "8px", display: "flex", alignItems: "center", gap: "12px", borderLeft: "2px solid #ff922b", paddingLeft: "12px" }}>
                    <Reply size={14} className="text-[#ff922b] flex-shrink-0" />
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <p className="text-[11px] text-[#ff922b] font-semibold mb-0.5">Répondre à</p>
                        <p className="text-xs text-slate-400 truncate">{truncate(replyTo.content)}</p>
                    </div>
                    <button onClick={onCancelReply} className="text-slate-500 hover:text-slate-300"><X size={14} /></button>
                </div>
            )}

            {/* Edit bar */}
            {editingMessage && (
                <div style={{ marginBottom: "8px", display: "flex", alignItems: "center", gap: "12px", borderLeft: "2px solid #3b82f6", paddingLeft: "12px" }}>
                    <Pencil size={14} className="text-blue-400 flex-shrink-0" />
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <p className="text-[11px] text-blue-400 font-semibold mb-0.5">Modifier</p>
                        <p className="text-xs text-slate-400 truncate">{truncate(editingMessage.content)}</p>
                    </div>
                    <button onClick={onCancelEdit} className="text-slate-500 hover:text-slate-300"><X size={14} /></button>
                </div>
            )}

            <div className="flex gap-2 items-end bg-slate-800/60 rounded-2xl border border-slate-700 focus-within:border-orange-500/50 transition-all p-2">
                <Button isIconOnly variant="light" size="sm"
                        className="text-slate-500 hover:text-[#ff922b] flex-shrink-0 self-end mb-0.5"
                        onClick={() => setShowEmoji(v => !v)}>
                    <Smile size={18} />
                </Button>
                <textarea
                    ref={textareaRef}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={editingMessage ? "Modifier le message..." : "Écrire un message..."}
                    rows={1}
                    style={{ flex: 1, background: "transparent", color: "#e2e8f0", fontSize: "14px", outline: "none", resize: "none", padding: "6px 4px", lineHeight: "1.5", maxHeight: "120px", overflowY: "auto" }}
                    className="placeholder:text-slate-600"
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
                        className={`transition-all ${message.trim() ? editingMessage ? "bg-blue-500 text-white shadow-lg shadow-blue-500/20" : "bg-[#ff922b] text-white shadow-lg shadow-orange-500/20" : "bg-slate-700 text-slate-500"}`}
                        onClick={handleSend} isDisabled={!message.trim()}>
                    {editingMessage ? <CheckCheck size={15} /> : <Send size={15} />}
                </Button>
            </div>
            <p style={{ fontSize: "10px", color: "#334155", marginTop: "6px", marginLeft: "8px" }}>
                Entrée pour envoyer • Maj+Entrée pour nouvelle ligne • Échap pour annuler
            </p>
        </div>
    );
}