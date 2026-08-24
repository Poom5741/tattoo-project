/**
 * Passkey backup — unit tests (TDD red→green).
 *
 * Tests recovery password encrypt/decrypt and backup file round-trips.
 * Pure crypto + Blob operations — no DOM APIs required.
 */

import { describe, it, expect } from "vitest";
import {
  encryptWithRecoveryPassword,
  decryptWithRecoveryPassword,
  createBackupFile,
  parseBackupFile,
} from "@/lib/passkey/backup";

// ── Recovery Password ───────────────────────────────────────────

describe("encryptWithRecoveryPassword / decryptWithRecoveryPassword", () => {
  it("encrypts a secret and decrypts it back with the same password", async () => {
    const secret = "my-super-secret-wallet-key-here";
    const password = "correct-horse-battery-staple";

    const { encrypted, salt } = await encryptWithRecoveryPassword(secret, password);
    expect(typeof encrypted).toBe("string");
    expect(encrypted.length).toBeGreaterThan(0);
    expect(typeof salt).toBe("string");
    expect(salt.length).toBeGreaterThan(0);

    const decrypted = await decryptWithRecoveryPassword(encrypted, password, salt);
    expect(decrypted).toBe(secret);
  });

  it("fails to decrypt with wrong password", async () => {
    const secret = "my-secret-data";
    const { encrypted, salt } = await encryptWithRecoveryPassword(secret, "correct-password");
    await expect(
      decryptWithRecoveryPassword(encrypted, "wrong-password", salt),
    ).rejects.toThrow();
  });

  it("fails to decrypt with wrong salt", async () => {
    const secret = "my-secret-data";
    const { encrypted } = await encryptWithRecoveryPassword(secret, "password");
    const wrongSalt = "c29vbWUtd3Jvbmctc2FsdA"; // some-other-salt (base64url)
    await expect(
      decryptWithRecoveryPassword(encrypted, "password", wrongSalt),
    ).rejects.toThrow();
  });

  it("produces different encrypted outputs for same input (nonce)", async () => {
    const secret = "deterministic-input-test";
    const password = "test-password";

    const a = await encryptWithRecoveryPassword(secret, password);
    const b = await encryptWithRecoveryPassword(secret, password);
    expect(a.encrypted).not.toBe(b.encrypted);
  });
});

// ── Backup File ──────────────────────────────────────────────────

describe("createBackupFile / parseBackupFile", () => {
  const testWallet = {
    version: 1 as const,
    address: "0x1234567890abcdef1234567890abcdef12345678",
    daccPublicKey: "0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef",
    encryptedPasswordSecretKey: "base64-encrypted-key-data-here",
    prfSalt: "c29tZS1wcmYtc2FsdA",
    credentialId: "credential-id-string",
  };

  it("creates a Blob and round-trips the wallet data", async () => {
    const blob = createBackupFile(testWallet);
    expect(blob).toBeInstanceOf(Blob);
    expect(blob.type).toBe("application/json");

    const parsed = await parseBackupFile(blob);
    expect(parsed).toEqual(testWallet);
  });

  it("rejects malformed JSON blob", async () => {
    const badBlob = new Blob(["not-json"], { type: "application/json" });
    await expect(parseBackupFile(badBlob)).rejects.toThrow();
  });

  it("rejects blob missing required fields", async () => {
    const badBlob = new Blob([JSON.stringify({ version: 1 })], { type: "application/json" });
    await expect(parseBackupFile(badBlob)).rejects.toThrow();
  });

  it("rejects blob with wrong version", async () => {
    const badData = { ...testWallet, version: 2 };
    const badBlob = new Blob([JSON.stringify(badData)], { type: "application/json" });
    await expect(parseBackupFile(badBlob)).rejects.toThrow();
  });

  it("rejects valid JSON where address has no 0x prefix", async () => {
    const badData = { ...testWallet, address: "1234567890abcdef1234567890abcdef12345678" };
    const badBlob = new Blob([JSON.stringify(badData)], { type: "application/json" });
    await expect(parseBackupFile(badBlob)).rejects.toThrow();
  });

  it("rejects blob missing version field", async () => {
    const { version: _, ...noVersion } = testWallet;
    const badBlob = new Blob([JSON.stringify(noVersion)], { type: "application/json" });
    await expect(parseBackupFile(badBlob)).rejects.toThrow();
  });
});
