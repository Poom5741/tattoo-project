globalThis.process ??= {};
globalThis.process.env ??= {};
import { i as isAdminAuthed } from "../../../chunks/auth_DbftzjD7.mjs";
import { a } from "../../../chunks/_@astro-renderers_B6-rS8YJ.mjs";
const prerender = false;
const POST = async ({ request, locals }) => {
  const env = locals.runtime.env;
  const authed = await isAdminAuthed(
    request.headers.get("cookie") ?? "",
    env.SESSION
  );
  if (!authed) {
    return new Response(JSON.stringify({ error: "Forbidden" }), {
      status: 403,
      headers: { "Content-Type": "application/json" }
    });
  }
  const form = await request.formData();
  const artistId = form.get("artistId")?.toString().trim();
  const walletAddress = form.get("walletAddress")?.toString().trim().toLowerCase();
  if (!artistId || !walletAddress) {
    return new Response(JSON.stringify({ error: "Missing fields" }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }
  if (!/^0x[0-9a-f]{40}$/.test(walletAddress)) {
    return new Response(JSON.stringify({ error: "Invalid wallet address" }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }
  await env.DB.prepare("UPDATE artists SET wallet_address = ? WHERE id = ?").bind(walletAddress, artistId).run();
  return new Response(null, {
    status: 302,
    headers: { Location: "/admin" }
  });
};
const _page = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  POST,
  prerender
}, Symbol.toStringTag, { value: "Module" }));
const page = () => _page;
export {
  page,
  a as renderers
};
