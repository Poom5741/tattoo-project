import { useEffect, useRef, useState, useCallback } from "react";

const FONT_PAIRS = {
  couture: {
    display: '"Bodoni Moda", Georgia, serif',
    mono: '"Space Mono", monospace',
    body: '"Archivo", system-ui, sans-serif',
  },
  editorial: {
    display: '"Playfair Display", Georgia, serif',
    mono: '"JetBrains Mono", monospace',
    body: '"Archivo", system-ui, sans-serif',
  },
  modern: {
    display: '"Spectral", Georgia, serif',
    mono: '"IBM Plex Mono", monospace',
    body: '"IBM Plex Sans", system-ui, sans-serif',
  },
} as const;

const ACCENTS = {
  bone: { accent: "#f4f1ea", ok: "#b9d8c4" },
  ember: { accent: "oklch(0.74 0.15 48)", ok: "oklch(0.74 0.15 48)" },
  jade: { accent: "oklch(0.78 0.12 165)", ok: "oklch(0.78 0.12 165)" },
} as const;

const TWEAKS_KEY = "inknoir.v2.tweaks";

interface TweakValues {
  fontPair: keyof typeof FONT_PAIRS;
  texture: "grain" | "scan" | "hatch" | "none";
  accent: keyof typeof ACCENTS;
}

const DEFAULTS: TweakValues = {
  fontPair: "couture",
  texture: "grain",
  accent: "bone",
};

function loadTweaks(): TweakValues {
  try {
    const raw = localStorage.getItem(TWEAKS_KEY);
    return raw ? { ...DEFAULTS, ...JSON.parse(raw) } : DEFAULTS;
  } catch {
    return DEFAULTS;
  }
}

const TWEAKS_STYLE = `
  .twk-panel{position:fixed;right:16px;bottom:16px;z-index:2147483646;width:280px;
    max-height:calc(100vh - 32px);display:flex;flex-direction:column;
    transform:scale(var(--dc-inv-zoom,1));transform-origin:bottom right;
    background:rgba(250,249,247,.78);color:#29261b;
    -webkit-backdrop-filter:blur(24px) saturate(160%);backdrop-filter:blur(24px) saturate(160%);
    border:.5px solid rgba(255,255,255,.6);border-radius:14px;
    box-shadow:0 1px 0 rgba(255,255,255,.5) inset,0 12px 40px rgba(0,0,0,.18);
    font:11.5px/1.4 ui-sans-serif,system-ui,-apple-system,sans-serif;overflow:hidden}
  .twk-hd{display:flex;align-items:center;justify-content:space-between;
    padding:10px 8px 10px 14px;cursor:move;user-select:none}
  .twk-hd b{font-size:12px;font-weight:600;letter-spacing:.01em}
  .twk-x{appearance:none;border:0;background:transparent;color:rgba(41,38,27,.55);
    width:22px;height:22px;border-radius:6px;cursor:default;font-size:13px;line-height:1}
  .twk-x:hover{background:rgba(0,0,0,.06);color:#29261b}
  .twk-body{padding:2px 14px 14px;display:flex;flex-direction:column;gap:10px;
    overflow-y:auto;overflow-x:hidden;min-height:0}
  .twk-row{display:flex;flex-direction:column;gap:5px}
  .twk-lbl{display:flex;justify-content:space-between;align-items:baseline;color:rgba(41,38,27,.72)}
  .twk-lbl>span:first-child{font-weight:500}
  .twk-sect{font-size:10px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;
    color:rgba(41,38,27,.45);padding:10px 0 0}
  .twk-sect:first-child{padding-top:0}
  .twk-field{appearance:none;box-sizing:border-box;width:100%;height:26px;padding:0 8px;
    border:.5px solid rgba(0,0,0,.1);border-radius:7px;
    background:rgba(255,255,255,.6);color:inherit;font:inherit;outline:none}
  .twk-field:focus{border-color:rgba(0,0,0,.25)}
  select.twk-field{padding-right:22px;
    background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'><path fill='rgba(0,0,0,.5)' d='M0 0h10L5 6z'/></svg>");
    background-repeat:no-repeat;background-position:right 8px center}
  .twk-seg{position:relative;display:flex;padding:2px;border-radius:8px;
    background:rgba(0,0,0,.06);user-select:none}
  .twk-seg-thumb{position:absolute;top:2px;bottom:2px;border-radius:6px;
    background:rgba(255,255,255,.9);box-shadow:0 1px 2px rgba(0,0,0,.12);
    transition:left .15s cubic-bezier(.3,.7,.4,1),width .15s}
  .twk-seg button{appearance:none;position:relative;z-index:1;flex:1;border:0;
    background:transparent;color:inherit;font:inherit;font-weight:500;min-height:22px;
    border-radius:6px;cursor:default;padding:4px 6px;line-height:1.2}
  .twk-chips{display:flex;gap:6px}
  .twk-chip{position:relative;appearance:none;flex:1;height:46px;padding:0;border:0;
    border-radius:6px;overflow:hidden;cursor:default;
    box-shadow:0 0 0 .5px rgba(0,0,0,.12),0 1px 2px rgba(0,0,0,.06);
    transition:transform .12s,box-shadow .12s}
  .twk-chip[data-on="1"]{box-shadow:0 0 0 1.5px rgba(0,0,0,.85),0 2px 6px rgba(0,0,0,.15)}
`;

interface SegmentedProps {
  value: string;
  options: { label: string; value: string }[];
  onChange: (v: string) => void;
}

function Segmented({ value, options, onChange }: SegmentedProps) {
  const idx = Math.max(0, options.findIndex((o) => o.value === value));
  const n = options.length;
  return (
    <div className="twk-seg">
      <div
        className="twk-seg-thumb"
        style={{
          left: `calc(2px + ${idx} * (100% - 4px) / ${n})`,
          width: `calc((100% - 4px) / ${n})`,
        }}
      />
      {options.map((o) => (
        <button key={o.value} type="button" onClick={() => onChange(o.value)}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

export default function TweaksPanel() {
  const [open, setOpen] = useState(false);
  const [t, setValues] = useState<TweakValues>(DEFAULTS);
  const dragRef = useRef<HTMLDivElement>(null);
  const offsetRef = useRef({ x: 16, y: 16 });
  const PAD = 16;

  useEffect(() => {
    setValues(loadTweaks());
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(TWEAKS_KEY, JSON.stringify(t));
    } catch {}
    const r = document.documentElement.style;
    const fp = FONT_PAIRS[t.fontPair] || FONT_PAIRS.couture;
    r.setProperty("--font-display", fp.display);
    r.setProperty("--font-mono", fp.mono);
    r.setProperty("--font-body", fp.body);
    const ac = ACCENTS[t.accent] || ACCENTS.bone;
    r.setProperty("--accent", ac.accent);
    r.setProperty("--ok", ac.ok);
    window.dispatchEvent(new CustomEvent("inknoir:texture", { detail: t.texture }));
  }, [t]);

  const setTweak = <K extends keyof TweakValues>(key: K, val: TweakValues[K]) => {
    setValues((prev) => ({ ...prev, [key]: val }));
  };

  const clampToViewport = useCallback(() => {
    const panel = dragRef.current;
    if (!panel) return;
    const w = panel.offsetWidth, h = panel.offsetHeight;
    const maxRight = Math.max(PAD, window.innerWidth - w - PAD);
    const maxBottom = Math.max(PAD, window.innerHeight - h - PAD);
    offsetRef.current = {
      x: Math.min(maxRight, Math.max(PAD, offsetRef.current.x)),
      y: Math.min(maxBottom, Math.max(PAD, offsetRef.current.y)),
    };
    panel.style.right = offsetRef.current.x + "px";
    panel.style.bottom = offsetRef.current.y + "px";
  }, []);

  useEffect(() => {
    if (!open) return;
    clampToViewport();
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(clampToViewport) : null;
    if (ro) {
      ro.observe(document.documentElement);
      return () => ro.disconnect();
    }
    window.addEventListener("resize", clampToViewport);
    return () => window.removeEventListener("resize", clampToViewport);
  }, [open, clampToViewport]);

  useEffect(() => {
    const onMsg = (e: MessageEvent) => {
      const type = e?.data?.type;
      if (type === "__activate_edit_mode") setOpen(true);
      else if (type === "__deactivate_edit_mode") setOpen(false);
    };
    window.addEventListener("message", onMsg);
    window.parent.postMessage({ type: "__edit_mode_available" }, "*");
    return () => window.removeEventListener("message", onMsg);
  }, []);

  const dismiss = () => {
    setOpen(false);
    window.parent.postMessage({ type: "__edit_mode_dismissed" }, "*");
  };

  const onDragStart = (e: React.MouseEvent) => {
    const panel = dragRef.current;
    if (!panel) return;
    const r = panel.getBoundingClientRect();
    const sx = e.clientX, sy = e.clientY;
    const startRight = window.innerWidth - r.right;
    const startBottom = window.innerHeight - r.bottom;
    const move = (ev: MouseEvent) => {
      offsetRef.current = {
        x: startRight - (ev.clientX - sx),
        y: startBottom - (ev.clientY - sy),
      };
      clampToViewport();
    };
    const up = () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", up);
    };
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
  };

  if (!open) return null;

  return (
    <>
      <style>{TWEAKS_STYLE}</style>
      <div
        ref={dragRef}
        className="twk-panel"
        style={{ right: offsetRef.current.x, bottom: offsetRef.current.y }}
      >
        <div className="twk-hd" onMouseDown={onDragStart}>
          <b>Tweaks</b>
          <button className="twk-x" onMouseDown={(e) => e.stopPropagation()} onClick={dismiss}>
            ✕
          </button>
        </div>
        <div className="twk-body">
          <div className="twk-sect">Typeface</div>
          <div className="twk-row">
            <div className="twk-lbl"><span>Pairing</span></div>
            <Segmented
              value={t.fontPair}
              options={[
                { label: "Couture", value: "couture" },
                { label: "Editorial", value: "editorial" },
                { label: "Modern", value: "modern" },
              ]}
              onChange={(v) => setTweak("fontPair", v as keyof typeof FONT_PAIRS)}
            />
          </div>
          <div className="twk-sect">Atmosphere</div>
          <div className="twk-row">
            <div className="twk-lbl"><span>Background texture</span></div>
            <select
              className="twk-field"
              value={t.texture}
              onChange={(e) => setTweak("texture", e.target.value as TweakValues["texture"])}
            >
              <option value="grain">Film grain</option>
              <option value="scan">Scanlines</option>
              <option value="hatch">Fine hatch</option>
              <option value="none">None</option>
            </select>
          </div>
          <div className="twk-row">
            <div className="twk-lbl"><span>Accent</span></div>
            <div className="twk-chips" role="radiogroup">
              {(Object.keys(ACCENTS) as (keyof typeof ACCENTS)[]).map((key) => {
                const on = t.accent === key;
                return (
                  <button
                    key={key}
                    type="button"
                    className="twk-chip"
                    data-on={on ? "1" : "0"}
                    style={{ background: ACCENTS[key].accent }}
                    onClick={() => setTweak("accent", key)}
                    title={key}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
