import type { Abi } from "viem";

const _DEPLOYMENT_ADDRESS = "" as const;
const _DEPLOYMENT_BLOCK = 0 as const;

export const CONTRACT_ADDRESS: `0x${string}` =
  (_DEPLOYMENT_ADDRESS as string).startsWith("0x")
    ? (_DEPLOYMENT_ADDRESS as `0x${string}`)
    : "0x0000000000000000000000000000000000000000";

export const CHAIN_ID = 84532 as const;

export const DEPLOY_BLOCK = BigInt(_DEPLOYMENT_BLOCK);

export const CONTRACT_ABI = [
  {
    type: "function",
    name: "mintWithVoucher",
    inputs: [
      {
        name: "voucher",
        type: "tuple",
        components: [
          { name: "tokenId", type: "uint256" },
          { name: "designId", type: "string" },
          { name: "price", type: "uint256" },
          { name: "artistTreasury", type: "address" },
          { name: "expiry", type: "uint256" },
          { name: "buyer", type: "address" },
          { name: "cidHash", type: "bytes32" },
        ],
      },
      { name: "signature", type: "bytes" },
      { name: "cid", type: "string" },
    ],
    outputs: [],
    stateMutability: "payable",
  },
  {
    type: "function",
    name: "ownerOf",
    inputs: [{ name: "tokenId", type: "uint256" }],
    outputs: [{ name: "", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "tokenURI",
    inputs: [{ name: "tokenId", type: "uint256" }],
    outputs: [{ name: "", type: "string" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "balanceOf",
    inputs: [{ name: "owner", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "event",
    name: "Transfer",
    inputs: [
      { name: "from", type: "address", indexed: true },
      { name: "to", type: "address", indexed: true },
      { name: "tokenId", type: "uint256", indexed: true },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "PlateMinted",
    inputs: [
      { name: "tokenId", type: "uint256", indexed: true },
      { name: "buyer", type: "address", indexed: true },
      { name: "designId", type: "string", indexed: false },
    ],
    anonymous: false,
  },
] as const satisfies Abi;
