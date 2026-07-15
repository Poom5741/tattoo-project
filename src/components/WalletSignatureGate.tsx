/**
 * WalletSignatureGate — Artist portal login via wallet signature.
 *
 * Fetches a challenge from the server, prompts the user to sign it
 * with their passkey wallet, and submits the signature for verification.
 * Replaces the previous Privy-based artist gate.
 */

import { useState, useEffect } from "react";
import { usePasskeyWallet } from "../contexts/PasskeyWalletContext";
import { bscTestnet } from "viem/chains";

type Phase = "idle" | "fetching-challenge" | "signing" | "logging-in" | "done" | "error";

export default function WalletSignatureGate() {
  const { status, address, daccPublickey, createWallet } = usePasskeyWallet();
  const [phase, setPhase] = useState<Phase>("idle");
  const [error, setError] = useState<string | null>(null);

  // Auto-start login when wallet is ready
  useEffect(() => {
    if (status !== "unlocked" || phase !== "idle") return;
    doLogin();
  }, [status]);

  const doLogin = async () => {
    setError(null);
    setPhase("fetching-challenge");

    try {
      const challengeRes = await fetch("/api/auth/challenge");
      if (!challengeRes.ok) {
        setPhase("error");
        setError("Failed to fetch challenge. Server returned " + challengeRes.status);
        return;
      }
      const challenge = await challengeRes.json() as { message: string; nonce: string };

      if (!address || !daccPublickey) {
        setPhase("error");
        setError("Wallet not ready. Please unlock your wallet first.");
        return;
      }

      setPhase("signing");
      // Dynamic imports: dacc-js (libsodium WASM) and viem chains
      // are only needed client-side, not in Workers SSR.
      const [{ daccSignMessage }, { bscTestnet }] = await Promise.all([
        import("dacc-js"),
        import("viem/chains"),
      ]);
      const result = await daccSignMessage({
        address,
        daccPublickey,
        passwordSecretkey: "passkey-derived-secret",
        network: bscTestnet,
        message: challenge.message,
      });

      setPhase("logging-in");
      const loginRes = await fetch("/api/auth/artist-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          address,
          signature: result.signature,
          nonce: challenge.nonce,
        }),
      });

      if (!loginRes.ok) {
        const err = await loginRes.json() as { error: string };
        setPhase("error");
        setError(err.error || "Login failed");
        return;
      }

      setPhase("done");
      window.location.reload();
    } catch (e) {
      console.error("WalletSignatureGate login error:", e);
      setPhase("error");
      setError("Something went wrong. Please try again.");
    }
  };

  if (status === "none") {
    return (
      <div className="card-bb p-12 md:p-20 text-center bg-surface-container-low max-w-[480px] mx-auto mt-20">
        <h2 className="font-display text-headline-md text-on-surface mb-4">Artist Portal</h2>
        <p className="font-body text-body-md text-on-surface-variant mb-7">
          Create a passkey wallet to sign in with your artist wallet.
        </p>
        <button className="btn-primary" onClick={createWallet}>
          Create Wallet
        </button>
      </div>
    );
  }

  if (status === "locked") {
    return (
      <div className="card-bb p-12 md:p-20 text-center bg-surface-container-low max-w-[480px] mx-auto mt-20">
        <h2 className="font-display text-headline-md text-on-surface mb-4">Artist Portal</h2>
        <p className="font-body text-body-md text-on-surface-variant mb-7">
          Unlock your wallet to sign in.
        </p>
        <p className="font-body text-body-sm text-on-surface-variant/60">
          Your wallet is locked. Unlock it from the navigation bar.
        </p>
      </div>
    );
  }

  if (phase === "error") {
    return (
      <div className="card-bb p-12 md:p-20 text-center bg-surface-container-low max-w-[480px] mx-auto mt-20">
        <h2 className="font-display text-headline-md text-on-surface mb-4">Sign In Failed</h2>
        <p className="font-body text-body-md text-error mb-7">{error}</p>
        <button className="btn-primary" onClick={() => { setPhase("idle"); doLogin(); }}>
          Try Again
        </button>
      </div>
    );
  }

  if (phase === "done") {
    return null;
  }

  // Loading states
  return (
    <div className="card-bb p-12 md:p-20 text-center bg-surface-container-low max-w-[480px] mx-auto mt-20">
      <h2 className="font-display text-headline-md text-on-surface mb-4">Artist Portal</h2>
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-primary-container border-t-transparent rounded-full animate-spin" />
        <p className="font-body text-body-md text-on-surface-variant">
          {phase === "fetching-challenge" && "Preparing sign-in…"}
          {phase === "signing" && "Sign challenge with your wallet…"}
          {phase === "logging-in" && "Verifying signature…"}
        </p>
      </div>
    </div>
  );
}
