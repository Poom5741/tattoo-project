import { useState } from "react";
import type { State } from "wagmi";
import Plate from "./Plate";

interface DesignData {
  id: string;
  n: string;
  title: string;
  artist_id: string;
  style: string | null;
  price: number | null;
  status: string;
  placement: string | null;
  seed: number | null;
  drawn: number | null;
  image_url?: string | null;
  selling_mode?: string;
  royalty_pct?: number | null;
  token_id?: number | null;
}

interface ResaleListing {
  id: string;
  design_id: string;
  seller_wallet: string;
  asking_price: number;
  token_id: number;
  status: string;
  title: string;
  style: string | null;
  placement: string | null;
  image_url: string | null;
  selling_mode: string;
  royalty_pct: number | null;
  artist_name: string;
}

interface MarketGridProps {
  designs: DesignData[];
  resaleListings?: ResaleListing[];
  initialState?: State;
}

const ALL_STYLES = ["Fine Line", "Blackwork", "Neo-Traditional", "Geometric", "Realism", "Lettering", "Japanese", "Watercolor", "Minimalist", "Dotwork"];

const FILTER_ACTIVE = "bg-primary-container text-on-primary border-primary-container";
const FILTER_INACTIVE = "bg-transparent text-on-surface-variant border-outline-variant hover:border-outline hover:bg-surface-container-low";

function StatusTag({ status, isResale }: { status: string; isResale?: boolean }) {
  if (isResale) {
    return (
      <span className="tag-bb bg-surface-tint/10 text-surface-tint border border-surface-tint/30">
        <span className="w-1.5 h-1.5 rounded-full bg-surface-tint"></span>
        Resale
      </span>
    );
  }
  const map: Record<string, { label: string; cls: string }> = {
    available: {
      label: "Available",
      cls: "tag-bb bg-green-900/8 text-green-900 border border-green-900/20",
    },
    reserved: {
      label: "Reserved",
      cls: "tag-bb bg-amber-700/8 text-amber-700 border border-amber-700/20",
    },
    sold: {
      label: "Claimed",
      cls: "tag-bb bg-on-surface/8 text-on-surface-variant border border-on-surface/15",
    },
  };
  const { label, cls } = map[status] ?? { label: status, cls: "tag-bb" };
  return (
    <span className={cls}>
      <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
      {label}
    </span>
  );
}

function SellingModeBadge({ mode, royaltyPct }: { mode?: string; royaltyPct?: number | null }) {
  if (!mode) return null;
  if (mode === "one-time") {
    return (
      <span className="inline-flex items-center font-body text-[10px] tracking-[0.1em] text-on-surface-variant/60 bg-secondary-container/50 border border-outline-variant px-1.5 py-0.5 rounded">
        SOULBOUND
      </span>
    );
  }
  return (
    <span className="inline-flex items-center font-body text-[10px] tracking-[0.1em] text-on-surface-variant/60 bg-green-900/8 border border-outline-variant px-1.5 py-0.5 rounded">
      RESELLABLE {royaltyPct ? `${royaltyPct}%` : ""}
    </span>
  );
}

function DesignCard({ d }: { d: DesignData }) {
  return (
    <a href={`/design/${d.id}`} className="card-bb block no-underline text-inherit group" data-testid="plate-card">
      <div className="aspect-[3/4] overflow-hidden bg-surface-dim relative">
        {d.image_url ? (
          <img
            src={d.image_url}
            alt={d.title}
            className="w-full h-full object-cover block transition-transform duration-500 group-hover:scale-[1.02]"
          />
        ) : (
          <Plate seed={d.seed ?? 0} density={1} />
        )}
      </div>
      <div className="p-5">
        <div className="flex justify-between items-start mb-2">
          <StatusTag status={d.status} />
          <span className="font-body text-[10px] tracking-[0.1em] text-on-surface-variant/60">№ {d.n}/001</span>
        </div>
        <h3 className="font-display text-headline-sm text-on-surface mb-1.5 group-hover:text-primary transition-colors duration-200">{d.title}</h3>
        <div className="font-body text-xs text-on-surface-variant mb-2">{d.style} · {d.placement}</div>
        {d.selling_mode && (
          <div className="mb-2.5">
            <SellingModeBadge mode={d.selling_mode} royaltyPct={d.royalty_pct} />
          </div>
        )}
        <div className="flex justify-between items-baseline pt-3 border-t border-outline-variant/20">
          <span className="font-display text-headline-sm text-on-surface">
            {d.price != null ? `฿${d.price.toLocaleString("th-TH", { minimumFractionDigits: 2 })}` : "—"}
          </span>
          {d.drawn != null && (
            <span className="font-body text-[10px] tracking-[0.06em] text-on-surface-variant/60">{d.drawn} watching</span>
          )}
        </div>
      </div>
    </a>
  );
}

function ResaleCard({ r }: { r: ResaleListing }) {
  return (
    <a href={`/design/${r.design_id}`} className="card-bb block no-underline text-inherit group" data-testid="resale-card">
      <div className="aspect-[3/4] overflow-hidden bg-surface-dim relative">
        {r.image_url ? (
          <img
            src={r.image_url}
            alt={r.title}
            className="w-full h-full object-cover block transition-transform duration-500 group-hover:scale-[1.02]"
          />
        ) : (
          <Plate seed={0} density={1} />
        )}
      </div>
      <div className="p-5">
        <div className="flex justify-between items-start mb-2">
          <StatusTag status="resale" isResale />
          <span className="font-body text-[10px] tracking-[0.1em] text-on-surface-variant/60">Resale</span>
        </div>
        <h3 className="font-display text-headline-sm text-on-surface mb-1.5 group-hover:text-primary transition-colors duration-200">{r.title}</h3>
        <div className="font-body text-xs text-on-surface-variant mb-2">{r.style} · {r.placement}</div>
        <div className="mb-2.5">
          <SellingModeBadge mode={r.selling_mode} royaltyPct={r.royalty_pct} />
        </div>
        <div className="flex justify-between items-baseline pt-3 border-t border-outline-variant/20">
          <span className="font-display text-headline-sm text-on-surface">
            ฿{r.asking_price.toLocaleString("th-TH", { minimumFractionDigits: 2 })}
          </span>
          <span className="font-body text-[10px] text-on-surface-variant/60">by {r.artist_name}</span>
        </div>
      </div>
    </a>
  );
}

function FilterButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      className={`px-4 py-2 rounded-full text-sm font-body font-semibold border transition-all duration-200 ${active ? FILTER_ACTIVE : FILTER_INACTIVE}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

export default function MarketGrid({ designs, resaleListings = [] }: MarketGridProps) {
  const [styleFilter, setStyleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [listingFilter, setListingFilter] = useState<"all" | "primary" | "resale">("all");

  const filteredDesigns = (listingFilter === "resale" ? [] : designs).filter((d) => {
    const styleOk = styleFilter === "all" || d.style === styleFilter;
    const statusOk = statusFilter === "all" || d.status === statusFilter;
    return styleOk && statusOk;
  });

  const filteredResale = (listingFilter === "primary" ? [] : resaleListings).filter((r) => {
    const styleOk = styleFilter === "all" || r.style === styleFilter;
    return styleOk;
  });

  const totalCount = filteredDesigns.length + filteredResale.length;

  return (
    <div>
      {/* Filter bar */}
      <div className="flex flex-col gap-4 mb-10">
        {/* Listing type toggle */}
        <div className="flex flex-wrap gap-2" data-testid="filter-listing">
          {(["all", "primary", "resale"] as const).map((f) => (
            <FilterButton key={f} active={listingFilter === f} onClick={() => setListingFilter(f)}>
              {f === "all" ? "All listings" : f === "primary" ? "Primary" : "Resale"}
            </FilterButton>
          ))}
        </div>

        {/* Status filter (only for primary) */}
        {listingFilter !== "resale" && (
          <div className="flex flex-wrap gap-2" data-testid="filter-status">
            {["all", "available", "reserved", "sold"].map((s) => (
              <FilterButton key={s} active={statusFilter === s} onClick={() => setStatusFilter(s)}>
                {s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
              </FilterButton>
            ))}
          </div>
        )}

        {/* Style filter */}
        <div className="flex flex-wrap gap-2" data-testid="filter-style">
          <FilterButton active={styleFilter === "all"} onClick={() => setStyleFilter("all")}>
            All styles
          </FilterButton>
          {ALL_STYLES.map((s) => (
            <FilterButton key={s} active={styleFilter === s} onClick={() => setStyleFilter(s)}>
              {s}
            </FilterButton>
          ))}
        </div>
      </div>

      {/* Results */}
      {totalCount === 0 ? (
        <div className="text-center py-16">
          <p className="font-body text-body-md text-on-surface-variant">No plates match your filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-gutter" data-testid="plate-grid">
          {filteredDesigns.map((d) => (
            <DesignCard key={d.id} d={d} />
          ))}
          {filteredResale.map((r) => (
            <ResaleCard key={r.id} r={r} />
          ))}
        </div>
      )}
    </div>
  );
}
