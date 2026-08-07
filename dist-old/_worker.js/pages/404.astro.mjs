globalThis.process ??= {};
globalThis.process.env ??= {};
/* empty css                                 */
import { c as createComponent, r as renderComponent, a as renderTemplate, m as maybeRenderHead } from "../chunks/astro/server_B1Q-Dpks.mjs";
import { $ as $$Base } from "../chunks/jsx-runtime_6SzGatPE.mjs";
import { N as Nav, $ as $$Footer } from "../chunks/Footer_D7ikpgG4.mjs";
import { a } from "../chunks/_@astro-renderers_B6-rS8YJ.mjs";
const prerender = false;
const $$404 = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "Base", $$Base, { "title": "Page Not Found — SAKNID" }, { "default": ($$result2) => renderTemplate` ${renderComponent($$result2, "Nav", Nav, { "client:load": true, "client:component-hydration": "load", "client:component-path": "/home/vscode/codingZone/tattoo-project/src/components/Nav", "client:component-export": "default" })} ${maybeRenderHead()}<main class="min-h-[60vh] flex items-center justify-center px-5 py-20"> <div class="text-center max-w-[420px]"> <div class="w-[52px] h-[52px] rounded-full bg-surface-container-dim text-on-surface flex items-center justify-center font-body font-bold text-lg mx-auto mb-5">404</div> <h1 class="font-display text-headline-md text-on-surface mb-3">Page not found</h1> <p class="font-body text-body-md text-on-surface-variant mb-8">
This plate doesn't exist in the gallery.
</p> <a href="/" class="btn-primary inline-flex">Back to gallery</a> </div> </main> ${renderComponent($$result2, "Footer", $$Footer, {})} ` })}`;
}, "/home/vscode/codingZone/tattoo-project/src/pages/404.astro", void 0);
const $$file = "/home/vscode/codingZone/tattoo-project/src/pages/404.astro";
const $$url = "/404";
const _page = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: $$404,
  file: $$file,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: "Module" }));
const page = () => _page;
export {
  page,
  a as renderers
};
