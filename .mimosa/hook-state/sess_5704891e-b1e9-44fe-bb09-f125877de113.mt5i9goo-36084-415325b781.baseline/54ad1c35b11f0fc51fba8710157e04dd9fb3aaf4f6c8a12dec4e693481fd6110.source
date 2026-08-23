/**
 * ClientWalletSignatureGate — Client inbox login via wallet signature.
 *
 * Fetches a challenge from the server, prompts the user to sign it
 * with their passkey wallet, and submits the signature for client authentication.
 * Bypasses the need for Google OAuth for messaging.
 */

import { useState, useEffect } from "react";
import {
  PasskeyWalletProvider,
  usePasskeyWallet,
} from "../contexts/PasskeyWalletContext";

type Phase = "idle" | "fetching-challenge" | "signing" | "logging-in" | "done" | "error";

const LS_SECRET = "saknid_wallet_secret";

function ClientWalletSignatureGateInner() {
  const { status, address, daccPublickey, createWallet, unlock } = usePasskeyWallet();
  const [phase, setPhase] = useState<Phase>("idle");
  const [error, setError] = useState<string | null>(null);

  const doLogin = async () => {
    setError(null);
    setPhase("fetching-challenge");

    try {
      const challengeRes = await fetch("/api/auth/challenge");
      if (!challengeRes.ok) {
        setPhase("error");
        setError(`Failed to fetch challenge. Server returned ${challengeRes.status}`);
        return;
      }
      const challenge = (await challengeRes.json()) as { message: string; nonce: string };

      if (!address || !daccPublickey) {
        setPhase("error");
        setError("Wallet not ready. Please unlock your wallet first.");
        return;
      }

      setPhase("signing");
      const secret = localStorage.getItem(LS_SECRET);
      if (!secret) {
        setPhase("error");
        setError("Wallet secret not found. Please recreate your wallet.");
        return;
      }

      const [{ daccSignMessage }, { bscTestnet }] = await Promise.all([
        import("dacc-js"),
        import("viem/chains"),
      ]);
      
      const result = await daccSignMessage({
        address,
        daccPublickey,
        passwordSecretkey: secret,
        network: bscTestnet,
        message: challenge.message,
      });

      setPhase("logging-in");
      const loginRes = await fetch("/api/auth/client-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          address,
          signature: result.signature,
          nonce: challenge.nonce,
        }),
      });

      if (!loginRes.ok) {
        let errMsg = "Sign-in failed";
        try {
          const err = (await loginRes.json()) as unknown;
          if (
            typeof err === "object" && err !== null &&
            "error" in err && typeof (err as Record<string, unknown>).error === "string"
          ) {
            errMsg = (err as Record<string, unknown>).error as string;
          }
        } catch { /* use default */ }
        setPhase("error");
        setError(errMsg);
        return;
      }

      setPhase("done");
      window.location.reload();
    } catch (e) {
      console.error("ClientWalletSignatureGate login error:", e);
      setPhase("error");
      setError("Something went wrong. Please try again.");
    }
  };

  // Auto-start login when wallet is ready
  useEffect(() => {
    if (status !== "unlocked" || phase !== "idle") return;
    doLogin();
  }, [status, phase]);

  if (status === "none") {
    return (
      <div className="card-bb p-12 md:p-20 text-center bg-surface-container-low max-w-[480px] mx-auto mt-10">
        <h2 className="font-display text-headline-md text-on-surface mb-4">Your Messages</h2>
        <p className="font-body text-body-md text-on-surface-variant mb-7">
          Create or connect a passkey wallet to view your conversations.
        </p>
        <button className="btn-primary" onClick={createWallet}>
          Create Wallet
        </button>
      </div>
    );
  }

  if (status === "locked") {
    return (
      <div className="card-bb p-12 md:p-20 text-center bg-surface-container-low max-w-[480px] mx-auto mt-10">
        <h2 className="font-display text-headline-md text-on-surface mb-4">Inbox Locked</h2>
        <p className="font-body text-body-md text-on-surface-variant mb-7">
          Unlock your wallet with biometrics to authenticate.
        </p>
        <button className="btn-primary" onClick={unlock}>
          Unlock Wallet
        </button>
      </div>
    );
  }

  if (phase === "error") {
    return (
      <div className="card-bb p-12 md:p-20 text-center bg-surface-container-low max-w-[480px] mx-auto mt-10">
        <h2 className="font-display text-headline-md text-on-surface mb-4">Authentication Failed</h2>
        <p className="font-body text-body-md text-error mb-7">{error}</p>
        <button className="btn-primary" onClick={() => setPhase("idle")}>
          Try Again
        </button>
      </div>
    );
  }

  if (phase === "done") {
    return null;
  }

  return (
    <div className="card-bb p-12 md:p-20 text-center bg-surface-container-low max-w-[480px] mx-auto mt-10">
      <h2 className="font-display text-headline-md text-on-surface mb-4">Connecting to Inbox</h2>
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-primary-container border-t-transparent rounded-full animate-spin" />
        <p className="font-body text-body-md text-on-surface-variant">
          {phase === "fetching-challenge" && "Preparing secure sign-in…"}
          {phase === "signing" && "Authorize biometric prompt to sign challenge…"}
          {phase === "logging-in" && "Verifying session signature…"}
        </p>
      </div>
    </div>
  );
}

export default function ClientWalletSignatureGate() {
  return (
    <PasskeyWalletProvider>
      <ClientWalletSignatureGateInner />
    </PasskeyWalletProvider>
  );
}
