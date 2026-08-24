export const prerender = false;

import type { APIRoute } from "astro";

// Resale is disabled at the soft launch. See wayfinder ticket 03.
export const POST: APIRoute = async () => {
  return new Response(
    JSON.stringify({ error: "Resale is not yet available" }),
    { status: 503, headers: { "Content-Type": "application/json" } }
  );
};
