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

function StatusTag({ status, isResale }: { status: string; isResale?: boolean }) {
  if (isResale) {
    return (
      <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-[#818cf8]/15 text-[#818cf8] border border-[#818cf8]/40">
        <span className="w-1.5 h-1.5 rounded-full bg-[#818cf8]"></span>
        Resale
      </span>
    );
  }
  const map: Record<string, { label: string; cls: string }> = {
    available: { label: "Available", cls: "bg-[#2E7D32]/15 text-[#2E7D32] border border-[#2E7D32]/40" },
    reserved: { label: "Reserved", cls: "bg-[#F9A825]/15 text-[#F9A825] border border-[#F9A825]/40" },
    sold: { label: "Claimed", cls: "bg-[#5A5B55]/15 text-[#5A5B55] border border-[#5A5B55]/40" },
  };
  const { label, cls } = map[status] ?? { label: status, cls: "" };
  return (
    <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold ${cls}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
      {label}
    </span>
  );
}

function SellingModeBadge({ mode, royaltyPct }: { mode?: string; royaltyPct?: number | null }) {
  if (!mode) return null;
  if (mode === "one-time") {
    return (
      <span className="font-sora text-[10px] tracking-[0.1em] text-[#5A5B55]/60 bg-[#C9A96E]/10 border border-[#E8E3D8] px-1.5 py-px rounded">
        SOULBOUND
      </span>
    );
  }
  return (
    <span className="font-sora text-[10px] tracking-[0.1em] text-[#5A5B55]/60 bg-[#64C864]/10 border border-[#E8E3D8] px-1.5 py-px rounded">
      RESELLABLE {royaltyPct ? `${royaltyPct}%` : ""}
    </span>
  );
}

function DesignCard({ d }: { d: DesignData }) {
  return (
    <a href={`/design/${d.id}`} className="block no-underline text-inherit">
      <div className="bg-[#F0EBE1] rounded-lg border border-[#E8E3D8]/30 overflow-hidden hover:shadow-md transition-all cursor-pointer">
        <div className="aspect-[3/4] overflow-hidden bg-[#F5F0E8] relative">
          {d.image_url ? (
            <img
              src={d.image_url}
              alt={d.title}
              className="w-full h-full object-cover block"
            />
          ) : (
            <Plate seed={d.seed ?? 0} density={1} />
          )}
        </div>
        <div className="p-5">
          <div className="flex justify-between items-start mb-2">
            <StatusTag status={d.status} />
            <span className="font-sora text-[#5A5B55]/60 text-[10px] tracking-[0.1em]">№ {d.n}/001</span>
          </div>
          <h3 className="font-playfair font-semibold text-[#1B1C18] text-[20px] mb-1.5">{d.title}</h3>
          <div className="font-sora text-[#5A5B55] text-[11px] mb-2">{d.style} · {d.placement}</div>
          {d.selling_mode && (
            <div className="mb-2.5">
              <SellingModeBadge mode={d.selling_mode} royaltyPct={d.royalty_pct} />
            </div>
          )}
          <div className="flex justify-between items-baseline">
            <span className="font-playfair font-semibold text-[#1B1C18] text-[22px]">
              {d.price != null ? d.price.toFixed(2) + " USDT" : "—"}
            </span>
            {d.drawn != null && (
              <span className="font-sora text-[#5A5B55]/60 text-[10px] tracking-[0.06em]">{d.drawn} watching</span>
            )}
          </div>
        </div>
      </div>
    </a>
  );
}

function ResaleCard({ r }: { r: ResaleListing }) {
  return (
    <a href={`/design/${r.design_id}`} className="block no-underline text-inherit">
      <div className="bg-[#F0EBE1] rounded-lg border border-[#E8E3D8]/30 overflow-hidden hover:shadow-md transition-all cursor-pointer">
        <div className="aspect-[3/4] overflow-hidden bg-[#F5F0E8] relative">
          {r.image_url ? (
            <img
              src={r.image_url}
              alt={r.title}
              className="w-full h-full object-cover block"
            />
          ) : (
            <Plate seed={0} density={1} />
          )}
        </div>
        <div className="p-5">
          <div className="flex justify-between items-start mb-2">
            <StatusTag status="resale" isResale />
            <span className="font-sora text-[#5A5B55]/60 text-[10px] tracking-[0.1em]">Resale</span>
          </div>
          <h3 className="font-playfair font-semibold text-[#1B1C18] text-[20px] mb-1.5">{r.title}</h3>
          <div className="font-sora text-[#5A5B55] text-[11px] mb-2">{r.style} · {r.placement}</div>
          <div className="mb-2.5">
            <SellingModeBadge mode={r.selling_mode} royaltyPct={r.royalty_pct} />
          </div>
          <div className="flex justify-between items-baseline">
            <span className="font-playfair font-semibold text-[#1B1C18] text-[22px]">
              {r.asking_price.toFixed(2)} USDT
            </span>
            <span className="font-sora text-[#5A5B55]/60 text-[10px]">by {r.artist_name}</span>
          </div>
        </div>
      </div>
    </a>
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
      <div className="flex gap-3 flex-wrap mb-8">
        {/* Primary/Resale toggle */}
        <div className="flex flex-wrap gap-2">
          {(["all", "primary", "resale"] as const).map((f) => (
            <button
              key={f}
              className={`px-4 py-2 rounded-full text-sm font-sora font-medium border border-[#E8E3D8] hover:border-[#D4CFC4] transition-colors ${listingFilter === f ? "bg-[#E60023] text-white border-[#E60023]" : ""}`}
              onClick={() => setListingFilter(f)}
            >
              {f === "all" ? "All listings" : f === "primary" ? "Primary" : "Resale"}
            </button>
          ))}
        </div>
        {/* Status filter (only relevant for primary) */}
        {listingFilter !== "resale" && (
          <div className="flex flex-wrap gap-2">
            {["all", "available", "reserved", "sold"].map((s) => (
              <button
                key={s}
                className={`px-4 py-2 rounded-full text-sm font-sora font-medium border border-[#E8E3D8] hover:border-[#D4CFC4] transition-colors ${statusFilter === s ? "bg-[#E60023] text-white border-[#E60023]" : ""}`}
                onClick={() => setStatusFilter(s)}
              >
                {s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        )}
        {/* Style filter */}
        <div className="flex flex-wrap gap-2">
          <button
            className={`px-4 py-2 rounded-full text-sm font-sora font-medium border border-[#E8E3D8] hover:border-[#D4CFC4] transition-colors ${styleFilter === "all" ? "bg-[#E60023] text-white border-[#E60023]" : ""}`}
            onClick={() => setStyleFilter("all")}
          >
            All styles
          </button>
          {ALL_STYLES.map((s) => (
            <button
              key={s}
              className={`px-4 py-2 rounded-full text-sm font-sora font-medium border border-[#E8E3D8] hover:border-[#D4CFC4] transition-colors ${styleFilter === s ? "bg-[#E60023] text-white border-[#E60023]" : ""}`}
              onClick={() => setStyleFilter(s)}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {totalCount === 0 ? (
        <div className="text-center py-[60px]">
          <p className="font-sora text-[#5A5B55] text-[13px]">No plates match your filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
