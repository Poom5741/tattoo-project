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
      <span className="tag" style={{ background: "rgba(99,102,241,0.15)", borderColor: "rgba(99,102,241,0.4)", color: "#818cf8" }}>
        <span className="dot" style={{ background: "#818cf8" }}></span>
        Resale
      </span>
    );
  }
  const map: Record<string, { label: string; cls: string }> = {
    available: { label: "Available", cls: "tag--avail" },
    reserved: { label: "Reserved", cls: "tag--reserved" },
    sold: { label: "Claimed", cls: "tag--sold" },
  };
  const { label, cls } = map[status] ?? { label: status, cls: "" };
  return (
    <span className={`tag ${cls}`}>
      <span className="dot"></span>
      {label}
    </span>
  );
}

function SellingModeBadge({ mode, royaltyPct }: { mode?: string; royaltyPct?: number | null }) {
  if (!mode) return null;
  if (mode === "one-time") {
    return (
      <span className="mono" style={{ fontSize: 9, letterSpacing: ".1em", color: "var(--fg-faint)", background: "rgba(201,169,110,0.08)", border: "1px solid var(--line)", padding: "1px 6px" }}>
        SOULBOUND
      </span>
    );
  }
  return (
    <span className="mono" style={{ fontSize: 9, letterSpacing: ".1em", color: "var(--fg-faint)", background: "rgba(100,200,100,0.08)", border: "1px solid var(--line)", padding: "1px 6px" }}>
      RESELLABLE {royaltyPct ? `${royaltyPct}%` : ""}
    </span>
  );
}

function DesignCard({ d }: { d: DesignData }) {
  return (
    <a href={`/design/${d.id}`} style={{ display: "block", textDecoration: "none", color: "inherit" }}>
      <div className="card" style={{ cursor: "pointer" }}>
        <div className="card__img" style={{ position: "relative" }}>
          {d.image_url ? (
            <img
              src={d.image_url}
              alt={d.title}
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
            />
          ) : (
            <Plate seed={d.seed ?? 0} density={1} />
          )}
        </div>
        <div className="card__body">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
            <StatusTag status={d.status} />
            <span className="mono faint" style={{ fontSize: 10, letterSpacing: ".1em" }}>№ {d.n}/001</span>
          </div>
          <h3 className="display" style={{ fontSize: 20, marginBottom: 6 }}>{d.title}</h3>
          <div className="mono dim" style={{ fontSize: 11, marginBottom: 8 }}>{d.style} · {d.placement}</div>
          {d.selling_mode && (
            <div style={{ marginBottom: 10 }}>
              <SellingModeBadge mode={d.selling_mode} royaltyPct={d.royalty_pct} />
            </div>
          )}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
            <span className="display" style={{ fontSize: 22 }}>
              {d.price != null ? d.price.toFixed(2) + " USDT" : "—"}
            </span>
            {d.drawn != null && (
              <span className="mono faint" style={{ fontSize: 10, letterSpacing: ".06em" }}>{d.drawn} watching</span>
            )}
          </div>
        </div>
      </div>
    </a>
  );
}

function ResaleCard({ r }: { r: ResaleListing }) {
  return (
    <a href={`/design/${r.design_id}`} style={{ display: "block", textDecoration: "none", color: "inherit" }}>
      <div className="card" style={{ cursor: "pointer" }}>
        <div className="card__img" style={{ position: "relative" }}>
          {r.image_url ? (
            <img
              src={r.image_url}
              alt={r.title}
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
            />
          ) : (
            <Plate seed={0} density={1} />
          )}
        </div>
        <div className="card__body">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
            <StatusTag status="resale" isResale />
            <span className="mono faint" style={{ fontSize: 10, letterSpacing: ".1em" }}>Resale</span>
          </div>
          <h3 className="display" style={{ fontSize: 20, marginBottom: 6 }}>{r.title}</h3>
          <div className="mono dim" style={{ fontSize: 11, marginBottom: 8 }}>{r.style} · {r.placement}</div>
          <div style={{ marginBottom: 10 }}>
            <SellingModeBadge mode={r.selling_mode} royaltyPct={r.royalty_pct} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
            <span className="display" style={{ fontSize: 22 }}>
              {r.asking_price.toFixed(2)} USDT
            </span>
            <span className="mono faint" style={{ fontSize: 10 }}>by {r.artist_name}</span>
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
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 32 }}>
        {/* Primary/Resale toggle */}
        <div className="opt-row">
          {(["all", "primary", "resale"] as const).map((f) => (
            <button
              key={f}
              className={"opt" + (listingFilter === f ? " is-on" : "")}
              onClick={() => setListingFilter(f)}
            >
              {f === "all" ? "All listings" : f === "primary" ? "Primary" : "Resale"}
            </button>
          ))}
        </div>
        {/* Status filter (only relevant for primary) */}
        {listingFilter !== "resale" && (
          <div className="opt-row">
            {["all", "available", "reserved", "sold"].map((s) => (
              <button
                key={s}
                className={"opt" + (statusFilter === s ? " is-on" : "")}
                onClick={() => setStatusFilter(s)}
              >
                {s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        )}
        {/* Style filter */}
        <div className="opt-row">
          <button
            className={"opt" + (styleFilter === "all" ? " is-on" : "")}
            onClick={() => setStyleFilter("all")}
          >
            All styles
          </button>
          {ALL_STYLES.map((s) => (
            <button
              key={s}
              className={"opt" + (styleFilter === s ? " is-on" : "")}
              onClick={() => setStyleFilter(s)}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {totalCount === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 0" }}>
          <p className="mono dim" style={{ fontSize: 13 }}>No plates match your filters.</p>
        </div>
      ) : (
        <div className="grid market-grid">
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
