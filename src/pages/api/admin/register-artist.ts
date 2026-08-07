export const prerender = false;

import type { APIRoute } from "astro";
import { isAdminAuthed } from "../../../lib/admin/auth";

export const GET: APIRoute = async () => {
  return new Response(null, { status: 302, headers: { Location: "/admin" } });
};

function jsonError(status: number, message: string): Response {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export const POST: APIRoute = async ({ request, locals }) => {
  const env = locals.runtime.env;
  const authed = await isAdminAuthed(
    request.headers.get("cookie") ?? "",
    env.SESSION
  );
  if (!authed) {
    return new Response(null, { status: 401 });
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return jsonError(400, "Invalid form data");
  }

  const str = (k: string) => {
    const v = form.get(k);
    return typeof v === "string" ? v.trim() : "";
  };
  const name = str("name");
  const handle = str("handle") || null;
  const city = str("city") || null;
  const style = str("style") || null;
  const email = str("email") || null;
  const walletAddress = str("walletAddress") || null;

  if (!name) {
    return jsonError(400, "Name is required");
  }

  // Generate ID from name: lowercase, replace spaces with hyphens, strip non-alphanumeric
  const id = name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .slice(0, 30);

  if (!id) {
    return jsonError(400, "Invalid name");
  }

  // Validate wallet address format if provided
  if (walletAddress && !/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
    return jsonError(400, "Invalid wallet address");
  }

  try {
    // Check if artist ID already exists
    const existing = await env.DB.prepare("SELECT id FROM artists WHERE id = ?")
      .bind(id)
      .first();
    if (existing) {
      return jsonError(409, "Artist with this ID already exists");
    }

    await env.DB.prepare(
      `INSERT INTO artists (id, name, handle, city, style, email, wallet_address)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    )
      .bind(id, name, handle, city, style, email, walletAddress?.toLowerCase() ?? null)
      .run();
  } catch (err) {
    console.error("[register-artist] D1 error:", String(err));
    return jsonError(500, "Internal server error");
  }

  return new Response(null, {
    status: 302,
    headers: { Location: "/admin" },
  });
};
