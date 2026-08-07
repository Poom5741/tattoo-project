globalThis.process ??= {};
globalThis.process.env ??= {};
import { randomUUID } from "crypto";
import { g as getChainClient } from "../../../chunks/chain-client_BHoaUBbE.mjs";
import { a as parseAbiItem } from "../../../chunks/verifyHash_CGN_bz2z.mjs";
import { a } from "../../../chunks/_@astro-renderers_B6-rS8YJ.mjs";
const prerender = false;
let deploymentInfo = null;
try {
  const mod = await import("../../../chunks/base-sepolia_DrEFlZE1.mjs");
  const data = mod.default ?? mod;
  if (data && data.address) deploymentInfo = data;
} catch {
}
const GET = async ({ params, locals }) => {
  const start = Date.now();
  const requestId = randomUUID();
  const { addr } = params;
  const env = locals.runtime.env;
  if (!/^0x[0-9a-fA-F]{40}$/.test(addr ?? "")) {
    return new Response(JSON.stringify({ error: "Invalid address" }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }
  if (!deploymentInfo) {
    return new Response(JSON.stringify([]), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, s-maxage=30"
      }
    });
  }
  const client = getChainClient(env);
  let chainMs = 0;
  let d1Ms = 0;
  try {
    const chainStart = Date.now();
    const transferEvent = parseAbiItem(
      "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)"
    );
    const logs = await client.getLogs({
      address: deploymentInfo.address,
      event: transferEvent,
      args: { to: addr },
      fromBlock: BigInt(deploymentInfo.deployBlock ?? 0)
    });
    const candidateTokenIds = [
      ...new Set(logs.map((l) => l.args.tokenId))
    ];
    const ownerCalls = await Promise.allSettled(
      candidateTokenIds.map(
        (tokenId) => client.readContract({
          address: deploymentInfo.address,
          abi: [parseAbiItem("function ownerOf(uint256 tokenId) view returns (address)")],
          functionName: "ownerOf",
          args: [tokenId]
        })
      )
    );
    const ownedTokenIds = candidateTokenIds.filter((_, i) => {
      const result = ownerCalls[i];
      return result.status === "fulfilled" && result.value.toLowerCase() === addr.toLowerCase();
    }).map(Number);
    chainMs = Date.now() - chainStart;
    if (ownedTokenIds.length === 0) {
      console.log(
        JSON.stringify({ request_id: requestId, route: `/api/wallet/${addr}`, status: 200, duration_ms: Date.now() - start, chain_call_ms: chainMs, d1_query_ms: 0 })
      );
      return new Response(JSON.stringify([]), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "public, s-maxage=30"
        }
      });
    }
    const db = env.DB;
    const d1Start = Date.now();
    const placeholders = ownedTokenIds.map(() => "?").join(",");
    const { results } = await db.prepare(`SELECT token_id, id, title FROM designs WHERE token_id IN (${placeholders})`).bind(...ownedTokenIds).all();
    d1Ms = Date.now() - d1Start;
    const designMap = new Map(results.map((r) => [r.token_id, r]));
    const owned = ownedTokenIds.map((tokenId) => {
      const d = designMap.get(tokenId);
      return { tokenId, designId: d?.id ?? null, title: d?.title ?? null, image: null };
    });
    console.log(
      JSON.stringify({ request_id: requestId, route: `/api/wallet/${addr}`, status: 200, duration_ms: Date.now() - start, chain_call_ms: chainMs, d1_query_ms: d1Ms })
    );
    return new Response(JSON.stringify(owned), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, s-maxage=30"
      }
    });
  } catch (err) {
    console.log(
      JSON.stringify({ request_id: requestId, route: `/api/wallet/${addr}`, status: 500, duration_ms: Date.now() - start, chain_call_ms: chainMs, d1_query_ms: d1Ms, error: String(err) })
    );
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};
const _page = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  GET,
  prerender
}, Symbol.toStringTag, { value: "Module" }));
const page = () => _page;
export {
  page,
  a as renderers
};
