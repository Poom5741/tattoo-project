import { useState } from "react";
import type { Artist, Design } from "../lib/catalog/types";
import { PasskeyWalletProvider, usePasskeyWallet } from "../contexts/PasskeyWalletContext";
import { createT, isSupportedLocale } from "../lib/i18n";
import type { Locale } from "../lib/i18n/types";

interface Props {
  artists: Artist[];
  designs: Design[];
  locale?: Locale;
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

function BookingFormInner({ artists, designs, locale: propLocale }: Props) {
  const { address } = usePasskeyWallet();
  const [locale] = useState<Locale>(propLocale || "en");
  const t = createT(locale);

  const STYLES = [
    { value: "Blackwork", label: t("bookingForm.styleBlackwork") },
    { value: "Fine Line", label: t("bookingForm.styleFineLine") },
    { value: "Geometric", label: t("bookingForm.styleGeometric") },
    { value: "Irezumi", label: t("bookingForm.styleIrezumi") },
    { value: "Neo-Traditional", label: t("bookingForm.styleNeoTraditional") },
    { value: "Realism", label: t("bookingForm.styleRealism") },
    { value: "Lettering", label: t("bookingForm.styleLettering") },
    { value: "Watercolor", label: t("bookingForm.styleWatercolor") },
    { value: "Minimalist", label: t("bookingForm.styleMinimalist") },
    { value: "Traditional", label: t("bookingForm.styleTraditional") },
    { value: "Not sure yet", label: t("bookingForm.styleNotSure") },
  ];

  const SIZES = [
    { value: "small", label: t("bookingForm.sizeSmall") },
    { value: "medium", label: t("bookingForm.sizeMedium") },
    { value: "large", label: t("bookingForm.sizeLarge") },
    { value: "extra-large", label: t("bookingForm.sizeExtraLarge") },
  ];

  const BUDGETS = [
    { value: "Under ฿5,000", label: t("bookingForm.budgetUnder5k") },
    { value: "฿5,000–10,000", label: t("bookingForm.budget5kTo10k") },
    { value: "฿10,000–20,000", label: t("bookingForm.budget10kTo20k") },
    { value: "฿20,000–40,000", label: t("bookingForm.budget20kTo40k") },
    { value: "฿40,000+", label: t("bookingForm.budget40kPlus") },
    { value: "Flexible / discuss", label: t("bookingForm.budgetFlexible") },
  ];

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
      setError(t("bookingForm.requiredFields"));
      return;
    }
    if (form.bookingType === "custom" && !form.customPlacement.trim()) {
      setError(t("bookingForm.requiredPlacement"));
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
          buyerWallet: address || null,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error((body as { error?: string }).error ?? "Request failed");
      }
      setDone(true);
      window.dispatchEvent(
        new CustomEvent("suknid:toast", {
          detail: { message: t("bookingForm.requestSent") },
        })
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : t("common.error"));
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="text-center py-10 font-body">
        <div className="font-display text-headline-md mb-3">✓</div>
        <div className="font-display text-headline-sm text-on-surface mb-2">{t("bookingForm.requestSent")}</div>
        <p className="font-body text-on-surface-variant/60 text-xs tracking-[0.06em]">
          {t("bookingForm.replyNotice")}
        </p>
        <a href="/inbox" className="btn-primary mt-6 inline-block">
          Go to your inbox
        </a>
        <button
          className="btn-secondary mt-6"
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
        <label className="label-bb">{t("bookingForm.bookingType")}</label>
        <div className="grid grid-cols-2 gap-px border border-outline-variant rounded-lg overflow-hidden mt-2">
          {([["plate", t("bookingForm.bookPlate"), t("bookingForm.choosePlate")], ["custom", t("bookingForm.customConsult"), t("bookingForm.describeIdea")]] as const).map(([val, title, sub]) => (
            <button
              key={val}
              type="button"
              onClick={() => setType(val)}
              className={`text-left px-4 py-3.5 cursor-pointer outline-none transition-colors ${
                form.bookingType === val
                  ? "bg-surface-container outline outline-1 outline-on-surface-variant"
                  : "bg-surface-container-low"
              } ${val === "custom" ? "border-l border-outline-variant" : ""}`}
            >
              <div className={`font-body text-[11px] tracking-[0.12em] uppercase ${form.bookingType === val ? "text-on-surface" : "text-on-surface-variant"}`}>
                {title}
              </div>
              <div className="font-body text-[10px] text-on-surface-variant/60 mt-1 tracking-[0.04em]">
                {sub}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Artist */}
      <div className="mb-5">
        <label htmlFor="bf-artist" className="label-bb">{t("bookingForm.artist")}</label>
        <select
          id="bf-artist"
          className="input-bb"
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
          <div className="font-body text-on-surface-variant/60 text-[11px] mt-2 tracking-[0.06em]">
            {selectedArtist.city} · {selectedArtist.booked}
          </div>
        )}
      </div>

      {/* Plate booking fields */}
      {form.bookingType === "plate" && (
        <div className="mb-5">
          <label htmlFor="bf-design" className="label-bb">{t("bookingForm.design")}</label>
          <select
            id="bf-design"
            className="input-bb"
            value={form.designId}
            onChange={(e) => set("designId", e.target.value)}
          >
            <option value="">{t("bookingForm.noDesignSelected")}</option>
            {artistDesigns.map((d) => (
              <option key={d.id} value={d.id}>
                {d.title} · {d.placement}
              </option>
            ))}
          </select>
          {artistDesigns.length === 0 && (
            <div className="font-body text-on-surface-variant/60 text-[11px] mt-2">
              {t("bookingForm.noPlates")}
            </div>
          )}
        </div>
      )}

      {/* Custom consultation fields */}
      {form.bookingType === "custom" && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-[18px]">
            <div className="mb-5">
              <label htmlFor="bf-style" className="label-bb">{t("bookingForm.stylePref")}</label>
              <select id="bf-style" className="input-bb" value={form.customStyle} onChange={(e) => set("customStyle", e.target.value)}>
                <option value="">{t("bookingForm.selectStyle")}</option>
                {STYLES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
            <div className="mb-5">
              <label htmlFor="bf-size" className="label-bb">{t("bookingForm.approxSize")}</label>
              <select id="bf-size" className="input-bb" value={form.customSize} onChange={(e) => set("customSize", e.target.value)}>
                <option value="">{t("bookingForm.selectSize")}</option>
                {SIZES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-[18px]">
            <div className="mb-5">
              <label htmlFor="bf-placement" className="label-bb">{t("bookingForm.placement")} <span className="text-primary-container">*</span></label>
              <input
                id="bf-placement"
                className="input-bb"
                type="text"
                placeholder="e.g. inner forearm, left calf…"
                value={form.customPlacement}
                onChange={(e) => set("customPlacement", e.target.value)}
              />
            </div>
            <div className="mb-5">
              <label htmlFor="bf-budget" className="label-bb">{t("bookingForm.budgetRange")}</label>
              <select id="bf-budget" className="input-bb" value={form.customBudget} onChange={(e) => set("customBudget", e.target.value)}>
                <option value="">{t("bookingForm.selectBudget")}</option>
                {BUDGETS.map((b) => <option key={b.value} value={b.value}>{b.label}</option>)}
              </select>
            </div>
          </div>
        </>
      )}

      {/* Shared fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-[18px]">
        <div className="mb-5">
          <label htmlFor="bf-name" className="label-bb">{t("bookingForm.fullName")} <span className="text-primary-container">*</span></label>
          <input
            id="bf-name"
            className="input-bb"
            type="text"
            placeholder="Your name"
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            required
          />
        </div>
        <div className="mb-5">
          <label htmlFor="bf-contact" className="label-bb">{t("bookingForm.contact")} <span className="text-primary-container">*</span></label>
          <input
            id="bf-contact"
            className="input-bb"
            type="text"
            placeholder={t("bookingForm.contactPlaceholder")}
            value={form.contact}
            onChange={(e) => set("contact", e.target.value)}
            required
          />
        </div>
      </div>

      <div className="mb-5">
        <label htmlFor="bf-message" className="label-bb">
          {form.bookingType === "custom" ? t("bookingForm.customDesc") : t("bookingForm.message")}
        </label>
        <textarea
          id="bf-message"
          className="input-bb resize-y"
          rows={4}
          placeholder={
            form.bookingType === "custom"
              ? t("bookingForm.customPlaceholder")
              : t("bookingForm.messagePlaceholder")
          }
          value={form.message}
          onChange={(e) => set("message", e.target.value)}
        />
      </div>

      {error && (
        <div className="font-body text-xs text-primary-container mt-4 px-3.5 py-3 border border-primary-container/40 bg-surface-container-low rounded-lg">
          {error}
        </div>
      )}

      <div className="mt-7">
        <button type="submit" className="btn-primary" disabled={submitting}>
          {submitting ? t("bookingForm.sending") : form.bookingType === "custom" ? t("bookingForm.requestConsult") : t("bookingForm.sendRequest")}
        </button>
        <p className="font-body text-on-surface-variant/60 text-[10.5px] mt-3.5 tracking-[0.06em]">
          {t("bookingForm.replyNotice")}
        </p>
      </div>
    </form>
  );
}

export default function BookingForm({ artists, designs, locale }: Props) {
  return (
    <PasskeyWalletProvider>
      <BookingFormInner artists={artists} designs={designs} locale={locale} />
    </PasskeyWalletProvider>
  );
}
