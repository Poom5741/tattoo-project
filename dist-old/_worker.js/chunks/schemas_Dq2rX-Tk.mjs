globalThis.process ??= {};
globalThis.process.env ??= {};
import { s as stringType, o as objectType, n as numberType, e as enumType } from "./astro/server_B1Q-Dpks.mjs";
const HexAddress = stringType().regex(/^0x[0-9a-fA-F]{40}$/, "Must be a 0x Ethereum address");
const HexTxHash = stringType().regex(/^0x[0-9a-fA-F]{64}$/, "Must be a 0x transaction hash");
objectType({
  id: stringType(),
  n: stringType(),
  title: stringType(),
  artist_id: stringType(),
  style: stringType().nullable(),
  price: numberType().nullable(),
  price_usd: numberType().int().nullable(),
  status: enumType(["available", "reserved", "sold", "owned", "pending", "rejected", "delisted"]),
  placement: stringType().nullable(),
  seed: numberType().nullable(),
  token: stringType().nullable(),
  minted: stringType().nullable(),
  medium: stringType().nullable(),
  sessions: numberType().int().nullable(),
  drawn: numberType().int().nullable(),
  image_override_url: stringType().url().nullable(),
  token_id: numberType().int().nullable(),
  reserved_until: numberType().int().nullable(),
  ipfs_cid: stringType().nullable(),
  selling_mode: enumType(["one-time", "resellable"]).default("one-time"),
  royalty_pct: numberType().nullable().optional(),
  image_url: stringType().nullable().optional()
});
objectType({
  id: stringType(),
  name: stringType(),
  handle: stringType().nullable(),
  city: stringType().nullable(),
  style: stringType().nullable(),
  years: numberType().int().nullable(),
  booked: stringType().nullable(),
  rate: numberType().int().nullable(),
  bio: stringType().nullable(),
  pieces: numberType().int().nullable(),
  rating: stringType().nullable(),
  seed: numberType().int().nullable(),
  email: stringType().email().nullable()
});
const BookingInquirySchema = objectType({
  artistId: stringType().min(1),
  designId: stringType().nullish(),
  name: stringType().min(1).max(200),
  contact: stringType().min(1).max(500),
  message: stringType().max(2e3).nullish(),
  bookingType: enumType(["plate", "custom"]).default("plate"),
  customStyle: stringType().max(100).nullish(),
  customSize: enumType(["small", "medium", "large", "extra-large"]).nullish(),
  customPlacement: stringType().max(200).nullish(),
  customBudget: stringType().max(100).nullish()
});
const VoucherRequestSchema = objectType({
  designId: stringType().min(1),
  buyer: HexAddress
});
const ConfirmRequestSchema = objectType({
  txHash: HexTxHash,
  tokenId: numberType().int().positive()
});
const CreateDesignSchema = objectType({
  title: stringType().min(1).max(200),
  style: stringType().min(1).max(100),
  price_usdt: numberType().positive(),
  placement: stringType().min(1).max(200),
  medium: stringType().min(1).max(200),
  selling_mode: enumType(["one-time", "resellable"]),
  royalty_pct: numberType().min(5).max(15).optional(),
  image_key: stringType().min(1)
}).refine(
  (d) => d.selling_mode === "one-time" || d.royalty_pct !== void 0,
  { message: "royalty_pct required for resellable designs", path: ["royalty_pct"] }
);
const ReviewDesignSchema = objectType({
  designId: stringType().min(1),
  action: enumType(["approve", "reject"])
});
const ResaleListingSchema = objectType({
  designId: stringType().min(1),
  tokenId: numberType().int().positive(),
  askingPrice: numberType().positive(),
  sellerWallet: HexAddress
});
const CreateOrderSchema = objectType({
  designId: stringType().min(1),
  customerId: stringType().optional(),
  customerEmail: stringType().email().optional(),
  customerPhone: stringType().max(20).optional(),
  channelCode: stringType().optional()
  // e.g., "qrpayment", "creditcard"
});
objectType({
  action: enumType(["accept", "decline"]),
  appointmentDate: numberType().int().optional()
}).refine(
  (d) => d.action === "decline" || d.appointmentDate !== void 0,
  { message: "appointmentDate required when accepting", path: ["appointmentDate"] }
);
export {
  BookingInquirySchema as B,
  CreateOrderSchema as C,
  HexAddress as H,
  ReviewDesignSchema as R,
  VoucherRequestSchema as V,
  ConfirmRequestSchema as a,
  CreateDesignSchema as b,
  ResaleListingSchema as c
};
