export const prerender = false;

import type { APIRoute } from "astro";
import { randomUUID } from "crypto";

export const GET: APIRoute = async ({ locals }) => {
  const start = Date.now();
  const requestId = randomUUID();
  const db = locals.runtime.env.DB;

  let d1Start = Date.now();
  let d1Ms = 0;

  try {
    d1Start = Date.now();
    const { results } = await db.prepare("SELECT * FROM designs ORDER BY token_id ASC").all();
    d1Ms = Date.now() - d1Start;

    const status = 200;
    console.log(
      JSON.stringify({ request_id: requestId, route: "/api/designs", status, duration_ms: Date.now() - start, d1_query_ms: d1Ms })
    );

    return new Response(JSON.stringify(results), {
      status,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    d1Ms = Date.now() - d1Start;
    const status = 500;
    console.log(
      JSON.stringify({ request_id: requestId, route: "/api/designs", status, duration_ms: Date.now() - start, d1_query_ms: d1Ms, error: String(err) })
    );
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status,
      headers: { "Content-Type": "application/json" },
    });
  }
};
