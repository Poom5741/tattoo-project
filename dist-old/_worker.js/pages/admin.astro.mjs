globalThis.process ??= {};
globalThis.process.env ??= {};
/* empty css                                 */
import { c as createComponent, r as renderComponent, a as renderTemplate, f as createAstro, m as maybeRenderHead, h as renderScript, g as addAttribute } from "../chunks/astro/server_B1Q-Dpks.mjs";
import { j as jsxRuntimeExports, $ as $$Base } from "../chunks/jsx-runtime_6SzGatPE.mjs";
import { i as isAdminAuthed } from "../chunks/auth_DbftzjD7.mjs";
import { r as reactExports } from "../chunks/_@astro-renderers_B6-rS8YJ.mjs";
import { a } from "../chunks/_@astro-renderers_B6-rS8YJ.mjs";
/* empty css                                 */
const thCls = "text-left px-3 py-2 text-[11px] font-body font-semibold tracking-wider uppercase text-on-surface-variant/60 border-b border-outline-variant/40";
const tdCls = "px-3 py-2 font-body text-body-md text-on-surface border-b border-outline-variant/20";
function AdminPendingReview() {
  const [designs, setDesigns] = reactExports.useState([]);
  const [loading, setLoading] = reactExports.useState(true);
  const [error, setError] = reactExports.useState(null);
  const [actionPending, setActionPending] = reactExports.useState(/* @__PURE__ */ new Set());
  reactExports.useEffect(() => {
    fetch("/api/admin/pending-designs").then((r) => r.json()).then((data) => setDesigns(data)).catch(() => setError("Failed to load pending designs.")).finally(() => setLoading(false));
  }, []);
  async function handleAction(designId, action) {
    setActionPending((prev) => new Set(prev).add(designId));
    try {
      const res = await fetch("/api/admin/review-design", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ designId, action })
      });
      if (res.ok) {
        setDesigns((prev) => prev.filter((d) => d.id !== designId));
      } else {
        const err = await res.json();
        alert("Action failed: " + (err.error ?? "Unknown error"));
      }
    } catch {
      alert("Network error. Please try again.");
    } finally {
      setActionPending((prev) => {
        const next = new Set(prev);
        next.delete(designId);
        return next;
      });
    }
  }
  if (loading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-body text-body-md text-on-surface-variant/60", children: "Loading pending designs…" });
  }
  if (error) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-body text-body-md text-error", children: error });
  }
  if (designs.length === 0) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-body text-body-md text-on-surface-variant/60", children: "No pending designs." });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full border-collapse", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: thCls, children: "Photo" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: thCls, children: "Title" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: thCls, children: "Artist" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: thCls, children: "Price (THB)" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: thCls, children: "Mode" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: thCls, children: "Royalty" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: thCls, children: "Actions" })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: designs.map((d) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "hover:bg-surface-container-low/50 transition-colors", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: tdCls, children: d.image_url ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: d.image_url, alt: d.title, className: "w-[60px] h-[60px] object-cover rounded" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-[60px] h-[60px] bg-surface-container-high rounded flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-body text-label-sm text-on-surface-variant/40", children: "No img" }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: tdCls, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium text-on-surface", children: d.title }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "font-body text-label-sm text-on-surface-variant/60", children: [
          d.style,
          " · ",
          d.placement
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: `${tdCls} text-body-md`, children: d.artist_name }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: `${tdCls} text-body-md`, children: d.price != null ? `฿${d.price.toLocaleString("th-TH", { minimumFractionDigits: 2 })}` : "—" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: tdCls, children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `inline-flex items-center px-2 py-0.5 rounded-full text-label-sm font-semibold border ${d.selling_mode === "resellable" ? "bg-green-50 text-green-700 border-green-200" : "bg-surface-container-high text-on-surface-variant border-outline-variant/30"}`, children: d.selling_mode === "resellable" ? "Resellable" : "Soulbound" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: `${tdCls} text-body-md`, children: d.selling_mode === "resellable" ? `${d.royalty_pct}%` : "—" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: tdCls, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => handleAction(d.id, "approve"),
            disabled: actionPending.has(d.id),
            className: "px-3 py-1.5 bg-green-600 text-white font-body text-label-sm font-semibold rounded-full transition-all hover:bg-green-700 disabled:opacity-40 cursor-pointer",
            children: "Approve"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => handleAction(d.id, "reject"),
            disabled: actionPending.has(d.id),
            className: "px-3 py-1.5 bg-error text-white font-body text-label-sm font-semibold rounded-full transition-all hover:bg-primary disabled:opacity-40 cursor-pointer",
            children: "Reject"
          }
        )
      ] }) })
    ] }, d.id)) })
  ] }) });
}
const $$Astro = createAstro();
const prerender = false;
const $$Index = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Index;
  const env = Astro2.locals.runtime.env;
  const authed = await isAdminAuthed(
    Astro2.request.headers.get("cookie") ?? "",
    env.SESSION
  );
  let bookings = [];
  let designs = [];
  let artists = [];
  if (authed) {
    const db = env.DB;
    const [bRes, dRes, aRes] = await Promise.all([
      db.prepare("SELECT * FROM booking_inquiries ORDER BY created_at DESC").all(),
      db.prepare("SELECT id, n, title, artist_id, style, price, status FROM designs ORDER BY rowid ASC").all(),
      db.prepare("SELECT id, name, wallet_address FROM artists ORDER BY name ASC").all()
    ]);
    bookings = bRes.results;
    designs = dRes.results;
    artists = aRes.results;
  }
  const artistMap = Object.fromEntries(artists.map((a2) => [a2.id, a2.name]));
  const stats = {
    bookings: bookings.length,
    pending: designs.filter((d) => d.status === "pending").length,
    available: designs.filter((d) => d.status === "available").length,
    reserved: designs.filter((d) => d.status === "reserved").length,
    sold: designs.filter((d) => d.status === "sold").length
  };
  function statusClass(status) {
    switch (status) {
      case "available":
        return "bg-green-50 text-green-700 border-green-200";
      case "reserved":
        return "bg-amber-50 text-amber-600 border-amber-200";
      case "sold":
        return "bg-surface-container-high text-on-surface-variant border-outline-variant/40";
      case "pending":
        return "bg-amber-50 text-amber-600 border-amber-200";
      case "rejected":
        return "bg-error/container text-error border-error/20";
      case "delisted":
        return "bg-surface-container-high text-on-surface-variant border-outline-variant/40";
      default:
        return "";
    }
  }
  function fmtDate(ts) {
    return new Date(ts * 1e3).toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  }
  const thBase = "font-body text-label-sm tracking-wider uppercase text-on-surface-variant/60 px-4 py-3 text-left border-b border-outline-variant bg-surface-container-low whitespace-nowrap";
  const tdBase = "px-4 py-3 border-b border-outline-variant/40 text-body-md font-body";
  return renderTemplate`${renderComponent($$result, "Base", $$Base, { "title": "Admin — SAKNID", "data-astro-cid-u2h3djql": true }, { "default": async ($$result2) => renderTemplate`  ${!authed ? renderTemplate`${maybeRenderHead()}<div class="min-h-screen flex items-center justify-center bg-surface px-5" data-astro-cid-u2h3djql> <div class="w-full max-w-[400px] card-bb p-10" data-astro-cid-u2h3djql> <div class="kicker font-body text-label-md font-semibold text-primary-container tracking-wider uppercase mb-5" data-astro-cid-u2h3djql>SAKNID / Admin</div> <h1 class="font-display text-headline-sm text-on-surface mb-7" data-astro-cid-u2h3djql>Sign in</h1> <form id="lf" novalidate data-astro-cid-u2h3djql> <div class="mb-5" data-astro-cid-u2h3djql> <label for="pw" class="label-bb" data-astro-cid-u2h3djql>Password</label> <input id="pw" type="password" class="input-bb" placeholder="••••••••" autocomplete="current-password" data-astro-cid-u2h3djql> </div> <div id="login-err" data-astro-cid-u2h3djql></div> <button type="submit" class="btn-primary w-full mt-5" data-astro-cid-u2h3djql>Enter dashboard</button> </form> ${renderScript($$result2, "/home/vscode/codingZone/tattoo-project/src/pages/admin/index.astro?astro&type=script&index=0&lang.ts")} </div> </div>` : renderTemplate`<div class="max-w-container-max mx-auto px-5 md:px-16 py-10 pb-20" data-astro-cid-u2h3djql>  <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-outline-variant mb-10" data-astro-cid-u2h3djql> <div data-astro-cid-u2h3djql> <div class="kicker font-body text-label-md font-semibold text-primary-container tracking-wider uppercase mb-2" data-astro-cid-u2h3djql>SAKNID / Admin</div> <h1 class="font-display text-headline-md text-on-surface" data-astro-cid-u2h3djql>Dashboard</h1> </div> <form method="POST" action="/api/admin/logout" data-astro-cid-u2h3djql> <button type="submit" class="btn-secondary" data-astro-cid-u2h3djql>Sign out</button> </form> </div>  <div class="stats grid grid-cols-2 md:grid-cols-5 gap-4 mb-12" data-astro-cid-u2h3djql> <div class="card-bb p-6" data-astro-cid-u2h3djql> <div class="font-display text-4xl md:text-5xl leading-none text-on-surface" data-astro-cid-u2h3djql>${stats.bookings}</div> <div class="font-body text-label-sm tracking-wider uppercase text-on-surface-variant/60 mt-2" data-astro-cid-u2h3djql>Bookings</div> </div> <div class="card-bb p-6" data-astro-cid-u2h3djql> <div class="font-display text-4xl md:text-5xl leading-none text-amber-500" data-astro-cid-u2h3djql>${stats.pending}</div> <div class="font-body text-label-sm tracking-wider uppercase text-on-surface-variant/60 mt-2" data-astro-cid-u2h3djql>Pending review</div> </div> <div class="card-bb p-6" data-astro-cid-u2h3djql> <div class="font-display text-4xl md:text-5xl leading-none text-green-600" data-astro-cid-u2h3djql>${stats.available}</div> <div class="font-body text-label-sm tracking-wider uppercase text-on-surface-variant/60 mt-2" data-astro-cid-u2h3djql>Available</div> </div> <div class="card-bb p-6" data-astro-cid-u2h3djql> <div class="font-display text-4xl md:text-5xl leading-none text-amber-500" data-astro-cid-u2h3djql>${stats.reserved}</div> <div class="font-body text-label-sm tracking-wider uppercase text-on-surface-variant/60 mt-2" data-astro-cid-u2h3djql>Reserved</div> </div> <div class="card-bb p-6" data-astro-cid-u2h3djql> <div class="font-display text-4xl md:text-5xl leading-none text-on-surface" data-astro-cid-u2h3djql>${stats.sold}</div> <div class="font-body text-label-sm tracking-wider uppercase text-on-surface-variant/60 mt-2" data-astro-cid-u2h3djql>Sold</div> </div> </div>  <div class="font-body text-label-sm tracking-wider uppercase text-on-surface-variant mb-4" data-astro-cid-u2h3djql>Pending design review</div> <div class="card-bb p-6 mb-12 border-amber-200/50" data-astro-cid-u2h3djql> ${renderComponent($$result2, "AdminPendingReview", AdminPendingReview, { "client:load": true, "client:component-hydration": "load", "client:component-path": "/home/vscode/codingZone/tattoo-project/src/components/AdminPendingReview", "client:component-export": "default", "data-astro-cid-u2h3djql": true })} </div>  <div class="font-body text-label-sm tracking-wider uppercase text-on-surface-variant mb-4" data-astro-cid-u2h3djql>Booking inquiries</div> ${bookings.length === 0 ? renderTemplate`<p class="font-body text-body-md text-on-surface-variant/60 mb-12" data-astro-cid-u2h3djql>No bookings yet.</p>` : renderTemplate`<div class="overflow-x-auto mb-12" data-astro-cid-u2h3djql> <table class="w-full border border-outline-variant/40 border-collapse rounded-lg overflow-hidden" data-astro-cid-u2h3djql> <thead data-astro-cid-u2h3djql> <tr data-astro-cid-u2h3djql> <th${addAttribute(thBase, "class")} data-astro-cid-u2h3djql>#</th> <th${addAttribute(thBase, "class")} data-astro-cid-u2h3djql>Date</th> <th${addAttribute(thBase, "class")} data-astro-cid-u2h3djql>Name</th> <th${addAttribute(thBase, "class")} data-astro-cid-u2h3djql>Contact</th> <th${addAttribute(thBase, "class")} data-astro-cid-u2h3djql>Artist</th> <th${addAttribute(thBase, "class")} data-astro-cid-u2h3djql>Plate</th> <th${addAttribute(thBase, "class")} data-astro-cid-u2h3djql>Message</th> </tr> </thead> <tbody data-astro-cid-u2h3djql> ${bookings.map((b) => renderTemplate`<tr class="hover:bg-surface-container-low/50 transition-colors" data-astro-cid-u2h3djql> <td${addAttribute(`${tdBase} text-label-sm text-on-surface-variant/60`, "class")} data-astro-cid-u2h3djql>${b.id}</td> <td${addAttribute(`${tdBase} text-label-sm whitespace-nowrap`, "class")} data-astro-cid-u2h3djql>${fmtDate(b.created_at)}</td> <td${addAttribute(`${tdBase} font-medium text-on-surface`, "class")} data-astro-cid-u2h3djql>${b.name}</td> <td${addAttribute(`${tdBase} text-body-md`, "class")} data-astro-cid-u2h3djql>${b.contact}</td> <td${addAttribute(`${tdBase} text-body-md`, "class")} data-astro-cid-u2h3djql>${artistMap[b.artist_id] ?? b.artist_id}</td> <td${addAttribute(`${tdBase} text-label-sm text-on-surface-variant/60`, "class")} data-astro-cid-u2h3djql>${b.design_id ?? "—"}</td> <td${addAttribute(`${tdBase}`, "class")} data-astro-cid-u2h3djql><div class="text-body-md text-on-surface-variant max-w-[260px] truncate" data-astro-cid-u2h3djql>${b.message ?? "—"}</div></td> </tr>`)} </tbody> </table> </div>`}  <div class="font-body text-label-sm tracking-wider uppercase text-on-surface-variant mb-4" data-astro-cid-u2h3djql>All plates</div> <div class="overflow-x-auto mb-12" data-astro-cid-u2h3djql> <table class="w-full border border-outline-variant/40 border-collapse rounded-lg overflow-hidden" data-astro-cid-u2h3djql> <thead data-astro-cid-u2h3djql> <tr data-astro-cid-u2h3djql> <th${addAttribute(thBase, "class")} data-astro-cid-u2h3djql>№</th> <th${addAttribute(thBase, "class")} data-astro-cid-u2h3djql>Title</th> <th${addAttribute(thBase, "class")} data-astro-cid-u2h3djql>Artist</th> <th${addAttribute(thBase, "class")} data-astro-cid-u2h3djql>Style</th> <th${addAttribute(thBase, "class")} data-astro-cid-u2h3djql>Price</th> <th${addAttribute(thBase, "class")} data-astro-cid-u2h3djql>Status</th> </tr> </thead> <tbody data-astro-cid-u2h3djql> ${designs.map((d) => renderTemplate`<tr class="hover:bg-surface-container-low/50 transition-colors" data-astro-cid-u2h3djql> <td${addAttribute(`${tdBase} text-label-sm text-on-surface-variant/60`, "class")} data-astro-cid-u2h3djql>${d.n}</td> <td${addAttribute(`${tdBase}`, "class")} data-astro-cid-u2h3djql><a${addAttribute(`/design/${d.id}`, "href")} class="text-primary-container underline underline-offset-3 hover:text-primary transition-colors" data-astro-cid-u2h3djql>${d.title}</a></td> <td${addAttribute(`${tdBase} text-body-md`, "class")} data-astro-cid-u2h3djql>${artistMap[d.artist_id] ?? d.artist_id}</td> <td${addAttribute(`${tdBase} text-label-sm text-on-surface-variant/60`, "class")} data-astro-cid-u2h3djql>${d.style ?? "—"}</td> <td${addAttribute(`${tdBase} text-body-md`, "class")} data-astro-cid-u2h3djql>${d.price != null ? `฿${d.price.toLocaleString("th-TH", { minimumFractionDigits: 2 })}` : "—"}</td> <td${addAttribute(`${tdBase}`, "class")} data-astro-cid-u2h3djql> <span${addAttribute(`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border ${statusClass(d.status)}`, "class")} data-astro-cid-u2h3djql> <span class="w-2 h-2 rounded-full bg-current" data-astro-cid-u2h3djql></span>${d.status} </span> </td> </tr>`)} </tbody> </table> </div>  <div class="font-body text-label-sm tracking-wider uppercase text-on-surface-variant mb-4 mt-6" data-astro-cid-u2h3djql>Register new artist</div> <form method="POST" action="/api/admin/register-artist" class="grid grid-cols-1 sm:grid-cols-2 gap-4 card-bb p-6 mb-9" data-astro-cid-u2h3djql> <div data-astro-cid-u2h3djql> <label class="label-bb text-label-sm" data-astro-cid-u2h3djql>Name *</label> <input type="text" name="name" class="input-bb text-body-md py-2" required placeholder="Artist name" data-astro-cid-u2h3djql> </div> <div data-astro-cid-u2h3djql> <label class="label-bb text-label-sm" data-astro-cid-u2h3djql>Handle</label> <input type="text" name="handle" class="input-bb text-body-md py-2" placeholder="@handle" data-astro-cid-u2h3djql> </div> <div data-astro-cid-u2h3djql> <label class="label-bb text-label-sm" data-astro-cid-u2h3djql>City</label> <input type="text" name="city" class="input-bb text-body-md py-2" placeholder="Bangkok" data-astro-cid-u2h3djql> </div> <div data-astro-cid-u2h3djql> <label class="label-bb text-label-sm" data-astro-cid-u2h3djql>Style</label> <input type="text" name="style" class="input-bb text-body-md py-2" placeholder="Neo-traditional" data-astro-cid-u2h3djql> </div> <div data-astro-cid-u2h3djql> <label class="label-bb text-label-sm" data-astro-cid-u2h3djql>Email</label> <input type="email" name="email" class="input-bb text-body-md py-2" placeholder="artist@email.com" data-astro-cid-u2h3djql> </div> <div data-astro-cid-u2h3djql> <label class="label-bb text-label-sm" data-astro-cid-u2h3djql>Wallet address</label> <input type="text" name="walletAddress" class="input-bb text-body-md py-2 font-mono" placeholder="0x…" data-astro-cid-u2h3djql> </div> <div class="sm:col-span-2" data-astro-cid-u2h3djql> <button type="submit" class="btn-primary text-label-md py-2 px-6" data-astro-cid-u2h3djql>Register artist</button> </div> </form>  <div class="font-body text-label-sm tracking-wider uppercase text-on-surface-variant mb-4" data-astro-cid-u2h3djql>Artist wallet addresses</div> <div class="overflow-x-auto mb-12" data-astro-cid-u2h3djql> <table class="w-full border border-outline-variant/40 border-collapse rounded-lg overflow-hidden" data-astro-cid-u2h3djql> <thead data-astro-cid-u2h3djql> <tr data-astro-cid-u2h3djql> <th${addAttribute(thBase, "class")} data-astro-cid-u2h3djql>Artist</th> <th${addAttribute(thBase, "class")} data-astro-cid-u2h3djql>ID</th> <th${addAttribute(thBase, "class")} data-astro-cid-u2h3djql>Current wallet</th> <th${addAttribute(thBase, "class")} data-astro-cid-u2h3djql>Update</th> </tr> </thead> <tbody data-astro-cid-u2h3djql> ${artists.map((a2) => renderTemplate`<tr class="hover:bg-surface-container-low/50 transition-colors" data-astro-cid-u2h3djql> <td${addAttribute(`${tdBase} font-medium text-on-surface`, "class")} data-astro-cid-u2h3djql>${a2.name}</td> <td${addAttribute(`${tdBase} text-label-sm text-on-surface-variant/60 font-mono`, "class")} data-astro-cid-u2h3djql>${a2.id}</td> <td${addAttribute(`${tdBase} text-label-sm font-mono max-w-[200px] truncate`, "class")} data-astro-cid-u2h3djql> ${a2.wallet_address ? a2.wallet_address : renderTemplate`<span class="text-on-surface-variant/40" data-astro-cid-u2h3djql>not set</span>`} </td> <td${addAttribute(tdBase, "class")} data-astro-cid-u2h3djql> <form method="POST" action="/api/admin/update-artist-wallet" class="flex gap-2 items-center" data-astro-cid-u2h3djql> <input type="hidden" name="artistId"${addAttribute(a2.id, "value")} data-astro-cid-u2h3djql> <input type="text" name="walletAddress" class="input-bb text-label-sm font-mono w-[280px] py-1.5" placeholder="0x…"${addAttribute(a2.wallet_address ?? "", "value")} data-astro-cid-u2h3djql> <button type="submit" class="btn-secondary text-label-sm py-1.5 px-4" data-astro-cid-u2h3djql>
Save
</button> </form> </td> </tr>`)} </tbody> </table> </div> </div>`}` })}`;
}, "/home/vscode/codingZone/tattoo-project/src/pages/admin/index.astro", void 0);
const $$file = "/home/vscode/codingZone/tattoo-project/src/pages/admin/index.astro";
const $$url = "/admin";
const _page = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: "Module" }));
const page = () => _page;
export {
  page,
  a as renderers
};
