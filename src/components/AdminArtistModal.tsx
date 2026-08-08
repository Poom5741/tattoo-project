import { useState, useEffect } from "react";

interface Artist {
  id: string;
  name: string;
  handle: string | null;
  city: string | null;
  style: string | null;
  years: number | null;
  booked: string | null;
  rate: number | null;
  bio: string | null;
  email: string | null;
  wallet_address: string | null;
}

interface AdminArtistModalProps {
  artist: Artist | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedArtist: Artist) => void;
}

const inputCls = "input-bb text-body-md py-2 w-full";
const labelCls = "label-bb text-label-sm";

export default function AdminArtistModal({ artist, isOpen, onClose, onSave }: AdminArtistModalProps) {
  const [formData, setFormData] = useState<Partial<Artist>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (artist) {
      setFormData({
        name: artist.name,
        handle: artist.handle,
        city: artist.city,
        style: artist.style,
        years: artist.years,
        booked: artist.booked,
        rate: artist.rate,
        bio: artist.bio,
        email: artist.email,
        wallet_address: artist.wallet_address,
      });
    }
    setError(null);
  }, [artist]);

  if (!isOpen || !artist) return null;

  function handleChange(field: keyof Artist, value: string | number | null) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/update-artist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          artistId: artist.id,
          ...formData,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        onSave({ ...artist, ...formData } as Artist);
        onClose();
      } else {
        setError(data.error || "Failed to update artist");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div
        className="bg-surface rounded-2xl shadow-xl w-full max-w-[600px] max-h-[90vh] overflow-y-auto mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-outline-variant">
          <div>
            <h2 className="font-display text-title-lg text-on-surface">Edit Artist</h2>
            <p className="font-body text-body-sm text-on-surface-variant mt-1">{artist.id}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-surface-container-high transition-colors"
          >
            <svg className="w-5 h-5 text-on-surface-variant" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-error/10 border border-error/20 rounded-lg">
              <p className="font-body text-body-sm text-error">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Name */}
            <div className="sm:col-span-2">
              <label className={labelCls}>Name *</label>
              <input
                type="text"
                value={formData.name ?? ""}
                onChange={(e) => handleChange("name", e.target.value)}
                className={inputCls}
                required
                maxLength={100}
              />
            </div>

            {/* Handle */}
            <div>
              <label className={labelCls}>Handle</label>
              <input
                type="text"
                value={formData.handle ?? ""}
                onChange={(e) => handleChange("handle", e.target.value || null)}
                className={inputCls}
                placeholder="@handle"
                maxLength={50}
              />
            </div>

            {/* City */}
            <div>
              <label className={labelCls}>City</label>
              <input
                type="text"
                value={formData.city ?? ""}
                onChange={(e) => handleChange("city", e.target.value || null)}
                className={inputCls}
                placeholder="Bangkok"
                maxLength={100}
              />
            </div>

            {/* Style */}
            <div>
              <label className={labelCls}>Style</label>
              <input
                type="text"
                value={formData.style ?? ""}
                onChange={(e) => handleChange("style", e.target.value || null)}
                className={inputCls}
                placeholder="Neo-traditional"
                maxLength={200}
              />
            </div>

            {/* Years */}
            <div>
              <label className={labelCls}>Years Experience</label>
              <input
                type="number"
                value={formData.years ?? ""}
                onChange={(e) => handleChange("years", e.target.value ? parseInt(e.target.value) : null)}
                className={inputCls}
                min={0}
                max={100}
              />
            </div>

            {/* Booked */}
            <div className="sm:col-span-2">
              <label className={labelCls}>Booking Status</label>
              <input
                type="text"
                value={formData.booked ?? ""}
                onChange={(e) => handleChange("booked", e.target.value || null)}
                className={inputCls}
                placeholder="Available for bookings"
                maxLength={100}
              />
            </div>

            {/* Rate */}
            <div>
              <label className={labelCls}>Rate (THB/hr)</label>
              <input
                type="number"
                value={formData.rate ?? ""}
                onChange={(e) => handleChange("rate", e.target.value ? parseInt(e.target.value) : null)}
                className={inputCls}
                min={0}
                max={10000}
              />
            </div>

            {/* Email */}
            <div>
              <label className={labelCls}>Email</label>
              <input
                type="email"
                value={formData.email ?? ""}
                onChange={(e) => handleChange("email", e.target.value || null)}
                className={inputCls}
                placeholder="artist@email.com"
              />
            </div>

            {/* Bio */}
            <div className="sm:col-span-2">
              <label className={labelCls}>Bio</label>
              <textarea
                value={formData.bio ?? ""}
                onChange={(e) => handleChange("bio", e.target.value || null)}
                className={`${inputCls} min-h-[80px]`}
                maxLength={2000}
                rows={3}
              />
            </div>

            {/* Wallet Address */}
            <div className="sm:col-span-2">
              <label className={labelCls}>Wallet Address</label>
              <input
                type="text"
                value={formData.wallet_address ?? ""}
                onChange={(e) => handleChange("wallet_address", e.target.value || null)}
                className={`${inputCls} font-mono`}
                placeholder="0x..."
                pattern="^0x[0-9a-fA-F]{40}$"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary px-6 py-2"
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary px-6 py-2"
              disabled={saving}
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
