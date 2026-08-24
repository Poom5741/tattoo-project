export const prerender = false;

import type { APIRoute } from "astro";
import { isAdminAuthed } from "../../../lib/admin/auth";

export const POST: APIRoute = async ({ request, locals }) => {
  const env = locals.runtime.env;
  const authed = await isAdminAuthed(
    request.headers.get("cookie") ?? "",
    env.SESSION
  );
  if (!authed) {
    return new Response(JSON.stringify({ error: "Forbidden" }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  }

  const form = await request.formData();
  const artistId = form.get("artistId")?.toString().trim();
  const walletAddress = form.get("walletAddress")?.toString().trim().toLowerCase();

  if (!artistId || !walletAddress) {
    return new Response(JSON.stringify({ error: "Missing fields" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (!/^0x[0-9a-f]{40}$/.test(walletAddress)) {
    return new Response(JSON.stringify({ error: "Invalid wallet address" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  await env.DB.prepare("UPDATE artists SET wallet_address = ? WHERE id = ?")
    .bind(walletAddress, artistId)
    .run();

  return new Response(null, {
    status: 302,
    headers: { Location: "/admin" },
  });
};
