export const prerender = false;

import type { APIRoute } from "astro";
import { randomUUID } from "crypto";
import { getArtistSession } from "../../../../lib/artist/auth";
import { z } from "zod";

const EditDesignSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  style: z.string().min(1).max(100).optional(),
  price_usdt: z.number().positive().optional(),
  placement: z.string().min(1).max(200).optional(),
  medium: z.string().min(1).max(200).optional(),
  royalty_pct: z.number().min(5).max(15).optional(),
  image_key: z.string().min(1).optional(),
  // selling_mode is intentionally excluded — it cannot be changed after creation
});

export const PUT: APIRoute = async ({ request, params, locals }) => {
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
      headers: { "Content-Type": "application/json" },
    });
  }

  const designId = params.id;
  if (!designId) {
    return new Response(JSON.stringify({ error: "Missing design ID" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const parsed = EditDesignSchema.safeParse(body);
  if (!parsed.success) {
    return new Response(JSON.stringify({ error: "Validation failed", issues: parsed.error.issues }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const db = env.DB;

  try {
    // Verify the design belongs to this artist and is rejected
    const design = await db
      .prepare("SELECT id, artist_id, status FROM designs WHERE id = ?")
      .bind(designId)
      .first<{ id: string; artist_id: string; status: string }>();

    if (!design) {
      return new Response(JSON.stringify({ error: "Design not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (design.artist_id !== session.artistId) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (design.status !== "rejected") {
      return new Response(JSON.stringify({ error: "Only rejected designs can be edited" }), {
        status: 422,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Build update fields
    const updates: string[] = ["status = 'pending'"];
    const binds: unknown[] = [];
    const { title, style, price_usdt, placement, medium, royalty_pct, image_key } = parsed.data;

    if (title !== undefined) { updates.push("title = ?"); binds.push(title); }
    if (style !== undefined) { updates.push("style = ?"); binds.push(style); }
    if (price_usdt !== undefined) { updates.push("price = ?"); binds.push(price_usdt); }
    if (placement !== undefined) { updates.push("placement = ?"); binds.push(placement); }
    if (medium !== undefined) { updates.push("medium = ?"); binds.push(medium); }
    if (royalty_pct !== undefined) { updates.push("royalty_pct = ?"); binds.push(royalty_pct); }
    if (image_key !== undefined) {
      const r2PublicUrl = (env.R2_PUBLIC_URL as string | undefined) ?? "";
      updates.push("image_url = ?");
      binds.push(`${r2PublicUrl}/${image_key}`);
    }

    binds.push(designId);

    await db
      .prepare(`UPDATE designs SET ${updates.join(", ")} WHERE id = ?`)
      .bind(...binds)
      .run();

    console.log(
      JSON.stringify({
        request_id: requestId,
        route: `/api/designs/${designId}/edit`,
        status: 200,
        duration_ms: Date.now() - start,
      })
    );

    return new Response(JSON.stringify({ id: designId, status: "pending" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.log(
      JSON.stringify({
        request_id: requestId,
        route: `/api/designs/${designId}/edit`,
        status: 500,
        duration_ms: Date.now() - start,
        error: String(err),
      })
    );
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
