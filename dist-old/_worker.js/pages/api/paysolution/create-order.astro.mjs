globalThis.process ??= {};
globalThis.process.env ??= {};
import { randomUUID } from "crypto";
import { o as objectType, s as stringType, n as numberType } from "../../../chunks/astro/server_B1Q-Dpks.mjs";
import { a } from "../../../chunks/_@astro-renderers_B6-rS8YJ.mjs";
const prerender = false;
const CreateOrderSchema = objectType({
  designId: stringType().min(1),
  buyerEmail: stringType().email().optional(),
  amount: numberType().positive(),
  currency: stringType().default("USDT")
});
const POST = async ({ request, locals }) => {
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
  const parsed = CreateOrderSchema.safeParse(body);
  if (!parsed.success) {
    return new Response(JSON.stringify({ error: "Validation failed", issues: parsed.error.issues }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }
  const { designId, amount, currency } = parsed.data;
  const db = env.DB;
  const design = await db.prepare("SELECT id, status, price FROM designs WHERE id = ?").bind(designId).first();
  if (!design) {
    return new Response(JSON.stringify({ error: "Design not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" }
    });
  }
  if (design.status !== "available") {
    return new Response(JSON.stringify({ error: "Design is not available" }), {
      status: 409,
      headers: { "Content-Type": "application/json" }
    });
  }
  const orderId = randomUUID();
  const callbackUrl = `${env.SITE_URL ?? "https://saknid.com"}/api/paysolution/webhook`;
  const returnUrl = `${env.SITE_URL ?? "https://saknid.com"}/checkout/${designId}?paysolution=1`;
  const stubPaymentUrl = `https://pay.paysolution.com/order/${orderId}?amount=${amount}&currency=${currency}&callback=${encodeURIComponent(callbackUrl)}&return=${encodeURIComponent(returnUrl)}`;
  return new Response(JSON.stringify({
    orderId,
    paymentUrl: stubPaymentUrl,
    amount,
    currency,
    status: "pending",
    // NOTE: This is a stub. Real integration requires PaySolution API credentials.
    stub: true
  }), {
    status: 200,
    headers: { "Content-Type": "application/json" }
  });
};
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
