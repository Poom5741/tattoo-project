globalThis.process ??= {};
globalThis.process.env ??= {};
/* empty css                                    */
import { c as createComponent, r as renderComponent, a as renderTemplate, f as createAstro } from "../../chunks/astro/server_B1Q-Dpks.mjs";
import { $ as $$Base } from "../../chunks/jsx-runtime_6SzGatPE.mjs";
import { N as Nav, $ as $$Footer } from "../../chunks/Footer_D7ikpgG4.mjs";
import { a } from "../../chunks/_@astro-renderers_B6-rS8YJ.mjs";
const $$Astro = createAstro();
const prerender = false;
const $$id = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$id;
  const { id } = Astro2.params;
  let design = null;
  try {
    const db = Astro2.locals.runtime.env.DB;
    design = await db.prepare("SELECT id, n, title, artist_id, style, price, price_usd, status, placement, seed, selling_mode, royalty_pct, image_url, token_id FROM designs WHERE id = ?").bind(id).first();
    if (design && design.status === "reserved") {
      await db.prepare("UPDATE designs SET status = 'available', reserved_until = NULL WHERE id = ?").bind(id).run().catch(() => {
      });
      design.status = "available";
    }
  } catch (e) {
    console.error("checkout SSR D1 error:", e);
  }
  if (!design) {
    return Astro2.redirect("/market");
  }
  if (design.status !== "available") {
    return Astro2.redirect(`/design/${id}`);
  }
  return renderTemplate`${renderComponent($$result, "Base", $$Base, { "title": `Acquire "${design.title}" — SAKNID`, "description": `Acquire ${design.title}. One-of-one tattoo plate on Base Sepolia.` }, { "default": async ($$result2) => renderTemplate` ${renderComponent($$result2, "Nav", Nav, { "client:load": true, "currentPath": "/checkout", "client:component-hydration": "load", "client:component-path": "/home/vscode/codingZone/tattoo-project/src/components/Nav", "client:component-export": "default" })} ${renderComponent($$result2, "CheckoutFlow", null, { "client:only": "react", "design": design, "client:component-hydration": "only", "client:component-path": "/home/vscode/codingZone/tattoo-project/src/components/CheckoutFlow", "client:component-export": "default" })} ${renderComponent($$result2, "Footer", $$Footer, {})} ` })}`;
}, "/home/vscode/codingZone/tattoo-project/src/pages/checkout/[id].astro", void 0);
const $$file = "/home/vscode/codingZone/tattoo-project/src/pages/checkout/[id].astro";
const $$url = "/checkout/[id]";
const _page = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: $$id,
  file: $$file,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: "Module" }));
const page = () => _page;
export {
  page,
  a as renderers
};
