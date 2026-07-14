import { useState } from "react";
import { ChatBox } from "./ChatBox";

const FLAGGED_CONVERSATIONS = [
  { id: "flag-1", clientName: "Alex R.", artistName: "Artist One", reason: "URL detected in message", flaggedAt: "2026-07-14", status: "flagged" },
  { id: "flag-2", clientName: "Sam K.", artistName: "Artist Two", reason: "Phone number detected", flaggedAt: "2026-07-13", status: "flagged" },
];

export function AdminReviewPanel() {
  const [selectedConv, setSelectedConv] = useState<string | null>(null);
  const [resolved, setResolved] = useState<string[]>([]);

  function resolve(convId: string) {
    setResolved(prev => [...prev, convId]);
    setSelectedConv(null);
  }

  const flagged = FLAGGED_CONVERSATIONS.filter(c => !resolved.includes(c.id));

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Admin Review</h1>
          <p className="text-sm text-gray-500 mt-1">{flagged.length} flagged conversations</p>
        </div>
      </div>

      <div className="flex gap-4 h-[calc(100vh-200px)]">
        {/* Flagged list */}
        <div className="w-80 shrink-0 border rounded-xl overflow-hidden bg-white">
          <div className="px-4 py-3 border-b bg-gray-50 font-medium text-sm">Flagged Conversations</div>
          <div className="overflow-y-auto">
            {flagged.length === 0 ? (
              <p className="text-center text-gray-400 text-sm py-8">No flagged conversations</p>
            ) : (
              flagged.map((conv) => (
                <button key={conv.id} onClick={() => setSelectedConv(conv.id)}
                  className={`w-full text-left px-4 py-3 border-b hover:bg-gray-50 transition-colors ${
                    selectedConv === conv.id ? "bg-red-50 border-l-2 border-l-red-500" : ""
                  }`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-sm">{conv.clientName}</span>
                    <span className="text-[10px] text-gray-400">{conv.flaggedAt}</span>
                  </div>
                  <p className="text-xs text-gray-500">vs {conv.artistName}</p>
                  <p className="text-xs text-red-600 mt-1">{conv.reason}</p>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Review area */}
        <div className="flex-1 flex flex-col">
          {selectedConv ? (
            <>
              <div className="border rounded-xl bg-white flex-1 flex flex-col overflow-hidden">
                <ChatBox userId="admin-1" senderRole="admin" conversationId={selectedConv} />
              </div>
              <div className="flex gap-2 mt-3">
                <button onClick={() => resolve(selectedConv)}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm hover:bg-emerald-700 transition-colors">
                  Resolve & Unflag
                </button>
                <button className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition-colors">
                  Block User
                </button>
                <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-300 transition-colors ml-auto">
                  Dismiss
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400 text-sm border rounded-xl bg-white">
              Select a flagged conversation to review
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
