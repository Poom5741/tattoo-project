import { useState, useEffect } from "react";

interface PendingDesign {
  id: string;
  n: string;
  title: string;
  style: string | null;
  price: number | null;
  placement: string | null;
  medium: string | null;
  selling_mode: string;
  royalty_pct: number | null;
  image_url: string | null;
  artist_name: string;
  artist_id: string;
}

export default function AdminPendingReview() {
  const [designs, setDesigns] = useState<PendingDesign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionPending, setActionPending] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetch("/api/admin/pending-designs")
      .then((r) => r.json())
      .then((data) => setDesigns(data as PendingDesign[]))
      .catch(() => setError("Failed to load pending designs."))
      .finally(() => setLoading(false));
  }, []);

  async function handleAction(designId: string, action: "approve" | "reject") {
    setActionPending((prev) => new Set(prev).add(designId));
    try {
      const res = await fetch("/api/admin/review-design", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ designId, action }),
      });
      if (res.ok) {
        // Optimistic: remove from list
        setDesigns((prev) => prev.filter((d) => d.id !== designId));
      } else {
        const err = await res.json() as { error: string };
        alert("Action failed: " + (err.error ?? "Unknown error"));
      }
    } catch {
      alert("Network error. Please try again.");
    } finally {
      setActionPending((prev) => {
        const next = new Set(prev);
        next.delete(designId);
        return next;
      });
    }
  }

  if (loading) {
    return <p className="dim" style={{ fontSize: 13 }}>Loading pending designs…</p>;
  }

  if (error) {
    return <p style={{ color: "#ff4444", fontSize: 13 }}>{error}</p>;
  }

  if (designs.length === 0) {
    return <p className="dim" style={{ fontSize: 13 }}>No pending designs.</p>;
  }

  return (
    <div style={{ overflowX: "auto" }}>
      <table className="tbl" style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={{ textAlign: "left", padding: "8px 12px", fontSize: 11 }}>PHOTO</th>
            <th style={{ textAlign: "left", padding: "8px 12px", fontSize: 11 }}>TITLE</th>
            <th style={{ textAlign: "left", padding: "8px 12px", fontSize: 11 }}>ARTIST</th>
            <th style={{ textAlign: "left", padding: "8px 12px", fontSize: 11 }}>PRICE (USDT)</th>
            <th style={{ textAlign: "left", padding: "8px 12px", fontSize: 11 }}>MODE</th>
            <th style={{ textAlign: "left", padding: "8px 12px", fontSize: 11 }}>ROYALTY</th>
            <th style={{ textAlign: "left", padding: "8px 12px", fontSize: 11 }}>ACTIONS</th>
          </tr>
        </thead>
        <tbody>
          {designs.map((d) => (
            <tr key={d.id} style={{ borderTop: "1px solid var(--line)" }}>
              <td style={{ padding: "8px 12px" }}>
                {d.image_url ? (
                  <img src={d.image_url} alt={d.title} style={{ width: 60, height: 60, objectFit: "cover" }} />
                ) : (
                  <div style={{ width: 60, height: 60, background: "var(--line)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10 }}>
                    No img
                  </div>
                )}
              </td>
              <td style={{ padding: "8px 12px" }}>
                <div style={{ fontWeight: 500, fontSize: 14 }}>{d.title}</div>
                <div className="dim" style={{ fontSize: 12 }}>{d.style} · {d.placement}</div>
              </td>
              <td style={{ padding: "8px 12px", fontSize: 13 }}>{d.artist_name}</td>
              <td style={{ padding: "8px 12px", fontSize: 13 }}>{d.price ?? "—"} USDT</td>
              <td style={{ padding: "8px 12px", fontSize: 12 }}>
                <span style={{
                  padding: "2px 8px",
                  background: d.selling_mode === "resellable" ? "rgba(100,200,100,0.15)" : "rgba(201,169,110,0.15)",
                  border: "1px solid var(--line)",
                  fontSize: 11,
                }}>
                  {d.selling_mode === "resellable" ? "Resellable" : "Soulbound"}
                </span>
              </td>
              <td style={{ padding: "8px 12px", fontSize: 13 }}>
                {d.selling_mode === "resellable" ? `${d.royalty_pct}%` : "—"}
              </td>
              <td style={{ padding: "8px 12px" }}>
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    onClick={() => handleAction(d.id, "approve")}
                    disabled={actionPending.has(d.id)}
                    style={{
                      padding: "6px 14px",
                      background: "#22c55e",
                      color: "#fff",
                      border: "none",
                      cursor: "pointer",
                      fontSize: 12,
                      opacity: actionPending.has(d.id) ? 0.6 : 1,
                    }}
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleAction(d.id, "reject")}
                    disabled={actionPending.has(d.id)}
                    style={{
                      padding: "6px 14px",
                      background: "#ef4444",
                      color: "#fff",
                      border: "none",
                      cursor: "pointer",
                      fontSize: 12,
                      opacity: actionPending.has(d.id) ? 0.6 : 1,
                    }}
                  >
                    Reject
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
