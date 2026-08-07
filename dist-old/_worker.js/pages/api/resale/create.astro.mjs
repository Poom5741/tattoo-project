globalThis.process ??= {};
globalThis.process.env ??= {};
import { randomUUID } from "crypto";
import { c as ResaleListingSchema } from "../../../chunks/schemas_Dq2rX-Tk.mjs";
import { a as CONTRACT_ABI, C as CONTRACT_ADDRESS } from "../../../chunks/contract_D8gETbvb.mjs";
import { g as getChainClient } from "../../../chunks/chain-client_BHoaUBbE.mjs";
import { a } from "../../../chunks/_@astro-renderers_B6-rS8YJ.mjs";
const prerender = false;
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
  const parsed = ResaleListingSchema.safeParse(body);
  if (!parsed.success) {
    return new Response(JSON.stringify({ error: "Validation failed", issues: parsed.error.issues }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }
  const { designId, tokenId, askingPrice, sellerWallet } = parsed.data;
  const db = env.DB;
  const design = await db.prepare("SELECT id, status, selling_mode, token_id FROM designs WHERE id = ?").bind(designId).first();
  if (!design) {
    return new Response(JSON.stringify({ error: "Design not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" }
    });
  }
  if (design.selling_mode === "one-time") {
    return new Response(JSON.stringify({ error: "Soulbound designs cannot be resold" }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }
  if (design.status !== "sold") {
    return new Response(JSON.stringify({ error: "Only sold designs can be listed for resale" }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }
  const existing = await db.prepare("SELECT id FROM resale_listings WHERE design_id = ? AND status = 'active'").bind(designId).first();
  if (existing) {
    return new Response(JSON.stringify({ error: "An active resale listing already exists for this design" }), {
      status: 409,
      headers: { "Content-Type": "application/json" }
    });
  }
  try {
    const publicClient = getChainClient(env);
    const owner = await publicClient.readContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: "ownerOf",
      args: [BigInt(tokenId)]
    });
    if (owner.toLowerCase() !== sellerWallet.toLowerCase()) {
      return new Response(JSON.stringify({ error: "Caller is not the NFT owner" }), {
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
  const id = randomUUID();
  const createdAt = Math.floor(Date.now() / 1e3);
  await db.prepare(
    "INSERT INTO resale_listings(id, design_id, seller_wallet, asking_price, token_id, status, created_at) VALUES (?, ?, ?, ?, ?, 'active', ?)"
  ).bind(id, designId, sellerWallet, askingPrice, tokenId, createdAt).run();
  return new Response(JSON.stringify({ id, status: "active" }), {
    status: 201,
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
