import { useState, useRef } from "react";

const STYLES = [
  "Fine Line", "Blackwork", "Neo-Traditional", "Realism", "Geometric",
  "Watercolor", "Illustrative", "Japanese", "Tribal", "Minimalist",
  "Dotwork", "New School", "Trash Polka", "Bio-Mechanical", "Lettering",
];

interface FormState {
  title: string;
  style: string;
  price_usdt: string;
  placement: string;
  medium: string;
  selling_mode: "one-time" | "resellable";
  royalty_pct: string;
  image_key: string;
}

export default function NewDesignForm() {
  const [form, setForm] = useState<FormState>({
    title: "",
    style: STYLES[0],
    price_usdt: "",
    placement: "",
    medium: "",
    selling_mode: "one-time",
    royalty_pct: "10",
    image_key: "",
  });
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function set(key: keyof FormState, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (error) setError(null);
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);
    setUploading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (!res.ok) {
        const err = await res.json() as { error: string };
        setUploadError(err.error ?? "Upload failed");
        return;
      }
      const data = await res.json() as { url: string; key: string };
      setPreviewUrl(data.url);
      set("image_key", data.key);
    } catch {
      setUploadError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) { setError("Title is required."); return; }
    if (!form.price_usdt || isNaN(Number(form.price_usdt)) || Number(form.price_usdt) <= 0) {
      setError("Price must be a positive number.");
      return;
    }
    if (!form.placement.trim()) { setError("Placement is required."); return; }
    if (!form.medium.trim()) { setError("Medium is required."); return; }
    if (!form.image_key) { setError("Please upload a photo."); return; }
    if (form.selling_mode === "resellable" && (!form.royalty_pct || Number(form.royalty_pct) < 5 || Number(form.royalty_pct) > 15)) {
      setError("Royalty must be between 5% and 15% for resellable designs.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const payload: Record<string, unknown> = {
        title: form.title.trim(),
        style: form.style,
        price_usdt: Number(form.price_usdt),
        placement: form.placement.trim(),
        medium: form.medium.trim(),
        selling_mode: form.selling_mode,
        image_key: form.image_key,
      };
      if (form.selling_mode === "resellable") {
        payload.royalty_pct = Number(form.royalty_pct);
      }

      const res = await fetch("/api/designs/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json() as { error: string };
        setError(err.error ?? "Submission failed. Please try again.");
        return;
      }

      setDone(true);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div style={{ padding: "24px", textAlign: "center" }}>
        <div style={{ fontSize: 32, marginBottom: 12 }}>✓</div>
        <h3 className="display" style={{ fontSize: 22, marginBottom: 8 }}>Design submitted for review</h3>
        <p className="dim" style={{ fontSize: 14 }}>
          Your design is now pending review by the INKNOIR team. You&apos;ll be able to see it in your portal with &ldquo;pending&rdquo; status.
        </p>
        <button
          style={{ marginTop: 20, padding: "10px 24px", background: "var(--ink-800)", color: "#fff", border: "none", cursor: "pointer", fontSize: 13 }}
          onClick={() => { setDone(false); setForm({ title: "", style: STYLES[0], price_usdt: "", placement: "", medium: "", selling_mode: "one-time", royalty_pct: "10", image_key: "" }); setPreviewUrl(null); }}
        >
          Submit another design
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      {/* Photo upload */}
      <div className="field">
        <label>Design photo *</label>
        <div
          style={{
            border: "2px dashed var(--line)",
            padding: "24px",
            textAlign: "center",
            cursor: "pointer",
            position: "relative",
          }}
          onClick={() => fileInputRef.current?.click()}
        >
          {previewUrl ? (
            <img src={previewUrl} alt="Design preview" style={{ maxHeight: 200, maxWidth: "100%", objectFit: "contain" }} />
          ) : uploading ? (
            <p className="dim" style={{ fontSize: 13 }}>Uploading…</p>
          ) : (
            <p className="dim" style={{ fontSize: 13 }}>Click to upload (JPEG, PNG, WebP · max 10MB)</p>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            style={{ display: "none" }}
            onChange={handleFileChange}
          />
        </div>
        {uploadError && <p style={{ color: "#ff4444", fontSize: 12, marginTop: 6 }}>{uploadError}</p>}
      </div>

      {/* Title */}
      <div className="field">
        <label>Title *</label>
        <input
          className="input"
          type="text"
          value={form.title}
          onChange={(e) => set("title", e.target.value)}
          placeholder="e.g. Serpent Rising"
          maxLength={200}
        />
      </div>

      {/* Style */}
      <div className="field">
        <label>Style *</label>
        <select className="input" value={form.style} onChange={(e) => set("style", e.target.value)}>
          {STYLES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* Price */}
      <div className="field">
        <label>Price (USDT) *</label>
        <input
          className="input"
          type="number"
          min="0.01"
          step="0.01"
          value={form.price_usdt}
          onChange={(e) => set("price_usdt", e.target.value)}
          placeholder="e.g. 250"
        />
      </div>

      {/* Placement */}
      <div className="field">
        <label>Placement *</label>
        <input
          className="input"
          type="text"
          value={form.placement}
          onChange={(e) => set("placement", e.target.value)}
          placeholder="e.g. Upper arm, back, forearm"
          maxLength={200}
        />
      </div>

      {/* Medium */}
      <div className="field">
        <label>Medium *</label>
        <input
          className="input"
          type="text"
          value={form.medium}
          onChange={(e) => set("medium", e.target.value)}
          placeholder="e.g. Black & grey, Full colour"
          maxLength={200}
        />
      </div>

      {/* Selling mode */}
      <div className="field">
        <label>Selling mode *</label>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 8 }}>
          <label style={{ display: "flex", gap: 10, alignItems: "flex-start", cursor: "pointer" }}>
            <input
              type="radio"
              name="selling_mode"
              value="one-time"
              checked={form.selling_mode === "one-time"}
              onChange={() => set("selling_mode", "one-time")}
              style={{ marginTop: 2 }}
            />
            <span>
              <strong>One-time (Soulbound)</strong>
              <br />
              <span className="dim" style={{ fontSize: 12 }}>The NFT cannot be resold. The buyer owns it permanently.</span>
            </span>
          </label>
          <label style={{ display: "flex", gap: 10, alignItems: "flex-start", cursor: "pointer" }}>
            <input
              type="radio"
              name="selling_mode"
              value="resellable"
              checked={form.selling_mode === "resellable"}
              onChange={() => set("selling_mode", "resellable")}
              style={{ marginTop: 2 }}
            />
            <span>
              <strong>Resellable</strong>
              <br />
              <span className="dim" style={{ fontSize: 12 }}>Buyers can resell the NFT. You earn royalties on each resale.</span>
            </span>
          </label>
        </div>
        <p style={{ fontSize: 11, color: "var(--fg-dim)", marginTop: 10, padding: "8px 12px", border: "1px solid var(--line)", background: "rgba(201,169,110,0.05)" }}>
          This cannot be changed after submission.
        </p>
      </div>

      {/* Royalty (only for resellable) */}
      {form.selling_mode === "resellable" && (
        <div className="field">
          <label>Royalty percentage: {form.royalty_pct}%</label>
          <input
            type="range"
            min={5}
            max={15}
            step={1}
            value={form.royalty_pct}
            onChange={(e) => set("royalty_pct", e.target.value)}
            style={{ width: "100%", marginTop: 8 }}
          />
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--fg-dim)", marginTop: 4 }}>
            <span>5% min</span><span>15% max</span>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={{ padding: "10px 14px", background: "rgba(255,60,60,0.1)", border: "1px solid rgba(255,60,60,0.3)", fontSize: 13 }}>
          {error}
        </div>
      )}

      <button
        type="submit"
        className="btn btn--solid btn--block"
        disabled={submitting || uploading || !form.image_key}
        style={{ marginTop: 4 }}
      >
        {submitting ? "Submitting…" : "Submit for review"}
      </button>
    </form>
  );
}
