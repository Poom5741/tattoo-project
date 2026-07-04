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
      <div className="p-3 bg-[#2E7D32]/10 border border-[#2E7D32]/30 text-sm font-sora">
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
        className="inline-flex items-center justify-center gap-2 px-7 py-3 rounded-full font-sora font-semibold text-sm transition-all bg-transparent text-[#1B1C18] border border-[#E8E3D8] hover:border-[#D4CFC4]"
        style={{ fontSize: 13 }}
      >
        List for resale
      </button>

      {showModal && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-[1000]"
          onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false); }}
        >
          <div className="w-[360px] bg-[#F0EBE1] border border-[#E8E3D8] p-7 rounded-lg">
            <div className="font-sora text-[#5A5B55]/60 text-[10px] tracking-[0.2em] uppercase mb-4">
              List for resale
            </div>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
                <div className="text-xs text-red-500">{error}</div>
              )}
              <div className="flex gap-2.5">
                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-2 flex-1 px-7 py-3 rounded-full font-sora font-semibold text-sm transition-all bg-[#E60023] text-white hover:bg-[#C4001F] disabled:opacity-40"
                  disabled={submitting}
                >
                  {submitting ? "Listing…" : "Confirm listing"}
                </button>
                <button
                  type="button"
                  className="inline-flex items-center justify-center gap-2 px-7 py-3 rounded-full font-sora font-semibold text-sm transition-all bg-transparent text-[#1B1C18] border border-[#E8E3D8] hover:border-[#D4CFC4]"
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
