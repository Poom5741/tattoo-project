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
  price_usd: number | null;
  status: string;
  placement: string | null;
  seed: number | null;
  drawn: number | null;
}

interface MarketGridProps {
  designs: DesignData[];
  initialState?: State;
}

const ALL_STYLES = ["Fine Line", "Blackwork", "Irezumi", "Geometric", "Realism", "Lettering", "Neo-Trad"];

function StatusTag({ status }: { status: string }) {
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

function DesignCard({ d }: { d: DesignData }) {
  return (
    <a href={`/design/${d.id}`} style={{ display: "block", textDecoration: "none", color: "inherit" }}>
      <div className="card" style={{ cursor: "pointer" }}>
        <div className="card__img">
          <Plate seed={d.seed ?? 0} density={1} />
        </div>
        <div className="card__body">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
            <StatusTag status={d.status} />
            <span className="mono faint" style={{ fontSize: 10, letterSpacing: ".1em" }}>№ {d.n}/001</span>
          </div>
          <h3 className="display" style={{ fontSize: 20, marginBottom: 8 }}>{d.title}</h3>
          <div className="mono dim" style={{ fontSize: 11, marginBottom: 12 }}>{d.style} · {d.placement}</div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
            <span className="display" style={{ fontSize: 22 }}>
              {d.price != null ? d.price.toFixed(3) + " ETH" : "—"}
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

export default function MarketGrid({ designs }: MarketGridProps) {
  const [styleFilter, setStyleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filtered = designs.filter((d) => {
    const styleOk = styleFilter === "all" || d.style === styleFilter;
    const statusOk = statusFilter === "all" || d.status === statusFilter;
    return styleOk && statusOk;
  });

  return (
    <div>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 32 }}>
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

      {filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 0" }}>
          <p className="mono dim" style={{ fontSize: 13 }}>No plates match your filters.</p>
        </div>
      ) : (
        <div className="grid market-grid">
          {filtered.map((d) => (
            <DesignCard key={d.id} d={d} />
          ))}
        </div>
      )}
    </div>
  );
}
