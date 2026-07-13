# Open Questions

## artist-portal-features - 2026-06-09

- [ ] BSC testnet (chain 97) vs mainnet (chain 56) for initial deployment — affects wrangler.toml config and RPC endpoints
- [ ] PaySolution API documentation: need endpoint URLs, authentication method, webhook signature verification format, and sandbox credentials — blocks Task 3.7
- [ ] USDT contract address for BSC testnet: is `0x337610d27c682E347C9cD60BD4b3b107C9d34dDd` the correct test USDT, or does the team use a custom mock USDT? — affects contract constructor and frontend config
- [ ] Artist cookie path issue: current `Path=/artist` on the `artist_token` cookie means API calls to `/api/` endpoints will NOT include the cookie. Need to decide: widen to `Path=/` (like the admin fix in commit `1531d58`) or pass token via Authorization header — blocks all artist-authenticated API endpoints in Waves 2-4
- [ ] Resale on-chain mechanics: should resale go through the same contract (add a `buyResale` function that handles transfer + payment split), or should we deploy a separate marketplace contract? The V2 contract design currently only covers primary minting — affects Task 4.2 implementation
- [ ] R2 bucket CORS configuration: does the `suknid-assets` R2 bucket allow PUT from the browser, or does the upload need to go through the server as a proxy? — affects Task 1.4 implementation (multipart proxy vs presigned URL)
- [ ] Platform treasury wallet address for receiving the 3% fee — needs to be set in the V2 contract constructor and as an env var
- [ ] Existing seed designs (d1-d15) on Base Sepolia: should they be migrated to BSC with new token IDs, or are they considered test data that will be superseded by real artist listings? — affects whether old Plate-component designs coexist with new photo-based designs
- [ ] IPFS pinning at mint time: the existing `nft.storage` dependency is available but the flow is partially implemented. Should mint-time IPFS pinning be included in this plan or deferred to a follow-up? — currently deferred per spec
- [ ] Per-artist treasury addresses: the current contract uses a single `artistTreasury`. The V2 voucher includes `artistTreasury` per-voucher. Where is each artist's treasury address stored? The `artists` table has `wallet_address` — confirm this is the payment destination — affects voucher generation in Task 3.5
