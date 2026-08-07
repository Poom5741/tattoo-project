globalThis.process ??= {};
globalThis.process.env ??= {};
import { randomUUID } from "crypto";
import { a } from "../../../chunks/_@astro-renderers_B6-rS8YJ.mjs";
const prerender = false;
const GET = async ({ locals }) => {
  const env = locals.runtime.env;
  const nonce = randomUUID();
  const message = `inknoir-artist-login-${nonce}`;
  await env.SESSION.put(`challenge:${nonce}`, message, {
    expirationTtl: 300
  });
  return new Response(JSON.stringify({ message, nonce }), {
    status: 200,
    headers: { "Content-Type": "application/json" }
  });
};
const _page = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  GET,
  prerender
}, Symbol.toStringTag, { value: "Module" }));
const page = () => _page;
export {
  page,
  a as renderers
};
