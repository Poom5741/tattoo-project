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
 * POST /api/admin/edit-artist
 *
 * Updates an artist's editable fields.
 * Body (JSON): { artistId: string, name: string, handle?: string|null, city?: string|null, style?: string|null, email?: string|null }
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

  const artistId =
    typeof body.artistId === "string" ? body.artistId.trim() : "";
  if (!artistId) {
    return jsonError(400, "artistId is required");
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  if (!name) {
    return jsonError(400, "name is required");
  }

  // Nullable optional fields
  const nullable = (v: unknown): string | null => {
    if (typeof v !== "string") return null;
    const t = v.trim();
    return t.length > 0 ? t : null;
  };

  const handle = nullable(body.handle);
  const city = nullable(body.city);
  const style = nullable(body.style);
  const email = nullable(body.email);

  try {
    const db = env.DB;

    // Verify artist exists and is not deleted
    const existing = await db
      .prepare("SELECT id, deleted_at FROM artists WHERE id = ?")
      .bind(artistId)
      .first<{ id: string; deleted_at: number | null }>();

    if (!existing) {
      return jsonError(404, "Artist not found");
    }
    if (existing.deleted_at !== null) {
      return jsonError(400, "Artist is deleted");
    }

    await db
      .prepare(
        `UPDATE artists SET name = ?, handle = ?, city = ?, style = ?, email = ? WHERE id = ?`
      )
      .bind(name, handle, city, style, email, artistId)
      .run();
  } catch (err) {
    console.error("[edit-artist] D1 error:", String(err));
    return jsonError(500, "Internal server error");
  }

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};
