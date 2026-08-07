globalThis.process ??= {};
globalThis.process.env ??= {};
import { g as getArtistSession } from "../../../chunks/auth_CBLJGIc-.mjs";
import { i as isAdminAuthed } from "../../../chunks/auth_DbftzjD7.mjs";
import { a } from "../../../chunks/_@astro-renderers_B6-rS8YJ.mjs";
const prerender = false;
function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" }
  });
}
const GET = async ({ request, locals }) => {
  const env = locals.runtime.env;
  const cookieHeader = request.headers.get("cookie") ?? "";
  const user = locals.user;
  const artistSession = await getArtistSession(cookieHeader, env.SESSION);
  const admin = await isAdminAuthed(cookieHeader, env.SESSION);
  if (!user && !artistSession && !admin) {
    return json({ error: "Unauthorized" }, 401);
  }
  let sql = "SELECT * FROM conversations";
  const params = [];
  if (admin) {
    const url = new URL(request.url);
    const artistId = url.searchParams.get("artistId");
    if (artistId) {
      sql += " WHERE artist_id = ?";
      params.push(artistId);
    }
  } else if (artistSession) {
    sql += " WHERE artist_id = ?";
    params.push(artistSession.artistId);
  } else if (user) {
    sql += " WHERE client_id = ?";
    params.push(user.id);
  }
  sql += " ORDER BY last_message_at DESC";
  try {
    const { results } = await env.DB.prepare(sql).bind(...params).all();
    const conversations = (results || []).map((row) => ({
      id: row.id,
      clientId: row.client_id,
      artistId: row.artist_id,
      designId: row.design_id ?? null,
      lastMessage: row.last_message ?? null,
      lastMessageAt: row.last_message_at ?? null,
      unread: row.unread ?? 0,
      status: row.status ?? "active",
      createdAt: row.created_at,
      clientName: row.client_name ?? row.client_id ?? "Client",
      artistName: row.artist_name ?? row.artist_id ?? "Artist"
    }));
    return json({ conversations });
  } catch (err) {
    console.error("GET /api/chat/conversations failed:", err);
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
