export const prerender = false;

import type { APIRoute } from "astro";
import { randomUUID } from "crypto";

export const POST: APIRoute = async ({ request, locals }) => {
  const env = locals.runtime.env;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { password } = body as { password?: string };
  const expected = env.ADMIN_PASSWORD ?? "inknoir2026";

  if (!password || password !== expected) {
    return new Response(JSON.stringify({ error: "Invalid password" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const token = randomUUID();
  await env.SESSION.put(`admin:${token}`, "1", { expirationTtl: 60 * 60 * 8 });

  const headers = new Headers();
  headers.set("Content-Type", "application/json");
  // Set new cookie at Path=/
  headers.append("Set-Cookie", `admin_token=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=28800`);
  // Expire stale cookie at old Path=/admin
  headers.append("Set-Cookie", "admin_token=; Path=/admin; HttpOnly; SameSite=Lax; Max-Age=0");

  return new Response(JSON.stringify({ ok: true }), { status: 200, headers });
};
