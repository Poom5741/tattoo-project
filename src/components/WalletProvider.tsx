import { WagmiProvider } from "@privy-io/wagmi";
import { PrivyProvider } from "@privy-io/react-auth";
import { QueryClientProvider } from "@tanstack/react-query";
import { config, queryClient } from "../lib/wagmi";
import { PRIVY_CONFIG } from "../lib/config/privy";
import type { ReactNode } from "react";

const PRIVY_APP_ID = import.meta.env.PUBLIC_PRIVY_APP_ID as string;

interface WalletProviderProps {
  children: ReactNode;
}

export default function WalletProvider({ children }: WalletProviderProps) {
  return (
    <PrivyProvider
      appId={PRIVY_APP_ID}
      config={PRIVY_CONFIG}
    >
      <QueryClientProvider client={queryClient}>
        <WagmiProvider config={config}>
          {children}
        </WagmiProvider>
      </QueryClientProvider>
    </PrivyProvider>
  );
}
