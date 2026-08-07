globalThis.process ??= {};
globalThis.process.env ??= {};
/* empty css                                    */
import { c as createComponent, r as renderComponent, a as renderTemplate, f as createAstro, m as maybeRenderHead, g as addAttribute } from "../../chunks/astro/server_B1Q-Dpks.mjs";
import { j as jsxRuntimeExports, $ as $$Base } from "../../chunks/jsx-runtime_6SzGatPE.mjs";
import { g as getArtistSession } from "../../chunks/auth_CBLJGIc-.mjs";
import { r as reactExports } from "../../chunks/_@astro-renderers_B6-rS8YJ.mjs";
import { a } from "../../chunks/_@astro-renderers_B6-rS8YJ.mjs";
import { P as PasskeyWalletProvider, u as usePasskeyWallet } from "../../chunks/PasskeyWalletContext_weVkuNv0.mjs";
const LS_SECRET = "saknid_wallet_secret";
function WalletSignatureGateInner() {
  const { status, address, daccPublickey, createWallet, unlock } = usePasskeyWallet();
  const [phase, setPhase] = reactExports.useState("idle");
  const [error, setError] = reactExports.useState(null);
  const doLogin = async () => {
    setError(null);
    setPhase("fetching-challenge");
    try {
      const challengeRes = await fetch("/api/auth/challenge");
      if (!challengeRes.ok) {
        setPhase("error");
        setError(`Failed to fetch challenge. Server returned ${challengeRes.status}`);
        return;
      }
      const challenge = await challengeRes.json();
      if (!address || !daccPublickey) {
        setPhase("error");
        setError("Wallet not ready. Please unlock your wallet first.");
        return;
      }
      setPhase("signing");
      const secret = localStorage.getItem(LS_SECRET);
      if (!secret) {
        setPhase("error");
        setError("Wallet secret not found. Please recreate your wallet.");
        return;
      }
      const [{ daccSignMessage }, { bscTestnet }] = await Promise.all([
        import("../../chunks/index_JBFjlWvQ.mjs"),
        import("../../chunks/index_Co265x6p.mjs")
      ]);
      const result = await daccSignMessage({
        address,
        daccPublickey,
        passwordSecretkey: secret,
        network: bscTestnet,
        message: challenge.message
      });
      setPhase("logging-in");
      const loginRes = await fetch("/api/auth/artist-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          address,
          signature: result.signature,
          nonce: challenge.nonce
        })
      });
      if (!loginRes.ok) {
        let errMsg = "Login failed";
        try {
          const err = await loginRes.json();
          if (typeof err === "object" && err !== null && "error" in err && typeof err.error === "string") {
            errMsg = err.error;
          }
        } catch {
        }
        setPhase("error");
        setError(errMsg);
        return;
      }
      setPhase("done");
      window.location.reload();
    } catch (e) {
      console.error("WalletSignatureGate login error:", e);
      setPhase("error");
      setError("Something went wrong. Please try again.");
    }
  };
  reactExports.useEffect(() => {
    if (status !== "unlocked" || phase !== "idle") return;
    doLogin();
  }, [status, phase]);
  if (status === "none") {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "card-bb p-12 md:p-20 text-center bg-surface-container-low max-w-[480px] mx-auto mt-20", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display text-headline-md text-on-surface mb-4", children: "Artist Portal" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-body text-body-md text-on-surface-variant mb-7", children: "Create a passkey wallet to sign in with your artist wallet." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "btn-primary", onClick: createWallet, children: "Create Wallet" })
    ] });
  }
  if (status === "locked") {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "card-bb p-12 md:p-20 text-center bg-surface-container-low max-w-[480px] mx-auto mt-20", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display text-headline-md text-on-surface mb-4", children: "Artist Portal" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-body text-body-md text-on-surface-variant mb-7", children: "Unlock your wallet to sign in." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "btn-primary", onClick: unlock, children: "Unlock Wallet" })
    ] });
  }
  if (phase === "error") {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "card-bb p-12 md:p-20 text-center bg-surface-container-low max-w-[480px] mx-auto mt-20", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display text-headline-md text-on-surface mb-4", children: "Sign In Failed" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-body text-body-md text-error mb-7", children: error }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "btn-primary", onClick: () => setPhase("idle"), children: "Try Again" })
    ] });
  }
  if (phase === "done") {
    return null;
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "card-bb p-12 md:p-20 text-center bg-surface-container-low max-w-[480px] mx-auto mt-20", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display text-headline-md text-on-surface mb-4", children: "Artist Portal" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-8 h-8 border-2 border-primary-container border-t-transparent rounded-full animate-spin" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-body text-body-md text-on-surface-variant", children: [
        phase === "fetching-challenge" && "Preparing sign-in…",
        phase === "signing" && "Sign challenge with your wallet…",
        phase === "logging-in" && "Verifying signature…"
      ] })
    ] })
  ] });
}
function WalletSignatureGate() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(PasskeyWalletProvider, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(WalletSignatureGateInner, {}) });
}
const STYLES = [
  "Fine Line",
  "Blackwork",
  "Neo-Traditional",
  "Realism",
  "Geometric",
  "Watercolor",
  "Illustrative",
  "Japanese",
  "Tribal",
  "Minimalist",
  "Dotwork",
  "New School",
  "Trash Polka",
  "Bio-Mechanical",
  "Lettering"
];
function NewDesignForm() {
  const [form, setForm] = reactExports.useState({
    title: "",
    style: STYLES[0],
    price_usdt: "",
    placement: "",
    medium: "",
    selling_mode: "one-time",
    royalty_pct: "10",
    image_key: ""
  });
  const [previewUrl, setPreviewUrl] = reactExports.useState(null);
  const [uploading, setUploading] = reactExports.useState(false);
  const [uploadError, setUploadError] = reactExports.useState(null);
  const [submitting, setSubmitting] = reactExports.useState(false);
  const [error, setError] = reactExports.useState(null);
  const [done, setDone] = reactExports.useState(false);
  const fileInputRef = reactExports.useRef(null);
  function set(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (error) setError(null);
  }
  async function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError(null);
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (!res.ok) {
        const err = await res.json();
        setUploadError(err.error ?? "Upload failed");
        return;
      }
      const data = await res.json();
      setPreviewUrl(data.url);
      set("image_key", data.key);
    } catch {
      setUploadError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  }
  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.title.trim()) {
      setError("Title is required.");
      return;
    }
    if (!form.price_usdt || isNaN(Number(form.price_usdt)) || Number(form.price_usdt) <= 0) {
      setError("Price must be a positive number.");
      return;
    }
    if (!form.placement.trim()) {
      setError("Placement is required.");
      return;
    }
    if (!form.medium.trim()) {
      setError("Medium is required.");
      return;
    }
    if (!form.image_key) {
      setError("Please upload a photo.");
      return;
    }
    if (form.selling_mode === "resellable" && (!form.royalty_pct || Number(form.royalty_pct) < 5 || Number(form.royalty_pct) > 15)) {
      setError("Royalty must be between 5% and 15% for resellable designs.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const payload = {
        title: form.title.trim(),
        style: form.style,
        price_usdt: Number(form.price_usdt),
        placement: form.placement.trim(),
        medium: form.medium.trim(),
        selling_mode: form.selling_mode,
        image_key: form.image_key
      };
      if (form.selling_mode === "resellable") {
        payload.royalty_pct = Number(form.royalty_pct);
      }
      const res = await fetch("/api/designs/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const err = await res.json();
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
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6 text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-3xl mb-3", children: "✓" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-playfair font-semibold text-[#1B1C18] text-xl mb-2", children: "Design submitted for review" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[#5A5B55] text-sm", children: "Your design is now pending review by the SAKNID team. You'll be able to see it in your portal with “pending” status." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          className: "mt-5 inline-flex items-center justify-center gap-2 px-7 py-3 rounded-full font-sora font-semibold text-sm transition-all bg-[#E60023] text-white hover:bg-[#C4001F]",
          onClick: () => {
            setDone(false);
            setForm({ title: "", style: STYLES[0], price_usdt: "", placement: "", medium: "", selling_mode: "one-time", royalty_pct: "10", image_key: "" });
            setPreviewUrl(null);
          },
          children: "Submit another design"
        }
      )
    ] });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSubmit, className: "flex flex-col gap-[18px]", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block font-sora font-semibold text-sm text-[#5A5B55] mb-2", children: "Design photo *" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          className: "border-2 border-dashed border-[#E8E3D8] p-6 text-center cursor-pointer rounded-lg hover:border-[#D4CFC4] transition-colors relative",
          onClick: () => fileInputRef.current?.click(),
          children: [
            previewUrl ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: previewUrl, alt: "Design preview", className: "max-h-[200px] max-w-full object-contain" }) : uploading ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[#5A5B55] text-[13px]", children: "Uploading…" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[#5A5B55] text-[13px]", children: "Click to upload (JPEG, PNG, WebP · max 10MB)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                ref: fileInputRef,
                type: "file",
                accept: "image/jpeg,image/png,image/webp",
                className: "hidden",
                onChange: handleFileChange
              }
            )
          ]
        }
      ),
      uploadError && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[#D32F2F] text-xs mt-1.5", children: uploadError })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block font-sora font-semibold text-sm text-[#5A5B55] mb-2", children: "Title *" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "input",
        {
          className: "w-full bg-[#F5F0E8] border border-[#E8E3D8] text-[#1B1C18] font-sora text-sm px-4 py-3 rounded-lg outline-none focus:border-[#E60023] transition-colors",
          type: "text",
          value: form.title,
          onChange: (e) => set("title", e.target.value),
          placeholder: "e.g. Serpent Rising",
          maxLength: 200
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block font-sora font-semibold text-sm text-[#5A5B55] mb-2", children: "Style *" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("select", { className: "w-full bg-[#F5F0E8] border border-[#E8E3D8] text-[#1B1C18] font-sora text-sm px-4 py-3 rounded-lg outline-none focus:border-[#E60023] transition-colors", value: form.style, onChange: (e) => set("style", e.target.value), children: STYLES.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: s, children: s }, s)) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block font-sora font-semibold text-sm text-[#5A5B55] mb-2", children: "Price (THB) *" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "input",
        {
          className: "w-full bg-[#F5F0E8] border border-[#E8E3D8] text-[#1B1C18] font-sora text-sm px-4 py-3 rounded-lg outline-none focus:border-[#E60023] transition-colors",
          type: "number",
          min: "0.01",
          step: "0.01",
          value: form.price_usdt,
          onChange: (e) => set("price_usdt", e.target.value),
          placeholder: "e.g. 2500"
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block font-sora font-semibold text-sm text-[#5A5B55] mb-2", children: "Placement *" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "input",
        {
          className: "w-full bg-[#F5F0E8] border border-[#E8E3D8] text-[#1B1C18] font-sora text-sm px-4 py-3 rounded-lg outline-none focus:border-[#E60023] transition-colors",
          type: "text",
          value: form.placement,
          onChange: (e) => set("placement", e.target.value),
          placeholder: "e.g. Upper arm, back, forearm",
          maxLength: 200
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block font-sora font-semibold text-sm text-[#5A5B55] mb-2", children: "Medium *" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "input",
        {
          className: "w-full bg-[#F5F0E8] border border-[#E8E3D8] text-[#1B1C18] font-sora text-sm px-4 py-3 rounded-lg outline-none focus:border-[#E60023] transition-colors",
          type: "text",
          value: form.medium,
          onChange: (e) => set("medium", e.target.value),
          placeholder: "e.g. Black & grey, Full colour",
          maxLength: 200
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block font-sora font-semibold text-sm text-[#5A5B55] mb-2", children: "Selling mode *" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-2.5 mt-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex gap-3 items-start cursor-pointer", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              type: "radio",
              name: "selling_mode",
              value: "one-time",
              checked: form.selling_mode === "one-time",
              onChange: () => set("selling_mode", "one-time"),
              className: "mt-0.5"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "One-time (Soulbound)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[#5A5B55] text-xs", children: "The NFT cannot be resold. The buyer owns it permanently." })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex gap-3 items-start cursor-pointer", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              type: "radio",
              name: "selling_mode",
              value: "resellable",
              checked: form.selling_mode === "resellable",
              onChange: () => set("selling_mode", "resellable"),
              className: "mt-0.5"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Resellable" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[#5A5B55] text-xs", children: "Buyers can resell the NFT. You earn royalties on each resale." })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] text-[#5A5B55] mt-2.5 p-2 border border-[#E8E3D8] bg-[#F5F0E8]", children: "This cannot be changed after submission." })
    ] }),
    form.selling_mode === "resellable" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "block font-sora font-semibold text-sm text-[#5A5B55] mb-2", children: [
        "Royalty percentage: ",
        form.royalty_pct,
        "%"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "input",
        {
          type: "range",
          min: 5,
          max: 15,
          step: 1,
          value: form.royalty_pct,
          onChange: (e) => set("royalty_pct", e.target.value),
          className: "w-full mt-2 accent-[#E60023]"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-[11px] text-[#5A5B55] mt-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "5% min" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "15% max" })
      ] })
    ] }),
    error && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-3 bg-[#D32F2F]/10 border border-[#D32F2F]/30 text-sm font-sora rounded", children: error }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "button",
      {
        type: "submit",
        className: "inline-flex items-center justify-center gap-2 px-7 py-3 rounded-full font-sora font-semibold text-sm transition-all bg-[#E60023] text-white hover:bg-[#C4001F] disabled:opacity-40 w-full mt-1",
        disabled: submitting || uploading || !form.image_key,
        children: submitting ? "Submitting…" : "Submit for review"
      }
    )
  ] });
}
function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}
function getFirstDayOfMonth(year, month) {
  return new Date(year, month, 1).getDay();
}
function dayKey(year, month, day) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}
function unixToDateKey(ts) {
  const d = new Date(ts * 1e3);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function BookingCalendar({ bookings: initialBookings }) {
  const today = /* @__PURE__ */ new Date();
  const [year, setYear] = reactExports.useState(today.getFullYear());
  const [month, setMonth] = reactExports.useState(today.getMonth());
  const [selectedDay, setSelectedDay] = reactExports.useState(null);
  const [bookings, setBookings] = reactExports.useState(initialBookings);
  const [actionPending, setActionPending] = reactExports.useState(/* @__PURE__ */ new Set());
  const [appointmentInputs, setAppointmentInputs] = reactExports.useState({});
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const MONTH_NAMES = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December"
  ];
  const DAY_NAMES = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
  const dayMap = {};
  for (const b of bookings) {
    const k = unixToDateKey(b.created_at);
    if (!dayMap[k]) dayMap[k] = [];
    dayMap[k].push(b);
    if (b.appointment_date) {
      const ak = unixToDateKey(b.appointment_date);
      if (!dayMap[ak]) dayMap[ak] = [];
      if (!dayMap[ak].find((x) => x.id === b.id)) dayMap[ak].push(b);
    }
  }
  function prevMonth() {
    if (month === 0) {
      setYear((y) => y - 1);
      setMonth(11);
    } else setMonth((m) => m - 1);
    setSelectedDay(null);
  }
  function nextMonth() {
    if (month === 11) {
      setYear((y) => y + 1);
      setMonth(0);
    } else setMonth((m) => m + 1);
    setSelectedDay(null);
  }
  async function handleAccept(bookingId) {
    const dateVal = appointmentInputs[bookingId];
    if (!dateVal) {
      alert("Please select an appointment date first.");
      return;
    }
    const appointmentDate = Math.floor(new Date(dateVal).getTime() / 1e3);
    setActionPending((prev) => new Set(prev).add(bookingId));
    try {
      const res = await fetch(`/api/bookings/${bookingId}/accept`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ appointmentDate }),
        credentials: "include"
      });
      if (res.ok) {
        setBookings((prev) => prev.map(
          (b) => b.id === bookingId ? { ...b, status: "accepted", appointment_date: appointmentDate } : b
        ));
      } else {
        const err = await res.json();
        alert("Failed: " + (err.error ?? "Unknown error"));
      }
    } catch {
      alert("Network error. Please try again.");
    } finally {
      setActionPending((prev) => {
        const s = new Set(prev);
        s.delete(bookingId);
        return s;
      });
    }
  }
  async function handleDecline(bookingId) {
    if (!confirm("Decline this booking inquiry?")) return;
    setActionPending((prev) => new Set(prev).add(bookingId));
    try {
      const res = await fetch(`/api/bookings/${bookingId}/decline`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include"
      });
      if (res.ok) {
        setBookings((prev) => prev.map(
          (b) => b.id === bookingId ? { ...b, status: "declined" } : b
        ));
      } else {
        const err = await res.json();
        alert("Failed: " + (err.error ?? "Unknown error"));
      }
    } catch {
      alert("Network error. Please try again.");
    } finally {
      setActionPending((prev) => {
        const s = new Set(prev);
        s.delete(bookingId);
        return s;
      });
    }
  }
  const selectedBookings = selectedDay ? dayMap[selectedDay] ?? [] : [];
  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center mb-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: prevMonth,
          className: "btn-secondary !px-3 !py-1.5 text-[13px] cursor-pointer",
          children: "←"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "font-display font-semibold text-on-surface text-headline-sm", children: [
        MONTH_NAMES[month],
        " ",
        year
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: nextMonth,
          className: "btn-secondary !px-3 !py-1.5 text-[13px] cursor-pointer",
          children: "→"
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-7 gap-px mb-px", children: DAY_NAMES.map((d) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-body text-[10px] tracking-[0.1em] text-on-surface-variant/60 text-center py-2", children: d }, d)) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-7 gap-px bg-outline-variant border border-outline-variant rounded-lg overflow-hidden mb-6", children: cells.map((day, i) => {
      if (day === null) {
        return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-surface-container-low min-h-[52px]" }, `e${i}`);
      }
      const k = dayKey(year, month, day);
      const dayBookings = dayMap[k] ?? [];
      const isToday = today.getFullYear() === year && today.getMonth() === month && today.getDate() === day;
      const isSelected = selectedDay === k;
      const hasPending = dayBookings.some((b) => (b.status ?? "pending") === "pending");
      const hasAccepted = dayBookings.some((b) => b.status === "accepted");
      const hasDeclined = dayBookings.some((b) => b.status === "declined");
      return /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          onClick: () => setSelectedDay(isSelected ? null : k),
          className: `min-h-[52px] p-1.5 px-2 relative transition-colors ${isSelected ? "bg-surface-container-high border-b-2 border-primary-container" : "bg-surface-container"} ${dayBookings.length > 0 ? "cursor-pointer" : "cursor-default"}`,
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `font-body text-xs ${isToday ? "text-primary-container font-bold" : "text-on-surface-variant font-normal"}`, children: day }),
            dayBookings.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-0.5 mt-1 flex-wrap", children: [
              hasPending && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-1.5 h-1.5 rounded-full bg-blue-500 inline-block", title: "Pending inquiry" }),
              hasAccepted && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-1.5 h-1.5 rounded-full bg-green-500 inline-block", title: "Accepted" }),
              hasDeclined && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-1.5 h-1.5 rounded-full bg-primary-container inline-block", title: "Declined" })
            ] })
          ]
        },
        k
      );
    }) }),
    selectedDay && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "card-bb p-5 mb-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-body text-[10px] tracking-[0.2em] uppercase text-on-surface-variant/60 mb-4", children: selectedDay }),
      selectedBookings.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-on-surface-variant text-[13px]", children: "No bookings on this date." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-col gap-4", children: selectedBookings.map((b) => {
        const status = b.status ?? "pending";
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-l-2 border-outline-variant pl-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-start mb-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-body font-medium text-sm text-on-surface", children: b.name }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-body text-[11px] text-on-surface-variant", children: b.contact })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `font-body text-[9px] tracking-[0.1em] uppercase px-2 py-0.5 border rounded-full ${status === "accepted" ? "bg-green-500/15 text-green-600 border-green-500/40" : status === "declined" ? "bg-primary-container/15 text-primary-container border-primary-container/40" : "bg-blue-500/15 text-blue-500 border-blue-500/40"}`, children: status })
          ] }),
          b.message && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-body text-xs text-on-surface-variant mb-2", children: b.message }),
          b.design_id && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "font-body text-[11px] text-on-surface-variant/60 mb-2", children: [
            "Plate: ",
            b.design_id
          ] }),
          status === "pending" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 items-center flex-wrap mt-2.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "date",
                className: "input-bb !w-auto !text-[11px] !px-2 !py-1.5",
                value: appointmentInputs[b.id] ?? "",
                onChange: (e) => setAppointmentInputs((prev) => ({ ...prev, [b.id]: e.target.value }))
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                onClick: () => handleAccept(b.id),
                disabled: actionPending.has(b.id),
                className: "px-3.5 py-1.5 bg-green-600 text-white border-none cursor-pointer font-body text-xs rounded-full disabled:opacity-60 transition-opacity",
                children: "Accept"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                onClick: () => handleDecline(b.id),
                disabled: actionPending.has(b.id),
                className: "px-3.5 py-1.5 bg-primary-container text-white border-none cursor-pointer font-body text-xs rounded-full disabled:opacity-60 transition-opacity",
                children: "Decline"
              }
            )
          ] })
        ] }, b.id);
      }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-4 font-body text-[11px] text-on-surface-variant/60", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "inline-block w-2 h-2 rounded-full bg-blue-500 mr-1 align-middle" }),
        "Pending"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "inline-block w-2 h-2 rounded-full bg-green-500 mr-1 align-middle" }),
        "Accepted"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "inline-block w-2 h-2 rounded-full bg-primary-container mr-1 align-middle" }),
        "Declined"
      ] })
    ] })
  ] });
}
function fmtDate(ts) {
  return new Date(ts * 1e3).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
}
function fmtThb(n) {
  return `฿${n.toLocaleString("th-TH", { minimumFractionDigits: 2 })}`;
}
function shortHash(hash) {
  if (!hash) return "—";
  if (hash.startsWith("paysolution:")) return hash.replace("paysolution:", "PaySolution #");
  return hash.slice(0, 8) + "…" + hash.slice(-6);
}
function EarningsDashboard() {
  const [data, setData] = reactExports.useState(null);
  const [loading, setLoading] = reactExports.useState(true);
  const [error, setError] = reactExports.useState(null);
  reactExports.useEffect(() => {
    fetch("/api/artist/earnings").then((r) => {
      if (!r.ok) throw new Error("Failed to load earnings");
      return r.json();
    }).then((d) => setData(d)).catch((e) => setError(e.message)).finally(() => setLoading(false));
  }, []);
  if (loading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[#5A5B55] text-[13px]", children: "Loading earnings…" });
  }
  if (error) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[#D32F2F] text-[13px]", children: error });
  }
  if (!data || data.recentTransactions.length === 0) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[#5A5B55] text-[13px]", children: "No earnings yet. Earnings appear here once your designs are sold." });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-3 gap-px bg-[#E8E3D8] border border-[#E8E3D8] rounded-lg overflow-hidden mb-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-[#F0EBE1] p-5 md:p-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-playfair font-semibold text-[#1B1C18] text-2xl md:text-[28px] leading-none", children: fmtThb(data.totalPrimary) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-sora text-[9px] tracking-[0.2em] uppercase text-[#5A5B55]/60 mt-1.5", children: "Primary Sales" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-[#F0EBE1] p-5 md:p-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-playfair font-semibold text-[#1B1C18] text-2xl md:text-[28px] leading-none text-[#2E7D32]", children: fmtThb(data.totalRoyalties) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-sora text-[9px] tracking-[0.2em] uppercase text-[#5A5B55]/60 mt-1.5", children: "Royalties" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-[#F0EBE1] p-5 md:p-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-playfair font-semibold text-[#1B1C18] text-2xl md:text-[28px] leading-none", children: fmtThb(data.totalEarnings) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-sora text-[9px] tracking-[0.2em] uppercase text-[#5A5B55]/60 mt-1.5", children: "Total Earned" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full border border-[#E8E3D8] border-collapse", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: ["Date", "Design", "Type", "Amount", "Platform Fee", "Payment", "Tx"].map((h) => /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "font-sora text-[10px] tracking-[0.14em] uppercase text-[#5A5B55]/60 px-4 py-3 text-left border-b border-[#E8E3D8] bg-[#F5F0E8] whitespace-nowrap", children: h }, h)) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: data.recentTransactions.map((e) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "hover:bg-[#F5F0E8]", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 border-b border-[#E8E3D8] text-sm font-sora text-[#5A5B55] whitespace-nowrap", children: fmtDate(e.created_at) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 border-b border-[#E8E3D8] text-sm", children: e.design_title ? /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: `/design/${e.design_id}`, className: "underline underline-offset-[3px]", children: e.design_title }) : "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 border-b border-[#E8E3D8]", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `inline-flex items-center gap-2 px-2 py-0.5 rounded text-[10px] font-sora font-semibold tracking-[0.1em] uppercase border ${e.type === "royalty" ? "bg-[#2E7D32]/15 text-[#2E7D32] border-[#2E7D32]/40" : "bg-[#8B7355]/15 text-[#8B7355] border-[#8B7355]/40"}`, children: e.type === "primary_sale" ? "Sale" : "Royalty" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-4 py-3 border-b border-[#E8E3D8] text-sm font-playfair text-[#2E7D32]", children: [
          "+",
          fmtThb(e.amount)
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 border-b border-[#E8E3D8] text-xs font-sora text-[#5A5B55]/60", children: fmtThb(e.platform_fee) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 border-b border-[#E8E3D8] text-[11px] font-sora text-[#5A5B55]", children: e.payment_method === "on_chain" ? "On-chain" : "PaySolution" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 border-b border-[#E8E3D8] text-[11px] font-sora text-[#5A5B55]/60", children: e.tx_hash && e.tx_hash.startsWith("0x") ? /* @__PURE__ */ jsxRuntimeExports.jsx(
          "a",
          {
            href: `https://testnet.bscscan.com/tx/${e.tx_hash}`,
            target: "_blank",
            rel: "noopener noreferrer",
            className: "underline underline-offset-2",
            children: shortHash(e.tx_hash)
          }
        ) : shortHash(e.tx_hash) })
      ] }, e.id)) })
    ] }) })
  ] });
}
const $$Astro = createAstro();
const prerender = false;
const $$Portal = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Portal;
  const env = Astro2.locals.runtime.env;
  const session = await getArtistSession(
    Astro2.request.headers.get("cookie") ?? "",
    env.SESSION
  );
  let plates = [];
  let bookings = [];
  let artistName = "";
  let showNewForm = false;
  if (session) {
    const db = env.DB;
    const [pRes, bRes, aRow] = await Promise.all([
      db.prepare("SELECT id, n, title, style, price, status, placement, selling_mode, image_url, royalty_pct FROM designs WHERE artist_id = ? ORDER BY rowid ASC").bind(session.artistId).all(),
      db.prepare("SELECT id, design_id, name, contact, message, buyer_wallet, created_at, status, appointment_date FROM booking_inquiries WHERE artist_id = ? ORDER BY created_at DESC").bind(session.artistId).all(),
      db.prepare("SELECT name FROM artists WHERE id = ?").bind(session.artistId).first()
    ]);
    plates = pRes.results;
    bookings = bRes.results;
    artistName = aRow?.name ?? session.name;
  }
  const url = new URL(Astro2.request.url);
  showNewForm = url.searchParams.has("new");
  const stats = {
    total: plates.length,
    available: plates.filter((p) => p.status === "available").length,
    pending: plates.filter((p) => p.status === "pending").length,
    sold: plates.filter((p) => p.status === "sold").length,
    inquiries: bookings.length
  };
  function statusClass(status) {
    switch (status) {
      case "available":
        return "bg-[#2E7D32]/15 text-[#2E7D32] border-[#2E7D32]/40";
      case "reserved":
        return "bg-[#F9A825]/15 text-[#F9A825] border-[#F9A825]/40";
      case "sold":
        return "bg-[#5A5B55]/15 text-[#5A5B55] border-[#5A5B55]/40";
      case "pending":
        return "bg-[#F9A825]/15 text-[#F9A825] border-[#F9A825]/40";
      case "rejected":
        return "bg-[#D32F2F]/15 text-[#D32F2F] border-[#D32F2F]/40";
      case "delisted":
        return "bg-[#5A5B55]/15 text-[#5A5B55] border-[#5A5B55]/40";
      default:
        return "";
    }
  }
  return renderTemplate`${renderComponent($$result, "Base", $$Base, { "title": "Artist Portal — SAKNID" }, { "default": async ($$result2) => renderTemplate`${!session ? renderTemplate`${renderComponent($$result2, "WalletSignatureGate", WalletSignatureGate, { "client:load": true, "client:component-hydration": "load", "client:component-path": "/home/vscode/codingZone/tattoo-project/src/components/WalletSignatureGate", "client:component-export": "default" })}` : renderTemplate`${maybeRenderHead()}<div class="max-w-[1000px] mx-auto px-7 py-10 pb-20"> <div class="flex justify-between items-center pb-6 border-b border-[#E8E3D8] mb-10"> <div> <div class="font-sora font-semibold text-xs tracking-[0.2em] uppercase text-[#E60023]" style="margin-bottom: 8px;">SAKNID / Artist Portal</div> <h1 class="font-playfair font-semibold text-[#1B1C18]" style="font-size: 32px;">${artistName}</h1> <div class="font-sora text-[10px] bg-[#E8E0D0] border border-[#E8E3D8] px-2 py-0.5 rounded text-[#5A5B55] max-w-[140px] truncate inline-block" style="margin-top: 8px;"${addAttribute(session.walletAddress, "title")}> ${session.walletAddress.slice(0, 6)}…${session.walletAddress.slice(-4)} </div> </div> <div style="display:flex;gap:12px;align-items:center"> <a href="/artist/portal?new=1" class="inline-flex items-center justify-center gap-2 px-7 py-3 rounded-full font-sora font-semibold text-sm transition-all bg-[#E60023] text-white hover:bg-[#C4001F] disabled:opacity-40">+ List new design</a> <form method="POST" action="/api/auth/artist-logout"> <button type="submit" class="inline-flex items-center justify-center gap-2 px-7 py-3 rounded-full font-sora font-semibold text-sm transition-all bg-transparent text-[#1B1C18] border border-[#E8E3D8] hover:border-[#D4CFC4]">Sign out</button> </form> </div> </div> <div class="grid grid-cols-2 md:grid-cols-5 gap-px bg-[#E8E3D8] border border-[#E8E3D8] mb-12 rounded-lg overflow-hidden"> <div class="bg-[#F0EBE1] p-6 md:p-7"><div class="font-playfair text-4xl md:text-5xl leading-none">${stats.total}</div><div class="font-sora text-[9px] tracking-[0.2em] uppercase text-[#5A5B55]/60 mt-2">Plates</div></div> <div class="bg-[#F0EBE1] p-6 md:p-7"><div class="font-playfair text-4xl md:text-5xl leading-none text-[#2E7D32]">${stats.available}</div><div class="font-sora text-[9px] tracking-[0.2em] uppercase text-[#5A5B55]/60 mt-2">Available</div></div> <div class="bg-[#F0EBE1] p-6 md:p-7"><div class="font-playfair text-4xl md:text-5xl leading-none text-[#F9A825]">${stats.pending}</div><div class="font-sora text-[9px] tracking-[0.2em] uppercase text-[#5A5B55]/60 mt-2">Pending</div></div> <div class="bg-[#F0EBE1] p-6 md:p-7"><div class="font-playfair text-4xl md:text-5xl leading-none">${stats.sold}</div><div class="font-sora text-[9px] tracking-[0.2em] uppercase text-[#5A5B55]/60 mt-2">Sold</div></div> <div class="bg-[#F0EBE1] p-6 md:p-7"><div class="font-playfair text-4xl md:text-5xl leading-none">${stats.inquiries}</div><div class="font-sora text-[9px] tracking-[0.2em] uppercase text-[#5A5B55]/60 mt-2">Inquiries</div></div> </div> ${showNewForm && renderTemplate`<div> <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px"> <div class="font-sora text-[10.5px] tracking-[0.2em] uppercase text-[#5A5B55] mb-4" style="margin-bottom:0">List new design</div> <a href="/artist/portal" class="font-sora text-[#5A5B55]/60" style="font-size:12px">Cancel</a> </div> <div class="border border-[#E8E3D8] p-7 mb-10 bg-[#F5F0E8] rounded-lg"> ${renderComponent($$result2, "NewDesignForm", NewDesignForm, { "client:visible": true, "client:component-hydration": "visible", "client:component-path": "/home/vscode/codingZone/tattoo-project/src/components/NewDesignForm", "client:component-export": "default" })} </div> </div>`} <div class="font-sora text-[10.5px] tracking-[0.2em] uppercase text-[#5A5B55] mb-4">Your plates</div> ${plates.length === 0 ? renderTemplate`<p class="font-sora text-[#5A5B55]/60" style="font-size:13px; margin-bottom:48px;">No plates yet. <a href="/artist/portal?new=1">List your first design →</a></p>` : renderTemplate`<table class="w-full border border-[#E8E3D8] border-collapse mb-[52px]"> <thead> <tr> <th class="font-sora text-[10px] tracking-[0.14em] uppercase text-[#5A5B55]/60 px-4 py-3 text-left border-b border-[#E8E3D8] bg-[#F5F0E8] whitespace-nowrap">Photo</th><th class="font-sora text-[10px] tracking-[0.14em] uppercase text-[#5A5B55]/60 px-4 py-3 text-left border-b border-[#E8E3D8] bg-[#F5F0E8] whitespace-nowrap">№</th><th class="font-sora text-[10px] tracking-[0.14em] uppercase text-[#5A5B55]/60 px-4 py-3 text-left border-b border-[#E8E3D8] bg-[#F5F0E8] whitespace-nowrap">Title</th><th class="font-sora text-[10px] tracking-[0.14em] uppercase text-[#5A5B55]/60 px-4 py-3 text-left border-b border-[#E8E3D8] bg-[#F5F0E8] whitespace-nowrap">Style</th><th class="font-sora text-[10px] tracking-[0.14em] uppercase text-[#5A5B55]/60 px-4 py-3 text-left border-b border-[#E8E3D8] bg-[#F5F0E8] whitespace-nowrap">Terms</th><th class="font-sora text-[10px] tracking-[0.14em] uppercase text-[#5A5B55]/60 px-4 py-3 text-left border-b border-[#E8E3D8] bg-[#F5F0E8] whitespace-nowrap">Price</th><th class="font-sora text-[10px] tracking-[0.14em] uppercase text-[#5A5B55]/60 px-4 py-3 text-left border-b border-[#E8E3D8] bg-[#F5F0E8] whitespace-nowrap">Status</th><th class="font-sora text-[10px] tracking-[0.14em] uppercase text-[#5A5B55]/60 px-4 py-3 text-left border-b border-[#E8E3D8] bg-[#F5F0E8] whitespace-nowrap">Actions</th> </tr> </thead> <tbody> ${plates.map((p) => renderTemplate`<tr> <td class="px-4 py-3 border-b border-[#E8E3D8] text-sm"> ${p.image_url ? renderTemplate`<img class="w-11 h-11 rounded object-cover border border-[#E8E3D8]"${addAttribute(p.image_url, "src")}${addAttribute(p.title, "alt")}>` : renderTemplate`<div class="w-11 h-11 rounded border border-[#E8E3D8] bg-[#E8E3D8] flex items-center justify-center text-[9px] text-[#5A5B55]/60">No img</div>`} </td> <td class="px-4 py-3 border-b border-[#E8E3D8] text-sm font-sora text-[#5A5B55]/60" style="font-size:11px">${p.n}</td> <td class="px-4 py-3 border-b border-[#E8E3D8] text-sm"><a${addAttribute(`/design/${p.id}`, "href")} style="text-decoration:underline;text-underline-offset:3px">${p.title}</a></td> <td class="px-4 py-3 border-b border-[#E8E3D8] text-sm font-sora text-[#5A5B55]/60" style="font-size:11px">${p.style ?? "—"}</td> <td class="px-4 py-3 border-b border-[#E8E3D8] text-sm font-sora text-[#5A5B55]/60" style="font-size:11px"> ${p.selling_mode === "resellable" ? `Resellable (${p.royalty_pct}%)` : "Soulbound"} </td> <td class="px-4 py-3 border-b border-[#E8E3D8] text-sm font-sora" style="font-size:12px">${p.price != null ? `฿${p.price.toLocaleString("th-TH", { minimumFractionDigits: 2 })}` : "—"}</td> <td class="px-4 py-3 border-b border-[#E8E3D8] text-sm"> <span${addAttribute(`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border ${statusClass(p.status)}`, "class")}> <span class="w-2 h-2 rounded-full bg-current"></span>${p.status} </span> </td> <td class="px-4 py-3 border-b border-[#E8E3D8] text-sm"> ${p.status === "rejected" && renderTemplate`<a${addAttribute(`/artist/portal?new=1&editId=${p.id}`, "href")} class="font-sora" style="font-size:11px;text-decoration:underline">Edit &amp; resubmit</a>`} ${p.status === "available" && renderTemplate`<button class="font-sora" style="font-size:11px;background:none;border:1px solid #E8E3D8;padding:3px 10px;cursor:pointer;color:#5A5B55"${addAttribute(`if(confirm('Delist "${p.title}"?')) fetch('/api/designs/${p.id}/delist',{method:'DELETE',credentials:'include'}).then(r=>r.ok?location.reload():alert('Failed'))`, "onclick")}>
Delist
</button>`} </td> </tr>`)} </tbody> </table>`} <div class="font-sora text-[10.5px] tracking-[0.2em] uppercase text-[#5A5B55] mb-4">Booking calendar</div> <div style="margin-bottom:52px;"> ${renderComponent($$result2, "BookingCalendar", BookingCalendar, { "client:load": true, "bookings": bookings, "client:component-hydration": "load", "client:component-path": "/home/vscode/codingZone/tattoo-project/src/components/BookingCalendar", "client:component-export": "default" })} </div> <div class="font-sora text-[10.5px] tracking-[0.2em] uppercase text-[#5A5B55] mb-4">Earnings</div> <div style="margin-bottom:52px;"> ${renderComponent($$result2, "EarningsDashboard", EarningsDashboard, { "client:load": true, "client:component-hydration": "load", "client:component-path": "/home/vscode/codingZone/tattoo-project/src/components/EarningsDashboard", "client:component-export": "default" })} </div> </div>`}` })}`;
}, "/home/vscode/codingZone/tattoo-project/src/pages/artist/portal.astro", void 0);
const $$file = "/home/vscode/codingZone/tattoo-project/src/pages/artist/portal.astro";
const $$url = "/artist/portal";
const _page = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: $$Portal,
  file: $$file,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: "Module" }));
const page = () => _page;
export {
  page,
  a as renderers
};
