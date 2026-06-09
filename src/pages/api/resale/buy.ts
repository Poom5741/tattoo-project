export const prerender = false;

import type { APIRoute } from "astro";
import { randomUUID } from "crypto";
import { z } from "zod";

const BuyResaleSchema = z.object({
  listingId: z.string().min(1),
  txHash: z.string().regex(/^0x[0-9a-fA-F]{64}$/, "Must be a 0x transaction hash"),
  buyerWallet: z.string().regex(/^0x[0-9a-fA-F]{40}$/, "Must be a 0x Ethereum address"),
});

export const POST: APIRoute = async ({ request, locals }) => {
  const env = locals.runtime.env;
  const db = env.DB;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const parsed = BuyResaleSchema.safeParse(body);
  if (!parsed.success) {
    return new Response(JSON.stringify({ error: "Validation failed", issues: parsed.error.issues }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { listingId, txHash, buyerWallet } = parsed.data;

  // Check for duplicate confirmation
  const existing = await db
    .prepare("SELECT 1 FROM mint_confirmations WHERE tx_hash = ?")
    .bind(txHash)
    .first();

  if (existing) {
    return new Response(JSON.stringify({ status: "noop" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Fetch resale listing
  const listing = await db
    .prepare(`SELECT rl.id, rl.design_id, rl.asking_price, rl.token_id, rl.status,
                     d.artist_id, d.royalty_pct
              FROM resale_listings rl
              JOIN designs d ON rl.design_id = d.id
              WHERE rl.id = ?`)
    .bind(listingId)
    .first<{
      id: string;
      design_id: string;
      asking_price: number;
      token_id: number;
      status: string;
      artist_id: string;
      royalty_pct: number | null;
    }>();

  if (!listing) {
    return new Response(JSON.stringify({ error: "Resale listing not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (listing.status !== "active") {
    return new Response(JSON.stringify({ error: "Listing is no longer active" }), {
      status: 422,
      headers: { "Content-Type": "application/json" },
    });
  }

  const confirmedAt = Math.floor(Date.now() / 1000);
  const royaltyPct = listing.royalty_pct ?? 0;
  const platformFeePct = 0.03;
  const royaltyAmount = listing.asking_price * (royaltyPct / 100);
  const platformFee = listing.asking_price * platformFeePct;

  // Update resale listing to sold
  await db
    .prepare("UPDATE resale_listings SET status = 'sold' WHERE id = ?")
    .bind(listingId)
    .run();

  // Update design buyer_wallet in booking_inquiries (no-op here — design stays 'sold')
  // Record mint confirmation to prevent double-processing
  await db
    .prepare("INSERT INTO mint_confirmations(tx_hash, token_id, buyer, confirmed_at) VALUES (?, ?, ?, ?)")
    .bind(txHash, listing.token_id, buyerWallet, confirmedAt)
    .run();

  // Record royalty earnings for artist
  if (royaltyAmount > 0) {
    await db
      .prepare(
        `INSERT INTO earnings(id, artist_id, design_id, type, amount, platform_fee, tx_hash, payment_method, created_at)
         VALUES (?, ?, ?, 'royalty', ?, ?, ?, 'on_chain', ?)`
      )
      .bind(randomUUID(), listing.artist_id, listing.design_id, royaltyAmount, platformFee, txHash, confirmedAt)
      .run();
  }

  return new Response(JSON.stringify({ status: "confirmed", listingId }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};
