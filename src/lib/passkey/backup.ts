/**
 * Passkey backup — recovery password encrypt/decrypt and backup file I/O.
 *
 * Recovery password uses PBKDF2 + AES-GCM to encrypt the wallet's
 * passwordSecretKey. The backup file is a versioned JSON blob that
 * can be downloaded/uploaded.
 */

import { base64urlEncode, base64urlDecode, generateRandomBytes, aesGcmEncrypt, aesGcmDecrypt } from "./crypto";

// ── Types ───────────────────────────────────────────────────────

export interface WalletBackupData {
  /** Schema version (must be 1). */
  version: 1;
  /** EVM wallet address (0x-prefixed). */
  address: string;
  /** dacc-js public key (hex). */
  daccPublicKey: string;
  /** passwordSecretKey encrypted with passkey PRF (base64). */
  encryptedPasswordSecretKey: string;
  /** Passkey PRF salt (base64url). */
  prfSalt: string;
  /** WebAuthn credential ID. */
  credentialId: string;
}

// ── Recovery Password ───────────────────────────────────────────

const PBKDF2_ITERATIONS = 100_000;

async function deriveKeyFromPassword(
  password: string,
  salt: Uint8Array,
): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    { name: "PBKDF2" },
    false,
    ["deriveKey"],
  );
  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt as Uint8Array<ArrayBuffer>,
      iterations: PBKDF2_ITERATIONS,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
}

/**
 * Encrypt a secret string with a recovery password.
 * Returns the base64url-encoded ciphertext and the base64url-encoded salt.
 */
export async function encryptWithRecoveryPassword(
  secret: string,
  password: string,
): Promise<{ encrypted: string; salt: string }> {
  const salt = generateRandomBytes(16);
  const key = await deriveKeyFromPassword(password, salt);
  const encoded = new TextEncoder().encode(secret);
  const combined = await aesGcmEncrypt(encoded, key);
  return { encrypted: base64urlEncode(combined), salt: base64urlEncode(salt) };
}

/**
 * Decrypt a recovery-password-encrypted secret.
 * The `encrypted` value and `salt` must be base64url-encoded strings
 * as returned by `encryptWithRecoveryPassword`.
 */
export async function decryptWithRecoveryPassword(
  encrypted: string,
  password: string,
  salt: string,
): Promise<string> {
  const saltBytes = base64urlDecode(salt);
  const key = await deriveKeyFromPassword(password, saltBytes);
  const combined = base64urlDecode(encrypted);
  const plaintext = await aesGcmDecrypt(combined, key);
  return new TextDecoder().decode(plaintext);
}

// ── Backup File ──────────────────────────────────────────────────

function isWalletBackupData(value: unknown): value is WalletBackupData {
  if (typeof value !== "object" || value === null) return false;
  const obj = value as Record<string, unknown>;
  if (obj.version !== 1) return false;
  if (typeof obj.address !== "string" || !obj.address.startsWith("0x")) return false;
  if (typeof obj.daccPublicKey !== "string") return false;
  if (typeof obj.encryptedPasswordSecretKey !== "string") return false;
  if (typeof obj.prfSalt !== "string") return false;
  if (typeof obj.credentialId !== "string") return false;
  return true;
}

/**
 * Create a downloadable backup file from wallet data.
 * The data is serialized as versioned JSON and wrapped in a Blob.
 */
export async function createBackupFile(wallet: WalletBackupData): Promise<Blob> {
  const json = JSON.stringify(wallet, null, 2);
  return new Blob([json], { type: "application/json" });
}

/**
 * Parse a backup Blob and validate the wallet data structure.
 * Throws if the blob is malformed, not valid JSON, or fails schema validation.
 */
export async function parseBackupFile(blob: Blob): Promise<WalletBackupData> {
  const text = await blob.text();
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error("Backup file is not valid JSON");
  }
  if (!isWalletBackupData(parsed)) {
    throw new Error("Backup file has invalid or missing fields");
  }
  return parsed;
}

// ── D1 Backup (cross-auth recovery) ────────────────────────────

/**
 * Upload encrypted wallet backup to D1 via Better Auth session.
 * The server endpoint checks the Better Auth session and stores
 * the backup associated with the current user.
 */
export async function uploadBackupToD1(
  wallet: WalletBackupData,
  recoveryPassword: string,
): Promise<void> {
  const json = JSON.stringify(wallet);
  const { encrypted, salt } = await encryptWithRecoveryPassword(json, recoveryPassword);
  const res = await fetch("/api/wallet/backup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      address: wallet.address,
      encryptedBlob: encrypted,
      prfSalt: wallet.prfSalt,
      credentialId: wallet.credentialId,
      recoverySalt: salt,
    }),
  });
  if (!res.ok) {
    const err = await res.json() as { error: string };
    throw new Error(err.error || "Failed to upload backup");
  }
}

/**
 * Download and decrypt wallet backup from D1.
 * Requires the recovery password used during upload.
 */
export async function downloadBackupFromD1(
  recoveryPassword: string,
): Promise<WalletBackupData> {
  const res = await fetch("/api/wallet/backup");
  if (!res.ok) {
    if (res.status === 404) throw new Error("No backup found");
    throw new Error("Failed to download backup");
  }
  const data = await res.json() as {
    encryptedBlob: string;
    recoverySalt: string;
  };
  const decrypted = await decryptWithRecoveryPassword(
    data.encryptedBlob,
    recoveryPassword,
    data.recoverySalt,
  );
  const parsed = JSON.parse(decrypted);
  if (!isWalletBackupData(parsed)) {
    throw new Error("Backup data is corrupted or invalid");
  }
  return parsed;
}
