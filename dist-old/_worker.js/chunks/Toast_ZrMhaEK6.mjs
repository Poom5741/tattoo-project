globalThis.process ??= {};
globalThis.process.env ??= {};
import { j as jsxRuntimeExports } from "./jsx-runtime_6SzGatPE.mjs";
import { r as reactExports } from "./_@astro-renderers_B6-rS8YJ.mjs";
function Toast() {
  const [msg, setMsg] = reactExports.useState(null);
  reactExports.useEffect(() => {
    const show = (e) => {
      const detail = e.detail;
      setMsg(detail.message);
      setTimeout(() => setMsg(null), 2600);
    };
    window.addEventListener("suknid:toast", show);
    return () => window.removeEventListener("suknid:toast", show);
  }, []);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `fixed bottom-6 right-6 bg-[#F0EBE1] text-[#1B1C18] px-6 py-3 rounded-lg shadow-lg border border-[#E8E3D8] font-sora text-sm flex items-center gap-3 transition-all duration-300 ${msg ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"}`, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { width: "16", height: "16", viewBox: "0 0 16 16", fill: "none", className: "text-[#2E7D32]", children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M3 8.5l3.2 3L13 5", stroke: "currentColor", strokeWidth: "1.4" }) }),
    msg
  ] });
}
export {
  Toast as T
};
