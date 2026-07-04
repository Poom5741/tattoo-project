import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { usePrivy } from "@privy-io/react-auth";
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
  const { login } = usePrivy();
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
      <div className="border border-[#E8E3D8] p-12 md:p-20 text-center bg-[#F0EBE1] rounded-lg">
        <div className="w-14 h-14 rounded-full bg-[#E60023] text-white flex items-center justify-center font-sora font-bold text-lg mx-auto mb-5" style={{ width: 52, height: 52 }}>⬡</div>
        <h3 className="font-playfair font-semibold text-[#1B1C18] text-[30px]">Connect your wallet</h3>
        <p className="text-[#5A5B55] text-sm mt-3 mx-auto mb-7 max-w-[38ch]">
          Connect to see plates you own on-chain.
        </p>
        <button className="inline-flex items-center justify-center gap-2 px-8 py-4 text-base rounded-full font-sora font-semibold text-sm transition-all bg-[#E60023] text-white hover:bg-[#C4001F] disabled:opacity-40" onClick={login}>Connect & Sign in</button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-center py-16 font-sora text-sm text-[#5A5B55]">
        Loading your collection…
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10">
        <p className="font-sora text-[13px] text-red-500/80">{error}</p>
      </div>
    );
  }

  if (plates.length === 0) {
    return (
      <div className="border border-[#E8E3D8] p-12 md:p-20 text-center bg-[#F0EBE1] rounded-lg">
        <div className="w-14 h-14 rounded-full bg-[#E60023] text-white flex items-center justify-center font-sora font-bold text-lg mx-auto mb-5" style={{ width: 52, height: 52 }}>⬡</div>
        <h3 className="font-playfair font-semibold text-[#1B1C18] text-[30px]">Nothing held yet</h3>
        <p className="text-[#5A5B55] text-sm mt-3 mx-auto mb-7 max-w-[38ch]">
          Claim a one-of-one plate and its certificate of authenticity will live here.
        </p>
        <a href="/market" className="inline-flex items-center justify-center gap-2 px-8 py-4 text-base rounded-full font-sora font-semibold text-sm transition-all bg-[#E60023] text-white hover:bg-[#C4001F] disabled:opacity-40">Enter the gallery →</a>
      </div>
    );
  }

  const totalValue = plates.reduce((s, d) => s + (d.price ?? 0), 0);

  return (
    <div>
      <div className="flex gap-8 mb-10">
        <div>
          <div className="font-playfair font-semibold text-[#1B1C18] text-[28px]">{plates.length}</div>
          <div className="font-sora text-[#5A5B55]/60 text-[10px] tracking-[0.12em] uppercase mt-1">Plates</div>
        </div>
        <div>
          <div className="font-playfair font-semibold text-[#1B1C18] text-[28px]">{totalValue.toFixed(3)} ETH</div>
          <div className="font-sora text-[#5A5B55]/60 text-[10px] tracking-[0.12em] uppercase mt-1">Value</div>
        </div>
      </div>

      {plates.map((d) => (
        <div
          className="flex items-center gap-6 p-6 border-b border-[#E8E3D8]/30 hover:bg-[#F5F0E8] transition-colors cursor-pointer"
          key={d.id}
          onClick={() => { window.location.href = `/design/${d.id}`; }}
        >
          <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
            <Plate seed={d.seed ?? 0} density={1} />
          </div>
          <div>
            <h3 className="font-playfair font-semibold text-[#1B1C18] text-[22px]">{d.title}</h3>
            <div className="font-sora text-[#5A5B55] text-[11.5px] mt-1.5 tracking-[0.04em]">
              {d.style} · № {d.n}/001 · {d.token ?? ""}
            </div>
            <div className="mt-2.5">
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border bg-[#2E7D32]/15 text-[#2E7D32] border-[#2E7D32]/40"><span className="w-2 h-2 rounded-full bg-current"></span>In collection</span>
            </div>
          </div>
          <div className="ml-auto flex-shrink-0">
            <a href={`/design/${d.id}`} className="inline-flex items-center justify-center gap-2 px-7 py-3 rounded-full font-sora font-semibold text-sm transition-all bg-transparent text-[#1B1C18] border border-[#E8E3D8] hover:border-[#D4CFC4]" onClick={(e) => e.stopPropagation()}>
              View plate →
            </a>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function WalletOwnedPlates() {
  return (
    <WalletProvider>
      <WalletOwnedPlatesInner />
    </WalletProvider>
  );
}
