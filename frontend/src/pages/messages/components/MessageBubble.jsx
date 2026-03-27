import React from "react";
import { Reply, Trash2, CheckCheck, Clock } from "lucide-react";

function truncate(str, max = 60) {
    if (!str) return "";
    return str.length > max ? str.slice(0, max) + "…" : str;
}

export function isSameDay(d1, d2) {
    return d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate();
}

export function formatDateLabel(dateStr) {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    if (isSameDay(date, today)) return "Aujourd'hui";
    if (isSameDay(date, yesterday)) return "Hier";
    return date.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}

export function DateSeparator({ label }) {
    return (
        <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-px bg-slate-800" />
            <span className="text-[11px] text-slate-500 font-medium px-2 whitespace-nowrap capitalize">{label}</span>
            <div className="flex-1 h-px bg-slate-800" />
        </div>
    );
}

const MessageBubble = React.forwardRef(function MessageBubble(
    { content, sentAt, left, isConsecutive, isTemp, reactions, pinned, starred, replyTo, deleted, edited, onContextMenu, onReplyClick },
    ref
) {
    const time = sentAt ? new Date(sentAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }) : "";

    const bubbleStyle = {
        padding: "10px 16px",
        borderRadius: "16px",
        fontSize: "14px",
        lineHeight: "1.5",
        wordBreak: "break-word",
        whiteSpace: "pre-wrap",
        opacity: isTemp ? 0.6 : 1,
        ...(deleted ? {
            background: "rgba(30,41,59,0.4)",
            border: "1px solid rgba(51,65,85,0.3)",
            color: "#64748b",
        } : left ? {
            background: "#1e293b",
            color: "#e2e8f0",
            borderTopLeftRadius: "4px",
            border: "1px solid rgba(51,65,85,0.5)",
        } : {
            background: "#ff922b",
            color: "white",
            borderTopRightRadius: "4px",
            boxShadow: "0 4px 12px rgba(255,146,43,0.15)",
        }),
    };

    return (
        <div ref={ref}
             style={{ display: "flex", justifyContent: left ? "flex-start" : "flex-end", marginTop: isConsecutive ? "4px" : "12px" }}
             onContextMenu={deleted ? undefined : onContextMenu}>
            <div style={{ maxWidth: "65%", display: "flex", flexDirection: "column", alignItems: left ? "flex-start" : "flex-end" }} className="group">
                {replyTo && !deleted && (
                    <div onClick={onReplyClick}
                         style={{ fontSize: "11px", padding: "6px 12px", borderRadius: "12px", marginBottom: "4px", borderLeft: "2px solid #ff922b", background: "rgba(30,41,59,0.8)", color: "#94a3b8", overflow: "hidden", cursor: "pointer", maxWidth: "100%" }}
                         onMouseEnter={e => e.currentTarget.style.background = "rgba(51,65,85,0.8)"}
                         onMouseLeave={e => e.currentTarget.style.background = "rgba(30,41,59,0.8)"}>
                        <p style={{ fontSize: "10px", color: "#ff922b", fontWeight: 600, marginBottom: "2px", display: "flex", alignItems: "center", gap: "4px" }}>
                            <Reply size={9} /> En réponse à
                        </p>
                        <span style={{ display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{truncate(replyTo.content)}</span>
                    </div>
                )}
                <div style={bubbleStyle}>
                    {deleted ? (
                        <span style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", fontStyle: "italic" }}>
                            <Trash2 size={11} />
                            {left ? "Ce message a été supprimé" : "Vous avez supprimé ce message"}
                        </span>
                    ) : (
                        <>
                            {(pinned || starred) && (
                                <div style={{ display: "flex", gap: "4px", marginBottom: "4px" }}>
                                    {pinned && <span style={{ fontSize: "10px" }}>📌</span>}
                                    {starred && <span style={{ fontSize: "10px" }}>⭐</span>}
                                </div>
                            )}
                            {content}
                        </>
                    )}
                </div>
                {!deleted && reactions && Object.keys(reactions).length > 0 && (
                    <div style={{ display: "flex", gap: "4px", marginTop: "4px", flexWrap: "wrap" }}>
                        {Object.entries(reactions).map(([emoji]) => (
                            <span key={emoji} style={{ fontSize: "12px", background: "#1e293b", border: "1px solid #334155", borderRadius: "999px", padding: "2px 8px" }}>{emoji}</span>
                        ))}
                    </div>
                )}
                <div style={{ display: "flex", alignItems: "center", gap: "4px", marginTop: "4px", padding: "0 4px", flexDirection: left ? "row" : "row-reverse", opacity: 0, transition: "opacity 0.2s" }}
                     className="group-hover:opacity-100">
                    <span style={{ fontSize: "10px", color: "#475569" }}>{time}</span>
                    {edited && !deleted && <span style={{ fontSize: "10px", color: "#475569", fontStyle: "italic" }}>modifié</span>}
                    {!left && !isTemp && !deleted && <CheckCheck size={10} style={{ color: "#475569" }} />}
                    {isTemp && <Clock size={10} style={{ color: "#475569" }} />}
                </div>
            </div>
        </div>
    );
});

export default MessageBubble;