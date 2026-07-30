export const prerender = false;

import type { APIRoute } from "astro";
import { z } from "zod";
import { randomUUID } from "crypto";
import { json, resolveSender } from "../../../../lib/chat/helpers";

const QuerySchema = z.object({
  since: z.coerce.number().int().nonnegative().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  offset: z.coerce.number().int().nonnegative().default(0),
});

interface MessageRow {
  id: string;
  conversation_id: string;
  sender_id: string;
  sender_role: string;
  text: string;
  booking_id: string | null;
  booking_action: string | null;
  flagged: number;
  flag_reason: string | null;
  created_at: number;
}

export const GET: APIRoute = async ({ request, locals, params }) => {
  const start = Date.now();
  const requestId = randomUUID();
  const env = locals.runtime.env;
  const cookie = request.headers.get("cookie") ?? "";
  const conversationId = params.conversationId;

  if (!conversationId) {
    return json({ error: "Conversation ID required" }, 400);
  }

  const sender = await resolveSender(cookie, env.SESSION, locals.user);
  if (!sender) {
    const status = 401;
    console.log(JSON.stringify({ request_id: requestId, route: "/api/chat/messages", status, duration_ms: Date.now() - start }));
    return json({ error: "Not authenticated" }, status);
  }

  const url = new URL(request.url);
  const queryParsed = QuerySchema.safeParse({
    since: url.searchParams.get("since") ?? undefined,
    limit: url.searchParams.get("limit") ?? undefined,
    offset: url.searchParams.get("offset") ?? undefined,
  });
  if (!queryParsed.success) {
    const status = 400;
    console.log(JSON.stringify({ request_id: requestId, route: "/api/chat/messages", status, duration_ms: Date.now() - start, issues: queryParsed.error.issues }));
    return json({ error: "Invalid query", issues: queryParsed.error.issues }, status);
  }
  const { since, limit, offset } = queryParsed.data;

  const d1Start = Date.now();
  try {
    const conversation = await env.DB.prepare("SELECT client_id, artist_id FROM conversations WHERE id = ?")
      .bind(conversationId)
      .first<{ client_id: string; artist_id: string }>();

    if (!conversation) {
      const status = 404;
      console.log(JSON.stringify({ request_id: requestId, route: "/api/chat/messages", status, duration_ms: Date.now() - start }));
      return json({ error: "Conversation not found" }, status);
    }

    const isParticipant = sender.role === "admin" || conversation.client_id === sender.id || conversation.artist_id === sender.id;
    if (!isParticipant) {
      const status = 403;
      console.log(JSON.stringify({ request_id: requestId, route: "/api/chat/messages", status, duration_ms: Date.now() - start }));
      return json({ error: "Not authorized" }, status);
    }

    let sql = `SELECT id, conversation_id, sender_id, sender_role, text, booking_id, booking_action, flagged, flag_reason, created_at
                FROM messages
                WHERE conversation_id = ?`;
    const sqlParams: (string | number)[] = [conversationId];
    if (since !== undefined) {
      sql += " AND created_at > ?";
      sqlParams.push(since);
    }
    sql += " ORDER BY created_at ASC LIMIT ? OFFSET ?";
    sqlParams.push(limit + 1, offset);

    const { results } = await env.DB.prepare(sql).bind(...sqlParams).all<MessageRow>();

    const hasMore = results.length > limit;
    const rows = hasMore ? results.slice(0, -1) : results;

    const messages = rows.map((m: MessageRow) => ({
      id: m.id,
      conversationId: m.conversation_id,
      senderId: m.sender_id,
      senderRole: m.sender_role,
      text: m.text,
      bookingId: m.booking_id,
      bookingAction: m.booking_action,
      flagged: m.flagged === 1,
      flagReason: m.flag_reason,
      createdAt: m.created_at,
    }));

    await env.DB.prepare("UPDATE conversations SET unread = 0 WHERE id = ?")
      .bind(conversationId)
      .run();

    const status = 200;
    const d1Ms = Date.now() - d1Start;
    console.log(JSON.stringify({ request_id: requestId, route: "/api/chat/messages", status, duration_ms: Date.now() - start, d1_query_ms: d1Ms }));

    return json({ messages, hasMore }, status);
  } catch (err) {
    const status = 500;
    console.log(JSON.stringify({ request_id: requestId, route: "/api/chat/messages", status, duration_ms: Date.now() - start, error: String(err) }));
    return json({ error: "Internal server error" }, status);
  }
};
