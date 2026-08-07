globalThis.process ??= {};
globalThis.process.env ??= {};
/* empty css                                 */
import { c as createComponent, r as renderComponent, a as renderTemplate, f as createAstro, m as maybeRenderHead } from "../chunks/astro/server_B1Q-Dpks.mjs";
import { j as jsxRuntimeExports, $ as $$Base } from "../chunks/jsx-runtime_6SzGatPE.mjs";
import { N as Nav, $ as $$Footer } from "../chunks/Footer_D7ikpgG4.mjs";
import { T as Toast } from "../chunks/Toast_ZrMhaEK6.mjs";
import { Q as QueryClientProvider, W as WagmiProvider } from "../chunks/QueryClientProvider_D2Fp2Zh2.mjs";
import { P as PasskeyWalletProvider, u as usePasskeyWallet } from "../chunks/PasskeyWalletContext_weVkuNv0.mjs";
import { q as queryClient, c as config } from "../chunks/wagmi_Qh5pcwov.mjs";
import { r as reactExports } from "../chunks/_@astro-renderers_B6-rS8YJ.mjs";
import { a } from "../chunks/_@astro-renderers_B6-rS8YJ.mjs";
import { P as Plate } from "../chunks/Plate_155EoXFk.mjs";
import { c as createT } from "../chunks/index_LvGhOnDK.mjs";
function WalletProvider({ children }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(PasskeyWalletProvider, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(QueryClientProvider, { client: queryClient, children: /* @__PURE__ */ jsxRuntimeExports.jsx(WagmiProvider, { config, children }) }) });
}
function WalletOwnedPlatesInner() {
  const { address, status } = usePasskeyWallet();
  const [plates, setPlates] = reactExports.useState([]);
  const [loading, setLoading] = reactExports.useState(false);
  const [error, setError] = reactExports.useState(null);
  const isConnected = status === "unlocked" && address !== null;
  reactExports.useEffect(() => {
    if (!isConnected || !address) {
      setPlates([]);
      return;
    }
    setLoading(true);
    setError(null);
    fetch(`/api/wallet/${address}`).then((r) => {
      if (!r.ok) throw new Error("Failed to load wallet");
      return r.json();
    }).then((data) => setPlates(data)).catch((e) => setError(e.message)).finally(() => setLoading(false));
  }, [address, isConnected]);
  if (!isConnected) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "card-bb p-12 md:p-20 text-center bg-surface-container-low", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-[52px] h-[52px] rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-body font-bold text-lg mx-auto mb-5", children: "⬡" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-display text-headline-md text-on-surface", children: "Connect your wallet" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-body text-body-md text-on-surface-variant mt-3 mx-auto mb-7 max-w-[38ch]", children: "Create or unlock your passkey wallet to see plates you own on-chain." })
    ] });
  }
  if (loading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center py-16 font-body text-body-md text-on-surface-variant", children: "Loading your collection…" });
  }
  if (error) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center py-10", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-body text-sm text-error", children: error }) });
  }
  if (plates.length === 0) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "card-bb p-12 md:p-20 text-center bg-surface-container-low", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-[52px] h-[52px] rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-body font-bold text-lg mx-auto mb-5", children: "⬡" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-display text-headline-md text-on-surface", children: "Nothing held yet" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-body text-body-md text-on-surface-variant mt-3 mx-auto mb-7 max-w-[38ch]", children: "Claim a one-of-one plate and its certificate of authenticity will live here." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: "/market", className: "btn-primary", children: "Enter the gallery →" })
    ] });
  }
  const totalValue = plates.reduce((s, d) => s + (d.price ?? 0), 0);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-8 mb-10", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-display text-headline-sm text-on-surface", children: plates.length }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-body text-xs text-on-surface-variant/60 tracking-[0.12em] uppercase mt-1", children: "Plates" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "font-display text-headline-sm text-on-surface", children: [
          totalValue.toFixed(3),
          " ETH"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-body text-xs text-on-surface-variant/60 tracking-[0.12em] uppercase mt-1", children: "Value" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-col gap-4", children: plates.map((d) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        className: "card-bb flex items-center gap-6 p-5 cursor-pointer",
        onClick: () => {
          window.location.href = `/design/${d.id}`;
        },
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-surface-dim", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Plate, { seed: d.seed ?? 0, density: 1 }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-display text-headline-sm text-on-surface", children: d.title }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "font-body text-sm text-on-surface-variant mt-1.5 tracking-[0.04em]", children: [
              d.style,
              " · № ",
              d.n,
              "/001 · ",
              d.token ?? ""
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2.5", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "tag-bb text-green-700 bg-green-700/10", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-2 h-2 rounded-full bg-current" }),
              "In collection"
            ] }) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-shrink-0 hidden sm:block", children: /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: `/design/${d.id}`, className: "btn-secondary", onClick: (e) => e.stopPropagation(), children: "View plate →" }) })
        ]
      },
      d.id
    )) })
  ] });
}
function WalletOwnedPlates() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(WalletProvider, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(WalletOwnedPlatesInner, {}) });
}
const $$Astro = createAstro();
const prerender = false;
const $$Wallet = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Wallet;
  const locale = Astro2.locals?.locale ?? "en";
  const t = createT(locale);
  return renderTemplate`${renderComponent($$result, "Base", $$Base, { "title": "Your Collection — SAKNID", "description": "View your one-of-one tattoo plates." }, { "default": ($$result2) => renderTemplate` ${renderComponent($$result2, "Nav", Nav, { "client:load": true, "currentPath": "/wallet", "client:component-hydration": "load", "client:component-path": "/home/vscode/codingZone/tattoo-project/src/components/Nav", "client:component-export": "default" })} ${renderComponent($$result2, "Toast", Toast, { "client:load": true, "client:component-hydration": "load", "client:component-path": "/home/vscode/codingZone/tattoo-project/src/components/Toast", "client:component-export": "default" })} ${maybeRenderHead()}<section class="py-14 pb-[90px]"> <div class="max-w-container-max mx-auto px-5 md:px-16"> <div class="kicker font-body text-label-md font-semibold text-primary-container tracking-wider uppercase mb-4">${t("walletPage.kicker")}</div> <h1 class="font-display text-display-md text-on-surface mb-8">${t("walletPage.title")}</h1> ${renderComponent($$result2, "WalletOwnedPlates", WalletOwnedPlates, { "client:load": true, "client:component-hydration": "load", "client:component-path": "/home/vscode/codingZone/tattoo-project/src/components/WalletOwnedPlates", "client:component-export": "default" })} </div> </section> ${renderComponent($$result2, "Footer", $$Footer, {})} ` })}`;
}, "/home/vscode/codingZone/tattoo-project/src/pages/wallet.astro", void 0);
const $$file = "/home/vscode/codingZone/tattoo-project/src/pages/wallet.astro";
const $$url = "/wallet";
const _page = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: $$Wallet,
  file: $$file,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: "Module" }));
const page = () => _page;
export {
  page,
  a as renderers
};
