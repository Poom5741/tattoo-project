globalThis.process ??= {};
globalThis.process.env ??= {};
/* empty css                                    */
import { c as createComponent, r as renderComponent, a as renderTemplate, m as maybeRenderHead, h as renderScript } from "../../chunks/astro/server_B1Q-Dpks.mjs";
import { $ as $$Base } from "../../chunks/jsx-runtime_6SzGatPE.mjs";
import { N as Nav, $ as $$Footer } from "../../chunks/Footer_D7ikpgG4.mjs";
import { a } from "../../chunks/_@astro-renderers_B6-rS8YJ.mjs";
const prerender = false;
const $$Login = createComponent(async ($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "Base", $$Base, { "title": "Sign In — SAKNID" }, { "default": async ($$result2) => renderTemplate` ${renderComponent($$result2, "Nav", Nav, { "client:load": true, "client:component-hydration": "load", "client:component-path": "/home/vscode/codingZone/tattoo-project/src/components/Nav", "client:component-export": "default" })} ${maybeRenderHead()}<main class="min-h-[60vh] flex items-center justify-center px-5 py-20"> <div class="card-bb p-8 md:p-12 text-center max-w-[420px] w-full bg-surface-container-low"> <div class="w-[52px] h-[52px] rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-body font-bold text-lg mx-auto mb-5">⬡</div> <h1 class="font-display text-headline-md text-on-surface mb-3">Sign in to SAKNID</h1> <p class="font-body text-body-md text-on-surface-variant mb-8">
Sign in with Google to manage your collection and wallet.
</p> <button id="google-signin" class="inline-flex items-center justify-center gap-3 w-full px-7 py-3 rounded-full font-body font-semibold text-sm transition-all bg-on-surface text-surface hover:opacity-85"> <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"> <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"></path> <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path> <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"></path> <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path> </svg>
Sign in with Google
</button> ${renderScript($$result2, "/home/vscode/codingZone/tattoo-project/src/pages/auth/login.astro?astro&type=script&index=0&lang.ts")} </div> </main> ${renderComponent($$result2, "Footer", $$Footer, {})} ` })}`;
}, "/home/vscode/codingZone/tattoo-project/src/pages/auth/login.astro", void 0);
const $$file = "/home/vscode/codingZone/tattoo-project/src/pages/auth/login.astro";
const $$url = "/auth/login";
const _page = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: $$Login,
  file: $$file,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: "Module" }));
const page = () => _page;
export {
  page,
  a as renderers
};
