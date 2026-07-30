export const prerender = false;

import type { APIRoute } from "astro";

export const GET: APIRoute = async ({ locals }) => {
  const env = locals.runtime.env as Env;
  return new Response(
    JSON.stringify({
      betterAuthUrl: env.BETTER_AUTH_URL ?? null,
      googleClientId: env.GOOGLE_CLIENT_ID ? "set" : "notset",
      googleClientSecret: env.GOOGLE_CLIENT_SECRET ? "set" : "notset",
      betterAuthSecret: env.BETTER_AUTH_SECRET ? "set" : "notset",
    }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
};
