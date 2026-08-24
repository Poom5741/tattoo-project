export const prerender = false;

import type { APIRoute } from "astro";
import { isAdminAuthed } from "../../../lib/admin/auth";

function jsonError(status: number, message: string): Response {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

/**
 * POST /api/admin/delete-artist
 *
 * Soft-deletes an artist by setting `deleted_at` to the current epoch seconds.
 * Body (JSON): { artistId: string }
 *
 * Returns 200 { success: true } on success.
 */
export const POST: APIRoute = async ({ request, locals }) => {
  const env = locals.runtime.env;
  const authed = await isAdminAuthed(
    request.headers.get("cookie") ?? "",
    env.SESSION,
  );
  if (!authed) {
    return jsonError(401, "Unauthorized");
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return jsonError(400, "Invalid request body");
  }

  const artistId = typeof body.artistId === "string" ? body.artistId.trim() : "";
  if (!artistId) {
    return jsonError(400, "artistId is required");
  }

  try {
    const db = env.DB;

    // Verify artist exists and is not already deleted
    const existing = await db
      .prepare("SELECT id, deleted_at FROM artists WHERE id = ?")
      .bind(artistId)
      .first<{ id: string; deleted_at: number | null }>();

    if (!existing) {
      return jsonError(404, "Artist not found");
    }
    if (existing.deleted_at !== null) {
      return jsonError(400, "Artist is already deleted");
    }

    const now = Math.floor(Date.now() / 1000);
    await db
      .prepare("UPDATE artists SET deleted_at = ? WHERE id = ?")
      .bind(now, artistId)
      .run();
  } catch (err) {
    console.error("[delete-artist] D1 error:", String(err));
    return jsonError(500, "Internal server error");
  }

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};
