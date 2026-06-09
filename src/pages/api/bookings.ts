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

  const { artistId, designId, name, contact, message, bookingType, customStyle, customSize, customPlacement, customBudget } = parsed.data;

  const db = env.DB;
  let d1Ms = 0;

  try {
    const d1Start = Date.now();
    await db
      .prepare(
        "INSERT INTO booking_inquiries (artist_id, design_id, name, contact, message, booking_type, custom_style, custom_size, custom_placement, custom_budget) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
      )
      .bind(artistId, designId ?? null, name, contact, message ?? null, bookingType, customStyle ?? null, customSize ?? null, customPlacement ?? null, customBudget ?? null)
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

  return new Response(JSON.stringify({ ok: true }), {
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
  const subject = `New INKNOIR booking inquiry for ${artistId}`;
  const text = `From: ${name}\nContact: ${contact}\nArtist: ${artistId}\n\n${message ?? ""}`;

  if (env.RESEND_API_KEY) {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "INKNOIR <noreply@inknoir.pages.dev>",
        to: ["bookings@inknoir.pages.dev"],
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
        personalizations: [{ to: [{ email: "bookings@inknoir.pages.dev" }] }],
        from: { email: "noreply@inknoir.pages.dev", name: "INKNOIR" },
        subject,
        content: [{ type: "text/plain", value: text }],
      }),
    });
  }
}
