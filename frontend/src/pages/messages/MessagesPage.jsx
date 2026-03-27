import React, { useState, useEffect, useCallback, useRef } from "react";
import api from "@/services/auth/client";
import { MessageSquare, User } from "lucide-react";
import { useAuth } from "@/auth/AuthContext";

import ConversationSidebar from "./components/ConversationSidebar";
import ChatHeader from "./components/ChatHeader";
import MessageBubble, { DateSeparator, formatDateLabel, isSameDay } from "./components/MessageBubble";
import MessageInput from "./components/MessageInput";
import ContextMenu from "./components/ContextMenu";
import PinnedPanel from "./components/PinnedPanel";

/* ================= AUTH ================= */
const useMessageAuth = () => {
    const { user, isAuthenticated } = useAuth();
    const userId = user?.id || null;
    let userRole = null;
    if (user?.roles) {
        const roles = Array.isArray(user.roles) ? user.roles.join(",").toUpperCase() : String(user.roles).toUpperCase();
        userRole = roles.includes("ALP") || roles.includes("PARTENAIRE") ? "alp" : "customer";
    }
    return { userId, userRole, isAuthenticated };
};

export default function MessagesPage() {
    const { userId: CURRENT_USER_ID, userRole, isAuthenticated } = useMessageAuth();

    const [conversations, setConversations] = useState([]);
    const [activeConversation, setActiveConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [activeTab, setActiveTab] = useState("all");
    const [isLoadingConversations, setIsLoadingConversations] = useState(true);
    const [isLoadingMessages, setIsLoadingMessages] = useState(false);
    const [hasAuthError, setHasAuthError] = useState(false);
    const [contextMenu, setContextMenu] = useState(null);
    const [replyTo, setReplyTo] = useState(null);
    const [editingMessage, setEditingMessage] = useState(null);
    const [showPinned, setShowPinned] = useState(false);

    const messagesContainerRef = useRef(null);
    const messageRefs = useRef({});

    const scrollToBottom = useCallback(() => {
        setTimeout(() => {
            const c = messagesContainerRef.current;
            if (c) c.scrollTop = c.scrollHeight;
        }, 50);
    }, []);

    const scrollToMessage = (id) => {
        const c = messagesContainerRef.current;
        const el = messageRefs.current[id];
        if (el && c) {
            c.scrollTo({ top: el.offsetTop - c.clientHeight / 2 + el.clientHeight / 2, behavior: "smooth" });
            el.style.transition = "box-shadow 0.3s";
            el.style.boxShadow = "0 0 0 2px rgba(255,146,43,0.5)";
            el.style.borderRadius = "1rem";
            setTimeout(() => { el.style.boxShadow = ""; }, 1500);
        }
    };

    const formatTime = (ts) => {
        if (!ts) return "";
        const d = new Date(ts);
        if ((new Date() - d) < 86400000) return d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
        return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" });
    };

    useEffect(() => {
        if (!isAuthenticated || !CURRENT_USER_ID) { setHasAuthError(true); setIsLoadingConversations(false); return; }
        (async () => {
            setIsLoadingConversations(true);
            try {
                const { data } = await api.get(`/api/channels`);
                const formatted = data.map((ch) => {
                    const isRenter = CURRENT_USER_ID === ch.renterUserId;
                    return {
                        id: ch.id,
                        conversation_name: ch.channelName || `Conversation #${ch.id?.toString().slice(0, 8)}`,
                        last_message: ch.lastMessage || "Démarrer la conversation...",
                        last_message_time: ch.updatedAt || ch.createdAt || "",
                        status: ch.status,
                        renterUserId: ch.renterUserId,
                        ownerUserId: ch.ownerUserId,
                        initials: isRenter ? "P" : "L",
                        otherUserType: isRenter ? "Propriétaire" : "Locataire",
                        otherUserId: isRenter ? ch.ownerUserId : ch.renterUserId,
                        otherUserPhone: isRenter ? (ch.ownerPhone || null) : (ch.renterPhone || null),
                    };
                });
                setConversations(formatted);
                if (formatted.length > 0) setActiveConversation(formatted[0]);
            } catch (e) { console.error(e); setConversations([]); }
            finally { setIsLoadingConversations(false); }
        })();
    }, [CURRENT_USER_ID, isAuthenticated]);

    useEffect(() => {
        if (!activeConversation) return;
        (async () => {
            setIsLoadingMessages(true);
            try {
                const { data } = await api.get(`/api/channels/${activeConversation.id}/messages`);
                setMessages(data);
            } catch (e) { console.error(e); setMessages([]); }
            finally { setIsLoadingMessages(false); }
        })();
    }, [activeConversation]);

    useEffect(scrollToBottom, [messages, scrollToBottom]);

    const handleSend = useCallback(async (content) => {
        if (!activeConversation) return;

        if (editingMessage) {
            setMessages(prev => prev.map(m => m.id === editingMessage.id ? { ...m, content, edited: true } : m));
            setEditingMessage(null);
            api.patch(`/api/channels/${activeConversation.id}/messages/${editingMessage.id}`, { content }).catch(console.error);
            return;
        }

        const capturedReply = replyTo;
        setReplyTo(null);
        const temp = { id: Date.now(), senderUserId: CURRENT_USER_ID, content, sentAt: new Date().toISOString(), isTemp: true, replyTo: capturedReply ? { id: capturedReply.id, content: capturedReply.content } : null };
        setMessages(prev => [...prev, temp]);

        try {
            const { data } = await api.post(`/api/channels/${activeConversation.id}/messages`, { content, replyToId: capturedReply?.id });
            setMessages(prev => prev.map(m => m.id === temp.id ? { ...data, replyTo: temp.replyTo } : m));
            setConversations(prev => prev.map(c => c.id === activeConversation.id ? { ...c, last_message: content, last_message_time: new Date().toISOString() } : c));
        } catch (e) {
            console.error(e);
            setMessages(prev => prev.filter(m => !m.isTemp));
        }
    }, [activeConversation, CURRENT_USER_ID, replyTo, editingMessage]);

    const handleReact = (msg, emoji) => setMessages(prev => prev.map(m => { if (m.id !== msg.id) return m; const r = { ...(m.reactions || {}) }; if (r[emoji]) delete r[emoji]; else r[emoji] = 1; return { ...m, reactions: r }; }));
    const handleDelete = (msg) => { setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, deleted: true, content: null } : m)); api.delete(`/api/channels/${activeConversation.id}/messages/${msg.id}`).catch(console.error); };
    const handlePin = (msg) => setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, pinned: !m.pinned } : m));
    const handleCopy = (msg) => navigator.clipboard.writeText(msg.content).catch(console.error);

    const filteredConvs = conversations.filter(c =>
        c.conversation_name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        (activeTab === "all" || (activeTab === "active" && c.status === "ACTIVE"))
    );

    if (hasAuthError) return (
        <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#020617" }}>
            <div className="text-center">
                <div className="p-4 bg-red-500/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4"><User size={28} className="text-red-400" /></div>
                <p className="text-red-400 font-semibold">Erreur d'authentification</p>
            </div>
        </div>
    );

    return (
        <div style={{ display: "flex", flexDirection: "row", height: "100%", overflow: "hidden", background: "#020617" }}>

            {contextMenu && (
                <ContextMenu
                    x={contextMenu.x} y={contextMenu.y} message={contextMenu.message}
                    isOwn={contextMenu.message.senderUserId === CURRENT_USER_ID}
                    onClose={() => setContextMenu(null)}
                    onReply={() => { setReplyTo(contextMenu.message); setEditingMessage(null); }}
                    onReact={(emoji) => handleReact(contextMenu.message, emoji)}
                    onEdit={() => { setEditingMessage(contextMenu.message); setReplyTo(null); }}
                    onCopy={() => handleCopy(contextMenu.message)}
                    onDelete={() => handleDelete(contextMenu.message)}
                    onPin={() => handlePin(contextMenu.message)}
                />
            )}

            <ConversationSidebar
                conversations={filteredConvs}
                activeConversation={activeConversation}
                onSelect={setActiveConversation}
                searchQuery={searchQuery}
                onSearch={setSearchQuery}
                activeTab={activeTab}
                onTabChange={setActiveTab}
                isLoading={isLoadingConversations}
                userRole={userRole}
                formatTime={formatTime}
            />

            {/* CHAT */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0, overflow: "hidden", background: "#020617", position: "relative" }}>
                {!activeConversation ? (
                    <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <div className="p-6 bg-slate-800/30 rounded-2xl border border-slate-800 text-center max-w-xs">
                            <div className="p-4 bg-orange-500/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4"><MessageSquare size={28} className="text-[#ff922b]" /></div>
                            <p className="text-slate-300 font-semibold">Aucune conversation sélectionnée</p>
                        </div>
                    </div>
                ) : (
                    <>
                        {showPinned && <PinnedPanel messages={messages} onClose={() => setShowPinned(false)} onScrollTo={scrollToMessage} />}

                        <ChatHeader
                            conversation={activeConversation}
                            messages={messages}
                            onShowPinned={() => setShowPinned(true)}
                        />

                        {/* Zone messages scrollable */}
                        <div ref={messagesContainerRef} style={{ flex: 1, overflowY: "auto", minHeight: 0, padding: "16px 24px" }}>
                            {isLoadingMessages ? (
                                <div className="flex flex-col gap-4">
                                    {[1, 2, 3].map(i => <div key={i} className={`flex ${i % 2 === 0 ? "justify-end" : "justify-start"}`}><div className="h-10 bg-slate-800 rounded-2xl animate-pulse w-48" /></div>)}
                                </div>
                            ) : messages.length === 0 ? (
                                <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                                    <div className="p-5 bg-slate-800/30 rounded-2xl border border-dashed border-slate-800 text-center">
                                        <MessageSquare size={32} className="text-slate-700 mx-auto mb-3" />
                                        <p className="text-slate-400 text-sm">Aucun message pour l'instant</p>
                                        <p className="text-slate-600 text-xs mt-1">Envoyez le premier message !</p>
                                    </div>
                                </div>
                            ) : (() => {
                                const items = [];
                                let lastDate = null;
                                messages.forEach((m, i) => {
                                    const d = m.sentAt ? new Date(m.sentAt) : null;
                                    if (d && (!lastDate || !isSameDay(lastDate, d))) {
                                        items.push(<DateSeparator key={`sep-${m.id}`} label={formatDateLabel(m.sentAt)} />);
                                        lastDate = d;
                                    }
                                    const prev = messages[i - 1];
                                    items.push(
                                        <MessageBubble
                                            key={m.id} {...m}
                                            left={m.senderUserId !== CURRENT_USER_ID}
                                            isConsecutive={i > 0 && prev.senderUserId === m.senderUserId && d && prev.sentAt && isSameDay(new Date(prev.sentAt), d)}
                                            onContextMenu={(e) => { e.preventDefault(); setContextMenu({ x: e.clientX, y: e.clientY, message: m }); }}
                                            onReplyClick={() => scrollToMessage(m.replyTo?.id)}
                                            ref={(el) => { if (el) messageRefs.current[m.id] = el; }}
                                        />
                                    );
                                });
                                return items;
                            })()}
                        </div>

                        <MessageInput
                            onSend={handleSend}
                            replyTo={replyTo}
                            onCancelReply={() => setReplyTo(null)}
                            editingMessage={editingMessage}
                            onCancelEdit={() => setEditingMessage(null)}
                        />
                    </>
                )}
            </div>
        </div>
    );
}