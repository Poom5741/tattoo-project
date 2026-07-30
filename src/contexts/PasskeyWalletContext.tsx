/**
 * PasskeyWalletContext — React context for passkey wallet lifecycle.
 *
 * Manages wallet status (none → unlocked → locked), creation via dacc-js,
 * and in-memory wallet address. Works independently from Better Auth.
 *
 * ponytail: PRF-derived key not yet wired — uses a generated secret stored
 * in localStorage. Replace getOrCreateSecret() with passkey PRF derivation
 * (registerPasskey + extract PRF extension results) when passkey auth flow
 * is built. The secret is the dacc-js passwordSecretkey that encrypts the
 * wallet private key; it must be deterministic across create + unlock.
 */

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  type ReactNode,
} from "react";
import { generateRandomSecret } from "@/lib/passkey/crypto";

// ── localStorage helpers ─────────────────────────────────────────

const LS_DACC = "saknid_wallet_daccPublickey";
const LS_ADDR = "saknid_wallet_address";
const LS_SECRET = "saknid_wallet_secret";

function readStorage(): { daccPublickey: string; address: `0x${string}` } | null {
  if (typeof window === "undefined") return null;
  const pk = localStorage.getItem(LS_DACC);
  const addr = localStorage.getItem(LS_ADDR) as `0x${string}` | null;
  if (pk && addr) return { daccPublickey: pk, address: addr };
  return null;
}

function persistWallet(pk: string, addr: `0x${string}`): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(LS_DACC, pk);
  localStorage.setItem(LS_ADDR, addr);
}

function getOrCreateSecret(): string {
  // Guard: localStorage is unavailable during SSR. createWallet is only
  // called client-side (dynamic import of dacc-js), so this is safe.
  const stored = localStorage.getItem(LS_SECRET);
  if (stored) return stored;
  const secret = generateRandomSecret();
  localStorage.setItem(LS_SECRET, secret);
  return secret;
}

// ── Types ───────────────────────────────────────────────────────

export type WalletStatus = "loading" | "none" | "locked" | "unlocked";

export interface PasskeyWalletState {
  status: WalletStatus;
  address: `0x${string}` | null;
  daccPublickey: string | null;
  createWallet: () => Promise<void>;
  unlock: () => void;
  lock: () => void;
  importBackup: (data: { daccPublickey: string; address: `0x${string}` }) => void;
  isReady: boolean;
}

const PasskeyWalletContext = createContext<PasskeyWalletState | null>(null);

// ── Provider ─────────────────────────────────────────────────────

export function PasskeyWalletProvider({ children }: { children: ReactNode }) {
  const restored = readStorage();
  const [status, setStatus] = useState<WalletStatus>(restored ? "locked" : "none");
  const [address, setAddress] = useState<`0x${string}` | null>(restored?.address ?? null);
  const walletRef = useRef<string | null>(restored?.daccPublickey ?? null);
  const [daccPublickey, setDaccPublickey] = useState<string | null>(restored?.daccPublickey ?? null);

  const createWallet = useCallback(async () => {
    if (walletRef.current) return;
    setStatus("loading");
    try {
      // Dynamic import: dacc-js bundles libsodium WASM which cannot run
      // in Cloudflare Workers (SSR). Only import when actually creating
      // a wallet — always client-side.
      const { createDaccWallet } = await import("dacc-js");
      const secret = getOrCreateSecret();
      const wallet = await createDaccWallet({ passwordSecretkey: secret });
      walletRef.current = wallet.daccPublickey;
      setAddress(wallet.address);
      setDaccPublickey(wallet.daccPublickey);
      persistWallet(wallet.daccPublickey, wallet.address);
      setStatus("unlocked");
    } catch (e) {
      setStatus("none");
      throw e;
    }
  }, []);

  const unlock = useCallback(() => {
    if (!walletRef.current || !address) return;
    setStatus("unlocked");
  }, [address]);

  const lock = useCallback(() => {
    if (!walletRef.current) return;
    setStatus("locked");
  }, []);

  const importBackup = useCallback(
    (data: { daccPublickey: string; address: `0x${string}` }) => {
      walletRef.current = data.daccPublickey;
      setAddress(data.address);
      setDaccPublickey(data.daccPublickey);
      persistWallet(data.daccPublickey, data.address);
      setStatus("unlocked");
    },
    [],
  );

  const value: PasskeyWalletState = {
    status,
    address,
    daccPublickey,
    createWallet,
    unlock,
    lock,
    importBackup,
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
    // Return a fallback state when used outside PasskeyWalletProvider
    // (e.g. Nav component that renders on all pages)
    return {
      status: "none",
      address: null,
      daccPublickey: null,
      createWallet: async () => {},
      unlock: () => {},
      lock: () => {},
      importBackup: () => {},
      isReady: false,
    };
  }
  return ctx;
}
