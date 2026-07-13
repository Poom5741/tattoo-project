import React from "react";
import { PrivyProvider, usePrivy, useWallets, useCreateWallet } from "@privy-io/react-auth";
import { baseSepolia } from "viem/chains";

interface Props {
  appId: string;
}

function LoginWall() {
  const { login, ready } = usePrivy();
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6">
      <div className="font-sora font-semibold text-xs tracking-[0.2em] uppercase text-[#E60023]">SUKNID / Artist Portal</div>
      <h1 className="font-playfair font-semibold text-[#1B1C18] text-[34px]">Sign in with your wallet</h1>
      <p className="font-sora text-[13px] text-[#5A5B55] max-w-[360px] text-center">
        Use email, Google, or any Ethereum wallet. No seed phrase required — your smart wallet is created automatically.
      </p>
      <button className="bg-[#E60023] text-white hover:bg-[#C4001F] disabled:opacity-40 px-8 py-4 text-base min-w-[200px]" onClick={login} disabled={!ready}>
        {ready ? "Connect & Sign in" : "Loading…"}
      </button>
    </div>
  );
}

function AuthHandler({ onSession }: { onSession: () => void }) {
  const { authenticated, getAccessToken, logout } = usePrivy();
  const { wallets } = useWallets();
  const { createWallet } = useCreateWallet();
  const [error, setError] = React.useState<string | null>(null);
  const [errorWallet, setErrorWallet] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const calledRef = React.useRef(false);
  const creatingWalletRef = React.useRef(false);

  const walletAddress = wallets[0]?.address ?? "";

  // Explicitly create embedded wallet if user signed in without one
  React.useEffect(() => {
    if (!authenticated || walletAddress || creatingWalletRef.current) return;
    creatingWalletRef.current = true;
    createWallet().catch(() => {
      creatingWalletRef.current = false;
    });
  }, [authenticated, walletAddress]);

  React.useEffect(() => {
    if (!authenticated || calledRef.current) return;
    if (!walletAddress) return;
    calledRef.current = true;
    setLoading(true);
    (async () => {
      try {
        const accessToken = await getAccessToken();
        if (!accessToken) throw new Error("Could not get access token");
        const res = await fetch("/api/auth/artist-login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ accessToken, walletAddress }),
        });
        if (res.ok) {
          onSession();
        } else {
          const data = await res.json() as { error?: string; walletAddress?: string };
          setError(data.error ?? "Login failed");
          if (data.walletAddress) setErrorWallet(data.walletAddress);
          await logout();
          calledRef.current = false;
        }
      } catch {
        setError("Network error. Please try again.");
        calledRef.current = false;
      } finally {
        setLoading(false);
      }
    })();
  }, [authenticated, walletAddress]);

  if (authenticated && !walletAddress) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="font-sora text-[13px] text-[#5A5B55]">Setting up your wallet…</p>
      </div>
    );
  }
  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="font-sora text-[13px] text-[#5A5B55]">Verifying wallet…</p>
      </div>
    );
  }
  if (error) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-5 px-6">
        <p className="font-sora text-[13px] text-[#E60023]">{error}</p>
        {errorWallet && (
          <div className="text-center max-w-[420px]">
            <p className="font-sora text-[11px] text-[#5A5B55] mb-2.5">
              Your wallet address — copy this and send it to your shop admin:
            </p>
            <div
              onClick={() => navigator.clipboard.writeText(errorWallet)}
              className="font-sora text-xs bg-[#E8E0D0] border border-[#E8E3D8] p-3 rounded cursor-pointer break-all"
              style={{ userSelect: "all" }}
              title="Click to copy"
            >
              {errorWallet}
            </div>
            <p className="font-sora text-[10px] text-[#5A5B55] mt-2">
              Click to copy
            </p>
          </div>
        )}
        <button className="bg-transparent text-[#1B1C18] border border-[#E8E3D8] hover:border-[#D4CFC4]" onClick={() => { setError(null); setErrorWallet(null); calledRef.current = false; }}>Try again</button>
      </div>
    );
  }
  return <LoginWall />;
}

export default function PrivyArtistGate({ appId }: Props) {
  const [sessionReady, setSessionReady] = React.useState(false);
  if (sessionReady) {
    window.location.reload();
    return null;
  }
  return (
    <PrivyProvider
      appId={appId}
      config={{
        loginMethods: ["email", "google", "wallet"],
        embeddedWallets: { createOnLogin: "all-users", requireUserPasswordOnCreate: false },
        defaultChain: baseSepolia,
        supportedChains: [baseSepolia],
        appearance: { theme: "light", accentColor: "#E60023" },
      }}
    >
      <AuthHandler onSession={() => setSessionReady(true)} />
    </PrivyProvider>
  );
}
