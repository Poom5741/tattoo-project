/**
 * Wallet Store — shared singleton for wallet state across Astro islands.
 *
 * Replaces per-island PasskeyWalletProvider contexts with a module-level
 * store that all islands import. Since ES modules are singletons, every
 * Astro island that imports this store gets the SAME instance.
 *
 * State mutations broadcast via CustomEvent("saknid-wallet-change") so
 * React hooks in different islands re-render on changes.
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

function getOrCreateSecret(): string {
  if (typeof window === "undefined") return "";
  const stored = localStorage.getItem(LS_SECRET);
  if (stored) return stored;
  // generateRandomSecret is imported at module scope (see top of file)
  const secret = generateRandomSecret();
  localStorage.setItem(LS_SECRET, secret);
  return secret;
}

// ── Module-level singleton state ───────────────────────────────
// On first import, hydrate from localStorage.
const initial = readStorage();

let _state: WalletState = {
  status: initial ? "locked" : "none",
  address: initial?.address ?? null,
  daccPublickey: initial?.daccPublickey ?? null,
};

// Ref holder for the wallet dacc publickey (not React state)
let _daccRef: string | null = initial?.daccPublickey ?? null;

// ── Event bus ──────────────────────────────────────────────────
const EVENT_NAME = "saknid-wallet-change";
type Listener = () => void;
const _listeners = new Set<Listener>();

function notify(): void {
  // Dispatch a DOM custom event for cross-island notification
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(EVENT_NAME));
  }
  // Also notify in-process listeners (same React root)
  _listeners.forEach((fn) => fn());
}

// ── Actions (module-level, shared across all islands) ──────────

async function createWallet(): Promise<void> {
  if (_daccRef) return;
  _state = { ..._state, status: "loading" };
  notify();

  try {
    const { createDaccWallet } = await import("dacc-js");

    let secret = localStorage.getItem(LS_SECRET);
    if (!secret) {
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
    notify();

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
      // Auth/backup not critical — wallet is created
    }
  } catch (e) {
    _state = { ..._state, status: "none" };
    notify();
    throw e;
  }
}

function unlock(): void {
  if (!_daccRef || !_state.address) return;
  _state = { ..._state, status: "unlocked" };
  notify();
}

function lock(): void {
  if (!_daccRef) return;
  _state = { ..._state, status: "locked" };
  notify();
}

function importBackup(data: {
  daccPublickey: string;
  address: `0x${string}`;
  encryptedPasswordSecretKey?: string;
}): void {
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
  notify();
}

// ── Getters (read current snapshot) ────────────────────────────
export function getWalletState(): WalletState {
  return _state;
}

export function getWalletActions(): WalletActions {
  return { createWallet, unlock, lock, importBackup };
}

export function isReady(): boolean {
  return _state.status === "unlocked";
}

// ── React hook ─────────────────────────────────────────────────
import { useState, useEffect, useCallback, useRef } from "react";
import { generateRandomSecret } from "@/lib/passkey/crypto";

/**
 * useWalletStore — React hook that subscribes to the shared wallet store.
 * Works identically across all Astro islands because it reads from the
 * module-level singleton, not from a per-island React context.
 */
export function useWalletStore(): WalletState & WalletActions & { isReady: boolean } {
  // Read initial snapshot from the module-level store
  const [state, setState] = useState<WalletState>(() => _state);
  const actionsRef = useRef<WalletActions>(getWalletActions());
  // Keep actions ref stable (they're module-level, never change)
  actionsRef.current = getWalletActions();

  useEffect(() => {
    // Sync on DOM custom event (cross-island)
    const onEvent = () => setState({ ..._state });
    window.addEventListener(EVENT_NAME, onEvent);

    // Also listen for React dispatch (same root)
    _listeners.add(onEvent);

    // Sync on storage event (cross-tab)
    const onStorage = (e: StorageEvent) => {
      if (e.key && [LS_DACC, LS_ADDR, LS_SECRET].includes(e.key)) {
        // Re-hydrate from localStorage
        const fresh = readStorage();
        if (fresh) {
          _daccRef = fresh.daccPublickey;
          _state = {
            status: "locked", // Re-hydrated wallets start locked
            address: fresh.address,
            daccPublickey: fresh.daccPublickey,
          };
        } else {
          _daccRef = null;
          _state = { status: "none", address: null, daccPublickey: null };
        }
        setState({ ..._state });
      }
    };
    window.addEventListener("storage", onStorage);

    return () => {
      window.removeEventListener(EVENT_NAME, onEvent);
      window.removeEventListener("storage", onStorage);
      _listeners.delete(onEvent);
    };
  }, []);

  const stableActions = actionsRef.current;

  return {
    ...state,
    ...stableActions,
    isReady: state.status === "unlocked",
  };
}
