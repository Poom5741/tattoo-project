export const prerender = false;

import type { APIRoute } from "astro";
import { BookingInquirySchema } from "../../lib/api/schemas";
import { randomUUID } from "crypto";

export const POST: APIRoute = async ({ request, locals }) => {
  const start = Date.now();
  const requestId = randomUUID();
  const env = locals.runtime.env;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const parsed = BookingInquirySchema.safeParse(body);
  if (!parsed.success) {
    return new Response(JSON.stringify({ error: "Validation failed", issues: parsed.error.issues }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { artistId, designId, name, contact, message, bookingType, customStyle, customSize, customPlacement, customBudget, buyerWallet } = parsed.data;

  const db = env.DB;
  let d1Ms = 0;
  let conversationId: string | null = null;

  try {
    const d1Start = Date.now();
    await db
      .prepare(
        "INSERT INTO booking_inquiries (artist_id, design_id, name, contact, message, booking_type, custom_style, custom_size, custom_placement, custom_budget, buyer_wallet) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
      )
      .bind(artistId, designId ?? null, name, contact, message ?? null, bookingType, customStyle ?? null, customSize ?? null, customPlacement ?? null, customBudget ?? null, buyerWallet ?? null)
      .run();

    // Auto-create chat conversation thread and initial message
    const clientId = buyerWallet ?? locals.user?.id ?? contact;
    const now = Math.floor(Date.now() / 1000);
    const initialText = message ? `Booking Inquiry: ${message}` : `New ${bookingType} booking inquiry from ${name}`;

    // Check if conversation thread already exists
    const existing = await db
      .prepare("SELECT id FROM conversations WHERE client_id = ? AND artist_id = ? AND status = 'active'")
      .bind(clientId, artistId)
      .first<{ id: string }>();

    if (existing) {
      conversationId = existing.id;
      await db
        .prepare("UPDATE conversations SET last_message = ?, last_message_at = ?, unread = unread + 1 WHERE id = ?")
        .bind(initialText, now, conversationId)
        .run();
    } else {
      conversationId = randomUUID();
      await db
        .prepare(
          "INSERT INTO conversations (id, client_id, artist_id, design_id, last_message, last_message_at, unread, status, created_at) VALUES (?, ?, ?, ?, ?, ?, 1, 'active', ?)"
        )
        .bind(conversationId, clientId, artistId, designId ?? null, initialText, now, now)
        .run();
    }

    // Insert initial message
    const messageId = randomUUID();
    await db
      .prepare(
        "INSERT INTO messages (id, conversation_id, sender_id, sender_role, text, created_at) VALUES (?, ?, ?, 'client', ?, ?)"
      )
      .bind(messageId, conversationId, clientId, initialText, now)
      .run();

    d1Ms = Date.now() - d1Start;
  } catch (err) {
    console.log(
      JSON.stringify({ request_id: requestId, route: "/api/bookings", status: 500, duration_ms: Date.now() - start, d1_query_ms: d1Ms, error: String(err) })
    );
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Fire-and-forget email
  void sendEmail({ artistId, name, contact, message: message ?? undefined, env }).catch((err) =>
    console.warn("[bookings] email send failed:", String(err))
  );

  console.log(
    JSON.stringify({ request_id: requestId, route: "/api/bookings", status: 200, duration_ms: Date.now() - start, d1_query_ms: d1Ms })
  );

  return new Response(JSON.stringify({ ok: true, conversationId }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};

async function sendEmail(opts: {
  artistId: string;
  name: string;
  contact: string;
  message?: string;
  env: { RESEND_API_KEY?: string };
}) {
  const { artistId, name, contact, message, env } = opts;
  const subject = `New SAKNID booking inquiry for ${artistId}`;
  const text = `From: ${name}\nContact: ${contact}\nArtist: ${artistId}\n\n${message ?? ""}`;

  if (env.RESEND_API_KEY) {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "SAKNID <noreply@saknid.pages.dev>",
        to: ["bookings@saknid.pages.dev"],
        subject,
        text,
      }),
    });
  } else {
    // MailChannels fallback (available in Cloudflare Workers)
    await fetch("https://api.mailchannels.net/tx/v1/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: "bookings@saknid.pages.dev" }] }],
        from: { email: "noreply@saknid.pages.dev", name: "SAKNID" },
        subject,
        content: [{ type: "text/plain", value: text }],
      }),
    });
  }
}
