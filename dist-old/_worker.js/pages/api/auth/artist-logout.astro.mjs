globalThis.process ??= {};
globalThis.process.env ??= {};
import { a } from "../../../chunks/_@astro-renderers_B6-rS8YJ.mjs";
const prerender = false;
const POST = async ({ request, locals }) => {
  const env = locals.runtime.env;
  const cookie = request.headers.get("cookie") ?? "";
  const token = cookie.match(/artist_token=([^;]+)/)?.[1];
  if (token) {
    await env.SESSION.delete(`artist:${token}`).catch(() => {
    });
  }
  const isSecure = request.url.startsWith("https://");
  const secureFlag = isSecure ? "Secure; " : "";
  const headers = new Headers();
  headers.set("Location", "/artist/portal");
  headers.append("Set-Cookie", `artist_token=; Path=/; HttpOnly; ${secureFlag}SameSite=Lax; Max-Age=0`);
  headers.append("Set-Cookie", `artist_token=; Path=/artist; HttpOnly; ${secureFlag}SameSite=Lax; Max-Age=0`);
  return new Response(null, { status: 302, headers });
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
