globalThis.process ??= {};
globalThis.process.env ??= {};
import { a } from "../../chunks/_@astro-renderers_B6-rS8YJ.mjs";
const prerender = false;
const GET = async ({ locals }) => {
  const env = locals.runtime.env;
  const checks = {};
  try {
    await env.SESSION.get("health-check");
    checks.kv = "ok";
  } catch {
    checks.kv = "error";
  }
  try {
    await env.DB.prepare("SELECT 1").first();
    checks.db = "ok";
  } catch {
    checks.db = "error";
  }
  const allOk = Object.values(checks).every((s) => s === "ok");
  return new Response(
    JSON.stringify({
      status: allOk ? "healthy" : "degraded",
      timestamp: Date.now(),
      checks
    }),
    {
      status: allOk ? 200 : 503,
      headers: { "Content-Type": "application/json" }
    }
  );
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
