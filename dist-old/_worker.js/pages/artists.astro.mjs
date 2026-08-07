globalThis.process ??= {};
globalThis.process.env ??= {};
/* empty css                                 */
import { c as createComponent, r as renderComponent, a as renderTemplate, f as createAstro, m as maybeRenderHead, g as addAttribute } from "../chunks/astro/server_B1Q-Dpks.mjs";
import { $ as $$Base } from "../chunks/jsx-runtime_6SzGatPE.mjs";
import { N as Nav, $ as $$Footer } from "../chunks/Footer_D7ikpgG4.mjs";
import { T as Toast } from "../chunks/Toast_ZrMhaEK6.mjs";
import { P as Plate } from "../chunks/Plate_155EoXFk.mjs";
import { c as createT } from "../chunks/index_LvGhOnDK.mjs";
import { a } from "../chunks/_@astro-renderers_B6-rS8YJ.mjs";
const $$Astro = createAstro();
const prerender = false;
const $$Artists = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Artists;
  const db = Astro2.locals.runtime.env.DB;
  const [aRes, cRes] = await Promise.all([
    db.prepare("SELECT id, name, handle, city, style, years, booked, bio, pieces, rating, seed FROM artists ORDER BY name ASC").all(),
    db.prepare("SELECT artist_id, COUNT(*) AS available_count FROM designs WHERE status='available' GROUP BY artist_id").all()
  ]);
  const availMap = Object.fromEntries(cRes.results.map((r) => [r.artist_id, r.available_count]));
  const artistDesignCounts = aRes.results.map((a2) => ({
    ...a2,
    style: a2.style ?? "Ink",
    availableCount: availMap[a2.id] ?? 0
  }));
  const locale = Astro2.locals?.locale ?? "en";
  const t = createT(locale);
  return renderTemplate`${renderComponent($$result, "Base", $$Base, { "title": "Artists — SAKNID" }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="min-h-screen flex flex-col"> ${renderComponent($$result2, "Nav", Nav, { "currentPath": "/artists", "client:load": true, "client:component-hydration": "load", "client:component-path": "/home/vscode/codingZone/tattoo-project/src/components/Nav", "client:component-export": "default" })} <main class="flex-1"> <section class="pt-14"> <div class="container-bb"> <span class="kicker font-body text-label-md font-semibold text-primary-container tracking-wider uppercase mb-4 block">${t("artistsPage.kicker")}</span> <h1 class="font-display text-display-lg-mobile md:text-display-lg text-on-surface mb-4">${t("artistsPage.title")}</h1> <p class="font-body text-body-lg text-on-surface-variant max-w-[48ch] mb-14">${t("artistsPage.subtitle")}</p> </div> </section> <section class="pb-24"> <div class="container-bb"> <div class="grid grid-cols-1 lg:grid-cols-2 gap-gutter"> ${artistDesignCounts.map((a2) => renderTemplate`<a${addAttribute(`/artist/${a2.id}`, "href")} class="card-bb flex flex-col no-underline group"${addAttribute(`artist-card-${a2.id}`, "data-testid")}> <div class="aspect-[16/10] relative overflow-hidden bg-surface-dim"> ${renderComponent($$result2, "Plate", Plate, { "seed": a2.seed, "label": a2.style.split(" · ")[0].toUpperCase(), "density": 0.9, "client:load": true, "client:component-hydration": "load", "client:component-path": "/home/vscode/codingZone/tattoo-project/src/components/Plate", "client:component-export": "default" })} </div> <div class="p-6 md:p-8 flex-1 flex flex-col"> <div class="flex items-center gap-3 mb-4"> <div class="w-12 h-12 rounded-full bg-surface-container-highest border border-outline-variant/50 flex items-center justify-center flex-shrink-0"> <span class="font-display text-lg text-primary-container">${a2.name[0]}</span> </div> <div class="min-w-0"> <h2 class="font-display text-headline-sm text-on-surface leading-tight">${a2.name}</h2> <div class="font-body text-xs text-on-surface-variant mt-0.5">${a2.city}</div> </div> </div> <span class="tag-bb self-start mb-4">${a2.style}</span> <p class="font-body text-body-md text-on-surface-variant mb-6 leading-relaxed line-clamp-3">${a2.bio}</p> <div class="flex gap-8 flex-wrap mt-auto pt-4 border-t border-outline-variant/20"> <div> <div class="font-display text-headline-sm text-on-surface">${a2.pieces}</div> <div class="font-body text-label-sm text-on-surface-variant mt-1">${t("artistsPage.plates")}</div> </div> <div> <div class="font-display text-headline-sm text-on-surface">${a2.rating}</div> <div class="font-body text-label-sm text-on-surface-variant mt-1">${t("artistsPage.rating")}</div> </div> <div> <div class="font-display text-headline-sm text-on-surface">${a2.availableCount}</div> <div class="font-body text-label-sm text-on-surface-variant mt-1">${t("artistsPage.available")}</div> </div> </div> <div class="mt-5"> <span class="tag-bb"> <span class="w-2 h-2 rounded-full bg-primary-container"></span> ${a2.booked} </span> </div> </div> </a>`)} </div> </div> </section> <hr class="border-t border-outline-variant/30"> <section class="py-16"> <div class="container-bb flex justify-between items-center gap-8 flex-wrap"> <div> <span class="kicker font-body text-label-md font-semibold text-primary-container tracking-wider uppercase mb-3 block">${t("artistsPage.joinKicker")}</span> <h2 class="font-display text-headline-md md:text-headline-lg text-on-surface max-w-[22ch]">${t("artistsPage.joinTitle")}</h2> </div> <a href="/artists" class="btn-secondary">${t("artistsPage.applyToSell")}</a> </div> </section> </main> ${renderComponent($$result2, "Footer", $$Footer, {})} </div> ${renderComponent($$result2, "Toast", Toast, { "client:load": true, "client:component-hydration": "load", "client:component-path": "/home/vscode/codingZone/tattoo-project/src/components/Toast", "client:component-export": "default" })} ` })}`;
}, "/home/vscode/codingZone/tattoo-project/src/pages/artists.astro", void 0);
const $$file = "/home/vscode/codingZone/tattoo-project/src/pages/artists.astro";
const $$url = "/artists";
const _page = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: $$Artists,
  file: $$file,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: "Module" }));
const page = () => _page;
export {
  page,
  a as renderers
};
