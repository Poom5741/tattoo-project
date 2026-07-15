/**
 * PasskeyNavButton — wallet status button in the navigation bar.
 *
 * Shows wallet address when unlocked, "Connect Wallet" otherwise.
 * Shows loading indicator during wallet creation.
 */

import { usePasskeyWallet } from "../contexts/PasskeyWalletContext";

export default function PasskeyNavButton() {
  const { status, address } = usePasskeyWallet();

  const label = (() => {
    if (status === "loading") return "Connecting…";
    if (status === "unlocked" && address) {
      return `${address.slice(0, 6)}…${address.slice(-4)}`;
    }
    return "Connect Wallet";
  })();

  return (
    <button className="nav__wallet" disabled={status === "loading"}>
      <span
        className="dot"
        style={
          status === "unlocked"
            ? { background: "#2E7D32" }
            : status === "loading"
            ? { background: "#F59E0B", animation: "pulse 1s infinite" }
            : undefined
        }
      />
      {label}
    </button>
  );
}
