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
      <div className="text-center py-10">
        <div className="font-playfair text-[32px] mb-3">✓</div>
        <div className="font-playfair text-xl mb-2">Request sent</div>
        <p className="font-sora text-[#5A5B55]/60 text-xs tracking-[0.06em]">
          We'll reply within 48 h to confirm availability and next steps.
        </p>
        <button
          className="inline-flex items-center justify-center gap-2 px-7 py-3 rounded-full font-sora font-semibold text-sm transition-all bg-transparent text-[#1B1C18] border border-[#E8E3D8] hover:border-[#D4CFC4] mt-6"
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
      <div className="mb-5">
        <label className="block font-sora font-semibold text-sm text-[#5A5B55] mb-2">Booking type</label>
        <div className="grid grid-cols-2 gap-px border border-[#E8E3D8] mt-2">
          {([["plate", "Book a plate", "Choose from existing designs"], ["custom", "Custom consultation", "Describe your own tattoo idea"]] as const).map(([val, title, sub]) => (
            <button
              key={val}
              type="button"
              onClick={() => setType(val)}
              className={`text-left px-4 py-3.5 cursor-pointer outline-none transition-colors ${
                form.bookingType === val
                  ? "bg-[#F5F0E8] outline outline-1 outline-[#5A5B55]"
                  : "bg-[#FAF7F2]"
              } ${val === "custom" ? "border-l border-[#E8E3D8]" : ""}`}
            >
              <div className={`font-sora text-[11px] tracking-[0.12em] uppercase ${form.bookingType === val ? "text-[#1B1C18]" : "text-[#5A5B55]"}`}>
                {title}
              </div>
              <div className="font-sora text-[10px] text-[#5A5B55]/60 mt-1 tracking-[0.04em]">
                {sub}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Artist */}
      <div className="mb-5">
        <label htmlFor="bf-artist" className="block font-sora font-semibold text-sm text-[#5A5B55] mb-2">Artist</label>
        <select
          id="bf-artist"
          className="w-full bg-[#F5F0E8] border border-[#E8E3D8] text-[#1B1C18] font-sora text-sm px-4 py-3 rounded-lg outline-none focus:border-[#E60023] transition-colors"
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
          <div className="font-sora text-[#5A5B55]/60 text-[11px] mt-2 tracking-[0.06em]">
            {selectedArtist.city} · {selectedArtist.booked}
          </div>
        )}
      </div>

      {/* Plate booking fields */}
      {form.bookingType === "plate" && (
        <div className="mb-5">
          <label htmlFor="bf-design" className="block font-sora font-semibold text-sm text-[#5A5B55] mb-2">Design</label>
          <select
            id="bf-design"
            className="w-full bg-[#F5F0E8] border border-[#E8E3D8] text-[#1B1C18] font-sora text-sm px-4 py-3 rounded-lg outline-none focus:border-[#E60023] transition-colors"
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
            <div className="font-sora text-[#5A5B55]/60 text-[11px] mt-2">
              No available plates for this artist right now.
            </div>
          )}
        </div>
      )}

      {/* Custom consultation fields */}
      {form.bookingType === "custom" && (
        <>
          <div className="grid grid-cols-2 gap-[18px]">
            <div className="mb-5">
              <label htmlFor="bf-style" className="block font-sora font-semibold text-sm text-[#5A5B55] mb-2">Style preference</label>
              <select id="bf-style" className="w-full bg-[#F5F0E8] border border-[#E8E3D8] text-[#1B1C18] font-sora text-sm px-4 py-3 rounded-lg outline-none focus:border-[#E60023] transition-colors" value={form.customStyle} onChange={(e) => set("customStyle", e.target.value)}>
                <option value="">— Select style —</option>
                {STYLES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="mb-5">
              <label htmlFor="bf-size" className="block font-sora font-semibold text-sm text-[#5A5B55] mb-2">Approximate size</label>
              <select id="bf-size" className="w-full bg-[#F5F0E8] border border-[#E8E3D8] text-[#1B1C18] font-sora text-sm px-4 py-3 rounded-lg outline-none focus:border-[#E60023] transition-colors" value={form.customSize} onChange={(e) => set("customSize", e.target.value)}>
                <option value="">— Select size —</option>
                {SIZES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-[18px]">
            <div className="mb-5">
              <label htmlFor="bf-placement" className="block font-sora font-semibold text-sm text-[#5A5B55] mb-2">Placement <span className="text-[#E60023]">*</span></label>
              <input
                id="bf-placement"
                className="w-full bg-[#F5F0E8] border border-[#E8E3D8] text-[#1B1C18] font-sora text-sm px-4 py-3 rounded-lg outline-none focus:border-[#E60023] transition-colors"
                type="text"
                placeholder="e.g. inner forearm, left calf…"
                value={form.customPlacement}
                onChange={(e) => set("customPlacement", e.target.value)}
              />
            </div>
            <div className="mb-5">
              <label htmlFor="bf-budget" className="block font-sora font-semibold text-sm text-[#5A5B55] mb-2">Budget range</label>
              <select id="bf-budget" className="w-full bg-[#F5F0E8] border border-[#E8E3D8] text-[#1B1C18] font-sora text-sm px-4 py-3 rounded-lg outline-none focus:border-[#E60023] transition-colors" value={form.customBudget} onChange={(e) => set("customBudget", e.target.value)}>
                <option value="">— Select budget —</option>
                {BUDGETS.map((b) => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
          </div>
        </>
      )}

      {/* Shared fields */}
      <div className="grid grid-cols-2 gap-[18px]">
        <div className="mb-5">
          <label htmlFor="bf-name" className="block font-sora font-semibold text-sm text-[#5A5B55] mb-2">Full name <span className="text-[#E60023]">*</span></label>
          <input
            id="bf-name"
            className="w-full bg-[#F5F0E8] border border-[#E8E3D8] text-[#1B1C18] font-sora text-sm px-4 py-3 rounded-lg outline-none focus:border-[#E60023] transition-colors"
            type="text"
            placeholder="Your name"
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            required
          />
        </div>
        <div className="mb-5">
          <label htmlFor="bf-contact" className="block font-sora font-semibold text-sm text-[#5A5B55] mb-2">Email or handle <span className="text-[#E60023]">*</span></label>
          <input
            id="bf-contact"
            className="w-full bg-[#F5F0E8] border border-[#E8E3D8] text-[#1B1C18] font-sora text-sm px-4 py-3 rounded-lg outline-none focus:border-[#E60023] transition-colors"
            type="text"
            placeholder="you@email.com or @handle"
            value={form.contact}
            onChange={(e) => set("contact", e.target.value)}
            required
          />
        </div>
      </div>

      <div className="mb-5">
        <label htmlFor="bf-message" className="block font-sora font-semibold text-sm text-[#5A5B55] mb-2">
          {form.bookingType === "custom" ? "Describe your idea, references, skin notes…" : "Message"}
        </label>
        <textarea
          id="bf-message"
          className="w-full bg-[#F5F0E8] border border-[#E8E3D8] text-[#1B1C18] font-sora text-sm px-4 py-3 rounded-lg outline-none focus:border-[#E60023] transition-colors"
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
        <div className="font-sora text-xs text-[#E60023] mt-4 px-3.5 py-3 border border-[#E60023]/40 bg-[#FAF7F2]">
          {error}
        </div>
      )}

      <div className="mt-7">
        <button type="submit" className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full font-sora font-semibold text-base transition-all bg-[#E60023] text-white hover:bg-[#C4001F] disabled:opacity-40 disabled:cursor-not-allowed" disabled={submitting}>
          {submitting ? "Sending…" : form.bookingType === "custom" ? "Request consultation" : "Send booking request"}
        </button>
        <p className="font-sora text-[#5A5B55]/60 text-[10.5px] mt-3.5 tracking-[0.06em]">
          We'll reply within 48 h to confirm availability and next steps.
        </p>
      </div>
    </form>
  );
}
