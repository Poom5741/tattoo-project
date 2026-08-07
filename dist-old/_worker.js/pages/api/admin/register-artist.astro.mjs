globalThis.process ??= {};
globalThis.process.env ??= {};
import { i as isAdminAuthed } from "../../../chunks/auth_DbftzjD7.mjs";
import { a } from "../../../chunks/_@astro-renderers_B6-rS8YJ.mjs";
const prerender = false;
const GET = async () => {
  return new Response(null, { status: 302, headers: { Location: "/admin" } });
};
const POST = async ({ request, locals }) => {
  const env = locals.runtime.env;
  const authed = await isAdminAuthed(
    request.headers.get("cookie") ?? "",
    env.SESSION
  );
  if (!authed) {
    return new Response(null, { status: 401 });
  }
  let form;
  try {
    form = await request.formData();
  } catch {
    return new Response("Invalid form data", { status: 400 });
  }
  const str = (k) => {
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
    return new Response("Name is required", { status: 400 });
  }
  const id = name.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").slice(0, 30);
  if (!id) {
    return new Response("Invalid name", { status: 400 });
  }
  if (walletAddress && !/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
    return new Response("Invalid wallet address", { status: 400 });
  }
  try {
    const existing = await env.DB.prepare("SELECT id FROM artists WHERE id = ?").bind(id).first();
    if (existing) {
      return new Response("Artist with this ID already exists", { status: 409 });
    }
    await env.DB.prepare(
      `INSERT INTO artists (id, name, handle, city, style, email, wallet_address)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    ).bind(id, name, handle, city, style, email, walletAddress?.toLowerCase() ?? null).run();
  } catch (err) {
    console.error("[register-artist] D1 error:", String(err));
    return new Response("Internal server error", { status: 500 });
  }
  return new Response(null, {
    status: 302,
    headers: { Location: "/admin" }
  });
};
const _page = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  GET,
  POST,
  prerender
}, Symbol.toStringTag, { value: "Module" }));
const page = () => _page;
export {
  page,
  a as renderers
};
