import { useState } from "react";
import type { Artist, Design } from "../lib/catalog/types";

interface Props {
  artists: Artist[];
  designs: Design[];
}

interface FormState {
  artistId: string;
  designId: string;
  name: string;
  contact: string;
  message: string;
}

export default function BookingForm({ artists, designs }: Props) {
  const [form, setForm] = useState<FormState>({
    artistId: artists[0]?.id ?? "",
    designId: "",
    name: "",
    contact: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedArtist = artists.find((a) => a.id === form.artistId);
  const artistDesigns = designs.filter(
    (d) => d.artistId === form.artistId && d.status === "available"
  );

  function set(key: keyof FormState, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (error) setError(null);
  }

  function onArtistChange(artistId: string) {
    setForm((prev) => ({ ...prev, artistId, designId: "" }));
    if (error) setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.contact.trim()) {
      setError("Name and contact are required.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          artistId: form.artistId,
          designId: form.designId || null,
          name: form.name.trim(),
          contact: form.contact.trim(),
          message: form.message.trim(),
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error((body as { error?: string }).error ?? "Request failed");
      }
      window.dispatchEvent(
        new CustomEvent("inknoir:toast", {
          detail: { message: "Booking request sent — we'll be in touch." },
        })
      );
      setForm({ artistId: form.artistId, designId: "", name: "", contact: "", message: "" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="field">
        <label htmlFor="bf-artist">Artist</label>
        <select
          id="bf-artist"
          className="select"
          value={form.artistId}
          onChange={(e) => onArtistChange(e.target.value)}
        >
          {artists.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name} — {a.style}
            </option>
          ))}
        </select>
        {selectedArtist && (
          <div className="mono faint" style={{ fontSize: 11, marginTop: 8, letterSpacing: ".06em" }}>
            {selectedArtist.city} · {selectedArtist.booked}
          </div>
        )}
      </div>

      <div className="field">
        <label htmlFor="bf-design">Design (optional)</label>
        <select
          id="bf-design"
          className="select"
          value={form.designId}
          onChange={(e) => set("designId", e.target.value)}
        >
          <option value="">— Custom commission / no plate selected —</option>
          {artistDesigns.map((d) => (
            <option key={d.id} value={d.id}>
              {d.title} · {d.placement}
            </option>
          ))}
        </select>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
        <div className="field">
          <label htmlFor="bf-name">Full name</label>
          <input
            id="bf-name"
            className="input"
            type="text"
            placeholder="Your name"
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            required
          />
        </div>
        <div className="field">
          <label htmlFor="bf-contact">Email or handle</label>
          <input
            id="bf-contact"
            className="input"
            type="text"
            placeholder="you@email.com or @handle"
            value={form.contact}
            onChange={(e) => set("contact", e.target.value)}
            required
          />
        </div>
      </div>

      <div className="field" style={{ marginBottom: 0 }}>
        <label htmlFor="bf-message">Message</label>
        <textarea
          id="bf-message"
          className="input"
          rows={4}
          placeholder="Placement, size, references, skin notes, anything the artist should know…"
          value={form.message}
          onChange={(e) => set("message", e.target.value)}
        />
      </div>

      {error && (
        <div
          className="mono"
          style={{
            fontSize: 12,
            color: "var(--warn)",
            marginTop: 16,
            padding: "12px 14px",
            border: "1px solid color-mix(in oklab, var(--warn) 40%, transparent)",
            background: "var(--ink-850)",
          }}
        >
          {error}
        </div>
      )}

      <div style={{ marginTop: 28 }}>
        <button
          type="submit"
          className="btn btn--solid btn--lg"
          disabled={submitting}
        >
          {submitting ? "Sending…" : "Send booking request"}
        </button>
        <p
          className="mono faint"
          style={{ fontSize: 10.5, marginTop: 14, letterSpacing: ".06em" }}
        >
          We'll reply within 48 h to confirm availability and next steps.
        </p>
      </div>
    </form>
  );
}
