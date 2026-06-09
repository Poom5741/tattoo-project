import { createConfig, http, fallback } from "wagmi";
import { baseSepolia } from "wagmi/chains";
import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient();

export const config = createConfig({
  chains: [baseSepolia],
  transports: {
    [baseSepolia.id]: fallback([
      http(import.meta.env.PUBLIC_BASE_RPC_PRIMARY),
      http(import.meta.env.PUBLIC_BASE_RPC_FALLBACK),
    ]),
  },
});
