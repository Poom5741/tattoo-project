export const prerender = false;

import type { APIRoute } from "astro";
import { isAdminAuthed } from "../../../lib/admin/auth";

export const GET: APIRoute = async ({ request, locals }) => {
  const env = locals.runtime.env;

  const authed = await isAdminAuthed(
    request.headers.get("cookie") ?? "",
    env.SESSION
  );
  if (!authed) {
    return new Response(null, { status: 401 });
  }

  try {
    const { results } = await env.DB.prepare(
      `SELECT d.id, d.n, d.title, d.style, d.price, d.placement, d.medium,
              d.selling_mode, d.royalty_pct, d.image_url, d.created_at,
              a.name as artist_name, a.id as artist_id
       FROM designs d
       JOIN artists a ON d.artist_id = a.id
       WHERE d.status = 'pending'
       ORDER BY d.rowid ASC`
    ).all();

    return new Response(JSON.stringify(results), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: "Internal server error", detail: String(err) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
