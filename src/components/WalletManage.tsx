/**
 * WalletManage — modal for creating, unlocking, and managing the passkey wallet.
 *
 * Content adapts to wallet status:
 * - none: "Create Wallet" button
 * - locked: "Unlock" button
 * - unlocked: address display + "Lock" button + backup option
 */

import React from "react";
import { usePasskeyWallet } from "../contexts/PasskeyWalletContext";

interface WalletManageProps {
  open: boolean;
  onClose: () => void;
}

export default function WalletManage({ open, onClose }: WalletManageProps) {
  const { status, address, createWallet, unlock, lock } = usePasskeyWallet();

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-surface-container-low rounded-2xl p-6 w-[360px] max-w-[90vw] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-display text-headline-sm text-on-surface">Wallet</h2>
          <button onClick={onClose} className="text-on-surface-variant hover:text-on-surface" aria-label="Close">
            ✕
          </button>
        </div>

        {status === "loading" && (
          <div className="flex flex-col gap-4 items-center py-8">
            <div className="w-8 h-8 border-2 border-primary-container border-t-transparent rounded-full animate-spin" />
            <p className="font-body text-body-md text-on-surface-variant">
              Creating wallet…
            </p>
          </div>
        )}

        {status === "none" && (
        )}

        {status === "locked" && (
          <div className="flex flex-col gap-4">
            <p className="font-body text-body-md text-on-surface-variant">
              Use biometrics to unlock your wallet.
            </p>
            <button className="btn-primary w-full" onClick={unlock}>
              Unlock Wallet
            </button>
          </div>
        )}

        {status === "unlocked" && address && (
          <div className="flex flex-col gap-4">
            <div className="card-bb p-4 bg-surface-dim/50">
              <div className="font-body text-label-sm text-on-surface-variant/60 uppercase tracking-wider mb-1">Address</div>
              <div className="font-mono text-sm text-on-surface break-all">{address}</div>
            </div>
            <button className="btn-secondary w-full" onClick={lock}>
              Lock Wallet
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
