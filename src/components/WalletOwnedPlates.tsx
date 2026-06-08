import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import type { State } from "wagmi";
import WalletProvider from "./WalletProvider";
import Plate from "./Plate";

interface OwnedPlate {
  id: string;
  n: string;
  title: string;
  artist_id: string;
  style: string | null;
  price: number | null;
  seed: number | null;
  token_id: number | null;
  token: string | null;
}

function WalletOwnedPlatesInner() {
  const { address, isConnected } = useAccount();
  const [plates, setPlates] = useState<OwnedPlate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isConnected || !address) {
      setPlates([]);
      return;
    }
    setLoading(true);
    setError(null);
    fetch(`/api/wallet/${address}`)
      .then((r) => {
        if (!r.ok) throw new Error("Failed to load wallet");
        return r.json() as Promise<OwnedPlate[]>;
      })
      .then((data) => setPlates(data))
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [address, isConnected]);

  if (!isConnected) {
    return (
      <div style={{ border: "1px solid var(--line)", padding: "80px 30px", textAlign: "center", background: "var(--ink-800)" }}>
        <div className="cert__seal" style={{ width: 52, height: 52, margin: "0 auto 22px" }}>⬡</div>
        <h3 className="display" style={{ fontSize: 30 }}>Connect your wallet</h3>
        <p className="dim" style={{ fontSize: 14, margin: "12px auto 28px", maxWidth: "38ch" }}>
          Connect to see plates you own on-chain.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "60px 0" }}>
        <p className="mono dim" style={{ fontSize: 13 }}>Loading your collection…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: "center", padding: "40px 0" }}>
        <p className="mono" style={{ fontSize: 13, color: "rgba(255,60,60,0.8)" }}>{error}</p>
      </div>
    );
  }

  if (plates.length === 0) {
    return (
      <div style={{ border: "1px solid var(--line)", padding: "80px 30px", textAlign: "center", background: "var(--ink-800)" }}>
        <div className="cert__seal" style={{ width: 52, height: 52, margin: "0 auto 22px" }}>⬡</div>
        <h3 className="display" style={{ fontSize: 30 }}>Nothing held yet</h3>
        <p className="dim" style={{ fontSize: 14, margin: "12px auto 28px", maxWidth: "38ch" }}>
          Claim a one-of-one plate and its certificate of authenticity will live here.
        </p>
        <a href="/market" className="btn btn--solid btn--lg">Enter the gallery →</a>
      </div>
    );
  }

  const totalValue = plates.reduce((s, d) => s + (d.price ?? 0), 0);

  return (
    <div>
      <div style={{ display: "flex", gap: 32, marginBottom: 40 }}>
        <div>
          <div className="display" style={{ fontSize: 28 }}>{plates.length}</div>
          <div className="mono faint" style={{ fontSize: 10, letterSpacing: ".12em", textTransform: "uppercase", marginTop: 4 }}>Plates</div>
        </div>
        <div>
          <div className="display" style={{ fontSize: 28 }}>{totalValue.toFixed(3)} ETH</div>
          <div className="mono faint" style={{ fontSize: 10, letterSpacing: ".12em", textTransform: "uppercase", marginTop: 4 }}>Value</div>
        </div>
      </div>

      {plates.map((d) => (
        <div
          className="row"
          key={d.id}
          onClick={() => { window.location.href = `/design/${d.id}`; }}
          style={{ cursor: "pointer" }}
        >
          <div className="row__thumb">
            <Plate seed={d.seed ?? 0} density={1} />
          </div>
          <div>
            <h3 className="display" style={{ fontSize: 22 }}>{d.title}</h3>
            <div className="mono dim" style={{ fontSize: 11.5, marginTop: 6, letterSpacing: ".04em" }}>
              {d.style} · № {d.n}/001 · {d.token ?? ""}
            </div>
            <div style={{ marginTop: 10 }}>
              <span className="tag tag--avail"><span className="dot"></span>In collection</span>
            </div>
          </div>
          <div className="row__cta">
            <a href={`/design/${d.id}`} className="btn btn--ghost" onClick={(e) => e.stopPropagation()}>
              View plate →
            </a>
          </div>
        </div>
      ))}
    </div>
  );
}

interface WalletOwnedPlatesProps {
  initialState?: State;
}

export default function WalletOwnedPlates({ initialState }: WalletOwnedPlatesProps) {
  return (
    <WalletProvider initialState={initialState}>
      <WalletOwnedPlatesInner />
    </WalletProvider>
  );
}
