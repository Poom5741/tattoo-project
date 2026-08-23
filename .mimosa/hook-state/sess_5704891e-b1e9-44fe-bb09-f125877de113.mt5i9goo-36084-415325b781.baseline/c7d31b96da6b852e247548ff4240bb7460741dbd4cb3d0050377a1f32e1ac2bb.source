export const prerender = false;

import type { APIRoute } from "astro";
import { randomUUID } from "crypto";

/**
 * GET /api/auth/challenge
 *
 * Returns a challenge message and nonce for wallet signature authentication.
 * The nonce is stored in KV temporarily (5 min TTL) for replay protection.
 */
export const GET: APIRoute = async ({ locals }) => {
  const env = locals.runtime.env;
  const nonce = randomUUID();
  const message = `inknoir-artist-login-${nonce}`;

  // Store nonce in KV with 5-minute TTL
  await env.SESSION.put(`challenge:${nonce}`, message, {
    expirationTtl: 300,
  });

  return new Response(JSON.stringify({ message, nonce }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};
