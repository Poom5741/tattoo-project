/**
 * Wallet Store — shared singleton for wallet state across Astro islands.
 *
 * Replaces per-island PasskeyWalletProvider contexts with a module-level
 * store that all islands import. Since ES modules are singletons, every
 * Astro island that imports this store gets the SAME instance.
 *
 * State mutations call emitChange() which notifies all subscribers.
 * Each subscriber's useEffect callback calls setState to trigger re-render.
 *
 * SSR-safe: _state starts as null (server) and hydrates from localStorage
 * on the client. The React hook handles both cases.
 */

// ── localStorage keys ──────────────────────────────────────────
const LS_DACC = "saknid_wallet_daccPublickey";
const LS_ADDR = "saknid_wallet_address";
const LS_SECRET = "saknid_wallet_secret";

// ── Types ──────────────────────────────────────────────────────
export type WalletStatus = "loading" | "none" | "locked" | "unlocked";

export interface WalletState {
  status: WalletStatus;
  address: `0x${string}` | null;
  daccPublickey: string | null;
}

export interface WalletActions {
  createWallet: () => Promise<void>;
  unlock: () => void;
  lock: () => void;
  importBackup: (data: {
    daccPublickey: string;
    address: `0x${string}`;
    encryptedPasswordSecretKey?: string;
  }) => void;
}

// ── localStorage helpers ───────────────────────────────────────
function readStorage(): { daccPublickey: string; address: `0x${string}`; secret?: string } | null {
  if (typeof window === "undefined") return null;
  const pk = localStorage.getItem(LS_DACC);
  const addr = localStorage.getItem(LS_ADDR) as `0x${string}` | null;
  const secret = localStorage.getItem(LS_SECRET) ?? undefined;
  if (pk && addr) return { daccPublickey: pk, address: addr, secret };
  return null;
}

function persistWallet(pk: string, addr: `0x${string}`, secret?: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(LS_DACC, pk);
  localStorage.setItem(LS_ADDR, addr);
  if (secret) localStorage.setItem(LS_SECRET, secret);
}

function persistSecret(secret: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(LS_SECRET, secret);
}

/** Build initial state from localStorage (client-only) or empty (SSR). */
function getInitialState(): WalletState {
  const restored = readStorage();
  return {
    status: restored ? "locked" : "none",
    address: restored?.address ?? null,
    daccPublickey: restored?.daccPublickey ?? null,
  };
}

// ── Module-level singleton state ───────────────────────────────
// On the server (SSR), readStorage() returns null → status "none".
// On the client, readStorage() returns wallet data → status "locked".
// Both server and client compute the SAME initial state for their
// environment, so hydration matches.
let _state: WalletState = getInitialState();
let _daccRef: string | null = _state.daccPublickey;

// ── Subscriber set ─────────────────────────────────────────────
type Subscriber = () => void;
const _subscribers = new Set<Subscriber>();

/** Call this after every _state mutation to notify all React roots. */
function emitChange(): void {
  console.log(`[WALLET-STORE] emitChange: status=${_state.status} addr=${_state.address?.slice(0,10)}… subscribers=${_subscribers.size}`);
  _subscribers.forEach((fn) => fn());
}

// ── Actions (module-level, shared across all islands) ──────────

async function createWallet(): Promise<void> {
  if (_daccRef) return;
  console.log(`[WALLET-STORE] createWallet: starting`);
  _state = { ..._state, status: "loading" };
  emitChange();

  try {
    const { createDaccWallet } = await import("dacc-js");

    let secret = localStorage.getItem(LS_SECRET);
    if (!secret) {
      const { generateRandomSecret } = await import("@/lib/passkey/crypto");
      secret = generateRandomSecret();
      localStorage.setItem(LS_SECRET, secret);
    }

    const wallet = await createDaccWallet({ passwordSecretkey: secret });
    _daccRef = wallet.daccPublickey;
    _state = {
      status: "unlocked",
      address: wallet.address,
      daccPublickey: wallet.daccPublickey,
    };
    persistWallet(wallet.daccPublickey, wallet.address);
    console.log(`[WALLET-STORE] createWallet: done, addr=${wallet.address.slice(0,10)}…`);
    emitChange();

    // Backup to cloud if signed in
    try {
      const { authClient } = await import("@/lib/auth/client");
      const { uploadBackupToD1 } = await import("@/lib/passkey/backup");
      const session = await authClient.getSession();
      if (session.data?.user) {
        const recoveryPassword = window.prompt(
          "Set a recovery password to back up your wallet to the cloud. You'll need it to restore on a new device."
        );
        if (recoveryPassword) {
          try {
            await uploadBackupToD1(
              {
                version: 1,
                address: wallet.address,
                daccPublicKey: wallet.daccPublickey,
                encryptedPasswordSecretKey: secret,
                prfSalt: "",
                credentialId: "",
              },
              recoveryPassword
            );
          } catch (e) {
            console.error("Failed to upload backup:", e);
          }
        }
      }
    } catch {
      // Auth/backup not critical
    }
  } catch (e) {
    _state = { ..._state, status: "none" };
    emitChange();
    throw e;
  }
}

function unlock(): void {
  if (!_daccRef || !_state.address) return;
  console.log(`[WALLET-STORE] unlock: addr=${_state.address.slice(0,10)}…`);
  _state = { ..._state, status: "unlocked" };
  emitChange();
}

function lock(): void {
  if (!_daccRef) return;
  console.log(`[WALLET-STORE] lock`);
  _state = { ..._state, status: "locked" };
  emitChange();
}

function importBackup(data: {
  daccPublickey: string;
  address: `0x${string}`;
  encryptedPasswordSecretKey?: string;
}): void {
  console.log(`[WALLET-STORE] importBackup: addr=${data.address.slice(0,10)}…`);
  _daccRef = data.daccPublickey;
  _state = {
    status: "unlocked",
    address: data.address,
    daccPublickey: data.daccPublickey,
  };
  persistWallet(data.daccPublickey, data.address);
  if (data.encryptedPasswordSecretKey) {
    persistSecret(data.encryptedPasswordSecretKey);
  }
  emitChange();
}

// ── React hook ─────────────────────────────────────────────────
import { useState, useEffect } from "react";

/**
 * useWalletStore — React hook that subscribes to the shared wallet store.
 *
 * Works across ALL Astro islands because it reads from the module-level
 * singleton _state (not a per-island React context).
 *
 * Each hook instance:
 * 1. Initializes local state from _state
 * 2. Registers a subscriber that calls setState when _state changes
 * 3. Returns the current state + actions
 */
export function useWalletStore(): WalletState & WalletActions & { isReady: boolean } {
  const [state, setState] = useState<WalletState>(_state);

  useEffect(() => {
    const subscriber = () => {
      console.log(`[WALLET-STORE] subscriber: new state status=${_state.status} addr=${_state.address?.slice(0,10)}…`);
      setState({ ..._state });
    };
    _subscribers.add(subscriber);
    console.log(`[WALLET-STORE] useEffect: registered subscriber, total=${_subscribers.size}`);

    // Sync on mount — catches any state change between initial render and effect
    setState({ ..._state });

    return () => {
      _subscribers.delete(subscriber);
    };
  }, []);

  return {
    ...state,
    createWallet,
    unlock,
    lock,
    importBackup,
    isReady: state.status === "unlocked",
  };
}

// ── Getters (for non-React code) ──────────────────────────────
export function getWalletState(): WalletState {
  return _state;
}

export function isReady(): boolean {
  return _state.status === "unlocked";
}
