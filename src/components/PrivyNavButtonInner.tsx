import { PrivyProvider, usePrivy, useWallets } from "@privy-io/react-auth";
import { PRIVY_CONFIG } from "../lib/config/privy";

const PRIVY_APP_ID = import.meta.env.PUBLIC_PRIVY_APP_ID as string;

function Button() {
  const { login, logout, authenticated, ready } = usePrivy();
  const { wallets } = useWallets();
  const address = wallets[0]?.address;

  if (!ready) {
    return (
      <button className="nav__wallet" disabled>
        <span className="dot"></span>
        Connect Wallet
      </button>
    );
  }

  if (authenticated && address) {
    return (
      <button className="nav__wallet" onClick={logout} title="Sign out">
        <span className="dot" style={{ background: "#2E7D32" }}></span>
        {address.slice(0, 6)}…{address.slice(-4)}
      </button>
    );
  }

  return (
    <button className="nav__wallet" onClick={login}>
      <span className="dot"></span>
      Connect Wallet
    </button>
  );
}

export default function PrivyNavButton() {
  return (
    <PrivyProvider
      appId={PRIVY_APP_ID}
      config={PRIVY_CONFIG}
    >
      <Button />
    </PrivyProvider>
  );
}
