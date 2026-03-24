import React, { useState, useEffect, useCallback, useRef } from "react";
import EmojiPicker from "emoji-picker-react";
import api from "@/services/auth/client";

import {
    Avatar,
    Button,
    Input,
    ScrollShadow,
    Chip,
    Tooltip,
} from "@heroui/react";

import {
    Search,
    Phone,
    MoreVertical,
    Send,
    Smile,
    MessageSquare,
    CheckCheck,
    Clock,
    User,
    Reply,
    Copy,
    Trash2,
    Star,
    Pin,
    Pencil,
    X,
} from "lucide-react";

import { useAuth } from "@/auth/AuthContext";

/* ================= AUTH UTILS ================= */

const useMessageAuth = () => {
    const { user, isAuthenticated } = useAuth();
    const userId = user?.id || null;
    let userRole = null;
    if (user?.roles) {
        const roles = Array.isArray(user.roles)
            ? user.roles.join(",").toUpperCase()
            : String(user.roles).toUpperCase();
        userRole = roles.includes("ALP") || roles.includes("PARTENAIRE") ? "alp" : "customer";
    }
    return { userId, userRole, isAuthenticated };
};

/* ================= HELPERS ================= */

const REACTIONS = ["❤️", "🔥", "😂", "👍", "😮", "😢"];

function truncate(str, max = 60) {
    if (!str) return "";
    return str.length > max ? str.slice(0, max) + "…" : str;
}

/* ================= CONTEXT MENU ================= */

function ContextMenu({ x, y, message, isOwn, onClose, onReply, onReact, onEdit, onCopy, onDelete, onPin, onStar }) {
    const menuRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) onClose();
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [onClose]);

    const [pos, setPos] = useState({ x, y });
    useEffect(() => {
        if (menuRef.current) {
            const rect = menuRef.current.getBoundingClientRect();
            setPos({
                x: x + rect.width > window.innerWidth ? window.innerWidth - rect.width - 8 : x,
                y: y + rect.height > window.innerHeight ? window.innerHeight - rect.height - 8 : y,
            });
        }
    }, [x, y]);

    return (
        <div ref={menuRef} className="fixed z-[999] select-none" style={{ left: pos.x, top: pos.y }}>
            {/* Reactions */}
            <div className="flex items-center gap-1 bg-slate-800 border border-slate-700 rounded-2xl px-3 py-2 mb-1.5 shadow-xl">
                {REACTIONS.map((emoji) => (
                    <button
                        key={emoji}
                        onClick={() => { onReact(emoji); onClose(); }}
                        className={`text-xl hover:scale-125 transition-transform w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-700 ${
                            message.reactions?.[emoji] ? "bg-slate-700 ring-1 ring-orange-500/50" : ""
                        }`}
                    >
                        {emoji}
                    </button>
                ))}
            </div>
            {/* Actions */}
            <div className="bg-slate-800 border border-slate-700 rounded-xl shadow-xl overflow-hidden min-w-[200px]">
                <MenuItem icon={<Reply size={15} />} label="Répondre" onClick={() => { onReply(); onClose(); }} />
                {isOwn && !message.deleted && (
                    <MenuItem icon={<Pencil size={15} />} label="Modifier" onClick={() => { onEdit(); onClose(); }} />
                )}
                {!message.deleted && (
                    <MenuItem icon={<Copy size={15} />} label="Copier" onClick={() => { onCopy(); onClose(); }} />
                )}
                <MenuItem
                    icon={<Pin size={15} />}
                    label={message.pinned ? "Désépingler" : "Épingler"}
                    onClick={() => { onPin(); onClose(); }}
                />
                <MenuItem
                    icon={<Star size={15} />}
                    label={message.starred ? "Retirer des importants" : "Mettre en important"}
                    onClick={() => { onStar(); onClose(); }}
                />
                <div className="border-t border-slate-700" />
                {isOwn && !message.deleted && (
                    <MenuItem icon={<Trash2 size={15} />} label="Supprimer" onClick={() => { onDelete(); onClose(); }} danger />
                )}
            </div>
        </div>
    );
}

function MenuItem({ icon, label, onClick, danger }) {
    return (
        <button
            onClick={onClick}
            className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-slate-700/60 ${
                danger ? "text-red-400 hover:text-red-300" : "text-slate-300 hover:text-slate-100"
            }`}
        >
            <span className={danger ? "text-red-400" : "text-slate-400"}>{icon}</span>
            {label}
        </button>
    );
}

/* ================= PINNED PANEL ================= */

function PinnedPanel({ messages, onClose, onScrollTo }) {
    const pinned = messages.filter((m) => m.pinned && !m.deleted);
    return (
        <div className="absolute inset-0 z-40 bg-slate-950/95 flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900 flex-shrink-0">
                <div className="flex items-center gap-2">
                    <Pin size={16} className="text-[#ff922b]" />
                    <span className="font-bold text-slate-100 text-sm">Messages épinglés</span>
                    <span className="text-xs text-slate-500 ml-1">({pinned.length})</span>
                </div>
                <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                    <X size={18} />
                </button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
                {pinned.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center py-16">
                        <div className="p-4 bg-slate-800/50 rounded-full mb-3">
                            <Pin size={24} className="text-slate-600" />
                        </div>
                        <p className="text-slate-500 text-sm">Aucun message épinglé</p>
                        <p className="text-slate-600 text-xs mt-1">Faites un clic droit sur un message pour l'épingler</p>
                    </div>
                ) : (
                    pinned.map((m) => (
                        <div
                            key={m.id}
                            onClick={() => { onScrollTo(m.id); onClose(); }}
                            className="bg-slate-800/60 border border-slate-700 rounded-xl px-4 py-3 cursor-pointer hover:bg-slate-800 transition-colors group"
                        >
                            <div className="flex items-center gap-2 mb-1.5">
                                <Pin size={11} className="text-yellow-400" />
                                {m.starred && <Star size={11} className="text-yellow-400 fill-yellow-400" />}
                                <span className="text-[10px] text-slate-500">
                                    {m.sentAt ? new Date(m.sentAt).toLocaleString("fr-FR", {
                                        day: "2-digit", month: "2-digit",
                                        hour: "2-digit", minute: "2-digit",
                                    }) : ""}
                                </span>
                                <span className="ml-auto text-[10px] text-[#ff922b] opacity-0 group-hover:opacity-100 transition-opacity">
                                    Voir le message →
                                </span>
                            </div>
                            <p className="text-sm text-slate-200 break-words line-clamp-3">{m.content}</p>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

/* ================= OPTIONS MENU ================= */

function OptionsMenu({ pinnedCount, onShowPinned }) {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    return (
        <div ref={ref} className="relative">
            <Tooltip content="Options" placement="bottom">
                <Button
                    isIconOnly variant="flat" size="sm"
                    className="bg-slate-800 text-slate-400 hover:text-white border border-slate-700"
                    onClick={() => setOpen((v) => !v)}
                >
                    <MoreVertical size={16} />
                </Button>
            </Tooltip>
            {open && (
                <div className="absolute right-0 top-full mt-2 bg-slate-800 border border-slate-700 rounded-xl shadow-xl overflow-hidden min-w-[210px] z-50">
                    <button
                        onClick={() => { onShowPinned(); setOpen(false); }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-700/60 hover:text-slate-100 transition-colors"
                    >
                        <Pin size={15} className="text-slate-400" />
                        Messages épinglés
                        {pinnedCount > 0 && (
                            <span className="ml-auto bg-orange-500/20 text-[#ff922b] text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                                {pinnedCount}
                            </span>
                        )}
                    </button>
                </div>
            )}
        </div>
    );
}

/* ================= MAIN COMPONENT ================= */

export default function Messages() {
    const { userId: CURRENT_USER_ID, userRole, isAuthenticated } = useMessageAuth();

    const [conversations, setConversations] = useState([]);
    const [activeConversation, setActiveConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState("");
    const [isEmojiPickerVisible, setIsEmojiPickerVisible] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [activeTab, setActiveTab] = useState("all");
    const [isLoadingConversations, setIsLoadingConversations] = useState(true);
    const [isLoadingMessages, setIsLoadingMessages] = useState(false);
    const [hasAuthError, setHasAuthError] = useState(false);

    const [contextMenu, setContextMenu] = useState(null);
    const [replyTo, setReplyTo] = useState(null);
    const [editingMessage, setEditingMessage] = useState(null);
    const [showPinned, setShowPinned] = useState(false);

    const messagesEndRef = useRef(null);
    const messageRefs = useRef({});

    const scrollToBottom = () => {
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    };

    const scrollToMessage = (id) => {
        const el = messageRefs.current[id];
        if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "center" });
            el.style.transition = "box-shadow 0.3s";
            el.style.boxShadow = "0 0 0 2px rgba(255,146,43,0.5)";
            el.style.borderRadius = "1rem";
            setTimeout(() => { el.style.boxShadow = ""; }, 1500);
        }
    };

    /* ================= LOAD CONVERSATIONS ================= */

    useEffect(() => {
        if (!isAuthenticated || !CURRENT_USER_ID) {
            setHasAuthError(true);
            setIsLoadingConversations(false);
            return;
        }
        const fetchConversations = async () => {
            setIsLoadingConversations(true);
            try {
                const { data } = await api.get(`/api/channels`);
                const formatted = data.map((channel) => {
                    const isRenter = CURRENT_USER_ID === channel.renterUserId;
                    return {
                        id: channel.id,
                        conversation_name: channel.channelName || `Conversation #${channel.id?.toString().slice(0, 8)}`,
                        last_message: channel.lastMessage || "Démarrer la conversation...",
                        last_message_time: channel.updatedAt || channel.createdAt || "",
                        status: channel.status,
                        renterUserId: channel.renterUserId,
                        ownerUserId: channel.ownerUserId,
                        initials: isRenter ? "P" : "L",
                        otherUserType: isRenter ? "Propriétaire" : "Locataire",
                        otherUserId: isRenter ? channel.ownerUserId : channel.renterUserId,
                    };
                });
                setConversations(formatted);
                if (formatted.length > 0) setActiveConversation(formatted[0]);
            } catch (err) {
                console.error("❌ Erreur chargement conversations:", err);
                setConversations([]);
            } finally {
                setIsLoadingConversations(false);
            }
        };
        fetchConversations();
    }, [CURRENT_USER_ID, isAuthenticated]);

    /* ================= LOAD MESSAGES ================= */

    useEffect(() => {
        if (!activeConversation) return;
        const fetchMessages = async () => {
            setIsLoadingMessages(true);
            try {
                const { data } = await api.get(`/api/channels/${activeConversation.id}/messages`);
                setMessages(data);
            } catch (err) {
                console.error("Erreur chargement messages", err);
                setMessages([]);
            } finally {
                setIsLoadingMessages(false);
            }
        };
        fetchMessages();
    }, [activeConversation]);

    useEffect(scrollToBottom, [messages]);

    /* ================= SEND / EDIT MESSAGE ================= */

    const handleSendMessage = useCallback(async () => {
        if (!message.trim() || !activeConversation) return;
        const content = message.trim();
        setMessage("");
        setIsEmojiPickerVisible(false);

        // Edit mode
        if (editingMessage) {
            setMessages((prev) =>
                prev.map((m) => m.id === editingMessage.id ? { ...m, content, edited: true } : m)
            );
            setEditingMessage(null);
            try {
                await api.patch(`/api/channels/${activeConversation.id}/messages/${editingMessage.id}`, { content });
            } catch (err) {
                console.error("Erreur modification message", err);
            }
            return;
        }

        const capturedReplyTo = replyTo;
        setReplyTo(null);

        const temp = {
            id: Date.now(),
            senderUserId: CURRENT_USER_ID,
            content,
            sentAt: new Date().toISOString(),
            isTemp: true,
            replyTo: capturedReplyTo ? { id: capturedReplyTo.id, content: capturedReplyTo.content } : null,
        };

        setMessages((prev) => [...prev, temp]);

        try {
            const { data } = await api.post(`/api/channels/${activeConversation.id}/messages`, {
                content,
                replyToId: capturedReplyTo?.id,
            });
            setMessages((prev) => prev.map((m) => m.id === temp.id ? { ...data, replyTo: temp.replyTo } : m));
            setConversations((prev) =>
                prev.map((c) =>
                    c.id === activeConversation.id
                        ? { ...c, last_message: content, last_message_time: new Date().toISOString() }
                        : c
                )
            );
        } catch (err) {
            console.error("Erreur envoi message", err);
            setMessages((prev) => prev.filter((m) => !m.isTemp));
            setMessage(content);
        }
    }, [message, activeConversation, CURRENT_USER_ID, replyTo, editingMessage]);

    /* ================= CONTEXT MENU ACTIONS ================= */

    const handleContextMenu = (e, msg) => {
        e.preventDefault();
        setContextMenu({ x: e.clientX, y: e.clientY, message: msg });
    };

    const handleReact = (msg, emoji) => {
        setMessages((prev) =>
            prev.map((m) => {
                if (m.id !== msg.id) return m;
                const reactions = { ...(m.reactions || {}) };
                if (reactions[emoji]) delete reactions[emoji];
                else reactions[emoji] = 1;
                return { ...m, reactions };
            })
        );
    };

    const handleDelete = (msg) => {
        setMessages((prev) => prev.map((m) => m.id === msg.id ? { ...m, deleted: true, content: null } : m));
        api.delete(`/api/channels/${activeConversation.id}/messages/${msg.id}`).catch(console.error);
    };

    const handlePin = (msg) => {
        setMessages((prev) => prev.map((m) => m.id === msg.id ? { ...m, pinned: !m.pinned } : m));
    };

    const handleStar = (msg) => {
        setMessages((prev) => prev.map((m) => m.id === msg.id ? { ...m, starred: !m.starred } : m));
    };

    const handleCopy = (msg) => {
        navigator.clipboard.writeText(msg.content).catch(console.error);
    };

    const handleEdit = (msg) => {
        setEditingMessage(msg);
        setMessage(msg.content);
        setReplyTo(null);
    };

    /* ================= FORMAT TIME ================= */

    const formatTime = (timestamp) => {
        if (!timestamp) return "";
        const date = new Date(timestamp);
        const diff = new Date() - date;
        const hours = Math.floor(diff / (1000 * 60 * 60));
        if (hours < 24) return date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
        return date.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" });
    };

    /* ================= FILTER CONVERSATIONS ================= */

    const filteredConversations = conversations.filter((conv) => {
        const matchesSearch = conv.conversation_name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesTab = activeTab === "all" || (activeTab === "active" && conv.status === "ACTIVE");
        return matchesSearch && matchesTab;
    });

    /* ================= RENDER ================= */

    if (hasAuthError) {
        return (
            <div className="h-full flex items-center justify-center bg-slate-950">
                <div className="text-center">
                    <div className="p-4 bg-red-500/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                        <User size={28} className="text-red-400" />
                    </div>
                    <p className="text-red-400 font-semibold">Erreur d'authentification</p>
                    <p className="text-slate-500 text-sm mt-1">Veuillez vous reconnecter.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full flex bg-slate-950 -mx-6 overflow-hidden">
            {/* Context menu */}
            {contextMenu && (
                <ContextMenu
                    x={contextMenu.x}
                    y={contextMenu.y}
                    message={contextMenu.message}
                    isOwn={contextMenu.message.senderUserId === CURRENT_USER_ID}
                    onClose={() => setContextMenu(null)}
                    onReply={() => { setReplyTo(contextMenu.message); setEditingMessage(null); setMessage(""); }}
                    onReact={(emoji) => handleReact(contextMenu.message, emoji)}
                    onEdit={() => handleEdit(contextMenu.message)}
                    onCopy={() => handleCopy(contextMenu.message)}
                    onDelete={() => handleDelete(contextMenu.message)}
                    onPin={() => handlePin(contextMenu.message)}
                    onStar={() => handleStar(contextMenu.message)}
                />
            )}

            {/* ===== SIDEBAR ===== */}
            <aside className="w-[340px] border-r border-slate-800 flex flex-col bg-slate-900 flex-shrink-0">
                <div className="p-5 border-b border-slate-800">
                    <div className="flex items-center gap-3 mb-1">
                        <div className="p-2 bg-orange-500/10 rounded-lg">
                            <MessageSquare size={20} className="text-[#ff922b]" />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold text-slate-100">Messagerie</h1>
                            <p className="text-xs text-slate-500">
                                {userRole === "alp" ? "Agent ALP" : "Client"} • {conversations.length} conversation(s)
                            </p>
                        </div>
                    </div>
                </div>

                <div className="p-4">
                    <Input
                        startContent={<Search size={15} className="text-slate-500" />}
                        placeholder="Rechercher..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        classNames={{
                            inputWrapper: "bg-slate-800/60 border-slate-700 hover:border-slate-600 focus-within:border-orange-500/70 transition-all",
                            input: "text-slate-300 placeholder:text-slate-600 text-sm",
                        }}
                        variant="bordered"
                        size="sm"
                    />
                </div>

                <div className="flex px-4 gap-2 mb-2">
                    {["all", "active"].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                                activeTab === tab
                                    ? "bg-orange-500/15 text-[#ff922b] border border-orange-500/30"
                                    : "text-slate-500 hover:text-slate-300 border border-transparent"
                            }`}
                        >
                            {tab === "all" ? "Toutes" : "Actives"}
                        </button>
                    ))}
                </div>

                <ScrollShadow className="flex-1 overflow-y-auto">
                    {isLoadingConversations ? (
                        <div className="flex flex-col gap-3 p-4">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="flex gap-3 p-3 animate-pulse">
                                    <div className="w-10 h-10 rounded-full bg-slate-800 flex-shrink-0" />
                                    <div className="flex-1 space-y-2">
                                        <div className="h-3 bg-slate-800 rounded w-3/4" />
                                        <div className="h-2 bg-slate-800 rounded w-1/2" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : filteredConversations.length === 0 ? (
                        <div className="flex flex-col items-center justify-center p-8 text-center">
                            <div className="p-4 bg-slate-800/50 rounded-full mb-3">
                                <MessageSquare size={24} className="text-slate-600" />
                            </div>
                            <p className="text-slate-500 text-sm">Aucune conversation</p>
                        </div>
                    ) : (
                        filteredConversations.map((conv) => (
                            <ConversationItem
                                key={conv.id}
                                {...conv}
                                active={activeConversation?.id === conv.id}
                                onClick={() => setActiveConversation(conv)}
                                formatTime={formatTime}
                            />
                        ))
                    )}
                </ScrollShadow>
            </aside>

            {/* ===== CHAT AREA ===== */}
            <main className="flex-1 flex flex-col overflow-hidden relative">
                {!activeConversation ? (
                    <div className="flex-1 flex flex-col items-center justify-center bg-slate-950">
                        <div className="p-6 bg-slate-800/30 rounded-2xl border border-slate-800 text-center max-w-xs">
                            <div className="p-4 bg-orange-500/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                                <MessageSquare size={28} className="text-[#ff922b]" />
                            </div>
                            <p className="text-slate-300 font-semibold">Aucune conversation sélectionnée</p>
                            <p className="text-slate-500 text-sm mt-1">Choisissez une conversation pour commencer</p>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Pinned panel overlay */}
                        {showPinned && (
                            <PinnedPanel
                                messages={messages}
                                onClose={() => setShowPinned(false)}
                                onScrollTo={scrollToMessage}
                            />
                        )}

                        {/* Chat Header */}
                        <div className="px-6 py-4 border-b border-slate-800 bg-slate-900 flex justify-between items-center flex-shrink-0">
                            <div className="flex gap-3 items-center">
                                <div className="relative">
                                    <Avatar
                                        name={activeConversation.initials}
                                        className="bg-orange-500/20 text-[#ff922b] font-bold border border-orange-500/30"
                                        size="md"
                                    />
                                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-slate-900" />
                                </div>
                                <div>
                                    <p className="font-bold text-slate-100 text-sm">{activeConversation.conversation_name}</p>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <span className="text-xs text-slate-400">{activeConversation.otherUserType}</span>
                                        <span className="text-slate-700">•</span>
                                        <Chip
                                            size="sm" variant="flat"
                                            className={`text-[10px] h-4 ${
                                                activeConversation.status === "ACTIVE"
                                                    ? "bg-green-500/10 text-green-400 border border-green-500/20"
                                                    : "bg-slate-700/50 text-slate-400"
                                            }`}
                                        >
                                            {activeConversation.status}
                                        </Chip>
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-1">
                                <Tooltip content="Appeler" placement="bottom">
                                    <Button isIconOnly variant="flat" size="sm" className="bg-slate-800 text-slate-400 hover:text-white border border-slate-700">
                                        <Phone size={16} />
                                    </Button>
                                </Tooltip>
                                <OptionsMenu
                                    pinnedCount={messages.filter((m) => m.pinned && !m.deleted).length}
                                    onShowPinned={() => setShowPinned(true)}
                                />
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-3 bg-slate-950">
                            {isLoadingMessages ? (
                                <div className="flex flex-col gap-4">
                                    {[1, 2, 3].map((i) => (
                                        <div key={i} className={`flex ${i % 2 === 0 ? "justify-end" : "justify-start"}`}>
                                            <div className="h-10 bg-slate-800 rounded-2xl animate-pulse w-48" />
                                        </div>
                                    ))}
                                </div>
                            ) : messages.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-center py-16">
                                    <div className="p-5 bg-slate-800/30 rounded-2xl border border-slate-800 border-dashed">
                                        <MessageSquare size={32} className="text-slate-700 mx-auto mb-3" />
                                        <p className="text-slate-400 text-sm font-medium">Aucun message pour l'instant</p>
                                        <p className="text-slate-600 text-xs mt-1">Envoyez le premier message !</p>
                                    </div>
                                </div>
                            ) : (
                                messages.map((m, index) => (
                                    <MessageBubble
                                        key={m.id}
                                        {...m}
                                        left={m.senderUserId !== CURRENT_USER_ID}
                                        isConsecutive={index > 0 && messages[index - 1].senderUserId === m.senderUserId}
                                        onContextMenu={(e) => handleContextMenu(e, m)}
                                        ref={(el) => { if (el) messageRefs.current[m.id] = el; }}
                                    />
                                ))
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Reply preview */}
                        {replyTo && (
                            <div className="px-6 py-2 bg-slate-900 border-t border-slate-800 flex items-center gap-3">
                                <Reply size={14} className="text-[#ff922b] flex-shrink-0" />
                                <div className="flex-1 border-l-2 border-[#ff922b] pl-3 min-w-0">
                                    <p className="text-[11px] text-[#ff922b] font-semibold mb-0.5">Répondre à</p>
                                    <p className="text-xs text-slate-400 truncate">{truncate(replyTo.content)}</p>
                                </div>
                                <button onClick={() => setReplyTo(null)} className="text-slate-500 hover:text-slate-300 flex-shrink-0">
                                    <X size={14} />
                                </button>
                            </div>
                        )}

                        {/* Edit preview */}
                        {editingMessage && (
                            <div className="px-6 py-2 bg-slate-900 border-t border-slate-800 flex items-center gap-3">
                                <Pencil size={14} className="text-blue-400 flex-shrink-0" />
                                <div className="flex-1 border-l-2 border-blue-500 pl-3 min-w-0">
                                    <p className="text-[11px] text-blue-400 font-semibold mb-0.5">Modifier le message</p>
                                    <p className="text-xs text-slate-400 truncate">{truncate(editingMessage.content)}</p>
                                </div>
                                <button
                                    onClick={() => { setEditingMessage(null); setMessage(""); }}
                                    className="text-slate-500 hover:text-slate-300 flex-shrink-0"
                                >
                                    <X size={14} />
                                </button>
                            </div>
                        )}

                        {/* Input area */}
                        <div className="px-6 py-4 border-t border-slate-800 bg-slate-900 flex-shrink-0 relative">
                            {isEmojiPickerVisible && (
                                <div className="absolute bottom-full left-6 mb-2 z-50">
                                    <EmojiPicker
                                        onEmojiClick={(e) => setMessage((m) => m + e.emoji)}
                                        theme="dark"
                                    />
                                </div>
                            )}
                            <div className="flex gap-2 items-end bg-slate-800/60 rounded-2xl border border-slate-700 focus-within:border-orange-500/50 transition-all p-2">
                                <Button
                                    isIconOnly variant="light" size="sm"
                                    className="text-slate-500 hover:text-[#ff922b] flex-shrink-0 self-end mb-0.5"
                                    onClick={() => setIsEmojiPickerVisible((v) => !v)}
                                >
                                    <Smile size={18} />
                                </Button>
                                <input
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder={editingMessage ? "Modifier le message..." : "Écrire un message..."}
                                    className="flex-1 bg-transparent text-slate-200 placeholder:text-slate-600 text-sm outline-none resize-none py-1.5 px-1"
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter" && !e.shiftKey) {
                                            e.preventDefault();
                                            handleSendMessage();
                                        }
                                        if (e.key === "Escape") {
                                            setEditingMessage(null);
                                            setReplyTo(null);
                                            setMessage("");
                                        }
                                    }}
                                />
                                <Button
                                    isIconOnly size="sm"
                                    className={`flex-shrink-0 self-end transition-all ${
                                        message.trim()
                                            ? editingMessage
                                                ? "bg-blue-500 text-white shadow-lg shadow-blue-500/20"
                                                : "bg-[#ff922b] text-white shadow-lg shadow-orange-500/20"
                                            : "bg-slate-700 text-slate-500"
                                    }`}
                                    onClick={handleSendMessage}
                                    isDisabled={!message.trim()}
                                >
                                    {editingMessage ? <CheckCheck size={15} /> : <Send size={15} />}
                                </Button>
                            </div>
                            <p className="text-[10px] text-slate-700 mt-1.5 ml-2">
                                Entrée pour envoyer • Maj+Entrée pour nouvelle ligne • Échap pour annuler
                            </p>
                        </div>
                    </>
                )}
            </main>
        </div>
    );
}

/* ================= CONVERSATION ITEM ================= */

function ConversationItem({ conversation_name, last_message, last_message_time, initials, active, onClick, formatTime, status }) {
    return (
        <div
            onClick={onClick}
            className={`px-4 py-3 cursor-pointer flex gap-3 transition-all relative ${
                active
                    ? "bg-slate-800/80 border-l-2 border-[#ff922b]"
                    : "hover:bg-slate-800/40 border-l-2 border-transparent"
            }`}
        >
            <div className="relative flex-shrink-0">
                <Avatar
                    name={initials}
                    className={`font-bold text-sm border ${
                        active ? "bg-orange-500/20 text-[#ff922b] border-orange-500/40" : "bg-slate-800 text-slate-400 border-slate-700"
                    }`}
                    size="sm"
                />
                {status === "ACTIVE" && (
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-slate-900" />
                )}
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                    <p className={`font-semibold truncate text-sm ${active ? "text-slate-100" : "text-slate-300"}`}>
                        {conversation_name}
                    </p>
                    <span className="text-[10px] text-slate-600 whitespace-nowrap ml-2 flex items-center gap-1 flex-shrink-0">
                        <Clock size={9} />
                        {formatTime(last_message_time)}
                    </span>
                </div>
                <p className="text-xs text-slate-500 truncate mt-0.5">{last_message}</p>
                {status && (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full inline-block mt-1 font-medium ${
                        status === "ACTIVE" ? "bg-green-500/10 text-green-400" : "bg-slate-800 text-slate-500"
                    }`}>
                        {status}
                    </span>
                )}
            </div>
        </div>
    );
}

/* ================= MESSAGE BUBBLE ================= */

const MessageBubble = React.forwardRef(function MessageBubble(
    { content, sentAt, left, isConsecutive, isTemp, reactions, pinned, starred, replyTo, deleted, edited, onContextMenu },
    ref
) {
    const time = sentAt
        ? new Date(sentAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
        : "";

    return (
        <div
            ref={ref}
            className={`flex ${left ? "justify-start" : "justify-end"} ${isConsecutive ? "mt-1" : "mt-3"}`}
            onContextMenu={deleted ? undefined : onContextMenu}
        >
            <div className={`max-w-[65%] group ${left ? "items-start" : "items-end"} flex flex-col`}>

                {/* Reply preview inside bubble */}
                {replyTo && !deleted && (
                    <div className="text-[11px] px-3 py-1.5 rounded-xl mb-1 border-l-2 border-[#ff922b] bg-slate-800/80 text-slate-400 max-w-full overflow-hidden">
                        <p className="text-[10px] text-[#ff922b] font-semibold mb-0.5 flex items-center gap-1">
                            <Reply size={9} /> En réponse à
                        </p>
                        <span className="block truncate">{truncate(replyTo.content)}</span>
                    </div>
                )}

                <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed transition-opacity break-all ${
                    isTemp ? "opacity-60" : "opacity-100"
                } ${
                    deleted
                        ? "bg-slate-800/40 border border-slate-700/30"
                        : left
                            ? "bg-slate-800 text-slate-200 rounded-tl-sm border border-slate-700/50"
                            : "bg-[#ff922b] text-white rounded-tr-sm shadow-lg shadow-orange-500/10"
                }`}>
                    {deleted ? (
                        <span className="text-slate-500 text-xs italic flex items-center gap-1.5">
                            <Trash2 size={11} />
                            {left ? "Cet utilisateur a supprimé ce message" : "Vous avez supprimé ce message"}
                        </span>
                    ) : (
                        <>
                            {(pinned || starred) && (
                                <div className="flex gap-1 mb-1">
                                    {pinned && <span className="text-[10px]">📌</span>}
                                    {starred && <span className="text-[10px]">⭐</span>}
                                </div>
                            )}
                            {content}
                        </>
                    )}
                </div>

                {/* Reactions */}
                {!deleted && reactions && Object.keys(reactions).length > 0 && (
                    <div className="flex gap-1 mt-1 flex-wrap">
                        {Object.entries(reactions).map(([emoji]) => (
                            <span key={emoji} className="text-xs bg-slate-800 border border-slate-700 rounded-full px-2 py-0.5">
                                {emoji}
                            </span>
                        ))}
                    </div>
                )}

                <div className={`flex items-center gap-1 mt-1 px-1 opacity-0 group-hover:opacity-100 transition-opacity ${left ? "flex-row" : "flex-row-reverse"}`}>
                    <span className="text-[10px] text-slate-600">{time}</span>
                    {edited && !deleted && <span className="text-[10px] text-slate-600 italic">modifié</span>}
                    {!left && !isTemp && !deleted && <CheckCheck size={10} className="text-slate-600" />}
                    {isTemp && <Clock size={10} className="text-slate-600" />}
                </div>
            </div>
        </div>
    );
});
