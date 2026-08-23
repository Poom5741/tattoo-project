export const prerender = false;

import type { APIRoute } from "astro";

export const POST: APIRoute = async ({ request, locals }) => {
  const env = locals.runtime.env;
  const cookie = request.headers.get("cookie") ?? "";
  const token = cookie.match(/artist_token=([^;]+)/)?.[1];

  if (token) {
    await env.SESSION.delete(`artist:${token}`).catch(() => {});
  }

  const isSecure = request.url.startsWith("https://");
  const secureFlag = isSecure ? "Secure; " : "";

  const headers = new Headers();
  headers.set("Location", "/artist/portal");
  // Clear cookie at Path=/
  headers.append("Set-Cookie", `artist_token=; Path=/; HttpOnly; ${secureFlag}SameSite=Lax; Max-Age=0`);
  headers.append("Set-Cookie", `artist_token=; Path=/artist; HttpOnly; ${secureFlag}SameSite=Lax; Max-Age=0`);

  return new Response(null, { status: 302, headers });
};
