export const prerender = false;

import type { APIRoute } from "astro";
import { createAuth } from "../../../lib/auth/server";

/**
 * Catch-all route for Better Auth API endpoints.
 * Handles /api/auth/* routes: login, register, session, callback, etc.
 */
export const ALL: APIRoute = async ({ request, locals }) => {
  try {
    const env = locals.runtime.env as Env;
    const auth = createAuth(env);
    return auth.handler(request);
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    console.error("Better Auth handler error:", e);
    return new Response(JSON.stringify({ error: "Internal auth error", message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
