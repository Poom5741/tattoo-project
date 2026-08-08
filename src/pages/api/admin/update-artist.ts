import type { APIRoute } from "astro";
import { isAdminAuthed } from "../../../lib/admin/auth";
import { UpdateArtistSchema } from "../../../lib/api/schemas";

export const POST: APIRoute = async ({ request, locals }) => {
  const env = (locals as any).runtime?.env;

  if (!env?.DB) {
    return new Response(
      JSON.stringify({ ok: false, error: "Database not available" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  // Check authentication
  const authed = await isAdminAuthed(
    request.headers.get("cookie") ?? "",
    env.SESSION
  );
  if (!authed) {
    return new Response(
      JSON.stringify({ ok: false, error: "Unauthorized" }),
      { status: 401, headers: { "Content-Type": "application/json" } }
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

  const result = UpdateArtistSchema.safeParse(body);
  if (!result.success) {
    return new Response(
      JSON.stringify({
        ok: false,
        error: result.error.issues[0]?.message || "Validation failed",
      }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const { artistId, ...updates } = result.data;

  // Check if artist exists
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
      JSON.stringify({ ok: false, error: "Cannot edit deleted artist" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  // Build dynamic UPDATE query
  const fields: string[] = [];
  const values: unknown[] = [];

  // Map camelCase to snake_case for wallet_address
  if (updates.name !== undefined) {
    fields.push("name = ?");
    values.push(updates.name);
  }
  if (updates.handle !== undefined) {
    fields.push("handle = ?");
    values.push(updates.handle);
  }
  if (updates.city !== undefined) {
    fields.push("city = ?");
    values.push(updates.city);
  }
  if (updates.style !== undefined) {
    fields.push("style = ?");
    values.push(updates.style);
  }
  if (updates.years !== undefined) {
    fields.push("years = ?");
    values.push(updates.years);
  }
  if (updates.booked !== undefined) {
    fields.push("booked = ?");
    values.push(updates.booked);
  }
  if (updates.rate !== undefined) {
    fields.push("rate = ?");
    values.push(updates.rate);
  }
  if (updates.bio !== undefined) {
    fields.push("bio = ?");
    values.push(updates.bio);
  }
  if (updates.email !== undefined) {
    fields.push("email = ?");
    values.push(updates.email);
  }
  if (updates.walletAddress !== undefined) {
    fields.push("wallet_address = ?");
    values.push(updates.walletAddress?.toLowerCase() ?? null);
  }

  if (fields.length === 0) {
    return new Response(
      JSON.stringify({ ok: false, error: "No fields to update" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    const query = `UPDATE artists SET ${fields.join(", ")} WHERE id = ?`;
    values.push(artistId);

    await env.DB.prepare(query)
      .bind(...values)
      .run();

    return new Response(
      JSON.stringify({
        ok: true,
        message: `Artist "${existing.name}" updated successfully`,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Update artist error:", error);
    return new Response(
      JSON.stringify({ ok: false, error: "Failed to update artist" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
