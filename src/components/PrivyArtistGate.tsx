import React from "react";
import { PrivyProvider, usePrivy, useWallets } from "@privy-io/react-auth";
import { baseSepolia } from "viem/chains";

interface Props {
  appId: string;
}

function LoginWall() {
  const { login, ready } = usePrivy();
  return (
    <div style={{ minHeight: "60vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "24px" }}>
      <div className="kicker" style={{ letterSpacing: "0.2em" }}>INKNOIR / Artist Portal</div>
      <h1 className="display" style={{ fontSize: "34px" }}>Sign in with your wallet</h1>
      <p className="mono" style={{ fontSize: "13px", color: "var(--fg-dim)", maxWidth: "360px", textAlign: "center" }}>
        Use email, Google, or any Ethereum wallet. No seed phrase required — your smart wallet is created automatically.
      </p>
      <button className="btn btn--solid btn--lg" onClick={login} disabled={!ready} style={{ minWidth: "200px" }}>
        {ready ? "Connect & Sign in" : "Loading…"}
      </button>
    </div>
  );
}

function AuthHandler({ onSession }: { onSession: () => void }) {
  const { authenticated, getAccessToken, logout } = usePrivy();
  const { wallets } = useWallets();
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const calledRef = React.useRef(false);

  const walletAddress = wallets[0]?.address ?? "";

  React.useEffect(() => {
    if (!authenticated || calledRef.current) return;
    // Wait for Privy to finish creating the embedded wallet before proceeding
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
          const data = await res.json() as { error?: string };
          setError(data.error ?? "Login failed");
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
      <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p className="mono" style={{ fontSize: "13px", color: "var(--fg-dim)" }}>Setting up your wallet…</p>
      </div>
    );
  }
  if (loading) {
    return (
      <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p className="mono" style={{ fontSize: "13px", color: "var(--fg-dim)" }}>Verifying wallet…</p>
      </div>
    );
  }
  if (error) {
    return (
      <div style={{ minHeight: "60vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "16px" }}>
        <p className="mono" style={{ fontSize: "13px", color: "var(--warn)" }}>{error}</p>
        <button className="btn btn--ghost" onClick={() => { setError(null); calledRef.current = false; }}>Try again</button>
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
        appearance: { theme: "dark", accentColor: "#c9a96e" },
      }}
    >
      <AuthHandler onSession={() => setSessionReady(true)} />
    </PrivyProvider>
  );
}
