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
    <div className="flex flex-col h-full border border-[#E8E3D8] rounded-xl overflow-hidden bg-[#FBF9F3]">
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#E8E3D8] bg-[#F5F0E8]">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-[#5A5B55]" />
          <span className="font-display font-semibold text-sm text-[#1B1C18]">Chat</span>
        </div>
        {senderRole === "artist" && onSendBooking && (
          <button onClick={onSendBooking} className="px-3 py-1.5 text-xs font-semibold font-body bg-[#E60023] text-white rounded-full hover:bg-[#C4001F] transition-colors shadow-sm">+ Send Booking</button>
        )}
      </div>
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {msgList.length === 0 ? (
          <p className="text-center text-[#5A5B55]/60 font-body text-sm mt-8">No messages yet.</p>
        ) : (
          msgList.map(msg => {
            const isSelf = msg.senderRole === senderRole || msg.senderId === userId;
            return (
              <div key={msg.id} className={`flex flex-col ${isSelf ? "items-end" : "items-start"}`}>
                {/* Sender ID/Role label for received messages */}
                {!isSelf && (
                  <span className="font-body text-[10px] font-semibold uppercase tracking-wider text-[#5A5B55]/70 mb-1 px-1">
                    {msg.senderRole === "client" ? "Client" : msg.senderRole === "admin" ? "Admin" : "Artist"}
                  </span>
                )}
                <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl font-body text-sm shadow-sm ${
                  isSelf 
                    ? "bg-[#E60023] text-white rounded-br-sm" 
                    : "bg-[#E8E3D8] text-[#1B1C18] rounded-bl-sm"
                }`}>
                  <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                  {msg.bookingId && (
                    <div className={`mt-2 p-1.5 rounded text-xs border font-medium ${
                      isSelf 
                        ? "bg-white/10 border-white/20 text-white" 
                        : "bg-[#FBF9F3] border-[#E8E3D8] text-[#5A5B55]"
                    }`}>
                      📅 Booking: #{msg.bookingId.slice(0, 8)}
                    </div>
                  )}
                  <p className={`text-[9px] mt-1 text-right font-medium opacity-60`}>
                    {new Date(msg.createdAt * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
      <div className="border-t border-[#E8E3D8] p-3 bg-[#F5F0E8]">
        {error && <div className="flex items-center gap-2 mb-2 p-2 bg-red-50 text-red-700 text-xs rounded-lg"><AlertTriangle className="w-4 h-4" />{error}</div>}
        <div className="flex gap-2">
          <input 
            value={text} 
            onChange={e => { setText(e.target.value); setError(""); }} 
            onKeyDown={e => e.key === "Enter" && handleSend()} 
            placeholder="Type a message..." 
            className="flex-1 px-3 py-2 border border-[#E8E3D8] bg-[#FBF9F3] text-[#1B1C18] rounded-lg text-sm focus:ring-1 focus:ring-[#E60023] focus:border-[#E60023] outline-none font-body" 
            maxLength={2000} 
          />
          <button 
            onClick={handleSend} 
            disabled={sending || !text.trim()} 
            className="px-4 py-2 bg-[#E60023] text-white rounded-lg hover:bg-[#C4001F] disabled:opacity-50 transition-colors shadow-sm"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
