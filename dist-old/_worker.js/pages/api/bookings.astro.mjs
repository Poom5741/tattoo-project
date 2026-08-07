globalThis.process ??= {};
globalThis.process.env ??= {};
import { B as BookingInquirySchema } from "../../chunks/schemas_Dq2rX-Tk.mjs";
import { randomUUID } from "crypto";
import { a } from "../../chunks/_@astro-renderers_B6-rS8YJ.mjs";
const prerender = false;
const POST = async ({ request, locals }) => {
  const start = Date.now();
  const requestId = randomUUID();
  const env = locals.runtime.env;
  let body;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }
  const parsed = BookingInquirySchema.safeParse(body);
  if (!parsed.success) {
    return new Response(JSON.stringify({ error: "Validation failed", issues: parsed.error.issues }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }
  const { artistId, designId, name, contact, message, bookingType, customStyle, customSize, customPlacement, customBudget } = parsed.data;
  const db = env.DB;
  let d1Ms = 0;
  let conversationId = null;
  try {
    const d1Start = Date.now();
    await db.prepare(
      "INSERT INTO booking_inquiries (artist_id, design_id, name, contact, message, booking_type, custom_style, custom_size, custom_placement, custom_budget) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
    ).bind(artistId, designId ?? null, name, contact, message ?? null, bookingType, customStyle ?? null, customSize ?? null, customPlacement ?? null, customBudget ?? null).run();
    const clientId = locals.user?.id ?? contact;
    const now = Math.floor(Date.now() / 1e3);
    const initialText = message ? `Booking Inquiry: ${message}` : `New ${bookingType} booking inquiry from ${name}`;
    const existing = await db.prepare("SELECT id FROM conversations WHERE client_id = ? AND artist_id = ? AND status = 'active'").bind(clientId, artistId).first();
    if (existing) {
      conversationId = existing.id;
      await db.prepare("UPDATE conversations SET last_message = ?, last_message_at = ?, unread = unread + 1 WHERE id = ?").bind(initialText, now, conversationId).run();
    } else {
      conversationId = randomUUID();
      await db.prepare(
        "INSERT INTO conversations (id, client_id, artist_id, design_id, last_message, last_message_at, unread, status, created_at) VALUES (?, ?, ?, ?, ?, ?, 1, 'active', ?)"
      ).bind(conversationId, clientId, artistId, designId ?? null, initialText, now, now).run();
    }
    const messageId = randomUUID();
    await db.prepare(
      "INSERT INTO messages (id, conversation_id, sender_id, sender_role, text, created_at) VALUES (?, ?, ?, 'client', ?, ?)"
    ).bind(messageId, conversationId, clientId, initialText, now).run();
    d1Ms = Date.now() - d1Start;
  } catch (err) {
    console.log(
      JSON.stringify({ request_id: requestId, route: "/api/bookings", status: 500, duration_ms: Date.now() - start, d1_query_ms: d1Ms, error: String(err) })
    );
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
  void sendEmail({ artistId, name, contact, message: message ?? void 0, env }).catch(
    (err) => console.warn("[bookings] email send failed:", String(err))
  );
  console.log(
    JSON.stringify({ request_id: requestId, route: "/api/bookings", status: 200, duration_ms: Date.now() - start, d1_query_ms: d1Ms })
  );
  return new Response(JSON.stringify({ ok: true, conversationId }), {
    status: 200,
    headers: { "Content-Type": "application/json" }
  });
};
async function sendEmail(opts) {
  const { artistId, name, contact, message, env } = opts;
  const subject = `New SAKNID booking inquiry for ${artistId}`;
  const text = `From: ${name}
Contact: ${contact}
Artist: ${artistId}

${message ?? ""}`;
  if (env.RESEND_API_KEY) {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: "SAKNID <noreply@saknid.pages.dev>",
        to: ["bookings@saknid.pages.dev"],
        subject,
        text
      })
    });
  } else {
    await fetch("https://api.mailchannels.net/tx/v1/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: "bookings@saknid.pages.dev" }] }],
        from: { email: "noreply@saknid.pages.dev", name: "SAKNID" },
        subject,
        content: [{ type: "text/plain", value: text }]
      })
    });
  }
}
const _page = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  POST,
  prerender
}, Symbol.toStringTag, { value: "Module" }));
const page = () => _page;
export {
  page,
  a as renderers
};
