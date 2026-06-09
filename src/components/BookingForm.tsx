import { useState } from "react";
import type { Artist, Design } from "../lib/catalog/types";

interface Props {
  artists: Artist[];
  designs: Design[];
}

type BookingType = "plate" | "custom";

interface FormState {
  artistId: string;
  bookingType: BookingType;
  // plate booking
  designId: string;
  // custom consultation
  customStyle: string;
  customSize: string;
  customPlacement: string;
  customBudget: string;
  // shared
  name: string;
  contact: string;
  message: string;
}

const STYLES = ["Blackwork", "Fine Line", "Geometric", "Irezumi", "Neo-Traditional", "Realism", "Lettering", "Watercolor", "Minimalist", "Traditional", "Not sure yet"];
const SIZES = [
  { value: "small", label: "Small — palm-sized or less" },
  { value: "medium", label: "Medium — hand-sized" },
  { value: "large", label: "Large — forearm / calf" },
  { value: "extra-large", label: "Extra large — full sleeve / back piece" },
];
const BUDGETS = ["Under ฿5,000", "฿5,000–10,000", "฿10,000–20,000", "฿20,000–40,000", "฿40,000+", "Flexible / discuss"];

export default function BookingForm({ artists, designs }: Props) {
  const [form, setForm] = useState<FormState>({
    artistId: artists[0]?.id ?? "",
    bookingType: "plate",
    designId: "",
    customStyle: "",
    customSize: "",
    customPlacement: "",
    customBudget: "",
    name: "",
    contact: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const selectedArtist = artists.find((a) => a.id === form.artistId);
  const artistDesigns = designs.filter(
    (d) => d.artistId === form.artistId && d.status === "available"
  );

  function set(key: keyof FormState, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (error) setError(null);
  }

  function setType(t: BookingType) {
    setForm((prev) => ({ ...prev, bookingType: t, designId: "", customStyle: "", customSize: "", customPlacement: "", customBudget: "" }));
    if (error) setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.contact.trim()) {
      setError("Name and contact are required.");
      return;
    }
    if (form.bookingType === "custom" && !form.customPlacement.trim()) {
      setError("Please describe where you'd like the tattoo placed.");
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
          designId: form.bookingType === "plate" ? (form.designId || null) : null,
          name: form.name.trim(),
          contact: form.contact.trim(),
          message: form.message.trim() || null,
          bookingType: form.bookingType,
          customStyle: form.customStyle || null,
          customSize: form.customSize || null,
          customPlacement: form.customPlacement.trim() || null,
          customBudget: form.customBudget || null,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error((body as { error?: string }).error ?? "Request failed");
      }
      setDone(true);
      window.dispatchEvent(
        new CustomEvent("inknoir:toast", {
          detail: { message: "Booking request sent — we'll be in touch within 48 h." },
        })
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div style={{ textAlign: "center", padding: "40px 0" }}>
        <div style={{ fontFamily: "var(--font-display)", fontSize: 32, marginBottom: 12 }}>✓</div>
        <div style={{ fontFamily: "var(--font-display)", fontSize: 20, marginBottom: 8 }}>Request sent</div>
        <p className="mono faint" style={{ fontSize: 12, letterSpacing: ".06em" }}>
          We'll reply within 48 h to confirm availability and next steps.
        </p>
        <button
          className="btn btn--ghost"
          style={{ marginTop: 24 }}
          onClick={() => { setDone(false); setForm((p) => ({ ...p, designId: "", name: "", contact: "", message: "" })); }}
        >
          Send another request
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate>

      {/* Booking type toggle */}
      <div className="field">
        <label>Booking type</label>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1, border: "1px solid var(--line)", marginTop: 8 }}>
          {([["plate", "Book a plate", "Choose from existing designs"], ["custom", "Custom consultation", "Describe your own tattoo idea"]] as const).map(([val, title, sub]) => (
            <button
              key={val}
              type="button"
              onClick={() => setType(val)}
              style={{
                background: form.bookingType === val ? "var(--ink-700)" : "var(--ink-850)",
                border: "none",
                borderLeft: val === "custom" ? "1px solid var(--line)" : "none",
                padding: "14px 16px",
                cursor: "pointer",
                textAlign: "left",
                outline: form.bookingType === val ? "1px solid var(--fg-dim)" : "none",
                outlineOffset: -1,
              }}
            >
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: ".12em", textTransform: "uppercase", color: form.bookingType === val ? "var(--fg)" : "var(--fg-dim)" }}>
                {title}
              </div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--fg-faint)", marginTop: 4, letterSpacing: ".04em" }}>
                {sub}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Artist */}
      <div className="field">
        <label htmlFor="bf-artist">Artist</label>
        <select
          id="bf-artist"
          className="select"
          value={form.artistId}
          onChange={(e) => set("artistId", e.target.value)}
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

      {/* Plate booking fields */}
      {form.bookingType === "plate" && (
        <div className="field">
          <label htmlFor="bf-design">Design</label>
          <select
            id="bf-design"
            className="select"
            value={form.designId}
            onChange={(e) => set("designId", e.target.value)}
          >
            <option value="">— No specific plate selected —</option>
            {artistDesigns.map((d) => (
              <option key={d.id} value={d.id}>
                {d.title} · {d.placement}
              </option>
            ))}
          </select>
          {artistDesigns.length === 0 && (
            <div className="mono faint" style={{ fontSize: 11, marginTop: 8 }}>
              No available plates for this artist right now.
            </div>
          )}
        </div>
      )}

      {/* Custom consultation fields */}
      {form.bookingType === "custom" && (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
            <div className="field">
              <label htmlFor="bf-style">Style preference</label>
              <select id="bf-style" className="select" value={form.customStyle} onChange={(e) => set("customStyle", e.target.value)}>
                <option value="">— Select style —</option>
                {STYLES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="field">
              <label htmlFor="bf-size">Approximate size</label>
              <select id="bf-size" className="select" value={form.customSize} onChange={(e) => set("customSize", e.target.value)}>
                <option value="">— Select size —</option>
                {SIZES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
            <div className="field">
              <label htmlFor="bf-placement">Placement <span style={{ color: "var(--warn)" }}>*</span></label>
              <input
                id="bf-placement"
                className="input"
                type="text"
                placeholder="e.g. inner forearm, left calf…"
                value={form.customPlacement}
                onChange={(e) => set("customPlacement", e.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="bf-budget">Budget range</label>
              <select id="bf-budget" className="select" value={form.customBudget} onChange={(e) => set("customBudget", e.target.value)}>
                <option value="">— Select budget —</option>
                {BUDGETS.map((b) => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
          </div>
        </>
      )}

      {/* Shared fields */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
        <div className="field">
          <label htmlFor="bf-name">Full name <span style={{ color: "var(--warn)" }}>*</span></label>
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
          <label htmlFor="bf-contact">Email or handle <span style={{ color: "var(--warn)" }}>*</span></label>
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
        <label htmlFor="bf-message">
          {form.bookingType === "custom" ? "Describe your idea, references, skin notes…" : "Message"}
        </label>
        <textarea
          id="bf-message"
          className="input"
          rows={4}
          placeholder={
            form.bookingType === "custom"
              ? "Share your concept, references, any skin considerations, or anything else the artist should know…"
              : "Placement, size, references, skin notes, anything the artist should know…"
          }
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
        <button type="submit" className="btn btn--solid btn--lg" disabled={submitting}>
          {submitting ? "Sending…" : form.bookingType === "custom" ? "Request consultation" : "Send booking request"}
        </button>
        <p className="mono faint" style={{ fontSize: 10.5, marginTop: 14, letterSpacing: ".06em" }}>
          We'll reply within 48 h to confirm availability and next steps.
        </p>
      </div>
    </form>
  );
}
