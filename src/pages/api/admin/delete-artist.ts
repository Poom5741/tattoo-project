import type { APIRoute } from "astro";
import { z } from "zod";

const DeleteArtistSchema = z.object({
  artistId: z.string().min(1, "Artist ID is required"),
});

export const POST: APIRoute = async ({ request, locals }) => {
  const env = (locals as any).runtime?.env;

  if (!env?.DB) {
    return new Response(
      JSON.stringify({ ok: false, error: "Database not available" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  // Parse and validate request body
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return new Response(
      JSON.stringify({ ok: false, error: "Invalid JSON" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const result = DeleteArtistSchema.safeParse(body);
  if (!result.success) {
    return new Response(
      JSON.stringify({
        ok: false,
        error: result.error.issues[0]?.message || "Validation failed",
      }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const { artistId } = result.data;

  try {
    // Check if artist exists and is not already deleted
    const existing = await env.DB.prepare(
      "SELECT id, name, deleted_at FROM artists WHERE id = ?"
    )
      .bind(artistId)
      .first();

    if (!existing) {
      return new Response(
        JSON.stringify({ ok: false, error: "Artist not found" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    if (existing.deleted_at) {
      return new Response(
        JSON.stringify({ ok: false, error: "Artist is already deleted" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Soft delete: set deleted_at to current timestamp
    const now = Math.floor(Date.now() / 1000);
    await env.DB.prepare("UPDATE artists SET deleted_at = ? WHERE id = ?")
      .bind(now, artistId)
      .run();

    return new Response(
      JSON.stringify({
        ok: true,
        message: `Artist "${existing.name}" has been deleted`,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Delete artist error:", error);
    return new Response(
      JSON.stringify({ ok: false, error: "Failed to delete artist" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
