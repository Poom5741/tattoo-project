export const prerender = false;

import type { APIRoute } from "astro";
import { getArtistSession } from "@/lib/artist/auth";
import { isAdminAuthed } from "@/lib/admin/auth";

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export const GET: APIRoute = async ({ params, request, locals }) => {
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
    )
      .bind(id)
      .first<Record<string, unknown>>();

    if (!row) {
      return json({ error: "Not found" }, 404);
    }

    const isParticipant =
      admin ||
      (user && row.client_id === user.id) ||
      (artistSession && row.artist_id === artistSession.artistId);

    if (!isParticipant) {
      return json({ error: "Forbidden" }, 403);
    }

    return json({ conversation: row });
  } catch (err) {
    console.error("GET /api/chat/conversations/[id] failed:", err);
    return json({ error: "Internal server error" }, 500);
  }
};
