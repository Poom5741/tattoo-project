import { PrivyProvider, usePrivy } from "@privy-io/react-auth";
import { baseSepolia } from "viem/chains";

const PRIVY_APP_ID = import.meta.env.PUBLIC_PRIVY_APP_ID as string;

function Button() {
  const { login, logout, authenticated, ready, user } = usePrivy();
  const address = user?.smartWallet?.address ?? user?.wallet?.address;

  if (!ready) {
    return (
      <button className="nav__wallet" disabled>
        <span className="dot"></span>
        Connect
      </button>
    );
  }

  if (authenticated && address) {
    return (
      <button className="nav__wallet" onClick={logout} title="Sign out">
        <span className="dot" style={{ background: "var(--ok)" }}></span>
        {address.slice(0, 6)}…{address.slice(-4)}
      </button>
    );
  }

  return (
    <button className="nav__wallet" onClick={login}>
      <span className="dot"></span>
      Connect
    </button>
  );
}

export default function PrivyNavButton() {
  return (
    <PrivyProvider
      appId={PRIVY_APP_ID}
      config={{
        loginMethods: ["email", "google", "wallet"],
        embeddedWallets: { createOnLogin: "all-users", requireUserPasswordOnCreate: false },
        defaultChain: baseSepolia,
        supportedChains: [baseSepolia],
        appearance: { theme: "dark", accentColor: "#c9a96e" },
      }}
    >
      <Button />
    </PrivyProvider>
  );
}
