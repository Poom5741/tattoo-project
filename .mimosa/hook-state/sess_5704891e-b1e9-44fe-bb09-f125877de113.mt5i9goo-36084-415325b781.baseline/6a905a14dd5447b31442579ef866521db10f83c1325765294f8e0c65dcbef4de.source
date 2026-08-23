import { useRef, useState } from "react";

interface DeferredConnectButtonProps {
  onConnect?: () => void;
}

export default function DeferredConnectButton({ onConnect }: DeferredConnectButtonProps) {
  const [loading, setLoading] = useState(false);
  const mountedRef = useRef<HTMLDivElement>(null);

  const handleClick = async () => {
    if (loading) return;
    setLoading(true);
    try {
      // Dynamic import for bundle isolation — T6 (Commerce worker) wires the actual provider
      const { ConnectButton } = await import("@rainbow-me/rainbowkit");
      if (mountedRef.current) {
        const { createRoot } = await import("react-dom/client");
        const root = createRoot(mountedRef.current);
        root.render(<ConnectButton />);
      }
      onConnect?.();
    } catch {
      setLoading(false);
    }
  };

  return (
    <div ref={mountedRef}>
      <button className="nav__wallet" onClick={handleClick} disabled={loading}>
        <span className="dot"></span>
        {loading ? "Connecting…" : "Connect"}
      </button>
    </div>
  );
}
