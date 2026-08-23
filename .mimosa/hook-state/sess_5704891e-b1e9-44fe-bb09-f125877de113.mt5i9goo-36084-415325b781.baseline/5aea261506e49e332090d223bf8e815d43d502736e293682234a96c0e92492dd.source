import { createConfig, http, fallback } from "wagmi";
import { bscTestnet } from "wagmi/chains";
import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient();

export const config = createConfig({
  chains: [bscTestnet],
  transports: {
    [bscTestnet.id]: fallback([
      http(import.meta.env.PUBLIC_BSC_RPC_PRIMARY),
      http(import.meta.env.PUBLIC_BSC_RPC_FALLBACK),
    ]),
  },
});
