export const prerender = false;

import type { APIRoute } from "astro";
import { parseAbiItem } from "viem";
import { getChainClient } from "../../lib/config/chain-client";

let deploymentAddress = "";
try {
  const mod = await import("../../../contracts/deployments/base-sepolia.json");
  const data = (mod.default ?? mod) as { address?: string };
  if (data?.address) deploymentAddress = data.address;
} catch {
  // Pre-deploy
}

// Called by Cloudflare Cron (*/5 * * * *) and optionally via GET
export const GET: APIRoute = async ({ locals }) => {
  const env = locals.runtime.env;
  const db = env.DB;
  const now = Math.floor(Date.now() / 1000);

  if (!deploymentAddress) {
    return new Response(JSON.stringify({ ok: true, reconciled: 0, note: "contract not deployed" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  const client = getChainClient(env);

  // Find reserved rows past TTL
  const { results: expired } = await db
    .prepare("SELECT id, token_id FROM designs WHERE status='reserved' AND reserved_until < ?")
    .bind(now)
    .all<{ id: string; token_id: number }>();

  let reconciled = 0;

  for (const row of expired) {
    if (row.token_id == null) {
      await db.prepare("UPDATE designs SET status='available', reserved_until=NULL WHERE id=?").bind(row.id).run();
      reconciled++;
      continue;
    }

    try {
      const owner = await client.readContract({
        address: deploymentAddress as `0x${string}`,
        abi: [parseAbiItem("function ownerOf(uint256 tokenId) view returns (address)")],
        functionName: "ownerOf",
        args: [BigInt(row.token_id)],
      });

      if (owner && owner !== "0x0000000000000000000000000000000000000000") {
        await db
          .prepare("UPDATE designs SET status='sold', reserved_until=NULL WHERE id=?")
          .bind(row.id)
          .run();
      } else {
        await db
          .prepare("UPDATE designs SET status='available', reserved_until=NULL WHERE id=?")
          .bind(row.id)
          .run();
      }
      reconciled++;
    } catch {
      // ownerOf reverts for unminted tokens — mark available
      await db
        .prepare("UPDATE designs SET status='available', reserved_until=NULL WHERE id=?")
        .bind(row.id)
        .run();
      reconciled++;
    }
  }

  return new Response(JSON.stringify({ ok: true, reconciled }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};
