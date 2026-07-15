/**
 * PasskeyWalletContext — React context for passkey wallet lifecycle.
 *
 * Manages wallet status (none → unlocked → locked), creation via dacc-js,
 * and in-memory wallet address. Works independently from Better Auth.
 */

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  type ReactNode,
} from "react";
import { createDaccWallet } from "dacc-js";

// ── Types ───────────────────────────────────────────────────────

export type WalletStatus = "loading" | "none" | "locked" | "unlocked";

export interface PasskeyWalletState {
  status: WalletStatus;
  address: `0x${string}` | null;
  daccPublickey: string | null;
  createWallet: () => Promise<void>;
  unlock: () => Promise<void>;
  lock: () => void;
  isReady: boolean;
}

const PasskeyWalletContext = createContext<PasskeyWalletState | null>(null);

// ── Provider ─────────────────────────────────────────────────────

export function PasskeyWalletProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<WalletStatus>("none");
  const [address, setAddress] = useState<`0x${string}` | null>(null);
  const walletRef = useRef<string | null>(null);
  const [daccPublickey, setDaccPublickey] = useState<string | null>(null);

  const createWallet = useCallback(async () => {
    if (walletRef.current) return;
    setStatus("loading");
    const wallet = await createDaccWallet({
      passwordSecretkey: "passkey-derived-secret",
    });
    walletRef.current = wallet.daccPublickey;
    setAddress(wallet.address);
    setDaccPublickey(wallet.daccPublickey);
    setStatus("unlocked");
  }, []);

  const unlock = useCallback(async () => {
    if (!walletRef.current || !address) return;
    setStatus("unlocked");
  }, [address]);

  const lock = useCallback(() => {
    if (!walletRef.current) return;
    setStatus("locked");
  }, []);

  const value: PasskeyWalletState = {
    status,
    address,
    daccPublickey,
    createWallet,
    unlock,
    lock,
    isReady: status === "unlocked",
  };

  return (
    <PasskeyWalletContext.Provider value={value}>
      {children}
    </PasskeyWalletContext.Provider>
  );
}

// ── Hook ─────────────────────────────────────────────────────────

export function usePasskeyWallet(): PasskeyWalletState {
  const ctx = useContext(PasskeyWalletContext);
  if (!ctx) {
    throw new Error("usePasskeyWallet must be used within PasskeyWalletProvider");
  }
  return ctx;
}
