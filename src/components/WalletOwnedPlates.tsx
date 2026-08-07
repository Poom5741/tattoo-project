import WalletProvider from "./WalletProvider";
import { useState, useEffect } from "react";
import { usePasskeyWallet } from "../contexts/PasskeyWalletContext";
import Plate from "./Plate";
import { createT, isSupportedLocale } from "../lib/i18n";
import type { Locale } from "../lib/i18n/types";

interface OwnedPlate {
  id: string;
  n: string;
  title: string;
  artist_id: string;
  style: string | null;
  price: number | null;
  seed: number | null;
  token_id: number | null;
  token: string | null;
}

function readHtmlLocale(): Locale {
  if (typeof document === "undefined") return "en";
  const val = document.querySelector("html")?.getAttribute("data-locale");
  return val && isSupportedLocale(val) ? val : "en";
}

function WalletOwnedPlatesInner({ locale: propLocale }: { locale?: Locale }) {
  const [locale] = useState<Locale>(propLocale || readHtmlLocale);
  const t = createT(locale);
  const { address, status } = usePasskeyWallet();
  const [plates, setPlates] = useState<OwnedPlate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isConnected = status === "unlocked" && address !== null;

  useEffect(() => {
    if (!isConnected || !address) {
      setPlates([]);
      return;
    }
    setLoading(true);
    setError(null);
    fetch(`/api/wallet/${address}`)
      .then((r) => {
        if (!r.ok) throw new Error("Failed to load wallet");
        return r.json() as Promise<OwnedPlate[]>;
      })
      .then((data) => setPlates(data))
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [address, isConnected]);

  if (!isConnected) {
    return (
      <div className="card-bb p-12 md:p-20 text-center bg-surface-container-low">
        <div className="w-[52px] h-[52px] rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-body font-bold text-lg mx-auto mb-5">⬡</div>
        <h3 className="font-display text-headline-md text-on-surface">{t("wallet.connectTitle")}</h3>
        <p className="font-body text-body-md text-on-surface-variant mt-3 mx-auto mb-7 max-w-[38ch]">
          {t("wallet.connectDesc")}
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-center py-16 font-body text-body-md text-on-surface-variant">
        {t("wallet.loadingCollection")}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10">
        <p className="font-body text-sm text-error">{error}</p>
      </div>
    );
  }

  if (plates.length === 0) {
    return (
      <div className="card-bb p-12 md:p-20 text-center bg-surface-container-low">
        <div className="w-[52px] h-[52px] rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-body font-bold text-lg mx-auto mb-5">⬡</div>
        <h3 className="font-display text-headline-md text-on-surface">{t("wallet.nothingHeld")}</h3>
        <p className="font-body text-body-md text-on-surface-variant mt-3 mx-auto mb-7 max-w-[38ch]">
          {t("wallet.nothingHeldDesc")}
        </p>
        <a href="/market" className="btn-primary">{t("wallet.enterGallery")}</a>
      </div>
    );
  }

  const totalValue = plates.reduce((s, d) => s + (d.price ?? 0), 0);

  return (
    <div>
      <div className="flex gap-8 mb-10">
        <div>
          <div className="font-display text-headline-sm text-on-surface">{plates.length}</div>
          <div className="font-body text-xs text-on-surface-variant/60 tracking-[0.12em] uppercase mt-1">{t("wallet.plates")}</div>
        </div>
        <div>
          <div className="font-display text-headline-sm text-on-surface">{totalValue.toFixed(3)} ETH</div>
          <div className="font-body text-xs text-on-surface-variant/60 tracking-[0.12em] uppercase mt-1">{t("wallet.value")}</div>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {plates.map((d) => (
          <div
            className="card-bb flex items-center gap-6 p-5 cursor-pointer"
            key={d.id}
            onClick={() => { window.location.href = `/design/${d.id}`; }}
          >
            <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-surface-dim">
              <Plate seed={d.seed ?? 0} density={1} />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-display text-headline-sm text-on-surface">{d.title}</h3>
              <div className="font-body text-sm text-on-surface-variant mt-1.5 tracking-[0.04em]">
                {d.style} · № {d.n}/001 · {d.token ?? ""}
              </div>
              <div className="mt-2.5">
                <span className="tag-bb text-green-700 bg-green-700/10"><span className="w-2 h-2 rounded-full bg-current"></span>{t("wallet.inCollection")}</span>
              </div>
            </div>
            <div className="flex-shrink-0 hidden sm:block">
              <a href={`/design/${d.id}`} className="btn-secondary" onClick={(e) => e.stopPropagation()}>
                {t("wallet.viewPlate")}
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
interface WalletOwnedPlatesProps {
  locale?: Locale;
}

export default function WalletOwnedPlates({ locale }: WalletOwnedPlatesProps) {
  return (
    <WalletProvider>
      <WalletOwnedPlatesInner locale={locale} />
    </WalletProvider>
  );
}
