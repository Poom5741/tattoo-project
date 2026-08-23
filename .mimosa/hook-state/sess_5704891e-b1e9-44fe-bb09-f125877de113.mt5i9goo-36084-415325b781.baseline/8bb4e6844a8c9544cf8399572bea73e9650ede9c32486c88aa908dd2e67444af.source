export const prerender = false;

import type { APIRoute } from "astro";

export const GET: APIRoute = async ({ locals }) => {
  const env = locals.runtime.env as Env;
  const checks: Record<string, string> = {};

  // KV check
  try {
    await env.SESSION.get("health-check");
    checks.kv = "ok";
  } catch {
    checks.kv = "error";
  }

  // D1 check
  try {
    await env.DB.prepare("SELECT 1").first();
    checks.db = "ok";
  } catch {
    checks.db = "error";
  }

  const allOk = Object.values(checks).every((s) => s === "ok");

  return new Response(
    JSON.stringify({
      status: allOk ? "healthy" : "degraded",
      timestamp: Date.now(),
      checks,
    }),
    {
      status: allOk ? 200 : 503,
      headers: { "Content-Type": "application/json" },
    },
  );
};
