globalThis.process ??= {};
globalThis.process.env ??= {};
import { g as getChainClient } from "../../chunks/chain-client_BHoaUBbE.mjs";
import { a as parseAbiItem } from "../../chunks/verifyHash_CGN_bz2z.mjs";
import { a } from "../../chunks/_@astro-renderers_B6-rS8YJ.mjs";
const prerender = false;
let deploymentAddress = "";
try {
  const mod = await import("../../chunks/base-sepolia_DrEFlZE1.mjs");
  const data = mod.default ?? mod;
  if (data?.address) deploymentAddress = data.address;
} catch {
}
const GET = async ({ locals }) => {
  const env = locals.runtime.env;
  const db = env.DB;
  const now = Math.floor(Date.now() / 1e3);
  if (!deploymentAddress) {
    return new Response(JSON.stringify({ ok: true, reconciled: 0, note: "contract not deployed" }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  }
  const client = getChainClient(env);
  const { results: expired } = await db.prepare("SELECT id, token_id FROM designs WHERE status='reserved' AND reserved_until < ?").bind(now).all();
  let reconciled = 0;
  for (const row of expired) {
    if (row.token_id == null) {
      await db.prepare("UPDATE designs SET status='available', reserved_until=NULL WHERE id=?").bind(row.id).run();
      reconciled++;
      continue;
    }
    try {
      const owner = await client.readContract({
        address: deploymentAddress,
        abi: [parseAbiItem("function ownerOf(uint256 tokenId) view returns (address)")],
        functionName: "ownerOf",
        args: [BigInt(row.token_id)]
      });
      if (owner && owner !== "0x0000000000000000000000000000000000000000") {
        await db.prepare("UPDATE designs SET status='sold', reserved_until=NULL WHERE id=?").bind(row.id).run();
      } else {
        await db.prepare("UPDATE designs SET status='available', reserved_until=NULL WHERE id=?").bind(row.id).run();
      }
      reconciled++;
    } catch {
      await db.prepare("UPDATE designs SET status='available', reserved_until=NULL WHERE id=?").bind(row.id).run();
      reconciled++;
    }
  }
  return new Response(JSON.stringify({ ok: true, reconciled }), {
    status: 200,
    headers: { "Content-Type": "application/json" }
  });
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
