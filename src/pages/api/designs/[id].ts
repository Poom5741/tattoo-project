export const prerender = false;

import type { APIRoute } from "astro";
import { randomUUID } from "crypto";

export const GET: APIRoute = async ({ params, locals }) => {
  const start = Date.now();
  const requestId = randomUUID();
  const { id } = params;
  const db = locals.runtime.env.DB;

  let d1Ms = 0;

  try {
    const d1Start = Date.now();
    const row = await db
      .prepare(
        `SELECT d.*, a.name AS artist_name, a.handle, a.city, a.style AS artist_style,
                a.years, a.booked, a.rate, a.bio, a.pieces, a.rating
         FROM designs d
         JOIN artists a ON a.id = d.artist_id
         WHERE d.id = ?`
      )
      .bind(id)
      .first();
    d1Ms = Date.now() - d1Start;

    if (!row) {
      console.log(
        JSON.stringify({ request_id: requestId, route: `/api/designs/${id}`, status: 404, duration_ms: Date.now() - start, d1_query_ms: d1Ms })
      );
      return new Response(JSON.stringify({ error: "Not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    console.log(
      JSON.stringify({ request_id: requestId, route: `/api/designs/${id}`, status: 200, duration_ms: Date.now() - start, d1_query_ms: d1Ms })
    );
    return new Response(JSON.stringify(row), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    d1Ms = Date.now() - d1Ms;
    console.log(
      JSON.stringify({ request_id: requestId, route: `/api/designs/${id}`, status: 500, duration_ms: Date.now() - start, d1_query_ms: d1Ms, error: String(err) })
    );
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
