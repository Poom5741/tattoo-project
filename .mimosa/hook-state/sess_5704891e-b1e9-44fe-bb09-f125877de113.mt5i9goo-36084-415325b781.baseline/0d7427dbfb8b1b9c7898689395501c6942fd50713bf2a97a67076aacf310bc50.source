import { useEffect, useState } from "react";

type Texture = "grain" | "scan" | "hatch" | "none";

function loadTexture(): Texture {
  try {
    const raw = localStorage.getItem("suknid.v2.tweaks");
    if (raw) {
      const parsed = JSON.parse(raw);
      return parsed.texture || "grain";
    }
  } catch {}
  return "grain";
}

export default function TextureLayer() {
  const [texture, setTexture] = useState<Texture>("grain");

  useEffect(() => {
    setTexture(loadTexture());
    const handler = (e: Event) => {
      const t = (e as CustomEvent<Texture>).detail;
      if (t) setTexture(t);
    };
    window.addEventListener("suknid:texture", handler);
    return () => window.removeEventListener("suknid:texture", handler);
  }, []);

  return (
    <div className={"tex" + (texture && texture !== "none" ? " tex--" + texture : "")} />
  );
}
