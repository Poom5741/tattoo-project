/**
 * Voucher signer — unit tests.
 *
 * These tests target src/lib/voucher.ts which is created in Phase 4 (T6).
 * They will fail with "Cannot find module" until T6 is complete.
 *
 * Expected module exports:
 *   signVoucher(params: VoucherParams, privateKey: `0x${string}`): Promise<`0x${string}`>
 *   VoucherSchema (Zod schema)
 *
 * Prerequisites: vitest (pnpm test). No network required.
 */

import { describe, it, expect, beforeAll } from "vitest";
import { existsSync } from "fs";
import { z } from "zod";

const hasVoucher = existsSync("src/lib/voucher.ts");

let signVoucher: any;
let VoucherSchema: any;

const TEST_PRIVATE_KEY =
  "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80" as const; // Foundry default key #0

const VALID_PARAMS = {
  designId: "1",
  price: "10000000000000000", // 0.01 ETH in wei
  recipient: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
  nonce: 0,
};

describe.skipIf(!hasVoucher)("signVoucher", () => {
  beforeAll(async () => {
    if (hasVoucher) {
      const modPath = "../../src/lib/voucher";
      const mod = await import(/* @vite-ignore */ modPath);
      signVoucher = mod.signVoucher;
      VoucherSchema = mod.VoucherSchema;
    }
  });
  it("produces a deterministic signature for fixed inputs", async () => {
    const sig1 = await signVoucher(VALID_PARAMS, TEST_PRIVATE_KEY);
    const sig2 = await signVoucher(VALID_PARAMS, TEST_PRIVATE_KEY);
    expect(sig1).toBe(sig2);
    expect(sig1).toMatch(/^0x[0-9a-fA-F]{130}$/);
  });

  it("produces different signatures for different designIds", async () => {
    const sig1 = await signVoucher(VALID_PARAMS, TEST_PRIVATE_KEY);
    const sig2 = await signVoucher({ ...VALID_PARAMS, designId: "2" }, TEST_PRIVATE_KEY);
    expect(sig1).not.toBe(sig2);
  });
});

describe.skipIf(!hasVoucher)("VoucherSchema", () => {
  it("accepts valid voucher params", () => {
    expect(() => VoucherSchema.parse(VALID_PARAMS)).not.toThrow();
  });

  it("rejects missing designId", () => {
    const { designId: _removed, ...rest } = VALID_PARAMS;
    expect(() => VoucherSchema.parse(rest)).toThrow(z.ZodError);
  });

  it("rejects non-numeric price string", () => {
    expect(() => VoucherSchema.parse({ ...VALID_PARAMS, price: "not-a-number" })).toThrow(z.ZodError);
  });

  it("rejects invalid Ethereum address for recipient", () => {
    expect(() => VoucherSchema.parse({ ...VALID_PARAMS, recipient: "not-an-address" })).toThrow(z.ZodError);
  });
});
