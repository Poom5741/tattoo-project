globalThis.process ??= {};
globalThis.process.env ??= {};
import { randomUUID } from "crypto";
import { g as getArtistSession } from "../../../../chunks/auth_CBLJGIc-.mjs";
import { a } from "../../../../chunks/_@astro-renderers_B6-rS8YJ.mjs";
const prerender = false;
const DELETE = async ({ request, params, locals }) => {
  const start = Date.now();
  const requestId = randomUUID();
  const env = locals.runtime.env;
  const session = await getArtistSession(
    request.headers.get("cookie") ?? "",
    env.SESSION
  );
  if (!session) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" }
    });
  }
  const designId = params.id;
  if (!designId) {
    return new Response(JSON.stringify({ error: "Missing design ID" }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }
  const db = env.DB;
  try {
    const design = await db.prepare("SELECT id, artist_id, status FROM designs WHERE id = ?").bind(designId).first();
    if (!design) {
      return new Response(JSON.stringify({ error: "Design not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" }
      });
    }
    if (design.artist_id !== session.artistId) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { "Content-Type": "application/json" }
      });
    }
    if (design.status !== "available") {
      return new Response(JSON.stringify({ error: "Only available designs can be delisted" }), {
        status: 422,
        headers: { "Content-Type": "application/json" }
      });
    }
    await db.prepare("UPDATE designs SET status = 'delisted' WHERE id = ?").bind(designId).run();
    console.log(
      JSON.stringify({
        request_id: requestId,
        route: `/api/designs/${designId}/delist`,
        status: 200,
        duration_ms: Date.now() - start
      })
    );
    return new Response(JSON.stringify({ id: designId, status: "delisted" }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (err) {
    console.log(
      JSON.stringify({
        request_id: requestId,
        route: `/api/designs/${designId}/delist`,
        status: 500,
        duration_ms: Date.now() - start,
        error: String(err)
      })
    );
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
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
