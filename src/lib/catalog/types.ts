export type StatusValue = "available" | "reserved" | "sold" | "owned";

export const STATUS = {
  AVAIL: "available",
  RESERVED: "reserved",
  SOLD: "sold",
  OWNED: "owned",
} as const;

export const STYLES = [
  "Fine Line",
  "Blackwork",
  "Irezumi",
  "Geometric",
  "Realism",
  "Lettering",
  "Neo-Trad",
] as const;

export type Style = (typeof STYLES)[number];

export interface Artist {
  id: string;
  name: string;
  handle: string;
  city: string;
  style: string;
  years: number;
  booked: string;
  rate: number;
  bio: string;
  pieces: number;
  rating: string;
  seed: number;
}

export interface Design {
  id: string;
  n: string;
  title: string;
  artistId: string;
  artistName: string;
  style: string;
  price: number;
  priceUsd: number;
  status: StatusValue;
  placement: string;
  seed: number;
  token: string;
  minted: string;
  medium: string;
  sessions: number;
  drawn: number;
  token_id: number;
}
