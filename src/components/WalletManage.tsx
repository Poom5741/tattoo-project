/**
 * WalletManage — modal for creating, unlocking, and managing the passkey wallet.
 *
 * Content adapts to wallet status:
 * - none: "Create Wallet" button + import from backup
 * - locked: "Unlock" button
 * - unlocked: address display + "Lock" button
 */

import React, { useRef } from "react";
import { usePasskeyWallet } from "../contexts/PasskeyWalletContext";

interface WalletManageProps {
  open: boolean;
  onClose: () => void;
}

export default function WalletManage({ open, onClose }: WalletManageProps) {
  const { status, address, createWallet, unlock, lock, importBackup } =
    usePasskeyWallet();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importError, setImportError] = React.useState<string | null>(null);

  if (!open) return null;

  const handleImport = async () => {
    setImportError(null);
    try {
      const file = fileInputRef.current?.files?.[0];
      if (!file) return;
      const text = await file.text();
      const parsed: unknown = JSON.parse(text);
      if (
        typeof parsed !== "object" || parsed === null ||
        typeof (parsed as Record<string, unknown>).daccPublickey !== "string" ||
        typeof (parsed as Record<string, unknown>).address !== "string"
      ) {
        setImportError("Invalid backup file format.");
        return;
      }
      const data = parsed as { daccPublickey: string; address: `0x${string}` };
      importBackup(data);
      onClose();
    } catch {
      setImportError("Could not read backup file. Ensure it is a valid JSON file.");
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-surface-container-low rounded-2xl p-6 w-[360px] max-w-[90vw] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-display text-headline-sm text-on-surface">Wallet</h2>
          <button
            onClick={onClose}
            className="text-on-surface-variant hover:text-on-surface"
            aria-label="Close"
          >
            &#10005;
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
          <div className="flex flex-col gap-4">
            <p className="font-body text-body-md text-on-surface-variant">
              Create a self-custodial wallet secured by your device's biometrics.
            </p>
            <button
              className="btn-primary w-full"
              onClick={createWallet}
            >
              Create Wallet
            </button>

            <div className="flex items-center gap-3 mt-2">
              <hr className="flex-1 border-outline-variant/30" />
              <span className="font-body text-xs text-on-surface-variant/60">
                or
              </span>
              <hr className="flex-1 border-outline-variant/30" />
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept=".json,application/json"
              className="hidden"
              onChange={handleImport}
            />
            <button
              className="btn-secondary w-full"
              onClick={() => fileInputRef.current?.click()}
            >
              Import from Backup
            </button>
            {importError && (
              <p className="font-body text-sm text-error">{importError}</p>
            )}
          </div>
        )}

        {status === "locked" && (
          <div className="flex flex-col gap-4">
            <p className="font-body text-body-md text-on-surface-variant">
              Use your device biometrics to unlock your wallet.
            </p>
            <button className="btn-primary w-full" onClick={unlock}>
              Unlock Wallet
            </button>
          </div>
        )}

        {status === "unlocked" && address && (
          <div className="flex flex-col gap-4">
            <div className="card-bb p-4 bg-surface-dim/50">
              <div className="font-body text-label-sm text-on-surface-variant/60 uppercase tracking-wider mb-1">
                Address
              </div>
              <div className="font-mono text-sm text-on-surface break-all">
                {address}
              </div>
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
