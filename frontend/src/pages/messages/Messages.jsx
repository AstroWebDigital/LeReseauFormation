import React, { useState, useEffect, useCallback, useRef } from "react";
import EmojiPicker from "emoji-picker-react";
import api from "@/services/auth/client";

import {
    Avatar,
    Button,
    Input,
    ScrollShadow,
    Tabs,
    Tab,
    Card,
    CardBody,
} from "@heroui/react";

import {
    Search,
    Phone,
    MoreVertical,
    Send,
    Paperclip,
    Smile,
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

        userRole = roles.includes("ALP") || roles.includes("PARTENAIRE")
            ? "alp"
            : "customer";
    }

    return { userId, userRole, isAuthenticated };
};

/* ================= COMPONENT ================= */

export default function Messages() {
    const { userId: CURRENT_USER_ID, userRole, isAuthenticated } =
        useMessageAuth();

    const [conversations, setConversations] = useState([]);
    const [activeConversation, setActiveConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState("");
    const [isEmojiPickerVisible, setIsEmojiPickerVisible] = useState(false);

    const [isLoadingConversations, setIsLoadingConversations] = useState(true);
    const [isLoadingMessages, setIsLoadingMessages] = useState(false);
    const [hasAuthError, setHasAuthError] = useState(false);

    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 100);
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
            console.log("🔍 Fetching conversations for user:", CURRENT_USER_ID);
            console.log("🔍 User role:", userRole);

            try {
                // Récupérer les conversations de l'utilisateur connecté
                // L'endpoint utilise l'authentification, pas besoin de passer l'userId
                const { data } = await api.get(`/api/channels`);

                console.log("✅ Conversations reçues:", data);

                const formatted = data.map((channel) => {
                    // Déterminer l'autre utilisateur dans la conversation
                    const isRenter = CURRENT_USER_ID === channel.renterUserId;
                    const otherUserId = isRenter ? channel.ownerUserId : channel.renterUserId;
                    const otherUserType = isRenter ? "Propriétaire" : "Locataire";
                    return {
                        id: channel.id,
                        conversation_name: channel.channelName || `Conversation #${channel.id?.toString().slice(0, 8)}`,
                        last_message: channel.lastMessage || "Démarrer la conversation...",
                        last_message_time: channel.updatedAt || channel.createdAt || "",
                        status: channel.status,
                        renterUserId: channel.renterUserId,
                        ownerUserId: channel.ownerUserId,
                        initials: isRenter ? "P" : "L",
                        otherUserType,
                        otherUserId,
                    };
                });

                console.log("✅ Conversations formatées:", formatted);
                setConversations(formatted);
                if (formatted.length > 0) {
                    setActiveConversation(formatted[0]);
                }
            } catch (err) {
                console.error("❌ Erreur chargement conversations:", err);
                console.error("❌ Details:", err.response?.data);
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
                const { data } = await api.get(
                    `/conversations/${activeConversation.id}/messages`
                );
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

    /* ================= SEND MESSAGE ================= */

    const handleSendMessage = useCallback(async () => {
        if (!message.trim() || !activeConversation) return;

        const content = message.trim();
        setMessage("");
        setIsEmojiPickerVisible(false);

        const temp = {
            id: Date.now(),
            sender_id: CURRENT_USER_ID,
            content,
            created_at: new Date().toLocaleTimeString("fr-FR", {
                hour: "2-digit",
                minute: "2-digit",
            }),
            isTemp: true,
        };

        setMessages((prev) => [...prev, temp]);

        try {
            const { data } = await api.post("/messages", {
                conversation_id: activeConversation.id,
                sender_id: CURRENT_USER_ID,
                content,
            });

            setMessages((prev) =>
                prev.map((m) => (m.id === temp.id ? data : m))
            );

            // Mettre à jour le dernier message dans la liste des conversations
            setConversations((prev) =>
                prev.map((c) =>
                    c.id === activeConversation.id
                        ? {
                            ...c,
                            last_message: content,
                            last_message_time: new Date().toISOString(),
                        }
                        : c
                )
            );
        } catch (err) {
            console.error("Erreur envoi message", err);
            setMessages((prev) => prev.filter((m) => !m.isTemp));
            setMessage(content);
        }
    }, [message, activeConversation, CURRENT_USER_ID]);

    /* ================= FORMAT TIME ================= */

    const formatTime = (timestamp) => {
        if (!timestamp) return "";
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now - date;
        const hours = Math.floor(diff / (1000 * 60 * 60));

        if (hours < 24) {
            return date.toLocaleTimeString("fr-FR", {
                hour: "2-digit",
                minute: "2-digit",
            });
        }
        return date.toLocaleDateString("fr-FR", {
            day: "2-digit",
            month: "2-digit",
        });
    };

    /* ================= RENDER ================= */

    if (hasAuthError) {
        return (
            <div className="h-full flex items-center justify-center">
                <p className="text-red-500">
                    Erreur d'authentification. Veuillez vous reconnecter.
                </p>
            </div>
        );
    }

    return (
        <div className="h-full flex bg-background -mx-6">
            {/* SIDEBAR */}
            <aside className="w-[360px] border-r flex flex-col">
                <div className="p-5 border-b">
                    <h1 className="text-2xl font-bold text-black">Messagerie</h1>
                    <p className="text-sm text-default-500">
                        {userRole === "alp" ? "Agent ALP" : "Client"}
                    </p>
                </div>

                <div className="p-4">
                    <Input
                        startContent={<Search size={18} />}
                        placeholder="Rechercher une conversation..."
                    />
                </div>

                <Tabs className="px-4">
                    <Tab key="all" title="Tous" />
                    <Tab key="active" title="Actives" />
                </Tabs>

                <ScrollShadow className="flex-1">
                    {isLoadingConversations ? (
                        <p className="p-5 text-center text-default-500">
                            Chargement des conversations...
                        </p>
                    ) : conversations.length === 0 ? (
                        <p className="p-5 text-center text-default-500">
                            Aucune conversation
                        </p>
                    ) : (
                        conversations.map((conv) => (
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

            {/* CHAT */}
            <main className="flex-1 flex flex-col">
                {!activeConversation ? (
                    <div className="flex-1 flex items-center justify-center">
                        <p className="text-default-500">
                            Sélectionnez une conversation pour commencer
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="p-5 border-b flex justify-between">
                            <div className="flex gap-3 items-center">
                                <Avatar
                                    name={activeConversation.initials}
                                    className="bg-orange-400 text-white"
                                />
                                <div>
                                    <p className="font-bold text-black">
                                        {activeConversation.conversation_name}
                                    </p>
                                    <p className="text-xs text-default-500">
                                        {activeConversation.otherUserType} •{" "}
                                        {activeConversation.status}
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Button isIconOnly variant="light">
                                    <Phone size={18} />
                                </Button>
                                <Button isIconOnly variant="light">
                                    <MoreVertical size={18} />
                                </Button>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto px-8 py-6 space-y-4">
                            {isLoadingMessages ? (
                                <p className="text-center text-default-500">
                                    Chargement des messages...
                                </p>
                            ) : messages.length === 0 ? (
                                <p className="text-center text-default-500">
                                    Aucun message. Envoyez le premier message!
                                </p>
                            ) : (
                                messages.map((m) => (
                                    <Message
                                        key={m.id}
                                        {...m}
                                        left={m.sender_id !== CURRENT_USER_ID}
                                    />
                                ))
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        <div className="p-4 border-t flex gap-2">
                            <Button
                                isIconOnly
                                variant="light"
                                onClick={() => setIsEmojiPickerVisible((v) => !v)}
                            >
                                <Smile size={18} />
                            </Button>

                            <Input
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Écrire un message..."
                                onKeyDown={(e) =>
                                    e.key === "Enter" && handleSendMessage()
                                }
                            />

                            <Button
                                isIconOnly
                                className="bg-primary text-white"
                                onClick={handleSendMessage}
                                isDisabled={!message.trim()}
                            >
                                <Send size={18} />
                            </Button>
                        </div>

                        {isEmojiPickerVisible && (
                            <div className="absolute bottom-24 right-6 z-50">
                                <EmojiPicker
                                    onEmojiClick={(e) =>
                                        setMessage((m) => m + e.emoji)
                                    }
                                />
                            </div>
                        )}
                    </>
                )}
            </main>
        </div>
    );
}

/* ================= UI COMPONENTS ================= */

function ConversationItem({
                              conversation_name,
                              last_message,
                              last_message_time,
                              initials,
                              active,
                              onClick,
                              formatTime,
                              status,
                          }) {
    return (
        <div
            onClick={onClick}
            className={`px-5 py-4 cursor-pointer flex gap-3 hover:bg-default-50 transition-colors ${
                active ? "bg-default-100 border-l-4 border-primary" : ""
            }`}
        >
            <Avatar name={initials} className="bg-orange-400 text-white" />
            <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                    <p className="font-medium truncate">{conversation_name}</p>
                    <span className="text-xs text-default-400 whitespace-nowrap ml-2">
                        {formatTime(last_message_time)}
                    </span>
                </div>
                <p className="text-sm text-default-500 truncate">
                    {last_message}
                </p>
                {status && (
                    <span
                        className={`text-xs px-2 py-0.5 rounded-full inline-block mt-1 ${
                            status === "ACTIVE"
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-100 text-gray-700"
                        }`}
                    >
                        {status}
                    </span>
                )}
            </div>
        </div>
    );
}

function Message({ content, created_at, left }) {
    return (
        <div className={`flex ${left ? "justify-start" : "justify-end"}`}>
            <Card
                className={`max-w-[60%] ${
                    left ? "bg-default-100" : "bg-primary text-white"
                }`}
            >
                <CardBody>
                    <p className="text-sm">{content}</p>
                    <p className="text-xs opacity-70 text-right mt-1">
                        {created_at}
                    </p>
                </CardBody>
            </Card>
        </div>
    );
}