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
    return new Response(null, { status: 401 });
  }

  const form = await request.formData();
  const name = (form.get("name") as string)?.trim();
  const handle = (form.get("handle") as string)?.trim() || null;
  const city = (form.get("city") as string)?.trim() || null;
  const style = (form.get("style") as string)?.trim() || null;
  const email = (form.get("email") as string)?.trim() || null;
  const walletAddress = (form.get("walletAddress") as string)?.trim() || null;

  if (!name) {
    return new Response("Name is required", { status: 400 });
  }

  // Generate ID from name: lowercase, replace spaces with hyphens, strip non-alphanumeric
  const id = name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .slice(0, 30);

  if (!id) {
    return new Response("Invalid name", { status: 400 });
  }

  // Check if artist ID already exists
  const existing = await env.DB.prepare("SELECT id FROM artists WHERE id = ?")
    .bind(id)
    .first();
  if (existing) {
    return new Response("Artist with this ID already exists", { status: 409 });
  }

  // Validate wallet address format if provided
  if (walletAddress && !/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
    return new Response("Invalid wallet address", { status: 400 });
  }

  await env.DB.prepare(
    `INSERT INTO artists (id, name, handle, city, style, email, wallet_address)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  )
    .bind(id, name, handle, city, style, email, walletAddress?.toLowerCase() ?? null)
    .run();

  return new Response(null, {
    status: 302,
    headers: { Location: "/admin" },
  });
};
