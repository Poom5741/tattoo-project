import { QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { PasskeyWalletProvider } from "../contexts/PasskeyWalletContext";
import { config, queryClient } from "../lib/wagmi";
import type { ReactNode } from "react";

interface WalletProviderProps {
  children: ReactNode;
}

export default function WalletProvider({ children }: WalletProviderProps) {
  return (
    <PasskeyWalletProvider>
      <QueryClientProvider client={queryClient}>
        <WagmiProvider config={config}>
          {children}
        </WagmiProvider>
      </QueryClientProvider>
    </PasskeyWalletProvider>
  );
}
