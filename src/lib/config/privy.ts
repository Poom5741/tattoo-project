import { bscTestnet } from "viem/chains";

export const PRIVY_CONFIG = {
  loginMethods: ["email", "google", "wallet"] as const,
  embeddedWallets: { createOnLogin: "all-users" as const, requireUserPasswordOnCreate: false },
  defaultChain: bscTestnet,
  supportedChains: [bscTestnet],
  appearance: { theme: "light" as const, accentColor: "#E60023" },
};
