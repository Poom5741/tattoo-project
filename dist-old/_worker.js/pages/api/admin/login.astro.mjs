globalThis.process ??= {};
globalThis.process.env ??= {};
import { randomUUID } from "crypto";
import { a } from "../../../chunks/_@astro-renderers_B6-rS8YJ.mjs";
const prerender = false;
const POST = async ({ request, locals }) => {
  const env = locals.runtime.env;
  let body;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid request body" }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }
  const { password } = body;
  const expected = env.ADMIN_PASSWORD ?? "saknid2026";
  if (!password || typeof password !== "string" || password.length === 0) {
    return new Response(JSON.stringify({ error: "Password is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }
  if (password !== expected) {
    return new Response(JSON.stringify({ error: "Invalid password" }), {
      status: 401,
      headers: { "Content-Type": "application/json" }
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
