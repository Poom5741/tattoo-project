export const prerender = false;

import type { APIRoute } from "astro";
import { randomUUID } from "crypto";
import { createPublicClient, http, fallback } from "viem";
import { bscTestnet } from "wagmi/chains";
import { ResaleListingSchema } from "../../../lib/api/schemas";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "../../../lib/config/contract";

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

  const parsed = ResaleListingSchema.safeParse(body);
  if (!parsed.success) {
    return new Response(JSON.stringify({ error: "Validation failed", issues: parsed.error.issues }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { designId, tokenId, askingPrice, sellerWallet } = parsed.data;
  const db = env.DB;

  // Verify design exists, is sold, and is resellable
  const design = await db
    .prepare("SELECT id, status, selling_mode, token_id FROM designs WHERE id = ?")
    .bind(designId)
    .first<{ id: string; status: string; selling_mode: string; token_id: number | null }>();

  if (!design) {
    return new Response(JSON.stringify({ error: "Design not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (design.selling_mode === "one-time") {
    return new Response(JSON.stringify({ error: "Soulbound designs cannot be resold" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (design.status !== "sold") {
    return new Response(JSON.stringify({ error: "Only sold designs can be listed for resale" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Check no existing active listing
  const existing = await db
    .prepare("SELECT id FROM resale_listings WHERE design_id = ? AND status = 'active'")
    .bind(designId)
    .first();

  if (existing) {
    return new Response(JSON.stringify({ error: "An active resale listing already exists for this design" }), {
      status: 409,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Verify on-chain ownership
  try {
    const transport = fallback([
      http(env.BSC_RPC_PRIMARY),
      http(env.BSC_RPC_FALLBACK),
    ]);

    const publicClient = createPublicClient({
      chain: bscTestnet,
      transport,
    });

    const owner = await publicClient.readContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: "ownerOf",
      args: [BigInt(tokenId)],
    }) as string;

    if (owner.toLowerCase() !== sellerWallet.toLowerCase()) {
      return new Response(JSON.stringify({ error: "Caller is not the NFT owner" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      });
    }
  } catch {
    return new Response(JSON.stringify({ error: "Could not verify on-chain ownership" }), {
      status: 422,
      headers: { "Content-Type": "application/json" },
    });
  }

  const id = randomUUID();
  const createdAt = Math.floor(Date.now() / 1000);

  await db
    .prepare(
      "INSERT INTO resale_listings(id, design_id, seller_wallet, asking_price, token_id, status, created_at) VALUES (?, ?, ?, ?, ?, 'active', ?)"
    )
    .bind(id, designId, sellerWallet, askingPrice, tokenId, createdAt)
    .run();

  return new Response(JSON.stringify({ id, status: "active" }), {
    status: 201,
    headers: { "Content-Type": "application/json" },
  });
};
