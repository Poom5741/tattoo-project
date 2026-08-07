globalThis.process ??= {};
globalThis.process.env ??= {};
import { i as isAdminAuthed } from "../../../chunks/auth_DbftzjD7.mjs";
import { a } from "../../../chunks/_@astro-renderers_B6-rS8YJ.mjs";
const prerender = false;
const GET = async ({ request, locals }) => {
  const env = locals.runtime.env;
  const authed = await isAdminAuthed(
    request.headers.get("cookie") ?? "",
    env.SESSION
  );
  if (!authed) {
    return new Response(null, { status: 401 });
  }
  try {
    const { results } = await env.DB.prepare(
      `SELECT d.id, d.n, d.title, d.style, d.price, d.placement, d.medium,
              d.selling_mode, d.royalty_pct, d.image_url,
              a.name as artist_name, a.id as artist_id
       FROM designs d
       JOIN artists a ON d.artist_id = a.id
       WHERE d.status = 'pending'
       ORDER BY d.rowid ASC`
    ).all();
    return new Response(JSON.stringify(results), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: "Internal server error", detail: String(err) }), {
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
