export const prerender = false;

import type { APIRoute } from "astro";
import { randomUUID } from "crypto";

export const POST: APIRoute = async ({ request, locals }) => {
  const env = locals.runtime.env;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid request body" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
  const { password } = body as { password?: string };
  const expected = env.ADMIN_PASSWORD ?? "saknid2026";
  if (!password || typeof password !== "string" || password.length === 0) {
    return new Response(JSON.stringify({ error: "Password is required" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }
  if (password !== expected) {
    return new Response(JSON.stringify({ error: "Invalid password" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }
  const token = randomUUID();
  await env.SESSION.put(`admin:${token}`, "1", { expirationTtl: 60 * 60 * 8 });
  const isSecure = request.url.startsWith("https://");
  const secureFlag = isSecure ? "Secure; " : "";
  const headers = new Headers();
  headers.set("Content-Type", "application/json");
  headers.append("Set-Cookie", `admin_token=${token}; Path=/; HttpOnly; ${secureFlag}SameSite=Lax; Max-Age=28800`);
  headers.append("Set-Cookie", `admin_token=; Path=/admin; HttpOnly; ${secureFlag}SameSite=Lax; Max-Age=0`);
  return new Response(JSON.stringify({ ok: true }), { status: 200, headers });
};
