export const prerender = false;

import type { APIRoute } from "astro";
import { createPublicClient, http, fallback } from "viem";
import { bscTestnet } from "wagmi/chains";
import { z } from "zod";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "../../../lib/config/contract";

const CancelResaleSchema = z.object({
  callerWallet: z.string().regex(/^0x[0-9a-fA-F]{40}$/, "Must be a 0x Ethereum address"),
});

export const DELETE: APIRoute = async ({ request, params, locals }) => {
  const env = locals.runtime.env;
  const db = env.DB;
  const { id } = params;

  if (!id) {
    return new Response(JSON.stringify({ error: "Missing listing id" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const parsed = CancelResaleSchema.safeParse(body);
  if (!parsed.success) {
    return new Response(JSON.stringify({ error: "Validation failed", issues: parsed.error.issues }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { callerWallet } = parsed.data;

  // Fetch listing
  const listing = await db
    .prepare("SELECT id, token_id, status, seller_wallet FROM resale_listings WHERE id = ?")
    .bind(id)
    .first<{ id: string; token_id: number; status: string; seller_wallet: string }>();

  if (!listing) {
    return new Response(JSON.stringify({ error: "Listing not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (listing.status !== "active") {
    return new Response(JSON.stringify({ error: "Only active listings can be cancelled" }), {
      status: 422,
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
      args: [BigInt(listing.token_id)],
    }) as string;

    if (owner.toLowerCase() !== callerWallet.toLowerCase()) {
      return new Response(JSON.stringify({ error: "Only the current NFT owner can cancel this listing" }), {
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

  await db
    .prepare("UPDATE resale_listings SET status = 'cancelled' WHERE id = ?")
    .bind(id)
    .run();

  return new Response(JSON.stringify({ id, status: "cancelled" }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};
