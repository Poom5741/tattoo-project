globalThis.process ??= {};
globalThis.process.env ??= {};
import { o as objectType, n as numberType, s as stringType, b as booleanType, e as enumType } from "./astro/server_B1Q-Dpks.mjs";
objectType({
  id: stringType(),
  conversationId: stringType(),
  senderId: stringType(),
  senderRole: enumType(["client", "artist", "admin"]),
  text: stringType().min(1).max(2e3),
  bookingId: stringType().nullable().optional(),
  bookingAction: enumType(["request", "confirm", "decline"]).nullable().optional(),
  flagged: booleanType().default(false),
  flagReason: stringType().nullable().optional(),
  createdAt: numberType().int()
});
objectType({
  id: stringType(),
  clientId: stringType(),
  artistId: stringType(),
  designId: stringType().nullable().optional(),
  lastMessage: stringType().nullable().optional(),
  lastMessageAt: numberType().int().nullable().optional(),
  unread: numberType().int().default(0),
  status: enumType(["active", "archived", "flagged"]).default("active"),
  createdAt: numberType().int()
});
const ANTI_BYPASS_PATTERNS = [
  /https?:\/\//i,
  /@[a-z0-9_-]+/i,
  /(line|whatsapp|fb|ig|t.me|telegram)/i,
  /\d{9,}/i
];
function filterMessage(text) {
  for (const pattern of ANTI_BYPASS_PATTERNS) {
    if (pattern.test(text)) {
      return { clean: false, reason: `Pattern matched: ${pattern.source}` };
    }
  }
  return { clean: true };
}
export {
  filterMessage as f
};
