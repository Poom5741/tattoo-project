import { useState, useRef, useEffect } from "react";
import { useChat } from "../lib/chat/store";
import { filterMessage } from "../lib/chat/schema";
import type { ChatMessage } from "../lib/chat/schema";
import { Send, AlertTriangle, MessageSquare } from "lucide-react";

interface ChatBoxProps {
  userId: string;
  senderRole: "client" | "artist" | "admin";
  conversationId: string;
  onSendBooking?: () => void;
}

export default function ChatBox({ userId, senderRole, conversationId, onSendBooking }: ChatBoxProps) {
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { messages, fetchMessages, sendMessage } = useChat();
  const msgList = messages[conversationId] ?? [];

  useEffect(() => {
    if (conversationId && fetchMessages) {
      fetchMessages(conversationId);
    }
  }, [conversationId, fetchMessages]);

  useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }, [msgList.length]);

  async function handleSend() {
    const trimmed = text.trim();
    if (!trimmed || sending) return;
    const check = filterMessage(trimmed);
    if (!check.clean) { setError("Message flagged: " + (check.reason || "Anti-bypass rule matched")); return; }
    setError(""); setSending(true);

    if (sendMessage) {
      const result = await sendMessage(conversationId, trimmed);
      if (!result.ok) {
        setError(result.error || "Failed to send message");
      } else {
        setText("");
      }
    }
    setSending(false);
  }

  return (
    <div className="flex flex-col h-full border rounded-xl overflow-hidden bg-white">
      <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-50">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-gray-500" />
          <span className="font-medium text-sm">Chat</span>
        </div>
        {senderRole === "artist" && onSendBooking && (
          <button onClick={onSendBooking} className="px-3 py-1.5 text-xs font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700">+ Send Booking</button>
        )}
      </div>
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
        {msgList.length === 0 ? <p className="text-center text-gray-400 text-sm mt-8">No messages yet.</p> : msgList.map(msg => (
          <div key={msg.id} className={`flex ${msg.senderId === userId ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm ${msg.senderId === userId ? "bg-blue-600 text-white rounded-br-sm" : "bg-gray-100 text-gray-900 rounded-bl-sm"}`}>
              <p>{msg.text}</p>
              {msg.bookingId && <div className="mt-1 p-1 rounded text-xs bg-opacity-50">Booking #{msg.bookingId.slice(0, 8)}</div>}
              <p className="text-[10px] mt-1 opacity-60">{new Date(msg.createdAt).toLocaleTimeString()}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="border-t p-3">
        {error && <div className="flex items-center gap-2 mb-2 p-2 bg-red-50 text-red-700 text-xs rounded-lg"><AlertTriangle className="w-4 h-4" />{error}</div>}
        <div className="flex gap-2">
          <input value={text} onChange={e => { setText(e.target.value); setError(""); }} onKeyDown={e => e.key === "Enter" && handleSend()} placeholder="Type a message..." className="flex-1 px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" maxLength={2000} />
          <button onClick={handleSend} disabled={sending || !text.trim()} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"><Send className="w-4 h-4" /></button>
        </div>
      </div>
    </div>
  );
}
