import { useState, useEffect } from "react";
import ChatBox from "./ChatBox";
import { ChatProvider, useChat } from "../lib/chat/store";

function InboxInner() {
  const [activeConv, setActiveConv] = useState<string | null>(null);
  const { conversations, fetchConversations, loading } = useChat();

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  return (
    <div className="flex h-[calc(100vh-120px)] gap-4">
      <div className="w-80 shrink-0 border rounded-xl overflow-hidden bg-white">
        <div className="px-4 py-3 border-b bg-gray-50 font-semibold text-sm">Inbox</div>
        <div>
          {loading && conversations.length === 0 ? (
            <div className="p-4 text-xs text-gray-400 text-center">Loading conversations...</div>
          ) : conversations.length === 0 ? (
            <div className="p-4 text-xs text-gray-400 text-center">No active conversations.</div>
          ) : (
            conversations.map((conv: any) => (
              <button
                key={conv.id}
                onClick={() => setActiveConv(conv.id)}
                className={`w-full text-left px-4 py-3 border-b hover:bg-gray-50 ${activeConv === conv.id ? "bg-blue-50" : ""}`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-sm">{conv.clientName || conv.artistName || conv.id}</span>
                  {conv.unread > 0 && (
                    <span className="px-1.5 py-0.5 bg-blue-600 text-white text-[10px] rounded-full">{conv.unread}</span>
                  )}
                </div>
                <p className="text-xs text-gray-500 truncate">{conv.lastMessage || conv.designId || "No messages"}</p>
              </button>
            ))
          )}
        </div>
      </div>
      <div className="flex-1">
        {activeConv ? (
          <ChatBox userId="artist" senderRole="artist" conversationId={activeConv} />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400 text-sm border rounded-xl bg-white">Select a conversation</div>
        )}
      </div>
    </div>
  );
}

export default function InboxView() {
  return (
    <ChatProvider>
      <InboxInner />
    </ChatProvider>
  );
}
