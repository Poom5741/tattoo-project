export const prerender = false;

import type { APIRoute } from "astro";
import { createAuth } from "@/lib/auth/server";

/**
 * Catch-all route for Better Auth API endpoints.
 * Handles /api/auth/* routes: login, register, session, callback, etc.
 */
export const ALL: APIRoute = async ({ request, locals, url }) => {
  try {
    const env = locals.runtime.env as Env;
    const auth = createAuth(env, url.origin);

    if (url.pathname === "/api/auth/session") {
      const session = await auth.api.getSession({ headers: request.headers });
      return new Response(JSON.stringify(session ?? { session: null, user: null }), {
        headers: { "Content-Type": "application/json" },
      });
    }

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
