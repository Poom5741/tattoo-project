import { useEffect, useRef } from "react";

const STYLE_KIND: Record<string, number> = {
  Geometric: 0,
  Blackwork: 1,
  "Fine Line": 2,
  Irezumi: 3,
  "Neo-Trad": 3,
  Realism: 4,
  Lettering: 5,
};

function mulberry32(a: number) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface PlateProps {
  seed?: number;
  label?: string;
  index?: string | number;
  density?: number;
  kind?: number | string;
  className?: string;
}

export default function Plate({ seed = 1, label, index, density = 1.0, kind, className }: PlateProps) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = canvas.getBoundingClientRect();
    const W = Math.max(rect.width, 160);
    const H = Math.max(rect.height, 200);
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    const ctx = canvas.getContext("2d")!;
    ctx.scale(dpr, dpr);
    const rnd = mulberry32(seed * 100 + 7);
    const INK = (a: number) => `rgba(236,233,227,${a})`;

    ctx.fillStyle = "#060607";
    ctx.fillRect(0, 0, W, H);
    const vg = ctx.createRadialGradient(W / 2, H * 0.42, 10, W / 2, H * 0.42, Math.max(W, H) * 0.7);
    vg.addColorStop(0, "rgba(236,233,227,0.05)");
    vg.addColorStop(1, "rgba(236,233,227,0)");
    ctx.fillStyle = vg;
    ctx.fillRect(0, 0, W, H);

    const cx = W / 2, cy = H * 0.44;
    const R = Math.min(W, H) * 0.32;
    const resolvedKind = typeof kind === "string" ? STYLE_KIND[kind] : kind;
    const variant = (typeof resolvedKind === "number" ? resolvedKind : seed) % 6;

    const wash = (x: number, y: number, r: number, op: number) => {
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, INK(op));
      g.addColorStop(0.6, INK(op * 0.4));
      g.addColorStop(1, INK(0));
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    };

    const stipple = (n: number, spread: number, maxR: number) => {
      for (let i = 0; i < n; i++) {
        const a = rnd() * Math.PI * 2, d = Math.pow(rnd(), 0.6) * spread;
        ctx.globalAlpha = 0.1 + rnd() * 0.45;
        ctx.fillStyle = INK(1);
        ctx.beginPath();
        ctx.arc(cx + Math.cos(a) * d, cy + Math.sin(a) * d, rnd() * maxR + 0.3, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    };

    if (variant === 0) {
      for (let i = 0; i < 5; i++) {
        ctx.strokeStyle = INK(0.18 + i * 0.08);
        ctx.lineWidth = i === 2 ? 1.2 : 0.6;
        ctx.beginPath();
        ctx.arc(cx, cy, R * (0.3 + i * 0.22), 0, Math.PI * 2);
        ctx.stroke();
      }
      const spokes = 16;
      ctx.strokeStyle = INK(0.16);
      for (let i = 0; i < spokes; i++) {
        const a = (i / spokes) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(a) * R * 0.3, cy + Math.sin(a) * R * 0.3);
        ctx.lineTo(cx + Math.cos(a) * R * 1.12, cy + Math.sin(a) * R * 1.12);
        ctx.stroke();
      }
      stipple(40 * density, R * 0.5, 0.7);
    } else if (variant === 1) {
      for (let i = 0; i < 14 * density; i++) {
        const a = rnd() * Math.PI * 2, d = rnd() * R * 0.7;
        wash(cx + Math.cos(a) * d, cy + Math.sin(a) * d * 1.1, R * (0.4 + rnd() * 0.7), 0.12 + rnd() * 0.16);
      }
      ctx.fillStyle = INK(0.5);
      ctx.beginPath();
      ctx.arc(cx, cy, R * 0.62, 0, Math.PI * 2);
      ctx.fill();
      stipple(120 * density, R * 1.4, 1.1);
    } else if (variant === 2) {
      ctx.strokeStyle = INK(0.45);
      ctx.lineWidth = 0.7;
      for (let i = 0; i < 7; i++) {
        ctx.beginPath();
        let x = cx + (rnd() - 0.5) * R, y = cy - R;
        ctx.moveTo(x, y);
        for (let s = 0; s < 6; s++) {
          x += (rnd() - 0.5) * R * 0.6;
          y += R * 0.3;
          ctx.lineTo(x, y);
        }
        ctx.globalAlpha = 0.3 + rnd() * 0.4;
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
      ctx.beginPath();
      ctx.arc(cx, cy, R * 0.9, 0, Math.PI * 2);
      ctx.strokeStyle = INK(0.3);
      ctx.stroke();
      stipple(24 * density, R * 0.4, 0.6);
    } else if (variant === 3) {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(-0.5);
      for (let i = 0; i < 6; i++) {
        ctx.strokeStyle = INK(0.12 + i * 0.05);
        ctx.lineWidth = 1 + i * 0.3;
        ctx.beginPath();
        for (let x = -R * 1.4; x <= R * 1.4; x += 6) {
          const y = Math.sin(x / (R * 0.4) + i) * R * 0.35 + (i - 3) * R * 0.28;
          x === -R * 1.4 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
      ctx.restore();
      for (let i = 0; i < 6 * density; i++) {
        const a = rnd() * Math.PI * 2;
        wash(cx + Math.cos(a) * R * 0.6, cy + Math.sin(a) * R * 0.6, R * 0.7, 0.08);
      }
      stipple(50 * density, R * 1.1, 0.8);
    } else if (variant === 4) {
      for (let i = 0; i < 9 * density; i++) {
        const a = rnd() * Math.PI * 2, d = rnd() * R * 0.6;
        wash(cx + Math.cos(a) * d, cy + Math.sin(a) * d, R * (0.5 + rnd() * 0.5), 0.07 + rnd() * 0.1);
      }
      stipple(220 * density, R * 1.2, 1.0);
      ctx.strokeStyle = INK(0.25);
      ctx.lineWidth = 0.6;
      ctx.beginPath();
      ctx.arc(cx, cy, R * 0.95, 0, Math.PI * 2);
      ctx.stroke();
    } else {
      for (let i = 0; i < 5; i++) {
        const y = cy + (i - 2) * R * 0.42;
        ctx.strokeStyle = INK(0.3);
        ctx.lineWidth = 0.7;
        ctx.beginPath();
        ctx.moveTo(cx - R * 1.1, y);
        ctx.lineTo(cx + R * 1.1, y);
        ctx.stroke();
        const ticks = 9 + Math.floor(rnd() * 8);
        for (let t = 0; t < ticks; t++) {
          const x = cx - R + (t / ticks) * R * 2;
          const h = (0.3 + rnd() * 0.7) * R * 0.3;
          ctx.globalAlpha = 0.3 + rnd() * 0.5;
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x, y - h);
          ctx.stroke();
        }
      }
      ctx.globalAlpha = 1;
      stipple(40 * density, R * 0.9, 0.7);
    }

    ctx.globalAlpha = 0.4;
    ctx.strokeStyle = INK(0.4);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(cx, cy, R * 1.15, 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = 1;
  }, [seed, density, kind]);

  return (
    <div className={`tile${className ? " " + className : ""}`}>
      <canvas ref={ref}></canvas>
      <div className="tile__frame"></div>
      {(label || index) && (
        <div className="tile__cap">
          <span>{label || "INK PLATE"}</span>
          <span>{index || ""}</span>
        </div>
      )}
    </div>
  );
}
