export const prerender = false;

import type { APIRoute } from "astro";
import { randomUUID } from "crypto";
import { z } from "zod";

const CreateOrderSchema = z.object({
  designId: z.string().min(1),
  buyerEmail: z.string().email().optional(),
  amount: z.number().positive(),
  currency: z.string().default("USDT"),
});

// PaySolution off-chain payment integration
// Creates a payment order and returns a payment URL
// Full integration requires PaySolution merchant API credentials
export const POST: APIRoute = async ({ request, locals }) => {
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

  const parsed = CreateOrderSchema.safeParse(body);
  if (!parsed.success) {
    return new Response(JSON.stringify({ error: "Validation failed", issues: parsed.error.issues }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { designId, amount, currency } = parsed.data;

  // Verify design exists and is available
  const db = env.DB;
  const design = await db
    .prepare("SELECT id, status, price FROM designs WHERE id = ?")
    .bind(designId)
    .first<{ id: string; status: string; price: number | null }>();

  if (!design) {
    return new Response(JSON.stringify({ error: "Design not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (design.status !== "available") {
    return new Response(JSON.stringify({ error: "Design is not available" }), {
      status: 409,
      headers: { "Content-Type": "application/json" },
    });
  }

  // TODO: Replace with actual PaySolution merchant API call
  // Documentation: https://paysolution.com/docs/api
  // Required env vars: PAYSOLUTION_MERCHANT_ID, PAYSOLUTION_API_KEY
  const orderId = randomUUID();
  const callbackUrl = `${env.SITE_URL ?? "https://inknoir.com"}/api/paysolution/webhook`;
  const returnUrl = `${env.SITE_URL ?? "https://inknoir.com"}/checkout/${designId}?paysolution=1`;

  // Stub response — replace with actual API call when credentials are available
  const stubPaymentUrl = `https://pay.paysolution.com/order/${orderId}?amount=${amount}&currency=${currency}&callback=${encodeURIComponent(callbackUrl)}&return=${encodeURIComponent(returnUrl)}`;

  return new Response(JSON.stringify({
    orderId,
    paymentUrl: stubPaymentUrl,
    amount,
    currency,
    status: "pending",
    // NOTE: This is a stub. Real integration requires PaySolution API credentials.
    stub: true,
  }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};
