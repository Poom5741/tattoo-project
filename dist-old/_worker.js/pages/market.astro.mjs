globalThis.process ??= {};
globalThis.process.env ??= {};
/* empty css                                 */
import { c as createComponent, r as renderComponent, a as renderTemplate, f as createAstro, m as maybeRenderHead } from "../chunks/astro/server_B1Q-Dpks.mjs";
import { j as jsxRuntimeExports, $ as $$Base } from "../chunks/jsx-runtime_6SzGatPE.mjs";
import { N as Nav, $ as $$Footer } from "../chunks/Footer_D7ikpgG4.mjs";
import { T as Toast } from "../chunks/Toast_ZrMhaEK6.mjs";
import { r as reactExports } from "../chunks/_@astro-renderers_B6-rS8YJ.mjs";
import { a } from "../chunks/_@astro-renderers_B6-rS8YJ.mjs";
import { P as Plate } from "../chunks/Plate_155EoXFk.mjs";
import { d as deserialize, c as config } from "../chunks/wagmi_Qh5pcwov.mjs";
import { c as createT } from "../chunks/index_LvGhOnDK.mjs";
function cookieToInitialState(config2, cookie) {
  if (!cookie)
    return void 0;
  const key = `${config2.storage?.key}.store`;
  const parsed = parseCookie(cookie, key);
  if (!parsed)
    return void 0;
  return deserialize(parsed).state;
}
function parseCookie(cookie, key) {
  const keyValue = cookie.split("; ").find((x) => x.startsWith(`${key}=`));
  if (!keyValue)
    return void 0;
  return keyValue.substring(key.length + 1);
}
const ALL_STYLES = ["Fine Line", "Blackwork", "Neo-Traditional", "Geometric", "Realism", "Lettering", "Japanese", "Watercolor", "Minimalist", "Dotwork"];
const FILTER_ACTIVE = "bg-primary-container text-on-primary border-primary-container";
const FILTER_INACTIVE = "bg-transparent text-on-surface-variant border-outline-variant hover:border-outline hover:bg-surface-container-low";
function StatusTag({ status, isResale }) {
  if (isResale) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "tag-bb bg-surface-tint/10 text-surface-tint border border-surface-tint/30", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-1.5 h-1.5 rounded-full bg-surface-tint" }),
      "Resale"
    ] });
  }
  const map = {
    available: {
      label: "Available",
      cls: "tag-bb bg-green-900/8 text-green-900 border border-green-900/20"
    },
    reserved: {
      label: "Reserved",
      cls: "tag-bb bg-amber-700/8 text-amber-700 border border-amber-700/20"
    },
    sold: {
      label: "Claimed",
      cls: "tag-bb bg-on-surface/8 text-on-surface-variant border border-on-surface/15"
    }
  };
  const { label, cls } = map[status] ?? { label: status, cls: "tag-bb" };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: cls, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-1.5 h-1.5 rounded-full bg-current" }),
    label
  ] });
}
function SellingModeBadge({ mode, royaltyPct }) {
  if (!mode) return null;
  if (mode === "one-time") {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "inline-flex items-center font-body text-[10px] tracking-[0.1em] text-on-surface-variant/60 bg-secondary-container/50 border border-outline-variant px-1.5 py-0.5 rounded", children: "SOULBOUND" });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center font-body text-[10px] tracking-[0.1em] text-on-surface-variant/60 bg-green-900/8 border border-outline-variant px-1.5 py-0.5 rounded", children: [
    "RESELLABLE ",
    royaltyPct ? `${royaltyPct}%` : ""
  ] });
}
function DesignCard({ d }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: `/design/${d.id}`, className: "card-bb block no-underline text-inherit group", "data-testid": "plate-card", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "aspect-[3/4] overflow-hidden bg-surface-dim relative", children: d.image_url ? /* @__PURE__ */ jsxRuntimeExports.jsx(
      "img",
      {
        src: d.image_url,
        alt: d.title,
        className: "w-full h-full object-cover block transition-transform duration-500 group-hover:scale-[1.02]"
      }
    ) : /* @__PURE__ */ jsxRuntimeExports.jsx(Plate, { seed: d.seed ?? 0, density: 1 }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-start mb-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(StatusTag, { status: d.status }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-body text-[10px] tracking-[0.1em] text-on-surface-variant/60", children: [
          "№ ",
          d.n,
          "/001"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-display text-headline-sm text-on-surface mb-1.5 group-hover:text-primary transition-colors duration-200", children: d.title }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "font-body text-xs text-on-surface-variant mb-2", children: [
        d.style,
        " · ",
        d.placement
      ] }),
      d.selling_mode && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-2.5", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SellingModeBadge, { mode: d.selling_mode, royaltyPct: d.royalty_pct }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-baseline pt-3 border-t border-outline-variant/20", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-display text-headline-sm text-on-surface", children: d.price != null ? `฿${d.price.toLocaleString("th-TH", { minimumFractionDigits: 2 })}` : "—" }),
        d.drawn != null && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-body text-[10px] tracking-[0.06em] text-on-surface-variant/60", children: [
          d.drawn,
          " watching"
        ] })
      ] })
    ] })
  ] });
}
function ResaleCard({ r }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: `/design/${r.design_id}`, className: "card-bb block no-underline text-inherit group", "data-testid": "resale-card", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "aspect-[3/4] overflow-hidden bg-surface-dim relative", children: r.image_url ? /* @__PURE__ */ jsxRuntimeExports.jsx(
      "img",
      {
        src: r.image_url,
        alt: r.title,
        className: "w-full h-full object-cover block transition-transform duration-500 group-hover:scale-[1.02]"
      }
    ) : /* @__PURE__ */ jsxRuntimeExports.jsx(Plate, { seed: 0, density: 1 }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-start mb-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(StatusTag, { status: "resale", isResale: true }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-body text-[10px] tracking-[0.1em] text-on-surface-variant/60", children: "Resale" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-display text-headline-sm text-on-surface mb-1.5 group-hover:text-primary transition-colors duration-200", children: r.title }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "font-body text-xs text-on-surface-variant mb-2", children: [
        r.style,
        " · ",
        r.placement
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-2.5", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SellingModeBadge, { mode: r.selling_mode, royaltyPct: r.royalty_pct }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-baseline pt-3 border-t border-outline-variant/20", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-display text-headline-sm text-on-surface", children: [
          "฿",
          r.asking_price.toLocaleString("th-TH", { minimumFractionDigits: 2 })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-body text-[10px] text-on-surface-variant/60", children: [
          "by ",
          r.artist_name
        ] })
      ] })
    ] })
  ] });
}
function FilterButton({ active, onClick, children }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "button",
    {
      className: `px-4 py-2 rounded-full text-sm font-body font-semibold border transition-all duration-200 ${active ? FILTER_ACTIVE : FILTER_INACTIVE}`,
      onClick,
      children
    }
  );
}
function MarketGrid({ designs, resaleListings = [] }) {
  const [styleFilter, setStyleFilter] = reactExports.useState("all");
  const [statusFilter, setStatusFilter] = reactExports.useState("all");
  const [listingFilter, setListingFilter] = reactExports.useState("all");
  const filteredDesigns = (listingFilter === "resale" ? [] : designs).filter((d) => {
    const styleOk = styleFilter === "all" || d.style === styleFilter;
    const statusOk = statusFilter === "all" || d.status === statusFilter;
    return styleOk && statusOk;
  });
  const filteredResale = (listingFilter === "primary" ? [] : resaleListings).filter((r) => {
    const styleOk = styleFilter === "all" || r.style === styleFilter;
    return styleOk;
  });
  const totalCount = filteredDesigns.length + filteredResale.length;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-4 mb-10", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-2", "data-testid": "filter-listing", children: ["all", "primary", "resale"].map((f) => /* @__PURE__ */ jsxRuntimeExports.jsx(FilterButton, { active: listingFilter === f, onClick: () => setListingFilter(f), children: f === "all" ? "All listings" : f === "primary" ? "Primary" : "Resale" }, f)) }),
      listingFilter !== "resale" && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-2", "data-testid": "filter-status", children: ["all", "available", "reserved", "sold"].map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(FilterButton, { active: statusFilter === s, onClick: () => setStatusFilter(s), children: s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1) }, s)) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2", "data-testid": "filter-style", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(FilterButton, { active: styleFilter === "all", onClick: () => setStyleFilter("all"), children: "All styles" }),
        ALL_STYLES.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(FilterButton, { active: styleFilter === s, onClick: () => setStyleFilter(s), children: s }, s))
      ] })
    ] }),
    totalCount === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center py-16", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-body text-body-md text-on-surface-variant", children: "No plates match your filters." }) }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-gutter", "data-testid": "plate-grid", children: [
      filteredDesigns.map((d) => /* @__PURE__ */ jsxRuntimeExports.jsx(DesignCard, { d }, d.id)),
      filteredResale.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsx(ResaleCard, { r }, r.id))
    ] })
  ] });
}
const $$Astro = createAstro();
const prerender = false;
const $$Market = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Market;
  let designs = [];
  let resaleListings = [];
  try {
    const db = Astro2.locals.runtime.env.DB;
    const [dRes, rRes] = await Promise.all([
      db.prepare("SELECT id, n, title, artist_id, style, price, status, placement, seed, drawn, image_url, selling_mode, royalty_pct, token_id FROM designs WHERE status IN ('available', 'reserved', 'sold') ORDER BY rowid ASC").all(),
      db.prepare(`SELECT rl.id, rl.design_id, rl.seller_wallet, rl.asking_price, rl.token_id, rl.status,
                       d.title, d.style, d.placement, d.image_url, d.selling_mode, d.royalty_pct,
                       a.name as artist_name
                FROM resale_listings rl
                JOIN designs d ON rl.design_id = d.id
                JOIN artists a ON d.artist_id = a.id
                WHERE rl.status = 'active'`).all()
    ]);
    designs = dRes.results;
    resaleListings = rRes.results;
  } catch {
  }
  const cookieHeader = Astro2.request.headers.get("cookie") ?? "";
  const initialState = cookieToInitialState(config, cookieHeader);
  const locale = Astro2.locals?.locale ?? "en";
  const t = createT(locale);
  return renderTemplate`${renderComponent($$result, "Base", $$Base, { "title": "Gallery — SAKNID", "description": "One-of-one tattoo plates. Browse the gallery." }, { "default": async ($$result2) => renderTemplate` ${renderComponent($$result2, "Nav", Nav, { "client:load": true, "currentPath": "/market", "client:component-hydration": "load", "client:component-path": "/home/vscode/codingZone/tattoo-project/src/components/Nav", "client:component-export": "default" })} ${renderComponent($$result2, "Toast", Toast, { "client:load": true, "client:component-hydration": "load", "client:component-path": "/home/vscode/codingZone/tattoo-project/src/components/Toast", "client:component-export": "default" })} ${maybeRenderHead()}<section class="py-14 pb-20"> <div class="container-bb"> <p class="kicker font-body text-label-md font-semibold text-primary-container tracking-wider uppercase mb-4">${t("marketPage.kicker")}</p> <div class="flex justify-between items-end flex-wrap gap-4 mb-10"> <h1 class="font-display text-display-lg-mobile md:text-display-lg text-on-surface">${t("marketPage.title")}</h1> <span class="font-body text-on-surface-variant/60 text-[11px] tracking-[0.12em]">${t("marketPage.countLabel").replace("{n}", String(designs.length))}</span> </div> ${renderComponent($$result2, "MarketGrid", MarketGrid, { "client:load": true, "designs": designs, "resaleListings": resaleListings, "initialState": initialState, "client:component-hydration": "load", "client:component-path": "/home/vscode/codingZone/tattoo-project/src/components/MarketGrid", "client:component-export": "default" })} </div> </section> ${renderComponent($$result2, "Footer", $$Footer, {})} ` })}`;
}, "/home/vscode/codingZone/tattoo-project/src/pages/market.astro", void 0);
const $$file = "/home/vscode/codingZone/tattoo-project/src/pages/market.astro";
const $$url = "/market";
const _page = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: $$Market,
  file: $$file,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: "Module" }));
const page = () => _page;
export {
  page,
  a as renderers
};
