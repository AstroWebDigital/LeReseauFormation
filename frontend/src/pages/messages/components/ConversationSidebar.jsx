import React from "react";
import { Input } from "@heroui/react";
import { Search, MessageSquare, Archive } from "lucide-react";
import ConversationItem from "./ConversationItem";

export default function ConversationSidebar({ conversations, activeConversation, onSelect, searchQuery, onSearch, activeTab, onTabChange, isLoading, userRole, formatTime, isDark }) {
    const bg = isDark ? "#0f172a" : "#ffffff";
    const border = isDark ? "#1e293b" : "#e2e8f0";
    const textMain = isDark ? "text-slate-100" : "text-slate-800";
    const textSub = isDark ? "text-slate-500" : "text-slate-400";

    return (
        <div style={{ width: "100%", flexShrink: 0, display: "flex", flexDirection: "column", height: "100%", overflow: "hidden", borderRight: `1px solid ${border}`, background: bg }}>
            <div style={{ flexShrink: 0, padding: "20px", borderBottom: `1px solid ${border}` }}>
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-500/10 rounded-lg">
                        <MessageSquare size={20} className="text-[#ff922b]" />
                    </div>
                    <div>
                        <h1 className={`text-lg font-bold ${textMain}`}>Messagerie</h1>
                        <p className={`text-xs ${textSub}`}>{userRole === "alp" ? "Agent ALP" : "Client"} • {conversations.length} {activeTab === "archives" ? "archivée(s)" : "conversation(s)"}</p>
                    </div>
                </div>
            </div>

            <div style={{ flexShrink: 0, padding: "16px" }}>
                <Input
                    startContent={<Search size={15} className={isDark ? "text-slate-500" : "text-slate-400"} />}
                    placeholder="Rechercher..." value={searchQuery}
                    onChange={(e) => onSearch(e.target.value)}
                    classNames={{
                        inputWrapper: isDark
                            ? "bg-slate-800/60 border-slate-700 hover:border-slate-600 focus-within:border-orange-500/70 transition-all"
                            : "bg-slate-50 border-slate-300 hover:border-slate-400 focus-within:border-orange-500/70 transition-all",
                        input: isDark ? "!text-slate-300 placeholder:text-slate-600 text-sm" : "!text-slate-700 placeholder:text-slate-400 text-sm",
                    }}
                    variant="bordered" size="sm"
                />
            </div>

            <div style={{ flexShrink: 0, display: "flex", gap: "6px", padding: "0 16px 8px" }}>
                {[
                    { key: "all", label: "Toutes" },
                    { key: "active", label: "Actives" },
                    { key: "archives", label: "Archives", icon: <Archive size={10} className="inline-block mr-0.5 -mt-0.5" /> },
                ].map(({ key, label, icon }) => (
                    <button key={key} onClick={() => onTabChange(key)}
                            className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                                activeTab === key
                                    ? key === "archives"
                                        ? "bg-slate-500/15 text-slate-400 border border-slate-500/30"
                                        : "bg-orange-500/15 text-[#ff922b] border border-orange-500/30"
                                    : isDark ? "text-slate-500 hover:text-slate-300 border border-transparent" : "text-slate-400 hover:text-slate-600 border border-transparent"
                            }`}>
                        {icon}{label}
                    </button>
                ))}
            </div>

            <div style={{ flex: 1, overflowY: "auto", minHeight: 0 }}>
                {isLoading ? (
                    <div className="flex flex-col gap-3 p-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="flex gap-3 p-3 animate-pulse">
                                <div className={`w-10 h-10 rounded-full flex-shrink-0 ${isDark ? "bg-slate-800" : "bg-slate-200"}`} />
                                <div className="flex-1 space-y-2">
                                    <div className={`h-3 rounded w-3/4 ${isDark ? "bg-slate-800" : "bg-slate-200"}`} />
                                    <div className={`h-2 rounded w-1/2 ${isDark ? "bg-slate-800" : "bg-slate-200"}`} />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : conversations.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-8 text-center">
                        <MessageSquare size={24} className={isDark ? "text-slate-600 mb-3" : "text-slate-300 mb-3"} />
                        <p className={`text-sm ${isDark ? "text-slate-500" : "text-slate-400"}`}>Aucune conversation</p>
                    </div>
                ) : conversations.map(conv => (
                    <ConversationItem
                        key={conv.id} {...conv}
                        active={activeConversation?.id === conv.id}
                        onClick={() => onSelect(conv)}
                        formatTime={formatTime}
                        isDark={isDark}
                    />
                ))}
            </div>
        </div>
    );
}