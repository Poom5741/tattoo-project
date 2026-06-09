import { useState } from "react";
import { useAccount, useReadContract } from "wagmi";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "../lib/config/contract";

interface ResaleButtonProps {
  designId: string;
  tokenId: number;
  appId: string;
}

export default function ResaleButton({ designId, tokenId }: ResaleButtonProps) {
  const { address, isConnected } = useAccount();
  const [showModal, setShowModal] = useState(false);
  const [price, setPrice] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const { data: ownerOf } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: "ownerOf",
    args: [BigInt(tokenId)],
    query: { enabled: isConnected && tokenId > 0 },
  });

  // Only show to the NFT owner
  const isOwner = address && ownerOf &&
    (ownerOf as string).toLowerCase() === address.toLowerCase();

  if (!isConnected || !isOwner) return null;

  if (done) {
    return (
      <div style={{ padding: "12px 16px", background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)", fontSize: 13 }}>
        Listed for resale successfully. Refresh the page to see your listing.
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const askingPrice = Number(price);
    if (!askingPrice || askingPrice <= 0) {
      setError("Please enter a valid price.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/resale/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          designId,
          tokenId,
          askingPrice,
          sellerWallet: address,
        }),
      });
      if (res.ok) {
        setDone(true);
        setShowModal(false);
      } else {
        const err = await res.json() as { error: string };
        setError(err.error ?? "Failed to create listing.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="btn btn--ghost"
        style={{ fontSize: 13 }}
      >
        List for resale
      </button>

      {showModal && (
        <div
          style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)",
            display: "flex", alignItems: "center", justifyContent: "center",
            zIndex: 1000,
          }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false); }}
        >
          <div style={{ width: 360, background: "var(--ink-800)", border: "1px solid var(--line)", padding: 28 }}>
            <div className="mono" style={{ fontSize: 10, letterSpacing: ".2em", textTransform: "uppercase", color: "var(--fg-dim)", marginBottom: 16 }}>
              List for resale
            </div>
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div className="field">
                <label>Asking price (USDT) *</label>
                <input
                  className="input"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={price}
                  onChange={(e) => { setPrice(e.target.value); setError(null); }}
                  placeholder="e.g. 350"
                  autoFocus
                />
              </div>
              {error && (
                <div style={{ fontSize: 12, color: "#ef4444" }}>{error}</div>
              )}
              <div style={{ display: "flex", gap: 10 }}>
                <button
                  type="submit"
                  className="btn btn--solid"
                  disabled={submitting}
                  style={{ flex: 1 }}
                >
                  {submitting ? "Listing…" : "Confirm listing"}
                </button>
                <button
                  type="button"
                  className="btn btn--ghost"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
