globalThis.process ??= {};
globalThis.process.env ??= {};
import { g as getArtistSession } from "../../../../chunks/auth_CBLJGIc-.mjs";
import { i as isAdminAuthed } from "../../../../chunks/auth_DbftzjD7.mjs";
import { a } from "../../../../chunks/_@astro-renderers_B6-rS8YJ.mjs";
const prerender = false;
function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" }
  });
}
const GET = async ({ params, request, locals }) => {
  const env = locals.runtime.env;
  const cookieHeader = request.headers.get("cookie") ?? "";
  const { id } = params;
  if (!id) {
    return json({ error: "Missing conversation id" }, 400);
  }
  const user = locals.user;
  const artistSession = await getArtistSession(cookieHeader, env.SESSION);
  const admin = await isAdminAuthed(cookieHeader, env.SESSION);
  if (!user && !artistSession && !admin) {
    return json({ error: "Unauthorized" }, 401);
  }
  try {
    const row = await env.DB.prepare(
      `SELECT c.*, a.name AS artist_name, a.handle AS artist_handle
       FROM conversations c
       JOIN artists a ON a.id = c.artist_id
       WHERE c.id = ?`
    ).bind(id).first();
    if (!row) {
      return json({ error: "Not found" }, 404);
    }
    const isParticipant = admin || user && row.client_id === user.id || artistSession && row.artist_id === artistSession.artistId;
    if (!isParticipant) {
      return json({ error: "Forbidden" }, 403);
    }
    return json({ conversation: row });
  } catch (err) {
    console.error("GET /api/chat/conversations/[id] failed:", err);
    return json({ error: "Internal server error" }, 500);
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
