globalThis.process ??= {};
globalThis.process.env ??= {};
const _DEPLOYMENT_ADDRESS = "";
const _DEPLOYMENT_BLOCK = 0;
const CONTRACT_ADDRESS = _DEPLOYMENT_ADDRESS.startsWith("0x") ? _DEPLOYMENT_ADDRESS : "0x0000000000000000000000000000000000000000";
const CHAIN_ID = 97;
BigInt(_DEPLOYMENT_BLOCK);
const CONTRACT_ABI = [
  // V2: mintWithVoucher with USDT payment (no payable/value)
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
          { name: "soulbound", type: "bool" },
          { name: "royaltyBps", type: "uint96" }
        ]
      },
      { name: "signature", type: "bytes" },
      { name: "cid", type: "string" }
    ],
    outputs: [],
    stateMutability: "nonpayable"
  },
  // V2: buyResale for secondary market purchases
  {
    type: "function",
    name: "buyResale",
    inputs: [
      { name: "tokenId", type: "uint256" },
      { name: "price", type: "uint256" }
    ],
    outputs: [],
    stateMutability: "nonpayable"
  },
  // V2: soulbound flag per token
  {
    type: "function",
    name: "soulbound",
    inputs: [{ name: "tokenId", type: "uint256" }],
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "view"
  },
  // V2: ERC-2981 royalty info
  {
    type: "function",
    name: "royaltyInfo",
    inputs: [
      { name: "tokenId", type: "uint256" },
      { name: "salePrice", type: "uint256" }
    ],
    outputs: [
      { name: "receiver", type: "address" },
      { name: "royaltyAmount", type: "uint256" }
    ],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "ownerOf",
    inputs: [{ name: "tokenId", type: "uint256" }],
    outputs: [{ name: "", type: "address" }],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "tokenURI",
    inputs: [{ name: "tokenId", type: "uint256" }],
    outputs: [{ name: "", type: "string" }],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "balanceOf",
    inputs: [{ name: "owner", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view"
  },
  {
    type: "event",
    name: "Transfer",
    inputs: [
      { name: "from", type: "address", indexed: true },
      { name: "to", type: "address", indexed: true },
      { name: "tokenId", type: "uint256", indexed: true }
    ],
    anonymous: false
  },
  {
    type: "event",
    name: "PlateMinted",
    inputs: [
      { name: "tokenId", type: "uint256", indexed: true },
      { name: "buyer", type: "address", indexed: true },
      { name: "designId", type: "string", indexed: false }
    ],
    anonymous: false
  },
  {
    type: "event",
    name: "ResalePurchase",
    inputs: [
      { name: "tokenId", type: "uint256", indexed: true },
      { name: "buyer", type: "address", indexed: true },
      { name: "price", type: "uint256", indexed: false }
    ],
    anonymous: false
  }
];
export {
  CONTRACT_ADDRESS as C,
  CONTRACT_ABI as a,
  CHAIN_ID as b
};
