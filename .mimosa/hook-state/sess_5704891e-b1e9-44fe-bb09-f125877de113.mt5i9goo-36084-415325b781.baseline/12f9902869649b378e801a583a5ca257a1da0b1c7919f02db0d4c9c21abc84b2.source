import type { Artist, Design, StatusValue } from "./types";
export { STYLES, STATUS } from "./types";

export function hash6(n: number): string {
  const s = ((((n * 2654435761) % 16777619) >>> 0)).toString(16).padStart(6, "0");
  return s.slice(0, 6);
}

export const ARTISTS: Artist[] = [
  {
    id: "mara",
    name: "Mara Vael",
    handle: "@maravael",
    city: "Berlin, DE",
    style: "Fine Line · Blackwork",
    years: 9,
    booked: "Booking Aug 2026",
    rate: 180,
    bio: "Mara works in negative space and single-needle linework — quiet compositions that sit close to the skin. Every flash piece she releases is drawn once and retired the moment it is claimed.",
    pieces: 41,
    rating: "4.98",
    seed: 11,
  },
  {
    id: "koto",
    name: "Koto Arai",
    handle: "@koto.irezumi",
    city: "Osaka, JP",
    style: "Irezumi · Neo-Traditional",
    years: 14,
    booked: "Waitlist open",
    rate: 240,
    bio: "Trained in the tebori tradition, Koto reinterprets classical Japanese motifs as one-off contemporary plates. Bold line, restrained palette, no repeats.",
    pieces: 63,
    rating: "5.00",
    seed: 29,
  },
  {
    id: "sol",
    name: "Sol Reyes",
    handle: "@sol.blackout",
    city: "Mexico City, MX",
    style: "Blackwork · Geometric",
    years: 7,
    booked: "Booking now",
    rate: 160,
    bio: "Heavy black, sacred geometry, and ornamental linework. Sol releases limited plates that read as objects first, tattoos second.",
    pieces: 33,
    rating: "4.95",
    seed: 47,
  },
  {
    id: "vera",
    name: "Vera Lindqvist",
    handle: "@vera.etch",
    city: "Stockholm, SE",
    style: "Etching · Realism",
    years: 11,
    booked: "Booking Sep 2026",
    rate: 210,
    bio: "Etching-style stippling that mimics old engraving plates. Vera's releases come with a hand-pulled proof — the design is never inked twice.",
    pieces: 52,
    rating: "4.99",
    seed: 71,
  },
];

const STATUS_AVAIL = "available" as StatusValue;
const STATUS_RESERVED = "reserved" as StatusValue;
const STATUS_SOLD = "sold" as StatusValue;

const _titles: [string, string, string, number, StatusValue, number, string][] = [
  ["Serpent in Negative", "mara", "Fine Line", 1.2, STATUS_AVAIL, 14, "Forearm · 16cm"],
  ["Koi Ascending", "koto", "Irezumi", 2.8, STATUS_AVAIL, 27, "Back · 34cm"],
  ["The Ornamental Eye", "sol", "Geometric", 1.6, STATUS_AVAIL, 5, "Sternum · 18cm"],
  ["Etched Moth", "vera", "Realism", 2.1, STATUS_RESERVED, 41, "Thigh · 22cm"],
  ["Single Crane", "koto", "Irezumi", 1.9, STATUS_AVAIL, 12, "Shoulder · 20cm"],
  ["Black Sun Mandala", "sol", "Blackwork", 2.4, STATUS_AVAIL, 8, "Spine · 30cm"],
  ["Wildflower Study", "mara", "Fine Line", 0.9, STATUS_SOLD, 3, "Ankle · 9cm"],
  ["Engraved Skull", "vera", "Realism", 3.2, STATUS_AVAIL, 33, "Forearm · 19cm"],
  ["Tiger, Folded", "koto", "Neo-Trad", 2.6, STATUS_AVAIL, 19, "Calf · 26cm"],
  ["Sacred Lattice", "sol", "Geometric", 1.4, STATUS_RESERVED, 7, "Hand · 11cm"],
  ["Thread & Needle", "mara", "Fine Line", 1.1, STATUS_AVAIL, 22, "Collar · 13cm"],
  ["Old Plate Anchor", "vera", "Lettering", 1.7, STATUS_AVAIL, 15, "Bicep · 17cm"],
  ["Smoke Dragon", "koto", "Irezumi", 3.6, STATUS_AVAIL, 2, "Full Sleeve · 48cm"],
  ["Twin Daggers", "sol", "Blackwork", 1.3, STATUS_SOLD, 9, "Ribs · 15cm"],
  ["Hare in Ink", "vera", "Realism", 1.8, STATUS_AVAIL, 28, "Thigh · 21cm"],
];

export const DESIGNS: Design[] = _titles.map((t, i) => {
  const [title, artistId, style, price, status, edDrawn, placement] = t;
  const artist = ARTISTS.find((a) => a.id === artistId)!;
  return {
    id: "d" + (i + 1),
    n: String(i + 1).padStart(3, "0"),
    title,
    artistId,
    artistName: artist.name,
    style,
    price,
    priceUsd: Math.round(price * 2480),
    status,
    placement,
    seed: artist.seed + i * 13,
    token: "0x" + hash6(i + 7) + "…" + hash6(i * 3 + 2),
    minted: "2026-0" + ((i % 5) + 1) + "-" + String((i * 3) % 27 + 1).padStart(2, "0"),
    medium: (["Single needle", "Tebori + machine", "Machine, heavy black", "Stipple / etch"] as const)[i % 4],
    sessions: 1 + (i % 3),
    drawn: edDrawn,
    token_id: i + 1,
  };
});
