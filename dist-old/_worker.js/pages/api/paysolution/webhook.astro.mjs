globalThis.process ??= {};
globalThis.process.env ??= {};
import { createHmac, timingSafeEqual, randomUUID } from "crypto";
import { a } from "../../../chunks/_@astro-renderers_B6-rS8YJ.mjs";
const prerender = false;
const POST = async ({ request, locals }) => {
  const env = locals.runtime.env;
  const rawBody = await request.text();
  const signature = request.headers.get("X-PaySolution-Signature");
  const secret = env.PAYSOLUTION_WEBHOOK_SECRET;
  if (!signature || !secret) {
    return new Response(JSON.stringify({ error: "Missing signature or secret" }), {
      status: 401,
      headers: { "Content-Type": "application/json" }
    });
  }
  const expected = createHmac("sha256", secret).update(rawBody).digest("hex");
  if (!timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
    return new Response(JSON.stringify({ error: "Invalid signature" }), {
      status: 401,
      headers: { "Content-Type": "application/json" }
    });
  }
  let body;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }
  const payload = body;
  if (!payload.orderId || !payload.designId || payload.status !== "paid") {
    return new Response(JSON.stringify({ error: "Invalid payload or payment not confirmed" }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }
  const db = env.DB;
  const alreadyProcessed = await db.prepare("SELECT 1 FROM mint_confirmations WHERE tx_hash = ?").bind(`paysolution:${payload.orderId}`).first();
  if (alreadyProcessed) {
    return new Response(JSON.stringify({ status: "noop" }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  }
  const design = await db.prepare("SELECT id, status, price, artist_id FROM designs WHERE id = ?").bind(payload.designId).first();
  if (!design || design.status === "sold") {
    return new Response(JSON.stringify({ error: "Design not available or already sold" }), {
      status: 409,
      headers: { "Content-Type": "application/json" }
    });
  }
  const confirmedAt = Math.floor(Date.now() / 1e3);
  const txRef = `paysolution:${payload.orderId}`;
  await db.prepare("UPDATE designs SET status = 'sold' WHERE id = ?").bind(payload.designId).run();
  await db.prepare("INSERT INTO mint_confirmations(tx_hash, token_id, buyer, confirmed_at) VALUES (?, ?, ?, ?)").bind(txRef, 0, payload.buyerWallet ?? "", confirmedAt).run();
  if (design.price && design.artist_id) {
    const platformFee = design.price * 0.03;
    const artistAmount = design.price - platformFee;
    await db.prepare(
      `INSERT INTO earnings(id, artist_id, design_id, type, amount, platform_fee, tx_hash, payment_method, created_at)
         VALUES (?, ?, ?, 'primary_sale', ?, ?, ?, 'paysolution', ?)`
    ).bind(randomUUID(), design.artist_id, design.id, artistAmount, platformFee, txRef, confirmedAt).run();
  }
  return new Response(JSON.stringify({ status: "processed" }), {
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
