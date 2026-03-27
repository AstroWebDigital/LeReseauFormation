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

export function DateSeparator({ label, isDark }) {
    return (
        <div className="flex items-center gap-3 my-4">
            <div className={`flex-1 h-px ${isDark ? "bg-slate-800" : "bg-slate-200"}`} />
            <span className={`text-[11px] font-medium px-2 whitespace-nowrap capitalize ${isDark ? "text-slate-500" : "text-slate-400"}`}>{label}</span>
            <div className={`flex-1 h-px ${isDark ? "bg-slate-800" : "bg-slate-200"}`} />
        </div>
    );
}

const MessageBubble = React.forwardRef(function MessageBubble(
    { content, sentAt, left, isConsecutive, isTemp, reactions, pinned, starred, replyTo, deleted, edited, onContextMenu, onReplyClick, isDark },
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
            background: isDark ? "rgba(30,41,59,0.4)" : "rgba(241,245,249,0.8)",
            border: isDark ? "1px solid rgba(51,65,85,0.3)" : "1px solid rgba(203,213,225,0.5)",
            color: isDark ? "#64748b" : "#94a3b8",
        } : left ? {
            background: isDark ? "#1e293b" : "#f1f5f9",
            color: isDark ? "#e2e8f0" : "#1e293b",
            borderTopLeftRadius: "4px",
            border: isDark ? "1px solid rgba(51,65,85,0.5)" : "1px solid rgba(203,213,225,0.6)",
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
                         style={{ fontSize: "11px", padding: "6px 12px", borderRadius: "12px", marginBottom: "4px", borderLeft: "2px solid #ff922b", background: isDark ? "rgba(30,41,59,0.8)" : "rgba(241,245,249,0.9)", color: isDark ? "#94a3b8" : "#64748b", overflow: "hidden", cursor: "pointer", maxWidth: "100%" }}
                         onMouseEnter={e => e.currentTarget.style.background = isDark ? "rgba(51,65,85,0.8)" : "rgba(226,232,240,0.9)"}
                         onMouseLeave={e => e.currentTarget.style.background = isDark ? "rgba(30,41,59,0.8)" : "rgba(241,245,249,0.9)"}>
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
                            <span key={emoji} style={{ fontSize: "12px", background: isDark ? "#1e293b" : "#f1f5f9", border: isDark ? "1px solid #334155" : "1px solid #e2e8f0", borderRadius: "999px", padding: "2px 8px" }}>{emoji}</span>
                        ))}
                    </div>
                )}
                <div style={{ display: "flex", alignItems: "center", gap: "4px", marginTop: "4px", padding: "0 4px", flexDirection: left ? "row" : "row-reverse", opacity: 0, transition: "opacity 0.2s" }}
                     className="group-hover:opacity-100">
                    <span style={{ fontSize: "10px", color: isDark ? "#475569" : "#94a3b8" }}>{time}</span>
                    {edited && !deleted && <span style={{ fontSize: "10px", color: isDark ? "#475569" : "#94a3b8", fontStyle: "italic" }}>modifié</span>}
                    {!left && !isTemp && !deleted && <CheckCheck size={10} style={{ color: isDark ? "#475569" : "#94a3b8" }} />}
                    {isTemp && <Clock size={10} style={{ color: isDark ? "#475569" : "#94a3b8" }} />}
                </div>
            </div>
        </div>
    );
});

export default MessageBubble;