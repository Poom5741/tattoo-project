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
    return <p className="dim" style={{ fontSize: 13 }}>Loading earnings…</p>;
  }

  if (error) {
    return <p style={{ color: "#ff4444", fontSize: 13 }}>{error}</p>;
  }

  if (!data || data.recentTransactions.length === 0) {
    return <p className="dim" style={{ fontSize: 13 }}>No earnings yet. Earnings appear here once your designs are sold.</p>;
  }

  return (
    <div>
      {/* Summary cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 1, background: "var(--line)", border: "1px solid var(--line)", marginBottom: 32 }}>
        <div style={{ background: "var(--ink-800)", padding: "20px 22px" }}>
          <div className="display" style={{ fontSize: 28, lineHeight: 1 }}>{fmtUsdt(data.totalPrimary)}</div>
          <div className="mono" style={{ fontSize: 9, letterSpacing: ".2em", textTransform: "uppercase", color: "var(--fg-faint)", marginTop: 6 }}>Primary Sales</div>
        </div>
        <div style={{ background: "var(--ink-800)", padding: "20px 22px" }}>
          <div className="display" style={{ fontSize: 28, lineHeight: 1, color: "var(--ok)" }}>{fmtUsdt(data.totalRoyalties)}</div>
          <div className="mono" style={{ fontSize: 9, letterSpacing: ".2em", textTransform: "uppercase", color: "var(--fg-faint)", marginTop: 6 }}>Royalties</div>
        </div>
        <div style={{ background: "var(--ink-800)", padding: "20px 22px" }}>
          <div className="display" style={{ fontSize: 28, lineHeight: 1 }}>{fmtUsdt(data.totalEarnings)}</div>
          <div className="mono" style={{ fontSize: 9, letterSpacing: ".2em", textTransform: "uppercase", color: "var(--fg-faint)", marginTop: 6 }}>Total Earned</div>
        </div>
      </div>

      {/* Recent transactions table */}
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", border: "1px solid var(--line)" }}>
          <thead>
            <tr>
              {["Date", "Design", "Type", "Amount", "Platform Fee", "Payment", "Tx"].map((h) => (
                <th key={h} style={{ textAlign: "left", padding: "10px 14px", fontSize: 10, fontFamily: "var(--font-mono)", letterSpacing: ".14em", textTransform: "uppercase", color: "var(--fg-faint)", borderBottom: "1px solid var(--line)", background: "var(--ink-850)", whiteSpace: "nowrap" }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.recentTransactions.map((e) => (
              <tr key={e.id} style={{ borderTop: "1px solid var(--line)" }}>
                <td style={{ padding: "10px 14px", fontSize: 12, fontFamily: "var(--font-mono)", color: "var(--fg-dim)", whiteSpace: "nowrap" }}>
                  {fmtDate(e.created_at)}
                </td>
                <td style={{ padding: "10px 14px", fontSize: 13 }}>
                  {e.design_title ? (
                    <a href={`/design/${e.design_id}`} style={{ textDecoration: "underline", textUnderlineOffset: 3 }}>{e.design_title}</a>
                  ) : "—"}
                </td>
                <td style={{ padding: "10px 14px" }}>
                  <span style={{
                    fontSize: 10,
                    fontFamily: "var(--font-mono)",
                    letterSpacing: ".1em",
                    textTransform: "uppercase",
                    padding: "2px 8px",
                    background: e.type === "royalty" ? "rgba(34,197,94,0.15)" : "rgba(201,169,110,0.15)",
                    border: "1px solid var(--line)",
                    color: e.type === "royalty" ? "#22c55e" : "var(--gold)",
                  }}>
                    {e.type === "primary_sale" ? "Sale" : "Royalty"}
                  </span>
                </td>
                <td style={{ padding: "10px 14px", fontSize: 14, fontFamily: "var(--font-display)", color: "var(--ok)" }}>
                  +{fmtUsdt(e.amount)}
                </td>
                <td style={{ padding: "10px 14px", fontSize: 12, fontFamily: "var(--font-mono)", color: "var(--fg-faint)" }}>
                  {fmtUsdt(e.platform_fee)}
                </td>
                <td style={{ padding: "10px 14px", fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--fg-dim)" }}>
                  {e.payment_method === "on_chain" ? "On-chain" : "PaySolution"}
                </td>
                <td style={{ padding: "10px 14px", fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--fg-faint)" }}>
                  {e.tx_hash && e.tx_hash.startsWith("0x") ? (
                    <a
                      href={`https://testnet.bscscan.com/tx/${e.tx_hash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ textDecoration: "underline", textUnderlineOffset: 2 }}
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
