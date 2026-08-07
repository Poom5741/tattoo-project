export const prerender = false;

import type { APIRoute } from "astro";

// Resale is disabled at the soft launch. On-chain resale depends on
// transactions that aren't testable yet; the listing UI is a placeholder.
// See wayfinder ticket 03 for the full rationale.
export const POST: APIRoute = async () => {
  return new Response(
    JSON.stringify({ error: "Resale is not yet available" }),
    { status: 503, headers: { "Content-Type": "application/json" } }
  );
};
