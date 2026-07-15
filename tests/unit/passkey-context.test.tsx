import React from "react";
/**
 * PasskeyWalletContext — unit tests (TDD red→green).
 *
 * Tests wallet lifecycle: create, lock, unlock, status transitions.
 * dacc-js createDaccWallet is mocked at the module boundary.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import type { ReactNode } from "react";
import {
  PasskeyWalletProvider,
  usePasskeyWallet,
} from "@/contexts/PasskeyWalletContext";

// Mock dacc-js
vi.mock("dacc-js", () => ({
  createDaccWallet: vi.fn().mockResolvedValue({
    address: "0x1234567890abcdef1234567890abcdef12345678",
    daccPublickey: "daccPublickey_test123",
  }),
}));

function createWrapper() {
  return function Wrapper({ children }: { children: ReactNode }) {
    return <PasskeyWalletProvider>{children}</PasskeyWalletProvider>;
  };
}

describe("PasskeyWalletContext", () => {
  beforeEach(() => {
    // Reset mock state between tests
    vi.clearAllMocks();
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
    expect(result.current.address).toBe(
      "0x1234567890abcdef1234567890abcdef12345678",
    );
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
    expect(result.current.address).toBe(
      "0x1234567890abcdef1234567890abcdef12345678",
    );
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

    await act(async () => {
      await result.current.unlock();
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

    // Address should be the same (no re-creation)
    expect(result.current.address).toBe(address1);
  });
});
