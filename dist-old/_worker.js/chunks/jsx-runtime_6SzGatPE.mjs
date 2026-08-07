globalThis.process ??= {};
globalThis.process.env ??= {};
import { c as createComponent, g as addAttribute, j as renderHead, k as renderSlot, h as renderScript, a as renderTemplate, l as defineScriptVars, f as createAstro } from "./astro/server_B1Q-Dpks.mjs";
/* empty css                         */
import { b as requireReact } from "./_@astro-renderers_B6-rS8YJ.mjs";
var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(cooked.slice()) }));
var _a;
const $$Astro = createAstro();
const $$Base = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Base;
  const { title = "SAKNID — One-of-one tattoo plates", description = "One-of-one tattoo plates. Blockchain-verified ownership." } = Astro2.props;
  const locale = Astro2.locals?.locale ?? "en";
  const widgetBlockedPrefixes = ["/admin", "/checkout", "/wallet"];
  const isBlocked = widgetBlockedPrefixes.some((p) => Astro2.url.pathname.startsWith(p));
  const tawkProperty = void 0;
  const tawkWidget = void 0;
  const showTawk = !isBlocked && Boolean(tawkProperty) && Boolean(tawkWidget);
  const tawkSrc = showTawk ? `https://embed.tawk.to/${tawkProperty}/${tawkWidget}` : null;
  return renderTemplate`<html${addAttribute(locale, "lang")}${addAttribute(locale, "data-locale")}> <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><link rel="alternate" hreflang="en"${addAttribute(Astro2.url.origin + Astro2.url.pathname, "href")}><link rel="alternate" hreflang="th"${addAttribute(Astro2.url.origin + Astro2.url.pathname, "href")}><link rel="alternate" hreflang="x-default"${addAttribute(Astro2.url.origin + Astro2.url.pathname, "href")}><title>${title}</title><meta name="description"${addAttribute(description, "content")}><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Sora:wght@300;400;500;600;700&display=swap" rel="stylesheet">${renderHead()}</head> <body> ${renderSlot($$result, $$slots["default"])} ${renderScript($$result, "/home/vscode/codingZone/tattoo-project/src/layouts/Base.astro?astro&type=script&index=0&lang.ts")} ${showTawk && renderTemplate(_a || (_a = __template(["<script>(function(){", '\n          var Tawk_API = Tawk_API || {},\n            Tawk_LoadStart = new Date();\n          (function () {\n            var s1 = document.createElement("script"),\n              s0 = document.getElementsByTagName("script")[0];\n            s1.async = true;\n            s1.src = tawkSrc;\n            s1.charset = "UTF-8";\n            s1.crossOrigin = "anonymous";\n            s0.parentNode.insertBefore(s1, s0);\n          })();\n        })();<\/script>'])), defineScriptVars({ tawkSrc }))} </body> </html>`;
}, "/home/vscode/codingZone/tattoo-project/src/layouts/Base.astro", void 0);
var jsxRuntime = { exports: {} };
var reactJsxRuntime_production_min = {};
/**
 * @license React
 * react-jsx-runtime.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var hasRequiredReactJsxRuntime_production_min;
function requireReactJsxRuntime_production_min() {
  if (hasRequiredReactJsxRuntime_production_min) return reactJsxRuntime_production_min;
  hasRequiredReactJsxRuntime_production_min = 1;
  var f = requireReact(), k = Symbol.for("react.element"), l = Symbol.for("react.fragment"), m = Object.prototype.hasOwnProperty, n = f.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner, p = { key: true, ref: true, __self: true, __source: true };
  function q(c, a, g) {
    var b, d = {}, e = null, h = null;
    void 0 !== g && (e = "" + g);
    void 0 !== a.key && (e = "" + a.key);
    void 0 !== a.ref && (h = a.ref);
    for (b in a) m.call(a, b) && !p.hasOwnProperty(b) && (d[b] = a[b]);
    if (c && c.defaultProps) for (b in a = c.defaultProps, a) void 0 === d[b] && (d[b] = a[b]);
    return { $$typeof: k, type: c, key: e, ref: h, props: d, _owner: n.current };
  }
  reactJsxRuntime_production_min.Fragment = l;
  reactJsxRuntime_production_min.jsx = q;
  reactJsxRuntime_production_min.jsxs = q;
  return reactJsxRuntime_production_min;
}
var hasRequiredJsxRuntime;
function requireJsxRuntime() {
  if (hasRequiredJsxRuntime) return jsxRuntime.exports;
  hasRequiredJsxRuntime = 1;
  {
    jsxRuntime.exports = requireReactJsxRuntime_production_min();
  }
  return jsxRuntime.exports;
}
var jsxRuntimeExports = requireJsxRuntime();
export {
  $$Base as $,
  jsxRuntimeExports as j
};
