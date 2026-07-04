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

const thCls = "text-left px-3 py-2 text-[11px] font-body font-semibold tracking-wider uppercase text-on-surface-variant/60 border-b border-outline-variant/40";
const tdCls = "px-3 py-2 font-body text-body-md text-on-surface border-b border-outline-variant/20";

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
    return <p className="font-body text-body-md text-on-surface-variant/60">Loading pending designs…</p>;
  }

  if (error) {
    return <p className="font-body text-body-md text-error">{error}</p>;
  }

  if (designs.length === 0) {
    return <p className="font-body text-body-md text-on-surface-variant/60">No pending designs.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className={thCls}>Photo</th>
            <th className={thCls}>Title</th>
            <th className={thCls}>Artist</th>
            <th className={thCls}>Price (USDT)</th>
            <th className={thCls}>Mode</th>
            <th className={thCls}>Royalty</th>
            <th className={thCls}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {designs.map((d) => (
            <tr key={d.id} className="hover:bg-surface-container-low/50 transition-colors">
              <td className={tdCls}>
                {d.image_url ? (
                  <img src={d.image_url} alt={d.title} className="w-[60px] h-[60px] object-cover rounded" />
                ) : (
                  <div className="w-[60px] h-[60px] bg-surface-container-high rounded flex items-center justify-center">
                    <span className="font-body text-label-sm text-on-surface-variant/40">No img</span>
                  </div>
                )}
              </td>
              <td className={tdCls}>
                <div className="font-medium text-on-surface">{d.title}</div>
                <div className="font-body text-label-sm text-on-surface-variant/60">{d.style} · {d.placement}</div>
              </td>
              <td className={`${tdCls} text-body-md`}>{d.artist_name}</td>
              <td className={`${tdCls} text-body-md`}>{d.price ?? "—"} USDT</td>
              <td className={tdCls}>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-label-sm font-semibold border ${
                  d.selling_mode === "resellable"
                    ? "bg-green-50 text-green-700 border-green-200"
                    : "bg-surface-container-high text-on-surface-variant border-outline-variant/30"
                }`}>
                  {d.selling_mode === "resellable" ? "Resellable" : "Soulbound"}
                </span>
              </td>
              <td className={`${tdCls} text-body-md`}>
                {d.selling_mode === "resellable" ? `${d.royalty_pct}%` : "—"}
              </td>
              <td className={tdCls}>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleAction(d.id, "approve")}
                    disabled={actionPending.has(d.id)}
                    className="px-3 py-1.5 bg-green-600 text-white font-body text-label-sm font-semibold rounded-full transition-all hover:bg-green-700 disabled:opacity-40 cursor-pointer"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleAction(d.id, "reject")}
                    disabled={actionPending.has(d.id)}
                    className="px-3 py-1.5 bg-error text-white font-body text-label-sm font-semibold rounded-full transition-all hover:bg-primary disabled:opacity-40 cursor-pointer"
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
