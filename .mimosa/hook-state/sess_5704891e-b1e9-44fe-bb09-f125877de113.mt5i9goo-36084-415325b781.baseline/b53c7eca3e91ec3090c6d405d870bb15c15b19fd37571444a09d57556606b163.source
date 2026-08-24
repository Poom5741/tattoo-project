import { useState } from "react";
import { CHANNEL_CODES } from "../lib/config/chillpay";

interface DesignData {
  id: string;
  n: string;
  title: string;
  artist_id?: string;
  artistId?: string;
  style: string | null;
  price: number | null;
  price_usd?: number | null;
  priceUsd?: number | null;
  status: string;
  placement: string | null;
  seed: number | null;
}

interface CheckoutFlowProps {
  design: DesignData;
}

function fmtThb(v: number | null | undefined) {
  if (!v) return "—";
  return `฿${v.toLocaleString("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function CheckoutFlow({ design }: CheckoutFlowProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedChannel, setSelectedChannel] = useState<string>(CHANNEL_CODES.QR_PAYMENT);
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");

  const price = design.price;
  const platformFee = price != null ? +(price * 0.03).toFixed(2) : 0;

  const onPay = async () => {
    if (!price) return;
    
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/chillpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          designId: design.id,
          customerEmail,
          customerPhone,
          channelCode: selectedChannel,
        }),
      });

      if (!res.ok) {
        const err = await res.json() as { error: string };
        setError(err.error || "Failed to create payment");
        return;
      }

      const data = await res.json() as { paymentUrl: string };
      
      // Redirect to ChillPay payment page
      window.location.href = data.paymentUrl;
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const channelOptions = [
    { code: CHANNEL_CODES.QR_PAYMENT, label: "QR PromptPay", icon: "📱" },
    { code: CHANNEL_CODES.CREDIT_CARD, label: "Credit/Debit Card", icon: "💳" },
    { code: CHANNEL_CODES.INTERNET_BANK_BAY, label: "Bank of Ayudhya", icon: "🏦" },
    { code: CHANNEL_CODES.INTERNET_BANK_BBL, label: "Bangkok Bank", icon: "🏦" },
    { code: CHANNEL_CODES.INTERNET_BANK_KBANK, label: "Kasikorn Bank", icon: "🏦" },
    { code: CHANNEL_CODES.INTERNET_BANK_SCB, label: "SCB", icon: "🏦" },
    { code: CHANNEL_CODES.TRUEMONEY, label: "TrueMoney Wallet", icon: "💰" },
  ];

  return (
    <section className="py-8 pb-[90px]">
      <div className="max-w-container-max mx-auto px-5 md:px-16">
        <a href={`/design/${design.id}`} className="inline-flex items-center gap-2 text-on-surface-variant hover:text-on-surface mb-8 font-body text-body-md">← Back to plate</a>
        <h1 className="font-display font-semibold text-on-surface text-headline-md md:text-display-lg mb-9">Acquire the plate</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-11">
          <div className="card-bb p-6">
            <div className="pb-6 border-b border-outline-variant mb-6">
              <div className="font-body text-label-sm text-on-surface-variant mb-2">AVAILABLE</div>
              <h3 className="font-display font-semibold text-on-surface text-headline-sm mt-3 mb-1.5">{design.title}</h3>
              <div className="font-body text-on-surface-variant text-body-md">{design.style}</div>
              <div className="font-body text-on-surface-variant/60 text-label-sm mt-2.5">№ {design.n} / 001 · {design.placement}</div>
            </div>
            <div className="flex flex-col gap-3">
              {[
                ["Plate price", fmtThb(price)],
                ["Platform fee (3%)", fmtThb(platformFee)],
                ["Artist receives", price != null ? fmtThb(price - platformFee) : "—"],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between font-body text-body-md">
                  <span className="text-on-surface-variant text-label-md">{k}</span>
                  <span className="text-on-surface text-label-md">{v}</span>
                </div>
              ))}
              <div className="flex justify-between pt-4 border-t border-outline-variant mt-1.5">
                <span className="font-body text-body-md">You pay</span>
                <span className="font-display font-semibold text-on-surface text-headline-md">{fmtThb(price)}</span>
              </div>
            </div>
          </div>

          <div className="card-bb p-6">
            <h3 className="font-display font-semibold text-on-surface text-headline-sm mb-5">Payment</h3>

            {error && (
              <div className="p-3 bg-error-container/30 border border-error/30 text-error text-body-md font-body mb-4 rounded-lg">
                {error}
              </div>
            )}

            <div className="mb-5">
              <label className="label-bb mb-2">Payment Method</label>
              <div className="grid grid-cols-1 gap-2">
                {channelOptions.map((channel) => (
                  <button
                    key={channel.code}
                    onClick={() => setSelectedChannel(channel.code)}
                    className={`flex items-center gap-3 p-3 rounded-lg border transition-colors text-left ${
                      selectedChannel === channel.code
                        ? "border-primary-container bg-primary-container/10"
                        : "border-outline-variant hover:border-on-surface-variant"
                    }`}
                  >
                    <span className="text-xl">{channel.icon}</span>
                    <span className="font-body text-body-md">{channel.label}</span>
                    {selectedChannel === channel.code && (
                      <span className="ml-auto text-primary-container">✓</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-5">
              <label className="label-bb mb-2">Email (for receipt)</label>
              <input
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                placeholder="you@example.com"
                className="input-bb w-full"
              />
            </div>

            <div className="mb-5">
              <label className="label-bb mb-2">Phone (optional)</label>
              <input
                type="tel"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="0812345678"
                className="input-bb w-full"
              />
            </div>

            <label className="flex gap-2.5 items-start mt-1.5 mb-6 cursor-pointer">
              <input type="checkbox" defaultChecked className="mt-0.5 accent-primary-container" />
              <span className="text-on-surface-variant text-label-sm">I understand this plate is one-of-one. On purchase it is permanently retired from the gallery.</span>
            </label>

            <button
              className="btn-primary w-full"
              disabled={isLoading}
              onClick={onPay}
            >
              {isLoading ? "Creating payment…" : `Pay ${fmtThb(price)}`}
            </button>
            
            <p className="font-body text-on-surface-variant/60 text-label-sm text-center mt-3.5 tracking-[0.06em]">
              Secured by ChillPay Payment Gateway
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
