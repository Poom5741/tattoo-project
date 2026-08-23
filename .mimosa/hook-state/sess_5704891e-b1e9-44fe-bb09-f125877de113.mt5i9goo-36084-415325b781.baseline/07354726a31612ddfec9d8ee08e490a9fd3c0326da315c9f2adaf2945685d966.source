/**
 * Passkey crypto — unit tests (TDD red→green).
 *
 * Tests pure Web Crypto wrappers: base64, encrypt/decrypt, HKDF, random.
 * No DOM APIs required — runs in vitest + happy-dom.
 */

import { describe, it, expect, beforeAll } from "vitest";
import {
  base64Encode,
  base64Decode,
  base64urlEncode,
  base64urlDecode,
  encryptString,
  decryptString,
  deriveAESKeyFromPRF,
  generateRandomBytes,
  generateRandomSecret,
} from "@/lib/passkey/crypto";

// ── Base64 ──────────────────────────────────────────────────────

describe("base64Encode / base64Decode", () => {
  it("encodes a small byte array to standard base64", () => {
    const input = new Uint8Array([104, 101, 108, 108, 111]); // "hello"
    expect(base64Encode(input)).toBe("aGVsbG8=");
  });

  it("decodes standard base64 back to original bytes", () => {
    const result = base64Decode("aGVsbG8=");
    expect([...result]).toEqual([104, 101, 108, 108, 111]);
  });

  it("round-trips arbitrary binary data", () => {
    const original = new Uint8Array([0, 255, 128, 64, 32, 1, 7]);
    const encoded = base64Encode(original);
    const decoded = base64Decode(encoded);
    expect([...decoded]).toEqual([...original]);
  });

  it("handles empty input", () => {
    expect(base64Encode(new Uint8Array(0))).toBe("");
    expect([...base64Decode("")]).toEqual([]);
  });

  it("rejects invalid base64 characters", () => {
    expect(() => base64Decode("!!!!")).toThrow("Invalid base64 character");
    expect(() => base64Decode("aGVs*G8=")).toThrow("Invalid base64 character");
  });
});

describe("base64urlEncode / base64urlDecode", () => {
  it("produces URL-safe output (no + / =)", () => {
    const input = new Uint8Array([255, 255, 255]); // base64 = "////"
    const encoded = base64urlEncode(input);
    expect(encoded).not.toContain("+");
    expect(encoded).not.toContain("/");
    expect(encoded).not.toContain("=");
    expect(encoded).toBe("____"); // base64url encoding of 0xFFFFFF
  });

  it("decodes URL-safe base64 correctly", () => {
    const encoded = "aGVsbG8"; // "hello" without padding
    const result = base64urlDecode(encoded);
    expect([...result]).toEqual([104, 101, 108, 108, 111]);
  });

  it("round-trips arbitrary binary data", () => {
    const original = new Uint8Array([0, 255, 128, 64, 32, 1, 7]);
    const encoded = base64urlEncode(original);
    const decoded = base64urlDecode(encoded);
    expect([...decoded]).toEqual([...original]);
  });

  it("handles empty input", () => {
    expect(base64urlEncode(new Uint8Array(0))).toBe("");
    expect([...base64urlDecode("")]).toEqual([]);
  });

  it("rejects invalid base64url characters", () => {
    expect(() => base64urlDecode("!!!!")).toThrow("Invalid base64 character");
    // base64url encoder shouldn't produce + or /, but decoder rejects them
    expect(() => base64urlDecode("a+b/c")).toThrow("Invalid base64 character");
  });
});

// ── Random ──────────────────────────────────────────────────────

describe("generateRandomBytes", () => {
  it("returns a Uint8Array of the requested length", () => {
    const result = generateRandomBytes(16);
    expect(result).toBeInstanceOf(Uint8Array);
    expect(result.length).toBe(16);
  });

  it("returns different values on successive calls", () => {
    const a = generateRandomBytes(32);
    const b = generateRandomBytes(32);
    expect([...a]).not.toEqual([...b]);
  });
});

describe("generateRandomSecret", () => {
  it("returns a base64url-encoded string of expected length", () => {
    const secret = generateRandomSecret();
    expect(typeof secret).toBe("string");
    // 32 bytes → 43 chars base64url (no padding)
    expect(secret.length).toBe(43);
  });

  it("returns different values on successive calls", () => {
    expect(generateRandomSecret()).not.toBe(generateRandomSecret());
  });
});

// ── HKDF ────────────────────────────────────────────────────────

describe("deriveAESKeyFromPRF", () => {
  it("produces a CryptoKey with AES-GCM usage", async () => {
    const input = new Uint8Array(32).fill(42);
    const key = await deriveAESKeyFromPRF(input);
    expect(key.algorithm).toMatchObject({ name: "AES-GCM" });
    expect(key.usages).toContain("encrypt");
    expect(key.usages).toContain("decrypt");
  });

  it("is deterministic — same input yields extractable key", async () => {
    const input = new Uint8Array(32).fill(7);
    const key1 = await deriveAESKeyFromPRF(input);
    const key2 = await deriveAESKeyFromPRF(input);
    // Can't compare CryptoKey objects directly, but we can verify
    // they both encrypt/decrypt the same data
    const plaintext = "deterministic test";
    const ct = await encryptString(plaintext, key1);
    const pt = await decryptString(ct, key2);
    expect(pt).toBe(plaintext);
  });

  it("different inputs produce different keys", async () => {
    const inputA = new Uint8Array(32).fill(1);
    const inputB = new Uint8Array(32).fill(2);
    const keyA = await deriveAESKeyFromPRF(inputA);
    const keyB = await deriveAESKeyFromPRF(inputB);
    const pt = "different keys test";
    const ct = await encryptString(pt, keyA);
    // decrypting with keyB should fail or produce garbage
    await expect(decryptString(ct, keyB)).rejects.toThrow();
  });
});

// ── Encrypt / Decrypt ───────────────────────────────────────────

describe("encryptString / decryptString", () => {
  let key: CryptoKey;

  beforeAll(async () => {
    const input = new Uint8Array(32).fill(99);
    key = await deriveAESKeyFromPRF(input);
  });

  it("encrypts a string and returns base64 ciphertext", async () => {
    const ct = await encryptString("hello passkey", key);
    expect(typeof ct).toBe("string");
    expect(ct.length).toBeGreaterThan(0);
  });

  it("decrypts ciphertext back to original plaintext", async () => {
    const original = "round-trip works!";
    const ct = await encryptString(original, key);
    const pt = await decryptString(ct, key);
    expect(pt).toBe(original);
  });

  it("produces different ciphertexts for same plaintext (nonce)", async () => {
    const pt = "same message";
    const ct1 = await encryptString(pt, key);
    const ct2 = await encryptString(pt, key);
    expect(ct1).not.toBe(ct2);
  });

  it("handles empty string", async () => {
    const ct = await encryptString("", key);
    const pt = await decryptString(ct, key);
    expect(pt).toBe("");
  });

  it("rejects wrong key", async () => {
    const pt = "secret data";
    const ct = await encryptString(pt, key);
    const wrongInput = new Uint8Array(32).fill(1);
    const wrongKey = await deriveAESKeyFromPRF(wrongInput);
    await expect(decryptString(ct, wrongKey)).rejects.toThrow();
  });
});
