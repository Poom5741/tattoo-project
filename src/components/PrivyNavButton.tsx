import { useRef, useState, useEffect } from "react";

// Deferred load so PrivyProvider never runs on the server (SSR-safe)
export default function PrivyNavButton() {
  const [Loaded, setLoaded] = useState<React.ComponentType | null>(null);
  const tried = useRef(false);

  useEffect(() => {
    if (tried.current) return;
    tried.current = true;
    import("./PrivyNavButtonInner").then((m) => setLoaded(() => m.default));
  }, []);

  if (!Loaded) {
    return (
      <button className="nav__wallet" disabled>
        <span className="dot"></span>
        Connect
      </button>
    );
  }

  return <Loaded />;
}
