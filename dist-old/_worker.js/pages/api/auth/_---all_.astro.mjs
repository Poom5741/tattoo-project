globalThis.process ??= {};
globalThis.process.env ??= {};
import { b as createAuth } from "../../../chunks/index_dnGMJJD3.mjs";
import { a } from "../../../chunks/_@astro-renderers_B6-rS8YJ.mjs";
const prerender = false;
const ALL = async ({ request, locals, url }) => {
  try {
    const env = locals.runtime.env;
    const auth = createAuth(env, url.origin);
    if (url.pathname === "/api/auth/session") {
      const session = await auth.api.getSession({ headers: request.headers });
      return new Response(JSON.stringify(session ?? { session: null, user: null }), {
        headers: { "Content-Type": "application/json" }
      });
    }
    return auth.handler(request);
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    console.error("Better Auth handler error:", e);
    return new Response(JSON.stringify({ error: "Internal auth error", message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};
const _page = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  ALL,
  prerender
}, Symbol.toStringTag, { value: "Module" }));
const page = () => _page;
export {
  page,
  a as renderers
};
