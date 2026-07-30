import React from "react";
/**
 * PasskeyWalletContext — unit tests (TDD red→green).
 *
 * Tests wallet lifecycle: create, lock, unlock, status transitions,
 * localStorage persistence, and importBackup.
 * dacc-js createDaccWallet is mocked at the module boundary.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import type { ReactNode } from "react";
import {
  PasskeyWalletProvider,
  usePasskeyWallet,
} from "@/contexts/PasskeyWalletContext";
import { uploadBackupToD1 } from "@/lib/passkey/backup";
import { authClient } from "@/lib/auth/client";

// Mock dacc-js
const mockAddr = "0x1234567890abcdef1234567890abcdef12345678" as const;
const mockPub = "daccPublickey_test123";
vi.mock("dacc-js", () => ({
  createDaccWallet: vi.fn().mockResolvedValue({
    address: mockAddr,
    daccPublickey: mockPub,
  }),
}));

// Mock auth client so createWallet doesn't hit the network
vi.mock("@/lib/auth/client", () => ({
  authClient: {
    getSession: vi.fn().mockResolvedValue({ data: null, error: null }),
  },
}));

// Mock D1 backup upload
vi.mock("@/lib/passkey/backup", async (importOriginal) => {
  const original = await importOriginal<typeof import("@/lib/passkey/backup")>();
  return {
    ...original,
    uploadBackupToD1: vi.fn().mockResolvedValue(undefined),
  };
});

function createWrapper() {
  return function Wrapper({ children }: { children: ReactNode }) {
    return <PasskeyWalletProvider>{children}</PasskeyWalletProvider>;
  };
}

describe("PasskeyWalletContext", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it("starts with status='none' and no address", () => {
    const { result } = renderHook(() => usePasskeyWallet(), {
      wrapper: createWrapper(),
    });
    expect(result.current.status).toBe("none");
    expect(result.current.address).toBeNull();
  });

  it("createWallet transitions status to 'unlocked' and sets address", async () => {
    const { result } = renderHook(() => usePasskeyWallet(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.createWallet();
    });

    expect(result.current.status).toBe("unlocked");
    expect(result.current.address).toBe(mockAddr);
  });

  it("persists wallet to localStorage after createWallet", async () => {
    const { result } = renderHook(() => usePasskeyWallet(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.createWallet();
    });

    expect(localStorage.getItem("saknid_wallet_daccPublickey")).toBe(mockPub);
    expect(localStorage.getItem("saknid_wallet_address")).toBe(mockAddr);
  });

  it("restores wallet from localStorage on mount and starts locked", () => {
    localStorage.setItem("saknid_wallet_daccPublickey", mockPub);
    localStorage.setItem("saknid_wallet_address", mockAddr);

    const { result } = renderHook(() => usePasskeyWallet(), {
      wrapper: createWrapper(),
    });

    expect(result.current.status).toBe("locked");
    expect(result.current.address).toBe(mockAddr);
  });

  it("lock transitions status to 'locked' but keeps address", async () => {
    const { result } = renderHook(() => usePasskeyWallet(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.createWallet();
    });

    act(() => {
      result.current.lock();
    });

    expect(result.current.status).toBe("locked");
    expect(result.current.address).toBe(mockAddr);
  });

  it("unlock transitions status back to 'unlocked'", async () => {
    const { result } = renderHook(() => usePasskeyWallet(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.createWallet();
    });

    act(() => {
      result.current.lock();
    });

    act(() => {
      result.current.unlock();
    });

    expect(result.current.status).toBe("unlocked");
  });

  it("multiple createWallet calls do not create a new wallet", async () => {
    const { result } = renderHook(() => usePasskeyWallet(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.createWallet();
    });
    const address1 = result.current.address;

    await act(async () => {
      await result.current.createWallet();
    });

    expect(result.current.address).toBe(address1);
  });

  it("importBackup sets wallet state and persists it", () => {
    const { result } = renderHook(() => usePasskeyWallet(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.importBackup({
        daccPublickey: "imported_pub",
        address: "0x0000000000000000000000000000000000000000" as `0x${string}`,
      });
    });

    expect(result.current.status).toBe("unlocked");
    expect(result.current.daccPublickey).toBe("imported_pub");
    expect(localStorage.getItem("saknid_wallet_daccPublickey")).toBe("imported_pub");
  });

  it("importBackup persists encryptedPasswordSecretKey when provided", () => {
    const { result } = renderHook(() => usePasskeyWallet(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.importBackup({
        daccPublickey: "imported_pub",
        address: "0x0000000000000000000000000000000000000000" as `0x${string}`,
        encryptedPasswordSecretKey: "imported-secret",
      });
    });

    expect(localStorage.getItem("saknid_wallet_secret")).toBe("imported-secret");
  });

  it("createWallet auto-uploads backup when Better Auth session exists", async () => {
    (authClient.getSession as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: { user: { id: "user_1", email: "test@example.com" } },
      error: null,
    });
    const promptSpy = vi.spyOn(window, "prompt").mockReturnValueOnce("recovery-password");

    const { result } = renderHook(() => usePasskeyWallet(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.createWallet();
    });

    expect(uploadBackupToD1).toHaveBeenCalledTimes(1);
    const [backup, password] = (uploadBackupToD1 as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(backup.address).toBe(mockAddr);
    expect(backup.encryptedPasswordSecretKey).toBeTruthy();
    expect(password).toBe("recovery-password");

    promptSpy.mockRestore();
  });

  it("createWallet reverts to 'none' and throws on failure", async () => {
    const mod = await import("dacc-js");
    (mod.createDaccWallet as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
      new Error("User declined"),
    );

    const { result } = renderHook(() => usePasskeyWallet(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await expect(result.current.createWallet()).rejects.toThrow("User declined");
    });

    expect(result.current.status).toBe("none");
  });
});
