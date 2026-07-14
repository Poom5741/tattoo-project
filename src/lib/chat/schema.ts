import { z } from "zod";

export const ChatMessageSchema = z.object({
  id: z.string(),
  conversationId: z.string(),
  senderId: z.string(),
  senderRole: z.enum(["client", "artist", "admin"]),
  text: z.string().min(1).max(2000),
  bookingId: z.string().nullable().optional(),
  bookingAction: z.enum(["request", "confirm", "decline"]).nullable().optional(),
  flagged: z.boolean().default(false),
  flagReason: z.string().nullable().optional(),
  createdAt: z.number().int(),
});

export const ConversationSchema = z.object({
  id: z.string(),
  clientId: z.string(),
  artistId: z.string(),
  designId: z.string().nullable().optional(),
  lastMessage: z.string().nullable().optional(),
  lastMessageAt: z.number().int().nullable().optional(),
  unread: z.number().int().default(0),
  status: z.enum(["active", "archived", "flagged"]).default("active"),
  createdAt: z.number().int(),
});

export type ChatMessage = z.infer<typeof ChatMessageSchema>;
export type Conversation = z.infer<typeof ConversationSchema>;

export const ANTI_BYPASS_PATTERNS = [
  /https?:\/\//i,
  /@[a-z0-9_-]+/i,
  /(line|whatsapp|fb|ig|t.me|telegram)/i,
  /\d{9,}/i,
];

export function filterMessage(text: string): { clean: boolean; reason?: string } {
  for (const pattern of ANTI_BYPASS_PATTERNS) {
    if (pattern.test(text)) {
      return { clean: false, reason: `Pattern matched: ${pattern.source}` };
    }
  }
  return { clean: true };
}
