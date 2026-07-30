/**
 * D1 backup upload/download unit tests.
 *
 * Mocks global fetch to test uploadBackupToD1 / downloadBackupFromD1
 * boundary behavior without a real server.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { uploadBackupToD1, downloadBackupFromD1, type WalletBackupData } from "@/lib/passkey/backup";

const testWallet: WalletBackupData = {
  version: 1,
  address: "0x1234567890abcdef1234567890abcdef12345678",
  daccPublicKey: "0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef",
  encryptedPasswordSecretKey: "base64-encrypted-key-data-here",
  prfSalt: "c29tZS1wcmYtc2FsdA",
  credentialId: "credential-id-string",
};

describe("uploadBackupToD1", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("posts encrypted backup to /api/wallet/backup and returns on 200", async () => {
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), { status: 200 })
    );

    await uploadBackupToD1(testWallet, "recovery-password");

    expect(globalThis.fetch).toHaveBeenCalledTimes(1);
    const [url, init] = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(url).toBe("/api/wallet/backup");
    expect(init.method).toBe("POST");
    const body = JSON.parse(init.body);
    expect(body.address).toBe(testWallet.address);
    expect(typeof body.encryptedBlob).toBe("string");
    expect(typeof body.recoverySalt).toBe("string");
  });

  it("throws server error message on non-ok response", async () => {
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValue(
      new Response(JSON.stringify({ error: "Not authenticated" }), { status: 401 })
    );

    await expect(uploadBackupToD1(testWallet, "password")).rejects.toThrow("Not authenticated");
  });

  it("throws default message on non-json error response", async () => {
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValue(
      new Response("Internal Server Error", { status: 500 })
    );

    await expect(uploadBackupToD1(testWallet, "password")).rejects.toThrow("Failed to upload backup");
  });
});

describe("downloadBackupFromD1", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns wallet backup on successful fetch + decrypt", async () => {
    const password = "restore-password";
    const { encryptWithRecoveryPassword } = await import("@/lib/passkey/backup");
    const json = JSON.stringify(testWallet);
    const { encrypted, salt } = await encryptWithRecoveryPassword(json, password);

    (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValue(
      new Response(JSON.stringify({ encryptedBlob: encrypted, recoverySalt: salt }), { status: 200 })
    );

    const result = await downloadBackupFromD1(password);
    expect(result).toEqual(testWallet);
  });

  it("throws 'No backup found' on 404", async () => {
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValue(
      new Response(JSON.stringify({ error: "No backup found" }), { status: 404 })
    );

    await expect(downloadBackupFromD1("password")).rejects.toThrow("No backup found");
  });

  it("throws on invalid server payload", async () => {
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValue(
      new Response(JSON.stringify({ encryptedBlob: "foo" }), { status: 200 })
    );

    await expect(downloadBackupFromD1("password")).rejects.toThrow("invalid backup format");
  });
});
