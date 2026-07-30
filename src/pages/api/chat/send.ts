export const prerender = false;

import type { APIRoute } from "astro";
import { z } from "zod";
import { randomUUID } from "crypto";
import { filterMessage } from "../../../lib/chat/schema";
import { json, resolveSender } from "../../../lib/chat/helpers";

const SendSchema = z.object({
  conversationId: z.string(),
  text: z.string().min(1).max(2000),
});

export const POST: APIRoute = async ({ request, locals }) => {
  const start = Date.now();
  const requestId = randomUUID();
  const env = locals.runtime.env;
  const cookie = request.headers.get("cookie") ?? "";

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    const status = 400;
    console.log(JSON.stringify({ request_id: requestId, route: "/api/chat/send", status, duration_ms: Date.now() - start }));
    return json({ error: "Invalid JSON" }, status);
  }

  const parsed = SendSchema.safeParse(body);
  if (!parsed.success) {
    const status = 400;
    console.log(JSON.stringify({ request_id: requestId, route: "/api/chat/send", status, duration_ms: Date.now() - start, issues: parsed.error.issues }));
    return json({ error: "Validation failed", issues: parsed.error.issues }, status);
  }

  const { conversationId, text } = parsed.data;

  const sender = await resolveSender(cookie, env.SESSION, locals.user);
  if (!sender) {
    const status = 401;
    console.log(JSON.stringify({ request_id: requestId, route: "/api/chat/send", status, duration_ms: Date.now() - start }));
    return json({ error: "Not authenticated" }, status);
  }

  const filter = filterMessage(text);
  const now = Math.floor(Date.now() / 1000);
  const messageId = randomUUID();
  const d1Start = Date.now();

  try {
    const conversation = await env.DB.prepare("SELECT client_id, artist_id FROM conversations WHERE id = ?")
      .bind(conversationId)
      .first<{ client_id: string; artist_id: string }>();

    if (!conversation) {
      const status = 404;
      console.log(JSON.stringify({ request_id: requestId, route: "/api/chat/send", status, duration_ms: Date.now() - start }));
      return json({ error: "Conversation not found" }, status);
    }

    const isParticipant = sender.role === "admin" || conversation.client_id === sender.id || conversation.artist_id === sender.id;
    if (!isParticipant) {
      const status = 403;
      console.log(JSON.stringify({ request_id: requestId, route: "/api/chat/send", status, duration_ms: Date.now() - start }));
      return json({ error: "Not authorized" }, status);
    }

    await env.DB.prepare(
      `INSERT INTO messages (id, conversation_id, sender_id, sender_role, text, flagged, flag_reason, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    )
      .bind(messageId, conversationId, sender.id, sender.role, text, filter.clean ? 0 : 1, filter.reason ?? null, now)
      .run();

    await env.DB.prepare(
      `UPDATE conversations
       SET last_message = ?, last_message_at = ?, unread = unread + ?
       WHERE id = ?`
    )
      .bind(text, now, 1, conversationId)
      .run();

    const status = 201;
    const d1Ms = Date.now() - d1Start;
    console.log(JSON.stringify({ request_id: requestId, route: "/api/chat/send", status, duration_ms: Date.now() - start, d1_query_ms: d1Ms }));

    return json(
      {
        id: messageId,
        conversationId,
        senderId: sender.id,
        senderRole: sender.role,
        text,
        flagged: !filter.clean,
        flagReason: filter.reason ?? null,
        createdAt: now,
      },
      status
    );
  } catch (err) {
    const status = 500;
    console.log(JSON.stringify({ request_id: requestId, route: "/api/chat/send", status, duration_ms: Date.now() - start, error: String(err) }));
    return json({ error: "Internal server error" }, status);
  }
};
