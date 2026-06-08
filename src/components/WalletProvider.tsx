import { WagmiProvider, type State } from "wagmi";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { QueryClientProvider } from "@tanstack/react-query";
import { config, queryClient } from "../lib/wagmi";
import type { ReactNode } from "react";

import "@rainbow-me/rainbowkit/styles.css";

interface WalletProviderProps {
  children: ReactNode;
  initialState?: State;
}

export default function WalletProvider({ children, initialState }: WalletProviderProps) {
  return (
    <WagmiProvider config={config} initialState={initialState}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>{children}</RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
