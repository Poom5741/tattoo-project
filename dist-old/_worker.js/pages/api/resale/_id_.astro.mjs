globalThis.process ??= {};
globalThis.process.env ??= {};
import { a as CONTRACT_ABI, C as CONTRACT_ADDRESS } from "../../../chunks/contract_D8gETbvb.mjs";
import { g as getChainClient } from "../../../chunks/chain-client_BHoaUBbE.mjs";
import { o as objectType, s as stringType } from "../../../chunks/astro/server_B1Q-Dpks.mjs";
import { a } from "../../../chunks/_@astro-renderers_B6-rS8YJ.mjs";
const prerender = false;
const CancelResaleSchema = objectType({
  callerWallet: stringType().regex(/^0x[0-9a-fA-F]{40}$/, "Must be a 0x Ethereum address")
});
const DELETE = async ({ request, params, locals }) => {
  const env = locals.runtime.env;
  const db = env.DB;
  const { id } = params;
  if (!id) {
    return new Response(JSON.stringify({ error: "Missing listing id" }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }
  let body;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }
  const parsed = CancelResaleSchema.safeParse(body);
  if (!parsed.success) {
    return new Response(JSON.stringify({ error: "Validation failed", issues: parsed.error.issues }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }
  const { callerWallet } = parsed.data;
  const listing = await db.prepare("SELECT id, token_id, status, seller_wallet FROM resale_listings WHERE id = ?").bind(id).first();
  if (!listing) {
    return new Response(JSON.stringify({ error: "Listing not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" }
    });
  }
  if (listing.status !== "active") {
    return new Response(JSON.stringify({ error: "Only active listings can be cancelled" }), {
      status: 422,
      headers: { "Content-Type": "application/json" }
    });
  }
  try {
    const publicClient = getChainClient(env);
    const owner = await publicClient.readContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: "ownerOf",
      args: [BigInt(listing.token_id)]
    });
    if (owner.toLowerCase() !== callerWallet.toLowerCase()) {
      return new Response(JSON.stringify({ error: "Only the current NFT owner can cancel this listing" }), {
        status: 403,
        headers: { "Content-Type": "application/json" }
      });
    }
  } catch {
    return new Response(JSON.stringify({ error: "Could not verify on-chain ownership" }), {
      status: 422,
      headers: { "Content-Type": "application/json" }
    });
  }
  await db.prepare("UPDATE resale_listings SET status = 'cancelled' WHERE id = ?").bind(id).run();
  return new Response(JSON.stringify({ id, status: "cancelled" }), {
    status: 200,
    headers: { "Content-Type": "application/json" }
  });
};
const _page = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  DELETE,
  prerender
}, Symbol.toStringTag, { value: "Module" }));
const page = () => _page;
export {
  page,
  a as renderers
};
