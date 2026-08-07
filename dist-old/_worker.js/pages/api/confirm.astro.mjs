globalThis.process ??= {};
globalThis.process.env ??= {};
import { randomUUID } from "crypto";
import { a as ConfirmRequestSchema } from "../../chunks/schemas_Dq2rX-Tk.mjs";
import { C as CONTRACT_ADDRESS, a as CONTRACT_ABI } from "../../chunks/contract_D8gETbvb.mjs";
import { g as getChainClient, z as zeroAddress } from "../../chunks/chain-client_BHoaUBbE.mjs";
import { p as parseEventLogs } from "../../chunks/verifyHash_CGN_bz2z.mjs";
import { a } from "../../chunks/_@astro-renderers_B6-rS8YJ.mjs";
const prerender = false;
const POST = async ({ request, locals }) => {
  const start = Date.now();
  const requestId = randomUUID();
  const env = locals.runtime.env;
  const db = env.DB;
  let body;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "invalid_json" }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }
  const parsed = ConfirmRequestSchema.safeParse(body);
  if (!parsed.success) {
    return new Response(JSON.stringify({ error: "validation_error", issues: parsed.error.issues }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }
  const { txHash, tokenId } = parsed.data;
  let chainMs = 0;
  try {
    const existing = await db.prepare("SELECT 1 FROM mint_confirmations WHERE tx_hash = ?").bind(txHash).first();
    if (existing) {
      console.log(
        JSON.stringify({
          request_id: requestId,
          route: "/api/confirm",
          status: 200,
          duration_ms: Date.now() - start,
          reason: "noop"
        })
      );
      return new Response(JSON.stringify({ status: "noop" }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    }
    const publicClient = getChainClient(env);
    const chainStart = Date.now();
    const receipt = await publicClient.getTransactionReceipt({
      hash: txHash
    });
    if (receipt.status !== "success") {
      return new Response(JSON.stringify({ error: "tx_failed" }), {
        status: 422,
        headers: { "Content-Type": "application/json" }
      });
    }
    if (receipt.to?.toLowerCase() !== CONTRACT_ADDRESS.toLowerCase()) {
      return new Response(JSON.stringify({ error: "wrong_contract" }), {
        status: 422,
        headers: { "Content-Type": "application/json" }
      });
    }
    const currentBlock = await publicClient.getBlockNumber();
    if (receipt.blockNumber + 3n > currentBlock) {
      return new Response(JSON.stringify({ error: "insufficient_confirmations" }), {
        status: 422,
        headers: { "Content-Type": "application/json" }
      });
    }
    chainMs = Date.now() - chainStart;
    const filteredLogs = receipt.logs.filter(
      (l) => l.address.toLowerCase() === CONTRACT_ADDRESS.toLowerCase()
    );
    const plateMintedLogs = parseEventLogs({
      abi: CONTRACT_ABI,
      eventName: "PlateMinted",
      logs: filteredLogs
    });
    if (plateMintedLogs.length === 0) {
      console.log(
        JSON.stringify({
          request_id: requestId,
          route: "/api/confirm",
          status: 422,
          duration_ms: Date.now() - start,
          chain_call_ms: chainMs,
          reason: "no_plate_minted_event"
        })
      );
      return new Response(JSON.stringify({ error: "no_plate_minted_event" }), {
        status: 422,
        headers: { "Content-Type": "application/json" }
      });
    }
    const mintedEvent = plateMintedLogs[0];
    const decodedTokenId = mintedEvent.args.tokenId;
    const decodedBuyer = mintedEvent.args.buyer;
    if (decodedTokenId !== BigInt(tokenId)) {
      return new Response(JSON.stringify({ error: "token_id_mismatch" }), {
        status: 422,
        headers: { "Content-Type": "application/json" }
      });
    }
    if (!decodedBuyer || decodedBuyer === zeroAddress) {
      return new Response(JSON.stringify({ error: "invalid_buyer" }), {
        status: 422,
        headers: { "Content-Type": "application/json" }
      });
    }
    const designRecord = await db.prepare("SELECT id, price, artist_id FROM designs WHERE token_id = ?").bind(tokenId).first();
    await db.prepare("UPDATE designs SET status = 'sold' WHERE token_id = ?").bind(tokenId).run();
    const confirmedAt = Math.floor(Date.now() / 1e3);
    await db.prepare(
      "INSERT INTO mint_confirmations(tx_hash, token_id, buyer, confirmed_at) VALUES (?, ?, ?, ?)"
    ).bind(txHash, tokenId, decodedBuyer, confirmedAt).run();
    if (designRecord?.price && designRecord.artist_id) {
      const price = designRecord.price;
      const platformFee = price * 0.03;
      const artistAmount = price - platformFee;
      const earningsId = randomUUID();
      await db.prepare(
        `INSERT INTO earnings(id, artist_id, design_id, type, amount, platform_fee, tx_hash, payment_method, created_at)
           VALUES (?, ?, ?, 'primary_sale', ?, ?, ?, 'on_chain', ?)`
      ).bind(earningsId, designRecord.artist_id, designRecord.id, artistAmount, platformFee, txHash, confirmedAt).run();
    }
    console.log(
      JSON.stringify({
        request_id: requestId,
        route: "/api/confirm",
        status: 200,
        duration_ms: Date.now() - start,
        chain_call_ms: chainMs
      })
    );
    return new Response(JSON.stringify({ status: "confirmed" }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (err) {
    console.log(
      JSON.stringify({
        request_id: requestId,
        route: "/api/confirm",
        status: 500,
        duration_ms: Date.now() - start,
        chain_call_ms: chainMs,
        error: String(err)
      })
    );
    return new Response(JSON.stringify({ error: "internal_server_error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
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
