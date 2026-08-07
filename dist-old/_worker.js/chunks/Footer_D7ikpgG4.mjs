globalThis.process ??= {};
globalThis.process.env ??= {};
import { j as jsxRuntimeExports } from "./jsx-runtime_6SzGatPE.mjs";
import { r as reactExports } from "./_@astro-renderers_B6-rS8YJ.mjs";
import { u as usePasskeyWallet, p as parseBackupFile, a as authClient, d as downloadBackupFromD1, P as PasskeyWalletProvider } from "./PasskeyWalletContext_weVkuNv0.mjs";
import { i as isSupportedLocale, l as localeCookieValue, c as createT } from "./index_LvGhOnDK.mjs";
import { c as createComponent, m as maybeRenderHead, a as renderTemplate } from "./astro/server_B1Q-Dpks.mjs";
function WalletManage({ open, onClose }) {
  const { status, address, createWallet, unlock, lock, importBackup } = usePasskeyWallet();
  const fileInputRef = reactExports.useRef(null);
  const [importError, setImportError] = reactExports.useState(null);
  const [restoreError, setRestoreError] = reactExports.useState(null);
  const [restoreLoading, setRestoreLoading] = reactExports.useState(false);
  if (!open) return null;
  const handleImport = async () => {
    setImportError(null);
    try {
      const file = fileInputRef.current?.files?.[0];
      if (!file) return;
      const backup = await parseBackupFile(file);
      importBackup({
        daccPublickey: backup.daccPublicKey,
        address: backup.address,
        encryptedPasswordSecretKey: backup.encryptedPasswordSecretKey
      });
      onClose();
    } catch (e) {
      const message = e instanceof Error ? e.message : "Could not read backup file.";
      setImportError(message);
    }
  };
  const handleRestoreFromCloud = async () => {
    setRestoreError(null);
    setRestoreLoading(true);
    try {
      const session = await authClient.getSession();
      if (!session.data?.user) {
        setRestoreError("Sign in with Google first to restore from cloud.");
        return;
      }
      const password = window.prompt("Enter your recovery password:");
      if (!password) return;
      const backup = await downloadBackupFromD1(password);
      importBackup({
        daccPublickey: backup.daccPublicKey,
        address: backup.address,
        encryptedPasswordSecretKey: backup.encryptedPasswordSecretKey
      });
      onClose();
    } catch (e) {
      const message = e instanceof Error ? e.message : "Restore failed";
      setRestoreError(message);
    } finally {
      setRestoreLoading(false);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "div",
    {
      className: "fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm",
      onClick: onClose,
      children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          className: "bg-surface-container-low rounded-2xl p-6 w-[360px] max-w-[90vw] shadow-2xl",
          onClick: (e) => e.stopPropagation(),
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center mb-6", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display text-headline-sm text-on-surface", children: "Wallet" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  onClick: onClose,
                  className: "text-on-surface-variant hover:text-on-surface",
                  "aria-label": "Close",
                  children: "✕"
                }
              )
            ] }),
            status === "loading" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-4 items-center py-8", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-8 h-8 border-2 border-primary-container border-t-transparent rounded-full animate-spin" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-body text-body-md text-on-surface-variant", children: "Creating wallet…" })
            ] }),
            status === "none" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-body text-body-md text-on-surface-variant", children: "Create a self-custodial wallet secured by your device's biometrics." }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  className: "btn-primary w-full",
                  onClick: createWallet,
                  children: "Create Wallet"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 mt-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("hr", { className: "flex-1 border-outline-variant/30" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-body text-xs text-on-surface-variant/60", children: "or" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("hr", { className: "flex-1 border-outline-variant/30" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "input",
                {
                  ref: fileInputRef,
                  type: "file",
                  accept: ".json,application/json",
                  className: "hidden",
                  onChange: handleImport
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  className: "btn-secondary w-full",
                  onClick: () => fileInputRef.current?.click(),
                  children: "Import from Backup"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  className: "btn-secondary w-full",
                  onClick: handleRestoreFromCloud,
                  disabled: restoreLoading,
                  children: restoreLoading ? "Restoring…" : "Restore from Cloud"
                }
              ),
              importError && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-body text-sm text-error", children: importError }),
              restoreError && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-body text-sm text-error", children: restoreError })
            ] }),
            status === "locked" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-body text-body-md text-on-surface-variant", children: "Use your device biometrics to unlock your wallet." }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "btn-primary w-full", onClick: unlock, children: "Unlock Wallet" })
            ] }),
            status === "unlocked" && address && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "card-bb p-4 bg-surface-dim/50", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-body text-label-sm text-on-surface-variant/60 uppercase tracking-wider mb-1", children: "Address" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-mono text-sm text-on-surface break-all", children: address })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "btn-secondary w-full", onClick: lock, children: "Lock Wallet" })
            ] })
          ]
        }
      )
    }
  );
}
function PasskeyNavButton() {
  const { status, address } = usePasskeyWallet();
  const [modalOpen, setModalOpen] = reactExports.useState(false);
  const label = (() => {
    if (status === "loading") return "Connecting…";
    if (status === "unlocked" && address) {
      return `${address.slice(0, 6)}…${address.slice(-4)}`;
    }
    return "Connect Wallet";
  })();
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "button",
      {
        className: "nav__wallet",
        disabled: status === "loading",
        onClick: () => setModalOpen(true),
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "span",
            {
              className: "dot",
              style: status === "unlocked" ? { background: "#2E7D32" } : status === "loading" ? { background: "#F59E0B", animation: "pulse 1s infinite" } : void 0
            }
          ),
          label
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(WalletManage, { open: modalOpen, onClose: () => setModalOpen(false) })
  ] });
}
const LOCALE_NAMES = {
  en: "EN",
  th: "TH"
};
function LanguageSwitcher() {
  const [locale, setLocale] = reactExports.useState("en");
  reactExports.useEffect(() => {
    const el = document.querySelector("html");
    const val = el?.getAttribute("data-locale");
    if (val && isSupportedLocale(val)) setLocale(val);
  }, []);
  function switchTo(next) {
    setLocale(next);
    document.cookie = localeCookieValue(next);
    window.location.reload();
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-1 border border-outline-variant/40 rounded-full overflow-hidden", children: ["en", "th"].map((lang) => /* @__PURE__ */ jsxRuntimeExports.jsx(
    "button",
    {
      type: "button",
      onClick: () => switchTo(lang),
      className: `px-3 py-1 text-xs font-semibold font-body uppercase transition-colors duration-150 ${locale === lang ? "bg-primary-container text-on-primary-container" : "text-on-surface-variant hover:text-on-surface"}`,
      "aria-label": lang === "en" ? "Switch to English" : "เปลี่ยนเป็นภาษาไทย",
      children: LOCALE_NAMES[lang]
    },
    lang
  )) });
}
function readHtmlLocale() {
  if (typeof document === "undefined") return "en";
  const val = document.querySelector("html")?.getAttribute("data-locale");
  return val && isSupportedLocale(val) ? val : "en";
}
function Nav({ currentPath = "/" }) {
  const [open, setOpen] = reactExports.useState(false);
  const [scrolled, setScrolled] = reactExports.useState(false);
  const [locale] = reactExports.useState(readHtmlLocale);
  const t = createT(locale);
  const links = [
    ["/market", t("nav.gallery")],
    ["/artists", t("nav.artists")],
    ["/booking", t("nav.book")],
    ["/wallet", t("nav.myWallet")],
    ["/artist/portal", t("nav.artistPortal")],
    ["/", t("nav.howItWorks")]
  ];
  reactExports.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  reactExports.useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(PasskeyWalletProvider, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "header",
      {
        className: "w-full sticky top-0 z-50 transition-all duration-300 " + (scrolled ? "bg-surface-container-low/95 backdrop-blur-md shadow-[0_1px_0_0_rgba(147,110,107,0.12)]" : "bg-surface-container-low"),
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs("nav", { className: "flex justify-between items-center w-full px-5 md:px-16 py-4 max-w-container-max mx-auto", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "a",
            {
              href: "/",
              className: "font-display text-2xl md:text-3xl font-bold tracking-tight text-on-surface",
              children: "SAKNID"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "hidden md:flex gap-8 items-center", children: links.map(([href, label]) => {
            const isActive = currentPath === href;
            return /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "a",
              {
                href,
                className: "font-body text-label-md font-semibold transition-colors duration-200 relative py-1 " + (isActive ? "text-on-surface" : "text-on-surface-variant hover:text-on-surface"),
                children: [
                  label,
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "span",
                    {
                      className: "absolute left-0 right-0 bottom-0 h-[2px] bg-primary-container transition-transform duration-200 origin-left " + (isActive ? "scale-x-100" : "scale-x-0"),
                      "aria-hidden": "true"
                    }
                  )
                ]
              },
              href
            );
          }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "hidden md:block", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LanguageSwitcher, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "hidden md:block", children: /* @__PURE__ */ jsxRuntimeExports.jsx(PasskeyNavButton, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                className: "md:hidden flex items-center justify-center w-10 h-10 text-on-surface",
                onClick: () => setOpen(!open),
                "aria-label": open ? "Close menu" : "Open menu",
                "aria-expanded": open,
                children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "relative w-5 h-5", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "span",
                    {
                      className: "absolute left-0 h-[1.5px] w-5 bg-on-surface transition-all duration-300 origin-center " + (open ? "top-[9px] rotate-45" : "top-[3px] rotate-0")
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "span",
                    {
                      className: "absolute left-0 top-[9px] h-[1.5px] w-5 bg-on-surface transition-all duration-300 " + (open ? "opacity-0 scale-x-0" : "opacity-100 scale-x-100")
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "span",
                    {
                      className: "absolute left-0 h-[1.5px] w-5 bg-on-surface transition-all duration-300 origin-center " + (open ? "top-[9px] -rotate-45" : "top-[15px] rotate-0")
                    }
                  )
                ] })
              }
            )
          ] })
        ] })
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        className: "fixed inset-0 z-40 bg-black/20 backdrop-blur-sm transition-opacity duration-300 md:hidden " + (open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"),
        onClick: () => setOpen(false),
        "aria-hidden": "true"
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        className: "fixed top-0 right-0 z-40 h-full w-[300px] max-w-[85vw] bg-surface-container-low shadow-2xl flex flex-col pt-20 px-6 pb-8 transition-transform duration-300 ease-out md:hidden " + (open ? "translate-x-0" : "translate-x-full"),
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("nav", { className: "flex flex-col gap-1", children: links.map(([href, label]) => {
            const isActive = currentPath === href;
            return /* @__PURE__ */ jsxRuntimeExports.jsx(
              "a",
              {
                href,
                onClick: () => setOpen(false),
                className: "font-body text-body-lg py-3 px-3 rounded-lg transition-colors duration-200 " + (isActive ? "text-on-surface bg-surface-container-high font-semibold" : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high/60"),
                children: label
              },
              href
            );
          }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-6 px-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(PasskeyNavButton, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-4 px-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LanguageSwitcher, {}) })
        ]
      }
    )
  ] });
}
const $$Footer = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${maybeRenderHead()}<footer class="bg-surface-container-low w-full mt-20 border-t border-outline-variant/30"> <div class="max-w-container-max mx-auto px-5 md:px-16 py-14"> <div class="flex flex-col md:flex-row justify-between gap-12"> <div class="max-w-xs"> <a href="/" class="font-display text-2xl font-bold tracking-tight text-on-surface">SAKNID</a> <p class="font-body text-sm text-on-surface-variant mt-4 leading-relaxed">
A gallery of one-of-one tattoo plates. Each design is drawn once, claimed once, and inked by its maker. No repeats, ever.
</p> </div> <div class="grid grid-cols-3 gap-8 md:gap-16"> <div> <h5 class="font-body text-label-md font-semibold text-on-surface mb-4 uppercase tracking-wider">Gallery</h5> <div class="flex flex-col gap-2.5"> <a href="/market" class="font-body text-sm text-on-surface-variant hover:text-primary-container transition-colors duration-200">Browse plates</a> <a href="/market" class="font-body text-sm text-on-surface-variant hover:text-primary-container transition-colors duration-200">New releases</a> <a href="/wallet" class="font-body text-sm text-on-surface-variant hover:text-primary-container transition-colors duration-200">Your collection</a> </div> </div> <div> <h5 class="font-body text-label-md font-semibold text-on-surface mb-4 uppercase tracking-wider">Artists</h5> <div class="flex flex-col gap-2.5"> <a href="/artists" class="font-body text-sm text-on-surface-variant hover:text-primary-container transition-colors duration-200">The roster</a> <a href="/artists" class="font-body text-sm text-on-surface-variant hover:text-primary-container transition-colors duration-200">Apply to sell</a> <a href="/artists" class="font-body text-sm text-on-surface-variant hover:text-primary-container transition-colors duration-200">Book a session</a> </div> </div> <div> <h5 class="font-body text-label-md font-semibold text-on-surface mb-4 uppercase tracking-wider">House</h5> <div class="flex flex-col gap-2.5"> <a href="/" class="font-body text-sm text-on-surface-variant hover:text-primary-container transition-colors duration-200">How it works</a> <a href="/" class="font-body text-sm text-on-surface-variant hover:text-primary-container transition-colors duration-200">Authenticity</a> <a href="/" class="font-body text-sm text-on-surface-variant hover:text-primary-container transition-colors duration-200">Aftercare</a> </div> </div> </div> </div> <div class="mt-12 pt-6 border-t border-outline-variant/30 flex flex-col md:flex-row justify-between items-center gap-4"> <span class="font-body text-xs text-on-surface-variant">© 2026 SAKNID — house of one-off ink</span> <span class="font-body text-xs text-on-surface-variant">Berlin · Osaka · CDMX · Stockholm</span> </div> </div> </footer>`;
}, "/home/vscode/codingZone/tattoo-project/src/components/Footer.astro", void 0);
export {
  $$Footer as $,
  Nav as N
};
