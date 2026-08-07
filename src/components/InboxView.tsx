import { useState, useEffect } from "react";
import ChatBox from "./ChatBox";
import { ChatProvider, useChat } from "../lib/chat/store";

interface InboxInnerProps {
  userId: string;
  role: "artist" | "client";
}

function InboxInner({ userId, role }: InboxInnerProps) {
  const [activeConv, setActiveConv] = useState<string | null>(null);
  const { conversations, fetchConversations, loading } = useChat();

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  return (
    <div className="flex h-[calc(100vh-120px)] gap-6 flex-col md:flex-row">
      <div className={`w-full md:w-80 shrink-0 border border-[#E8E3D8] rounded-xl overflow-hidden bg-[#FBF9F3] ${
        activeConv ? "hidden md:block" : "block"
      }`}>
        <div className="px-4 py-3 border-b border-[#E8E3D8] bg-[#F5F0E8] font-display font-semibold text-sm text-[#1B1C18]">Inbox</div>
        <div className="divide-y divide-[#E8E3D8]/40 overflow-y-auto max-h-[calc(100vh-180px)]">
          {loading && conversations.length === 0 ? (
            <div className="p-4 text-xs text-[#5A5B55]/60 text-center font-body">Loading conversations...</div>
          ) : conversations.length === 0 ? (
            <div className="p-4 text-xs text-[#5A5B55]/60 text-center font-body">No active conversations.</div>
          ) : (
            conversations.map((conv: any) => (
              <button
                key={conv.id}
                onClick={() => setActiveConv(conv.id)}
                className={`w-full text-left px-4 py-3.5 hover:bg-[#F5F0E8]/50 transition-colors font-body ${
                  activeConv === conv.id ? "bg-[#F5F0E8]" : ""
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-semibold text-sm text-[#1B1C18]">
                    {role === "client" ? (conv.artistName || conv.clientName || conv.id) : (conv.clientName || conv.artistName || conv.id)}
                  </span>
                  {conv.unread > 0 && (
                    <span className="px-2 py-0.5 bg-[#E60023] text-white text-[9px] font-bold rounded-full">{conv.unread}</span>
                  )}
                </div>
                <p className="text-xs text-[#5A5B55]/70 truncate">{conv.lastMessage || conv.designId || "No messages"}</p>
              </button>
            ))
          )}
        </div>
      </div>
      <div className={`flex-1 h-full ${activeConv ? "block" : "hidden md:block"}`}>
        {activeConv ? (
          <ChatBox userId={userId} senderRole={role} conversationId={activeConv} onBack={() => setActiveConv(null)} />
        ) : (
          <div className="flex items-center justify-center h-full text-[#5A5B55]/60 text-sm border border-[#E8E3D8] rounded-xl bg-[#FBF9F3] font-body">Select a conversation</div>
        )}
      </div>
    </div>
  );
}

interface InboxViewProps {
  userId?: string;
  role?: "artist" | "client";
}

export default function InboxView({ userId = "artist", role = "artist" }: InboxViewProps) {
  return (
    <ChatProvider>
      <InboxInner userId={userId} role={role} />
    </ChatProvider>
  );
}
