import { z } from "zod";

const HexAddress = z.string().regex(/^0x[0-9a-fA-F]{40}$/, "Must be a 0x Ethereum address");
const HexTxHash = z.string().regex(/^0x[0-9a-fA-F]{64}$/, "Must be a 0x transaction hash");

export const DesignSchema = z.object({
  id: z.string(),
  n: z.string(),
  title: z.string(),
  artist_id: z.string(),
  style: z.string().nullable(),
  price: z.number().nullable(),
  price_usd: z.number().int().nullable(),
  status: z.enum(["available", "reserved", "sold", "owned", "pending", "rejected", "delisted"]),
  placement: z.string().nullable(),
  seed: z.number().nullable(),
  token: z.string().nullable(),
  minted: z.string().nullable(),
  medium: z.string().nullable(),
  sessions: z.number().int().nullable(),
  drawn: z.number().int().nullable(),
  image_override_url: z.string().url().nullable(),
  token_id: z.number().int().nullable(),
  reserved_until: z.number().int().nullable(),
  ipfs_cid: z.string().nullable(),
  selling_mode: z.enum(["one-time", "resellable"]).default("one-time"),
  royalty_pct: z.number().nullable().optional(),
  image_url: z.string().nullable().optional(),
});

export const ArtistSchema = z.object({
  id: z.string(),
  name: z.string(),
  handle: z.string().nullable(),
  city: z.string().nullable(),
  style: z.string().nullable(),
  years: z.number().int().nullable(),
  booked: z.string().nullable(),
  rate: z.number().int().nullable(),
  bio: z.string().nullable(),
  pieces: z.number().int().nullable(),
  rating: z.string().nullable(),
  seed: z.number().int().nullable(),
  email: z.string().email().nullable(),
});

export const BookingInquirySchema = z.object({
  artistId: z.string().min(1),
  designId: z.string().optional(),
  name: z.string().min(1).max(200),
  contact: z.string().min(1).max(500),
  message: z.string().max(2000).optional(),
  bookingType: z.enum(["plate", "custom"]).default("plate"),
  customStyle: z.string().max(100).optional(),
  customSize: z.enum(["small", "medium", "large", "extra-large"]).optional(),
  customPlacement: z.string().max(200).optional(),
  customBudget: z.string().max(100).optional(),
});

export const VoucherRequestSchema = z.object({
  designId: z.string().min(1),
  buyer: HexAddress,
});

export const ConfirmRequestSchema = z.object({
  txHash: HexTxHash,
  tokenId: z.number().int().positive(),
});

export const CreateDesignSchema = z.object({
  title: z.string().min(1).max(200),
  style: z.string().min(1).max(100),
  price_usdt: z.number().positive(),
  placement: z.string().min(1).max(200),
  medium: z.string().min(1).max(200),
  selling_mode: z.enum(["one-time", "resellable"]),
  royalty_pct: z.number().min(5).max(15).optional(),
  image_key: z.string().min(1),
}).refine(
  (d) => d.selling_mode === "one-time" || d.royalty_pct !== undefined,
  { message: "royalty_pct required for resellable designs", path: ["royalty_pct"] }
);

export const ReviewDesignSchema = z.object({
  designId: z.string().min(1),
  action: z.enum(["approve", "reject"]),
});

export const ResaleListingSchema = z.object({
  designId: z.string().min(1),
  tokenId: z.number().int().positive(),
  askingPrice: z.number().positive(),
  sellerWallet: HexAddress,
});

export const BookingActionSchema = z.object({
  action: z.enum(["accept", "decline"]),
  appointmentDate: z.number().int().optional(),
}).refine(
  (d) => d.action === "decline" || d.appointmentDate !== undefined,
  { message: "appointmentDate required when accepting", path: ["appointmentDate"] }
);

export type Design = z.infer<typeof DesignSchema>;
export type Artist = z.infer<typeof ArtistSchema>;
export type BookingInquiry = z.infer<typeof BookingInquirySchema>;
export type VoucherRequest = z.infer<typeof VoucherRequestSchema>;
export type ConfirmRequest = z.infer<typeof ConfirmRequestSchema>;
export type CreateDesign = z.infer<typeof CreateDesignSchema>;
export type ReviewDesign = z.infer<typeof ReviewDesignSchema>;
export type ResaleListing = z.infer<typeof ResaleListingSchema>;
export type BookingAction = z.infer<typeof BookingActionSchema>;
