export const prerender = false;

import type { APIRoute } from "astro";

export const GET: APIRoute = async ({ locals }) => {
  const env = locals.runtime.env;
  const db = env.DB;
  const BASE_RPC = env.BASE_RPC_PRIMARY ?? "";

  let d1Status: "ok" | "fail" = "fail";
  let chainStatus: "ok" | "fail" = "fail";
  let reservedCount = 0;
  let soldCount = 0;
  let availableCount = 0;
  let drift = 0;

  try {
    const [pingRow, countsRows] = await Promise.all([
      db.prepare("SELECT 1").first(),
      db.prepare("SELECT status, COUNT(*) AS c FROM designs GROUP BY status").all(),
    ]);
    if (pingRow) d1Status = "ok";
    for (const row of countsRows.results as Array<{ status: string; c: number }>) {
      if (row.status === "reserved") reservedCount = row.c;
      else if (row.status === "sold") soldCount = row.c;
      else if (row.status === "available") availableCount = row.c;
    }
    const now = Math.floor(Date.now() / 1000);
    const expiredRes = await db
      .prepare("SELECT COUNT(*) AS c FROM designs WHERE status='reserved' AND reserved_until < ?")
      .bind(now)
      .first<{ c: number }>();
    drift = expiredRes?.c ?? 0;
  } catch {
    d1Status = "fail";
  }

  try {
    const res = await fetch(BASE_RPC, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jsonrpc: "2.0", method: "eth_chainId", params: [], id: 1 }),
      signal: AbortSignal.timeout(5000),
    });
    if (res.ok) chainStatus = "ok";
  } catch {
    chainStatus = "fail";
  }

  const ok = d1Status === "ok" && chainStatus === "ok";

  return new Response(
    JSON.stringify({ ok, d1: d1Status, chain: chainStatus, reservedCount, soldCount, availableCount, drift }),
    { status: ok ? 200 : 503, headers: { "Content-Type": "application/json" } }
  );
};
