import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import type { ChatMessage, Conversation } from "./schema";

interface ChatContextValue {
  conversations: Conversation[];
  messages: Record<string, ChatMessage[]>;
  activeConversation: string | null;
  setActiveConversation: (id: string | null) => void;
  addMessage: (conversationId: string, msg: ChatMessage) => void;
  markRead: (conversationId: string) => void;
  flagConversation: (conversationId: string, reason?: string) => void;
  unreadCount: number;
}

const ChatContext = createContext<ChatContextValue>(null!);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Record<string, ChatMessage[]>>({});
  const [activeConversation, setActiveConversation] = useState<string | null>(null);

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
      setActiveConversation, addMessage, markRead, flagConversation, unreadCount,
    }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  return useContext(ChatContext);
}
