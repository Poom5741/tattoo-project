import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import type { ChatMessage, Conversation } from "./schema";

interface ChatContextValue {
  conversations: Conversation[];
  messages: Record<string, ChatMessage[]>;
  activeConversation: string | null;
  setActiveConversation: (id: string | null) => void;
  fetchConversations: () => Promise<void>;
  fetchMessages: (conversationId: string) => Promise<void>;
  sendMessage: (conversationId: string, text: string) => Promise<{ ok: boolean; error?: string; message?: ChatMessage }>;
  addMessage: (conversationId: string, msg: ChatMessage) => void;
  markRead: (conversationId: string) => void;
  flagConversation: (conversationId: string, reason?: string) => void;
  unreadCount: number;
  loading: boolean;
}

const ChatContext = createContext<ChatContextValue>(null!);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Record<string, ChatMessage[]>>({});
  const [activeConversation, setActiveConversation] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchConversations = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/chat/conversations");
      if (res.ok) {
        const data = await res.json();
        setConversations(data.conversations ?? []);
      }
    } catch (err) {
      console.error("fetchConversations failed:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchMessages = useCallback(async (conversationId: string) => {
    try {
      const res = await fetch(`/api/chat/messages/${conversationId}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(prev => ({
          ...prev,
          [conversationId]: data.messages ?? [],
        }));
        // Endpoint resets unread to 0
        setConversations(prev =>
          prev.map(c => c.id === conversationId ? { ...c, unread: 0 } : c)
        );
      }
    } catch (err) {
      console.error(`fetchMessages failed for ${conversationId}:`, err);
    }
  }, []);

  const sendMessage = useCallback(async (conversationId: string, text: string) => {
    try {
      const res = await fetch("/api/chat/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId, text }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { ok: false, error: data.error || "Failed to send message" };
      }
      const msg: ChatMessage = {
        id: data.id,
        conversationId: data.conversationId,
        senderId: data.senderId,
        senderRole: data.senderRole,
        text: data.text,
        flagged: Boolean(data.flagged),
        flagReason: data.flagReason ?? null,
        createdAt: data.createdAt,
      };
      setMessages(prev => ({
        ...prev,
        [conversationId]: [...(prev[conversationId] ?? []), msg],
      }));
      setConversations(prev =>
        prev.map(c =>
          c.id === conversationId
            ? { ...c, lastMessage: msg.text, lastMessageAt: msg.createdAt }
            : c
        )
      );
      return { ok: true, message: msg };
    } catch (err) {
      console.error("sendMessage failed:", err);
      return { ok: false, error: "Network error" };
    }
  }, []);

  const addMessage = useCallback((conversationId: string, msg: ChatMessage) => {
    setMessages(prev => ({
      ...prev,
      [conversationId]: [...(prev[conversationId] ?? []), msg],
    }));
    setConversations(prev =>
      prev.map(c =>
        c.id === conversationId
          ? { ...c, lastMessage: msg.text, lastMessageAt: msg.createdAt, unread: msg.senderRole !== "client" ? c.unread : c.unread + 1 }
          : c
      )
    );
  }, []);

  const markRead = useCallback((conversationId: string) => {
    setConversations(prev =>
      prev.map(c => c.id === conversationId ? { ...c, unread: 0 } : c)
    );
  }, []);

  const flagConversation = useCallback((conversationId: string, reason?: string) => {
    setConversations(prev =>
      prev.map(c => c.id === conversationId ? { ...c, status: "flagged" } : c)
    );
  }, []);

  const unreadCount = conversations.reduce((sum, c) => sum + c.unread, 0);

  return (
    <ChatContext.Provider value={{
      conversations, messages, activeConversation,
      setActiveConversation, fetchConversations, fetchMessages, sendMessage,
      addMessage, markRead, flagConversation, unreadCount, loading,
    }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  return useContext(ChatContext);
}
