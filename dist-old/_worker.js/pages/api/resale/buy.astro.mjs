globalThis.process ??= {};
globalThis.process.env ??= {};
import { randomUUID } from "crypto";
import { o as objectType, s as stringType } from "../../../chunks/astro/server_B1Q-Dpks.mjs";
import { a } from "../../../chunks/_@astro-renderers_B6-rS8YJ.mjs";
const prerender = false;
const BuyResaleSchema = objectType({
  listingId: stringType().min(1),
  txHash: stringType().regex(/^0x[0-9a-fA-F]{64}$/, "Must be a 0x transaction hash"),
  buyerWallet: stringType().regex(/^0x[0-9a-fA-F]{40}$/, "Must be a 0x Ethereum address")
});
const POST = async ({ request, locals }) => {
  const env = locals.runtime.env;
  const db = env.DB;
  let body;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }
  const parsed = BuyResaleSchema.safeParse(body);
  if (!parsed.success) {
    return new Response(JSON.stringify({ error: "Validation failed", issues: parsed.error.issues }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }
  const { listingId, txHash, buyerWallet } = parsed.data;
  const existing = await db.prepare("SELECT 1 FROM mint_confirmations WHERE tx_hash = ?").bind(txHash).first();
  if (existing) {
    return new Response(JSON.stringify({ status: "noop" }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  }
  const listing = await db.prepare(`SELECT rl.id, rl.design_id, rl.asking_price, rl.token_id, rl.status,
                     d.artist_id, d.royalty_pct
              FROM resale_listings rl
              JOIN designs d ON rl.design_id = d.id
              WHERE rl.id = ?`).bind(listingId).first();
  if (!listing) {
    return new Response(JSON.stringify({ error: "Resale listing not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" }
    });
  }
  if (listing.status !== "active") {
    return new Response(JSON.stringify({ error: "Listing is no longer active" }), {
      status: 422,
      headers: { "Content-Type": "application/json" }
    });
  }
  const confirmedAt = Math.floor(Date.now() / 1e3);
  const royaltyPct = listing.royalty_pct ?? 0;
  const platformFeePct = 0.03;
  const royaltyAmount = listing.asking_price * (royaltyPct / 100);
  const platformFee = listing.asking_price * platformFeePct;
  await db.prepare("UPDATE resale_listings SET status = 'sold' WHERE id = ?").bind(listingId).run();
  await db.prepare("INSERT INTO mint_confirmations(tx_hash, token_id, buyer, confirmed_at) VALUES (?, ?, ?, ?)").bind(txHash, listing.token_id, buyerWallet, confirmedAt).run();
  if (royaltyAmount > 0) {
    await db.prepare(
      `INSERT INTO earnings(id, artist_id, design_id, type, amount, platform_fee, tx_hash, payment_method, created_at)
         VALUES (?, ?, ?, 'royalty', ?, ?, ?, 'on_chain', ?)`
    ).bind(randomUUID(), listing.artist_id, listing.design_id, royaltyAmount, platformFee, txHash, confirmedAt).run();
  }
  return new Response(JSON.stringify({ status: "confirmed", listingId }), {
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
