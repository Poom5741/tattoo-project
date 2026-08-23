/**
 * Passkey crypto — pure Web Crypto wrappers.
 *
 * Provides base64, AES-GCM encrypt/decrypt, HKDF derivation, and
 * random byte generation. All functions use the Web Crypto API
 * (SubtleCrypto) available in modern browsers and Node 20+.
 */

// ── Base64 ──────────────────────────────────────────────────────

const BASE64_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
const BASE64_URL_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";

function base64EncodeInternal(data: Uint8Array, chars: string): string {
  const len = data.length;
  let result = "";
  for (let i = 0; i < len; i += 3) {
    const b0 = data[i];
    const b1 = i + 1 < len ? data[i + 1] : 0;
    const b2 = i + 2 < len ? data[i + 2] : 0;
    result += chars[b0 >> 2];
    result += chars[((b0 & 0x03) << 4) | (b1 >> 4)];
    result += chars[((b1 & 0x0f) << 2) | (b2 >> 6)];
    result += chars[b2 & 0x3f];
  }
  const pad = len % 3;
  if (pad === 1) {
    result = result.slice(0, -2);
    if (chars === BASE64_CHARS) result += "==";
  } else if (pad === 2) {
    result = result.slice(0, -1);
    if (chars === BASE64_CHARS) result += "=";
  }
  return result;
}

function base64DecodeInternal(str: string, chars: string): Uint8Array {
  // Strip padding for standard base64
  const cleaned = str.replace(/=+$/, "");
  if (cleaned.length === 0) return new Uint8Array(0);
  // Build reverse lookup
  const lookup: Record<string, number> = {};
  for (let i = 0; i < chars.length; i++) lookup[chars[i]] = i;

  // Validate — unknown characters corrupt output, so reject early.
  for (let i = 0; i < cleaned.length; i++) {
    if (lookup[cleaned[i]] === undefined) {
      throw new Error(`Invalid base64 character at position ${i}: "${cleaned[i]}"`);
    }
  }

  const len = cleaned.length;
  const outLen = Math.floor((len * 3) / 4);
  const out = new Uint8Array(outLen);
  let j = 0;
  for (let i = 0; i < len; i += 4) {
    const c0 = lookup[cleaned[i]];
    const c1 = i + 1 < len ? lookup[cleaned[i + 1]] : 0;
    const c2 = i + 2 < len ? lookup[cleaned[i + 2]] : 0;
    const c3 = i + 3 < len ? lookup[cleaned[i + 3]] : 0;
    out[j++] = (c0 << 2) | (c1 >> 4);
    if (j < outLen) out[j++] = ((c1 & 0x0f) << 4) | (c2 >> 2);
    if (j < outLen) out[j++] = ((c2 & 0x03) << 6) | c3;
  }
  return out;
}

/** Encode bytes to standard base64 (with padding). */
export function base64Encode(data: Uint8Array): string {
  return base64EncodeInternal(data, BASE64_CHARS);
}

/** Decode standard base64 string to bytes. */
export function base64Decode(str: string): Uint8Array {
  return base64DecodeInternal(str, BASE64_CHARS);
}

/** Encode bytes to URL-safe base64 (no padding, -_ instead of +/). */
export function base64urlEncode(data: Uint8Array): string {
  return base64EncodeInternal(data, BASE64_URL_CHARS);
}

/** Decode URL-safe base64 string to bytes. */
export function base64urlDecode(str: string): Uint8Array {
  return base64DecodeInternal(str, BASE64_URL_CHARS);
}

// ── Random ──────────────────────────────────────────────────────

/** Generate cryptographically random bytes. */
export function generateRandomBytes(length: number): Uint8Array {
  const buf = new Uint8Array(length);
  crypto.getRandomValues(buf);
  return buf;
}

/** Generate a base64url-encoded 32-byte random secret (43 chars). */
export function generateRandomSecret(): string {
  return base64urlEncode(generateRandomBytes(32));
}

// ── HKDF ────────────────────────────────────────────────────────

const HKDF_SALT = new Uint8Array([
  0x73, 0x61, 0x6b, 0x6e, 0x69, 0x64, 0x2d, 0x70, 0x61, 0x73, 0x73,
  0x6b, 0x65, 0x79, 0x2d, 0x61, 0x65, 0x73,
]); // "saknid-passkey-aes"

/**
 * Derive an AES-256-GCM key from a 32-byte PRF output using HKDF-SHA256.
 * Deterministic — same input produces the same key.
 */
export async function deriveAESKeyFromPRF(prfOutput: Uint8Array): Promise<CryptoKey> {
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    prfOutput,
    { name: "HKDF" },
    false,
    ["deriveKey"],
  );
  return crypto.subtle.deriveKey(
    {
      name: "HKDF",
      salt: HKDF_SALT,
      info: new Uint8Array(0),
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
}

// ── AES-GCM helpers (shared between crypto.ts and backup.ts) ────

/**
 * Encrypt bytes with AES-GCM. Returns IV prepended to the ciphertext.
 * Use `aesGcmDecrypt` to reverse this.
 */
export async function aesGcmEncrypt(
  data: Uint8Array,
  key: CryptoKey,
): Promise<Uint8Array> {
  const iv = generateRandomBytes(12);
  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    data,
  );
  const combined = new Uint8Array(iv.length + ciphertext.byteLength);
  combined.set(iv);
  combined.set(new Uint8Array(ciphertext), iv.length);
  return combined;
}

/**
 * Decrypt an AES-GCM payload previously produced by `aesGcmEncrypt`.
 * The first 12 bytes are the IV, the rest is the ciphertext.
 */
export async function aesGcmDecrypt(
  combined: Uint8Array,
  key: CryptoKey,
): Promise<Uint8Array> {
  const iv = combined.slice(0, 12);
  const data = combined.slice(12);
  const plaintext = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    key,
    data,
  );
  return new Uint8Array(plaintext);
}

// ── Convenience string encrypt/decrypt ──────────────────────────

/** Encrypt a plaintext string with an AES-GCM key. Returns base64 ciphertext. */
export async function encryptString(plaintext: string, key: CryptoKey): Promise<string> {
  const encoded = new TextEncoder().encode(plaintext);
  const combined = await aesGcmEncrypt(encoded, key);
  return base64Encode(combined);
}

/** Decrypt a base64 ciphertext back to the original plaintext string. */
export async function decryptString(ciphertext: string, key: CryptoKey): Promise<string> {
  const combined = base64Decode(ciphertext);
  const plaintext = await aesGcmDecrypt(combined, key);
  return new TextDecoder().decode(plaintext);
}
