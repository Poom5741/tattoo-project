export const prerender = false;

import type { APIRoute } from "astro";
import { getArtistSession } from "../../../lib/artist/auth";

interface EarningRow {
  id: string;
  artist_id: string;
  design_id: string | null;
  type: string;
  amount: number;
  platform_fee: number;
  tx_hash: string | null;
  payment_method: string;
  created_at: number;
  design_title: string | null;
}

export const GET: APIRoute = async ({ request, locals }) => {
  const env = locals.runtime.env;

  const session = await getArtistSession(
    request.headers.get("cookie") ?? "",
    env.SESSION
  );

  if (!session) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const { results } = await env.DB.prepare(
      `SELECT e.id, e.artist_id, e.design_id, e.type, e.amount, e.platform_fee,
              e.tx_hash, e.payment_method, e.created_at,
              d.title as design_title
       FROM earnings e
       LEFT JOIN designs d ON e.design_id = d.id
       WHERE e.artist_id = ?
       ORDER BY e.created_at DESC
       LIMIT 100`
    )
      .bind(session.artistId)
      .all<EarningRow>();

    const totalPrimary = results
      .filter((e) => e.type === "primary_sale")
      .reduce((sum, e) => sum + e.amount, 0);

    const totalRoyalties = results
      .filter((e) => e.type === "royalty")
      .reduce((sum, e) => sum + e.amount, 0);

    return new Response(
      JSON.stringify({
        totalPrimary,
        totalRoyalties,
        totalEarnings: totalPrimary + totalRoyalties,
        recentTransactions: results,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: "Internal server error", detail: String(err) }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
