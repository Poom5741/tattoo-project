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
      <div className="p-6 text-center">
        <div className="text-3xl mb-3">✓</div>
        <h3 className="font-playfair font-semibold text-[#1B1C18] text-xl mb-2">Design submitted for review</h3>
        <p className="text-[#5A5B55] text-sm">
          Your design is now pending review by the INKNOIR team. You&apos;ll be able to see it in your portal with &ldquo;pending&rdquo; status.
        </p>
        <button
          className="mt-5 inline-flex items-center justify-center gap-2 px-7 py-3 rounded-full font-sora font-semibold text-sm transition-all bg-[#E60023] text-white hover:bg-[#C4001F]"
          onClick={() => { setDone(false); setForm({ title: "", style: STYLES[0], price_usdt: "", placement: "", medium: "", selling_mode: "one-time", royalty_pct: "10", image_key: "" }); setPreviewUrl(null); }}
        >
          Submit another design
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-[18px]">
      {/* Photo upload */}
      <div className="mb-5">
        <label className="block font-sora font-semibold text-sm text-[#5A5B55] mb-2">Design photo *</label>
        <div
          className="border-2 border-dashed border-[#E8E3D8] p-6 text-center cursor-pointer rounded-lg hover:border-[#D4CFC4] transition-colors relative"
          onClick={() => fileInputRef.current?.click()}
        >
          {previewUrl ? (
            <img src={previewUrl} alt="Design preview" className="max-h-[200px] max-w-full object-contain" />
          ) : uploading ? (
            <p className="text-[#5A5B55] text-[13px]">Uploading…</p>
          ) : (
            <p className="text-[#5A5B55] text-[13px]">Click to upload (JPEG, PNG, WebP · max 10MB)</p>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>
        {uploadError && <p className="text-[#D32F2F] text-xs mt-1.5">{uploadError}</p>}
      </div>

      {/* Title */}
      <div className="mb-5">
        <label className="block font-sora font-semibold text-sm text-[#5A5B55] mb-2">Title *</label>
        <input
          className="w-full bg-[#F5F0E8] border border-[#E8E3D8] text-[#1B1C18] font-sora text-sm px-4 py-3 rounded-lg outline-none focus:border-[#E60023] transition-colors"
          type="text"
          value={form.title}
          onChange={(e) => set("title", e.target.value)}
          placeholder="e.g. Serpent Rising"
          maxLength={200}
        />
      </div>

      {/* Style */}
      <div className="mb-5">
        <label className="block font-sora font-semibold text-sm text-[#5A5B55] mb-2">Style *</label>
        <select className="w-full bg-[#F5F0E8] border border-[#E8E3D8] text-[#1B1C18] font-sora text-sm px-4 py-3 rounded-lg outline-none focus:border-[#E60023] transition-colors" value={form.style} onChange={(e) => set("style", e.target.value)}>
          {STYLES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* Price */}
      <div className="mb-5">
        <label className="block font-sora font-semibold text-sm text-[#5A5B55] mb-2">Price (USDT) *</label>
        <input
          className="w-full bg-[#F5F0E8] border border-[#E8E3D8] text-[#1B1C18] font-sora text-sm px-4 py-3 rounded-lg outline-none focus:border-[#E60023] transition-colors"
          type="number"
          min="0.01"
          step="0.01"
          value={form.price_usdt}
          onChange={(e) => set("price_usdt", e.target.value)}
          placeholder="e.g. 250"
        />
      </div>

      {/* Placement */}
      <div className="mb-5">
        <label className="block font-sora font-semibold text-sm text-[#5A5B55] mb-2">Placement *</label>
        <input
          className="w-full bg-[#F5F0E8] border border-[#E8E3D8] text-[#1B1C18] font-sora text-sm px-4 py-3 rounded-lg outline-none focus:border-[#E60023] transition-colors"
          type="text"
          value={form.placement}
          onChange={(e) => set("placement", e.target.value)}
          placeholder="e.g. Upper arm, back, forearm"
          maxLength={200}
        />
      </div>

      {/* Medium */}
      <div className="mb-5">
        <label className="block font-sora font-semibold text-sm text-[#5A5B55] mb-2">Medium *</label>
        <input
          className="w-full bg-[#F5F0E8] border border-[#E8E3D8] text-[#1B1C18] font-sora text-sm px-4 py-3 rounded-lg outline-none focus:border-[#E60023] transition-colors"
          type="text"
          value={form.medium}
          onChange={(e) => set("medium", e.target.value)}
          placeholder="e.g. Black & grey, Full colour"
          maxLength={200}
        />
      </div>

      {/* Selling mode */}
      <div className="mb-5">
        <label className="block font-sora font-semibold text-sm text-[#5A5B55] mb-2">Selling mode *</label>
        <div className="flex flex-col gap-2.5 mt-2">
          <label className="flex gap-3 items-start cursor-pointer">
            <input
              type="radio"
              name="selling_mode"
              value="one-time"
              checked={form.selling_mode === "one-time"}
              onChange={() => set("selling_mode", "one-time")}
              className="mt-0.5"
            />
            <span>
              <strong>One-time (Soulbound)</strong>
              <br />
              <span className="text-[#5A5B55] text-xs">The NFT cannot be resold. The buyer owns it permanently.</span>
            </span>
          </label>
          <label className="flex gap-3 items-start cursor-pointer">
            <input
              type="radio"
              name="selling_mode"
              value="resellable"
              checked={form.selling_mode === "resellable"}
              onChange={() => set("selling_mode", "resellable")}
              className="mt-0.5"
            />
            <span>
              <strong>Resellable</strong>
              <br />
              <span className="text-[#5A5B55] text-xs">Buyers can resell the NFT. You earn royalties on each resale.</span>
            </span>
          </label>
        </div>
        <p className="text-[11px] text-[#5A5B55] mt-2.5 p-2 border border-[#E8E3D8] bg-[#F5F0E8]">
          This cannot be changed after submission.
        </p>
      </div>

      {/* Royalty (only for resellable) */}
      {form.selling_mode === "resellable" && (
        <div className="mb-5">
          <label className="block font-sora font-semibold text-sm text-[#5A5B55] mb-2">Royalty percentage: {form.royalty_pct}%</label>
          <input
            type="range"
            min={5}
            max={15}
            step={1}
            value={form.royalty_pct}
            onChange={(e) => set("royalty_pct", e.target.value)}
            className="w-full mt-2 accent-[#E60023]"
          />
          <div className="flex justify-between text-[11px] text-[#5A5B55] mt-1">
            <span>5% min</span><span>15% max</span>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="p-3 bg-[#D32F2F]/10 border border-[#D32F2F]/30 text-sm font-sora rounded">
          {error}
        </div>
      )}

      <button
        type="submit"
        className="inline-flex items-center justify-center gap-2 px-7 py-3 rounded-full font-sora font-semibold text-sm transition-all bg-[#E60023] text-white hover:bg-[#C4001F] disabled:opacity-40 w-full mt-1"
        disabled={submitting || uploading || !form.image_key}
      >
        {submitting ? "Submitting…" : "Submit for review"}
      </button>
    </form>
  );
}
