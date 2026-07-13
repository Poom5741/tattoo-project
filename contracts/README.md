# SuknidPlates — Foundry Smart Contract

ERC-721 lazy-mint contract for SUKNID tattoo plates. Vouchers are signed off-chain by the Cloudflare Worker and verified on-chain via EIP-712.

## Prerequisites

### 1. Install Foundry

```bash
curl -L https://foundry.paradigm.xyz | bash
foundryup
```

Verify: `forge --version`

### 2. Install OpenZeppelin Contracts v5

```bash
cd contracts
forge install OpenZeppelin/openzeppelin-contracts@v5 --no-commit
```

This populates `contracts/lib/openzeppelin-contracts/`. The `lib/` directory is gitignored; you must run this after every fresh clone.

## Build

```bash
cd contracts
forge build
```

## Test

```bash
cd contracts
forge test -vv
```

All 12 tests should pass:

- `testSuccessfulMint` — happy path mint
- `testRevertOnExpiredVoucher` — EXPIRED
- `testRevertOnWrongSigner` — BAD_SIG (random key)
- `testRevertOnDoubleClaim` — MINTED
- `testRevertOnUnderpayment` — UNDERPAID
- `testRevertOnWrongBuyer` — WRONG_BUYER (front-run mitigation)
- `testRevertOnWrongChainId` — BAD_SIG (domain separator mismatch)
- `testRevertOnWrongCid` — BAD_CID (cid substitution mitigation)
- `testSetAuthorizedSignerOnlyOwner` — non-owner reverts
- `testReentrancyBlocked` — ReentrancyGuard fires
- `testRevertOnRotatedSigner` — old key invalid after rotation
- `testTokenURIReturnsIpfs` — tokenURI returns `ipfs://<cid>`

## Deploy to Base Sepolia

```bash
# Set required env vars
export BASE_SEPOLIA_RPC=https://sepolia.base.org
export BASESCAN_API_KEY=<your_key>
export SIGNER_ADDRESS=<your_signer_wallet_address>
export ARTIST_TREASURY=<your_treasury_wallet_address>

# Deploy + verify
bash scripts/deploy-contract.sh
```

The script writes `contracts/deployments/base-sepolia.json` and updates `src/lib/config/contract.ts`.

## Signer Rotation

```bash
export CONTRACT_ADDRESS=<deployed_address>
export NEW_SIGNER=<new_signer_address>

cd contracts
forge script script/SetAuthorizedSigner.s.sol:SetAuthorizedSignerScript \
  --rpc-url $BASE_SEPOLIA_RPC \
  --broadcast
```

After rotation, vouchers signed by the old key will revert with `BAD_SIG`.

## Contract Architecture

- **ERC721** — base NFT standard (non-enumerable to avoid gas overhead)
- **Ownable** — `setAuthorizedSigner` protected
- **ReentrancyGuard** — protects `mintWithVoucher` against malicious treasury re-entry
- **EIP712** — typed structured data for off-chain signing

### LazyMintVoucher struct

| Field | Type | Purpose |
|-------|------|---------|
| tokenId | uint256 | Which token to mint |
| designId | string | Off-chain catalog ID |
| price | uint256 | Minimum wei required |
| artistTreasury | address | Payment destination |
| expiry | uint256 | Unix timestamp cutoff |
| buyer | address | Prevents front-running |
| cidHash | bytes32 | keccak256(cid) — prevents CID substitution |

### Security invariants

1. `msg.sender == voucher.buyer` — voucher is buyer-bound (front-run mitigation)
2. `keccak256(cid) == voucher.cidHash` — metadata CID is signer-bound (substitution mitigation)
3. `nonReentrant` on `mintWithVoucher` — malicious treasury cannot re-enter
4. `call{value:}` — works with contract-wallet treasuries (not limited to 2300 gas)
5. `setAuthorizedSigner` — owner can rotate signing key without redeploying
