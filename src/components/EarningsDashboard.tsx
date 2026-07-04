import { useState, useEffect } from "react";

interface EarningRow {
  id: string;
  design_id: string | null;
  type: string;
  amount: number;
  platform_fee: number;
  tx_hash: string | null;
  payment_method: string;
  created_at: number;
  design_title: string | null;
}

interface EarningsData {
  totalPrimary: number;
  totalRoyalties: number;
  totalEarnings: number;
  recentTransactions: EarningRow[];
}

function fmtDate(ts: number) {
  return new Date(ts * 1000).toLocaleString("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

function fmtUsdt(n: number) {
  return n.toFixed(2) + " USDT";
}

function shortHash(hash: string | null) {
  if (!hash) return "—";
  if (hash.startsWith("paysolution:")) return hash.replace("paysolution:", "PaySolution #");
  return hash.slice(0, 8) + "…" + hash.slice(-6);
}

export default function EarningsDashboard() {
  const [data, setData] = useState<EarningsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/artist/earnings")
      .then((r) => {
        if (!r.ok) throw new Error("Failed to load earnings");
        return r.json();
      })
      .then((d) => setData(d as EarningsData))
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <p className="text-[#5A5B55] text-[13px]">Loading earnings…</p>;
  }

  if (error) {
    return <p className="text-[#D32F2F] text-[13px]">{error}</p>;
  }

  if (!data || data.recentTransactions.length === 0) {
    return <p className="text-[#5A5B55] text-[13px]">No earnings yet. Earnings appear here once your designs are sold.</p>;
  }

  return (
    <div>
      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-px bg-[#E8E3D8] border border-[#E8E3D8] rounded-lg overflow-hidden mb-8">
        <div className="bg-[#F0EBE1] p-5 md:p-6">
          <div className="font-playfair font-semibold text-[#1B1C18] text-2xl md:text-[28px] leading-none">{fmtUsdt(data.totalPrimary)}</div>
          <div className="font-sora text-[9px] tracking-[0.2em] uppercase text-[#5A5B55]/60 mt-1.5">Primary Sales</div>
        </div>
        <div className="bg-[#F0EBE1] p-5 md:p-6">
          <div className="font-playfair font-semibold text-[#1B1C18] text-2xl md:text-[28px] leading-none text-[#2E7D32]">{fmtUsdt(data.totalRoyalties)}</div>
          <div className="font-sora text-[9px] tracking-[0.2em] uppercase text-[#5A5B55]/60 mt-1.5">Royalties</div>
        </div>
        <div className="bg-[#F0EBE1] p-5 md:p-6">
          <div className="font-playfair font-semibold text-[#1B1C18] text-2xl md:text-[28px] leading-none">{fmtUsdt(data.totalEarnings)}</div>
          <div className="font-sora text-[9px] tracking-[0.2em] uppercase text-[#5A5B55]/60 mt-1.5">Total Earned</div>
        </div>
      </div>

      {/* Recent transactions table */}
      <div className="overflow-x-auto">
        <table className="w-full border border-[#E8E3D8] border-collapse">
          <thead>
            <tr>
              {["Date", "Design", "Type", "Amount", "Platform Fee", "Payment", "Tx"].map((h) => (
                <th key={h} className="font-sora text-[10px] tracking-[0.14em] uppercase text-[#5A5B55]/60 px-4 py-3 text-left border-b border-[#E8E3D8] bg-[#F5F0E8] whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.recentTransactions.map((e) => (
              <tr key={e.id} className="hover:bg-[#F5F0E8]">
                <td className="px-4 py-3 border-b border-[#E8E3D8] text-sm font-sora text-[#5A5B55] whitespace-nowrap">
                  {fmtDate(e.created_at)}
                </td>
                <td className="px-4 py-3 border-b border-[#E8E3D8] text-sm">
                  {e.design_title ? (
                    <a href={`/design/${e.design_id}`} className="underline underline-offset-[3px]">{e.design_title}</a>
                  ) : "—"}
                </td>
                <td className="px-4 py-3 border-b border-[#E8E3D8]">
                  <span className={`inline-flex items-center gap-2 px-2 py-0.5 rounded text-[10px] font-sora font-semibold tracking-[0.1em] uppercase border ${e.type === "royalty" ? "bg-[#2E7D32]/15 text-[#2E7D32] border-[#2E7D32]/40" : "bg-[#8B7355]/15 text-[#8B7355] border-[#8B7355]/40"}`}>
                    {e.type === "primary_sale" ? "Sale" : "Royalty"}
                  </span>
                </td>
                <td className="px-4 py-3 border-b border-[#E8E3D8] text-sm font-playfair text-[#2E7D32]">
                  +{fmtUsdt(e.amount)}
                </td>
                <td className="px-4 py-3 border-b border-[#E8E3D8] text-xs font-sora text-[#5A5B55]/60">
                  {fmtUsdt(e.platform_fee)}
                </td>
                <td className="px-4 py-3 border-b border-[#E8E3D8] text-[11px] font-sora text-[#5A5B55]">
                  {e.payment_method === "on_chain" ? "On-chain" : "PaySolution"}
                </td>
                <td className="px-4 py-3 border-b border-[#E8E3D8] text-[11px] font-sora text-[#5A5B55]/60">
                  {e.tx_hash && e.tx_hash.startsWith("0x") ? (
                    <a
                      href={`https://testnet.bscscan.com/tx/${e.tx_hash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline underline-offset-2"
                    >
                      {shortHash(e.tx_hash)}
                    </a>
                  ) : (
                    shortHash(e.tx_hash)
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
