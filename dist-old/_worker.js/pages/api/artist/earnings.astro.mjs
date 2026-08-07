globalThis.process ??= {};
globalThis.process.env ??= {};
import { g as getArtistSession } from "../../../chunks/auth_CBLJGIc-.mjs";
import { a } from "../../../chunks/_@astro-renderers_B6-rS8YJ.mjs";
const prerender = false;
const GET = async ({ request, locals }) => {
  const env = locals.runtime.env;
  const session = await getArtistSession(
    request.headers.get("cookie") ?? "",
    env.SESSION
  );
  if (!session) {
    return new Response(null, { status: 401 });
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
    ).bind(session.artistId).all();
    const totalPrimary = results.filter((e) => e.type === "primary_sale").reduce((sum, e) => sum + e.amount, 0);
    const totalRoyalties = results.filter((e) => e.type === "royalty").reduce((sum, e) => sum + e.amount, 0);
    return new Response(
      JSON.stringify({
        totalPrimary,
        totalRoyalties,
        totalEarnings: totalPrimary + totalRoyalties,
        recentTransactions: results
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" }
      }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: "Internal server error", detail: String(err) }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
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
