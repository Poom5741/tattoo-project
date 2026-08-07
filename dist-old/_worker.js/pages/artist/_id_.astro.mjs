globalThis.process ??= {};
globalThis.process.env ??= {};
/* empty css                                    */
import { c as createComponent, r as renderComponent, a as renderTemplate, f as createAstro, m as maybeRenderHead, F as Fragment, g as addAttribute } from "../../chunks/astro/server_B1Q-Dpks.mjs";
import { $ as $$Base } from "../../chunks/jsx-runtime_6SzGatPE.mjs";
import { N as Nav, $ as $$Footer } from "../../chunks/Footer_D7ikpgG4.mjs";
import { T as Toast } from "../../chunks/Toast_ZrMhaEK6.mjs";
import { P as Plate } from "../../chunks/Plate_155EoXFk.mjs";
import { c as createT } from "../../chunks/index_LvGhOnDK.mjs";
import { a } from "../../chunks/_@astro-renderers_B6-rS8YJ.mjs";
const $$Astro = createAstro();
const prerender = false;
const $$id = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$id;
  const { id } = Astro2.params;
  let artist = null;
  let plates = [];
  try {
    const db = Astro2.locals.runtime.env.DB;
    const row = await db.prepare("SELECT * FROM artists WHERE id = ?").bind(id).first();
    artist = row ?? null;
    if (artist) {
      const { results } = await db.prepare("SELECT * FROM designs WHERE artist_id = ? ORDER BY token_id ASC").bind(id).all();
      plates = results;
    }
  } catch {
  }
  if (!artist) {
    return Astro2.redirect("/artists");
  }
  const avail = plates.filter((d) => d.status === "available").length;
  function fmtEth(v) {
    if (!v) return "—";
    return v.toFixed(3) + " ETH";
  }
  const locale = Astro2.locals?.locale ?? "en";
  const t = createT(locale);
  return renderTemplate`${renderComponent($$result, "Base", $$Base, { "title": `${artist.name} — SAKNID`, "description": artist.bio ?? `${artist.name} — ${artist.style}` }, { "default": async ($$result2) => renderTemplate` ${renderComponent($$result2, "Nav", Nav, { "client:load": true, "currentPath": "/artists", "client:component-hydration": "load", "client:component-path": "/home/vscode/codingZone/tattoo-project/src/components/Nav", "client:component-export": "default" })} ${renderComponent($$result2, "Toast", Toast, { "client:load": true, "client:component-hydration": "load", "client:component-path": "/home/vscode/codingZone/tattoo-project/src/components/Toast", "client:component-export": "default" })} ${maybeRenderHead()}<section class="py-8 pb-20"> <div class="max-w-container-max mx-auto px-5 md:px-16"> <a href="/artists" class="inline-flex items-center gap-2 text-on-surface-variant hover:text-on-surface mb-8 font-body text-sm transition-colors duration-200">${t("artistDetail.backToArtists")}</a>  <div class="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-8 lg:gap-12 items-start"> <div class="card-bb aspect-[3/4] overflow-hidden !border-outline-variant/20"> ${renderComponent($$result2, "Plate", Plate, { "seed": artist.seed ?? 0, "label": artist.style?.split(" · ")[0]?.toUpperCase(), "density": 1.1, "client:load": true, "client:component-hydration": "load", "client:component-path": "/home/vscode/codingZone/tattoo-project/src/components/Plate", "client:component-export": "default" })} </div> <div class="flex flex-col"> <div class="font-body text-on-surface-variant text-label-sm tracking-wider flex gap-2 items-center mb-4"> <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path><circle cx="12" cy="10" r="3"></circle></svg> ${artist.city}${artist.handle && renderTemplate`${renderComponent($$result2, "Fragment", Fragment, {}, { "default": async ($$result3) => renderTemplate`&nbsp;·&nbsp;${artist.handle}` })}`} </div> <h1 class="font-display font-semibold text-on-surface text-display-lg-mobile md:text-display-lg leading-none">${artist.name}</h1> <div class="font-body text-on-surface-variant text-body-md mt-4 tracking-wide">${artist.style}</div> <p class="text-on-surface-variant text-body-md my-6 max-w-[48ch] leading-relaxed">${artist.bio}</p>  <div class="flex gap-8 flex-wrap py-5 border-t border-b border-outline-variant/20 my-2 mb-7"> ${artist.years != null && renderTemplate`<div> <div class="font-display font-semibold text-on-surface text-headline-sm">${artist.years} yrs</div> <div class="font-body text-on-surface-variant/60 text-label-sm tracking-wider uppercase mt-1">${t("artistDetail.experience")}</div> </div>`} ${artist.pieces != null && renderTemplate`<div> <div class="font-display font-semibold text-on-surface text-headline-sm">${artist.pieces}</div> <div class="font-body text-on-surface-variant/60 text-label-sm tracking-wider uppercase mt-1">${t("artistDetail.platesReleased")}</div> </div>`} ${artist.rating != null && renderTemplate`<div> <div class="font-display font-semibold text-on-surface text-headline-sm">${artist.rating} ★</div> <div class="font-body text-on-surface-variant/60 text-label-sm tracking-wider uppercase mt-1">${t("artistDetail.rating")}</div> </div>`} ${artist.rate != null && renderTemplate`<div> <div class="font-display font-semibold text-on-surface text-headline-sm">€${artist.rate}/hr</div> <div class="font-body text-on-surface-variant/60 text-label-sm tracking-wider uppercase mt-1">${t("artistDetail.sessionRate")}</div> </div>`} </div>  <div class="flex gap-3 flex-wrap"> <a${addAttribute(`/booking?artistId=${artist.id}`, "href")} class="btn-primary">${t("artistDetail.bookSession")}</a> ${artist.booked && renderTemplate`<span class="tag-bb text-xs border bg-green-600/10 text-green-700 border-green-600/30 self-center"> <span class="w-2 h-2 rounded-full bg-current"></span>${artist.booked} </span>`} </div> </div> </div>  ${plates.length > 0 && renderTemplate`<div class="mt-16"> <div class="flex justify-between items-end mb-8 flex-wrap gap-4"> <h2 class="font-display font-semibold text-on-surface text-headline-md">Available plates</h2> <span class="font-body text-on-surface-variant/60 text-label-sm tracking-wider">${avail} OF ${plates.length} OPEN</span> </div> <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-gutter"> ${plates.map((d) => renderTemplate`<a${addAttribute(`/design/${d.id}`, "href")} class="card-bb block no-underline group"> <div class="aspect-[3/4] overflow-hidden bg-surface-dim"> ${renderComponent($$result2, "Plate", Plate, { "seed": d.seed ?? 0, "density": 1, "client:load": true, "client:component-hydration": "load", "client:component-path": "/home/vscode/codingZone/tattoo-project/src/components/Plate", "client:component-export": "default" })} </div> <div class="p-5"> <div class="flex justify-between items-start mb-2.5"> <span${addAttribute(`tag-bb text-xs border ${d.status === "available" ? "bg-green-600/10 text-green-700 border-green-600/30" : d.status === "reserved" ? "bg-amber-500/10 text-amber-600 border-amber-500/30" : "bg-on-surface-variant/10 text-on-surface-variant border-on-surface-variant/30"}`, "class")}> <span class="w-2 h-2 rounded-full bg-current"></span> ${d.status === "available" ? "Available" : d.status === "reserved" ? "Reserved" : "Claimed"} </span> <span class="font-body text-on-surface-variant/60 text-[10px]">№ ${d.n}/001</span> </div> <h3 class="font-display font-semibold text-on-surface text-xl mb-2 group-hover:text-primary transition-colors duration-200">${d.title}</h3> <div class="font-body text-on-surface-variant text-xs">${d.style} · ${d.placement}</div> <div class="font-display font-semibold text-on-surface text-[22px] mt-3">${fmtEth(d.price)}</div> </div> </a>`)} </div> </div>`} </div> </section> ${renderComponent($$result2, "Footer", $$Footer, {})} ` })}`;
}, "/home/vscode/codingZone/tattoo-project/src/pages/artist/[id].astro", void 0);
const $$file = "/home/vscode/codingZone/tattoo-project/src/pages/artist/[id].astro";
const $$url = "/artist/[id]";
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
