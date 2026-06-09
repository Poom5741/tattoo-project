export const prerender = false;

import type { APIRoute } from "astro";

export const POST: APIRoute = async ({ request, locals }) => {
  const env = locals.runtime.env;
  const cookie = request.headers.get("cookie") ?? "";
  const token = cookie.match(/admin_token=([^;]+)/)?.[1];

  if (token) {
    await env.SESSION.delete(`admin:${token}`).catch(() => {});
  }

  return new Response(null, {
    status: 302,
    headers: {
      Location: "/admin",
      "Set-Cookie": "admin_token=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0",
    },
  });
};
