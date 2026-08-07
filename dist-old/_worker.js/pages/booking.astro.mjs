globalThis.process ??= {};
globalThis.process.env ??= {};
/* empty css                                 */
import { c as createComponent, r as renderComponent, a as renderTemplate, f as createAstro, m as maybeRenderHead } from "../chunks/astro/server_B1Q-Dpks.mjs";
import { j as jsxRuntimeExports, $ as $$Base } from "../chunks/jsx-runtime_6SzGatPE.mjs";
import { N as Nav, $ as $$Footer } from "../chunks/Footer_D7ikpgG4.mjs";
import { T as Toast } from "../chunks/Toast_ZrMhaEK6.mjs";
import { r as reactExports } from "../chunks/_@astro-renderers_B6-rS8YJ.mjs";
import { a } from "../chunks/_@astro-renderers_B6-rS8YJ.mjs";
import { c as createT } from "../chunks/index_LvGhOnDK.mjs";
import { D as DESIGNS, A as ARTISTS } from "../chunks/seed_lejRA9eZ.mjs";
const STYLES = ["Blackwork", "Fine Line", "Geometric", "Irezumi", "Neo-Traditional", "Realism", "Lettering", "Watercolor", "Minimalist", "Traditional", "Not sure yet"];
const SIZES = [
  { value: "small", label: "Small — palm-sized or less" },
  { value: "medium", label: "Medium — hand-sized" },
  { value: "large", label: "Large — forearm / calf" },
  { value: "extra-large", label: "Extra large — full sleeve / back piece" }
];
const BUDGETS = ["Under ฿5,000", "฿5,000–10,000", "฿10,000–20,000", "฿20,000–40,000", "฿40,000+", "Flexible / discuss"];
function BookingForm({ artists, designs }) {
  const [form, setForm] = reactExports.useState({
    artistId: artists[0]?.id ?? "",
    bookingType: "plate",
    designId: "",
    customStyle: "",
    customSize: "",
    customPlacement: "",
    customBudget: "",
    name: "",
    contact: "",
    message: ""
  });
  const [submitting, setSubmitting] = reactExports.useState(false);
  const [error, setError] = reactExports.useState(null);
  const [done, setDone] = reactExports.useState(false);
  const selectedArtist = artists.find((a2) => a2.id === form.artistId);
  const artistDesigns = designs.filter(
    (d) => d.artistId === form.artistId && d.status === "available"
  );
  function set(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (error) setError(null);
  }
  function setType(t) {
    setForm((prev) => ({ ...prev, bookingType: t, designId: "", customStyle: "", customSize: "", customPlacement: "", customBudget: "" }));
    if (error) setError(null);
  }
  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim() || !form.contact.trim()) {
      setError("Name and contact are required.");
      return;
    }
    if (form.bookingType === "custom" && !form.customPlacement.trim()) {
      setError("Please describe where you'd like the tattoo placed.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          artistId: form.artistId,
          designId: form.bookingType === "plate" ? form.designId || null : null,
          name: form.name.trim(),
          contact: form.contact.trim(),
          message: form.message.trim() || null,
          bookingType: form.bookingType,
          customStyle: form.customStyle || null,
          customSize: form.customSize || null,
          customPlacement: form.customPlacement.trim() || null,
          customBudget: form.customBudget || null
        })
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Request failed");
      }
      setDone(true);
      window.dispatchEvent(
        new CustomEvent("suknid:toast", {
          detail: { message: "Booking request sent — we'll be in touch within 48 h." }
        })
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }
  if (done) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-10", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-display text-headline-md mb-3", children: "✓" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-display text-headline-sm text-on-surface mb-2", children: "Request sent" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-body text-on-surface-variant/60 text-xs tracking-[0.06em]", children: "We'll reply within 48 h to confirm availability and next steps." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          className: "btn-secondary mt-6",
          onClick: () => {
            setDone(false);
            setForm((p) => ({ ...p, designId: "", name: "", contact: "", message: "" }));
          },
          children: "Send another request"
        }
      )
    ] });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSubmit, noValidate: true, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "label-bb", children: "Booking type" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 gap-px border border-outline-variant rounded-lg overflow-hidden mt-2", children: [["plate", "Book a plate", "Choose from existing designs"], ["custom", "Custom consultation", "Describe your own tattoo idea"]].map(([val, title, sub]) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          type: "button",
          onClick: () => setType(val),
          className: `text-left px-4 py-3.5 cursor-pointer outline-none transition-colors ${form.bookingType === val ? "bg-surface-container outline outline-1 outline-on-surface-variant" : "bg-surface-container-low"} ${val === "custom" ? "border-l border-outline-variant" : ""}`,
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `font-body text-[11px] tracking-[0.12em] uppercase ${form.bookingType === val ? "text-on-surface" : "text-on-surface-variant"}`, children: title }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-body text-[10px] text-on-surface-variant/60 mt-1 tracking-[0.04em]", children: sub })
          ]
        },
        val
      )) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: "bf-artist", className: "label-bb", children: "Artist" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "select",
        {
          id: "bf-artist",
          className: "input-bb",
          value: form.artistId,
          onChange: (e) => set("artistId", e.target.value),
          children: artists.map((a2) => /* @__PURE__ */ jsxRuntimeExports.jsxs("option", { value: a2.id, children: [
            a2.name,
            " — ",
            a2.style
          ] }, a2.id))
        }
      ),
      selectedArtist && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "font-body text-on-surface-variant/60 text-[11px] mt-2 tracking-[0.06em]", children: [
        selectedArtist.city,
        " · ",
        selectedArtist.booked
      ] })
    ] }),
    form.bookingType === "plate" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: "bf-design", className: "label-bb", children: "Design" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "select",
        {
          id: "bf-design",
          className: "input-bb",
          value: form.designId,
          onChange: (e) => set("designId", e.target.value),
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "— No specific plate selected —" }),
            artistDesigns.map((d) => /* @__PURE__ */ jsxRuntimeExports.jsxs("option", { value: d.id, children: [
              d.title,
              " · ",
              d.placement
            ] }, d.id))
          ]
        }
      ),
      artistDesigns.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-body text-on-surface-variant/60 text-[11px] mt-2", children: "No available plates for this artist right now." })
    ] }),
    form.bookingType === "custom" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-[18px]", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: "bf-style", className: "label-bb", children: "Style preference" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { id: "bf-style", className: "input-bb", value: form.customStyle, onChange: (e) => set("customStyle", e.target.value), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "— Select style —" }),
            STYLES.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: s, children: s }, s))
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: "bf-size", className: "label-bb", children: "Approximate size" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { id: "bf-size", className: "input-bb", value: form.customSize, onChange: (e) => set("customSize", e.target.value), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "— Select size —" }),
            SIZES.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: s.value, children: s.label }, s.value))
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-[18px]", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { htmlFor: "bf-placement", className: "label-bb", children: [
            "Placement ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-primary-container", children: "*" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              id: "bf-placement",
              className: "input-bb",
              type: "text",
              placeholder: "e.g. inner forearm, left calf…",
              value: form.customPlacement,
              onChange: (e) => set("customPlacement", e.target.value)
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: "bf-budget", className: "label-bb", children: "Budget range" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { id: "bf-budget", className: "input-bb", value: form.customBudget, onChange: (e) => set("customBudget", e.target.value), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "— Select budget —" }),
            BUDGETS.map((b) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: b, children: b }, b))
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-[18px]", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { htmlFor: "bf-name", className: "label-bb", children: [
          "Full name ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-primary-container", children: "*" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            id: "bf-name",
            className: "input-bb",
            type: "text",
            placeholder: "Your name",
            value: form.name,
            onChange: (e) => set("name", e.target.value),
            required: true
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { htmlFor: "bf-contact", className: "label-bb", children: [
          "Email or handle ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-primary-container", children: "*" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            id: "bf-contact",
            className: "input-bb",
            type: "text",
            placeholder: "you@email.com or @handle",
            value: form.contact,
            onChange: (e) => set("contact", e.target.value),
            required: true
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: "bf-message", className: "label-bb", children: form.bookingType === "custom" ? "Describe your idea, references, skin notes…" : "Message" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "textarea",
        {
          id: "bf-message",
          className: "input-bb resize-y",
          rows: 4,
          placeholder: form.bookingType === "custom" ? "Share your concept, references, any skin considerations, or anything else the artist should know…" : "Placement, size, references, skin notes, anything the artist should know…",
          value: form.message,
          onChange: (e) => set("message", e.target.value)
        }
      )
    ] }),
    error && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-body text-xs text-primary-container mt-4 px-3.5 py-3 border border-primary-container/40 bg-surface-container-low rounded-lg", children: error }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-7", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "submit", className: "btn-primary", disabled: submitting, children: submitting ? "Sending…" : form.bookingType === "custom" ? "Request consultation" : "Send booking request" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-body text-on-surface-variant/60 text-[10.5px] mt-3.5 tracking-[0.06em]", children: "We'll reply within 48 h to confirm availability and next steps." })
    ] })
  ] });
}
const $$Astro = createAstro();
const $$Booking = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Booking;
  const locale = Astro2.locals?.locale ?? "en";
  const t = createT(locale);
  return renderTemplate`${renderComponent($$result, "Base", $$Base, { "title": "Book a session — SAKNID", "description": "Book a session with one of our resident artists. One-of-one tattoo plates, hand-drawn and inked once." }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="min-h-screen flex flex-col"> ${renderComponent($$result2, "Nav", Nav, { "currentPath": "/booking", "client:load": true, "client:component-hydration": "load", "client:component-path": "/home/vscode/codingZone/tattoo-project/src/components/Nav", "client:component-export": "default" })} <main class="flex-1"> <div class="container-bb"> <a href="/artists" class="inline-flex items-center gap-2 text-on-surface-variant hover:text-on-surface mb-8 font-body text-sm transition-colors">${t("bookingPage.backToArtists")}</a> <span class="kicker font-body text-label-md font-semibold text-primary-container tracking-wider uppercase mb-4 block">${t("bookingPage.kicker")}</span> <div class="flex justify-between items-end flex-wrap gap-4 mb-10"> <div> <h1 class="font-display text-display-lg-mobile md:text-display-lg text-on-surface">${t("bookingPage.title")}</h1> <p class="font-body text-body-lg text-on-surface-variant mt-3.5 max-w-[48ch]">${t("bookingPage.subtitle")}</p> </div> </div> <div class="grid grid-cols-1 lg:grid-cols-[1.3fr_0.7fr] gap-12 items-start"> <div class="card-bb p-8 md:p-9"> ${renderComponent($$result2, "BookingForm", BookingForm, { "artists": ARTISTS, "designs": DESIGNS, "client:load": true, "client:component-hydration": "load", "client:component-path": "/home/vscode/codingZone/tattoo-project/src/components/BookingForm", "client:component-export": "default" })} </div> <div class="flex flex-col gap-px bg-outline-variant border border-outline-variant rounded-lg overflow-hidden"> ${ARTISTS.map((a2) => renderTemplate`<div class="p-5 px-[22px] bg-surface-container-low flex flex-col gap-1.5"> <div class="display font-display font-semibold text-on-surface text-headline-sm">${a2.name}</div> <div class="font-body text-on-surface-variant/60 text-[10.5px] tracking-[0.08em]">${a2.style}</div> <div class="font-body text-on-surface-variant text-label-sm mt-0.5">${a2.city}</div> <div class="mt-2"> <span class="tag-bb"> <span class="w-2 h-2 rounded-full bg-primary-container"></span> ${a2.booked} </span> </div> </div>`)} </div> </div> </div> </main> ${renderComponent($$result2, "Footer", $$Footer, {})} </div> ${renderComponent($$result2, "Toast", Toast, { "client:load": true, "client:component-hydration": "load", "client:component-path": "/home/vscode/codingZone/tattoo-project/src/components/Toast", "client:component-export": "default" })} ` })}`;
}, "/home/vscode/codingZone/tattoo-project/src/pages/booking.astro", void 0);
const $$file = "/home/vscode/codingZone/tattoo-project/src/pages/booking.astro";
const $$url = "/booking";
const _page = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: $$Booking,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: "Module" }));
const page = () => _page;
export {
  page,
  a as renderers
};
