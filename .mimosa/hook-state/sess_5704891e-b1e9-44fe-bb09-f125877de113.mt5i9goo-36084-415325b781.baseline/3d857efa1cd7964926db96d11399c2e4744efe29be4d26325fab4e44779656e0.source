import { createPublicClient, http, fallback } from "viem";
import { bscTestnet } from "viem/chains";

export function getChainClient(env: { BSC_RPC_PRIMARY: string; BSC_RPC_FALLBACK: string }) {
  const transport = fallback([
    http(env.BSC_RPC_PRIMARY),
    http(env.BSC_RPC_FALLBACK),
  ]);

  return createPublicClient({
    chain: bscTestnet,
    transport,
  });
}
