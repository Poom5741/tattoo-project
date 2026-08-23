/**
 * PasskeyWalletContext — React context for passkey wallet lifecycle.
 *
 * DELEGATES to the shared walletStore singleton so that ALL Astro islands
 * share the same wallet state. Previously, each island created its own
 * PasskeyWalletProvider → separate React contexts → state mutations in
 * one island (e.g. Nav unlock) didn't reach other islands (e.g. /wallet page).
 *
 * Now usePasskeyWallet() reads from the module-level walletStore, which is
 * a singleton across all ES module imports (Astro islands share it).
 *
 * PasskeyWalletProvider is kept for backward compatibility but is now
 * effectively a no-op wrapper — the real state lives in walletStore.
 */

import {
  createContext,
  useContext,
  type ReactNode,
} from "react";
import {
  useWalletStore,
  type WalletStatus,
  type WalletState,
  type WalletActions,
} from "@/lib/walletStore";

// ── Types ───────────────────────────────────────────────────────

export type { WalletStatus };

export interface PasskeyWalletState {
  status: WalletStatus;
  address: `0x${string}` | null;
  daccPublickey: string | null;
  createWallet: () => Promise<void>;
  unlock: () => void;
  lock: () => void;
  importBackup: (data: {
    daccPublickey: string;
    address: `0x${string}`;
    encryptedPasswordSecretKey?: string;
  }) => void;
  isReady: boolean;
}

const PasskeyWalletContext = createContext<PasskeyWalletState | null>(null);

// ── Provider (kept for backward compat — now delegates to shared store) ──

export function PasskeyWalletProvider({ children }: { children: ReactNode }) {
  return (
    <PasskeyWalletContext.Provider value={null}>
      {children}
    </PasskeyWalletContext.Provider>
  );
}

// ── Hook ─────────────────────────────────────────────────────────

/**
 * usePasskeyWallet — reads from the shared walletStore singleton.
 *
 * All Astro islands that call this hook get the SAME state because
 * walletStore is a module-level singleton. State mutations broadcast
 * via CustomEvent("saknid-wallet-change") so all hooks re-render.
 */
export function usePasskeyWallet(): PasskeyWalletState {
  const store = useWalletStore();
  return store;
}
