export const prerender = false;

import type { APIRoute } from "astro";
import { randomUUID } from "crypto";
import { getArtistSession } from "../../../lib/artist/auth";
import { CreateDesignSchema } from "../../../lib/api/schemas";

export const POST: APIRoute = async ({ request, locals }) => {
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

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const parsed = CreateDesignSchema.safeParse(body);
  if (!parsed.success) {
    return new Response(JSON.stringify({ error: "Validation failed", issues: parsed.error.issues }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { title, style, price_usdt, placement, medium, selling_mode, royalty_pct, image_key } = parsed.data;

  const db = env.DB;

  try {
    // Generate next 'n' value
    const maxN = await db
      .prepare("SELECT MAX(CAST(n AS INTEGER)) as max_n FROM designs")
      .first<{ max_n: number | null }>();
    const nextN = ((maxN?.max_n ?? 0) + 1).toString();

    const designId = randomUUID();
    const r2PublicUrl = (env.R2_PUBLIC_URL as string | undefined) ?? "";
    const image_url = `${r2PublicUrl}/${image_key}`;

    await db
      .prepare(
        `INSERT INTO designs
         (id, n, title, artist_id, style, price, placement, medium, status, selling_mode, royalty_pct, image_url)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?, ?)`
      )
      .bind(
        designId,
        nextN,
        title,
        session.artistId,
        style,
        price_usdt,
        placement,
        medium,
        selling_mode,
        royalty_pct ?? null,
        image_url
      )
      .run();

    console.log(
      JSON.stringify({
        request_id: requestId,
        route: "/api/designs/create",
        status: 200,
        duration_ms: Date.now() - start,
        design_id: designId,
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
        route: "/api/designs/create",
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
