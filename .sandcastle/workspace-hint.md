# Suknid — tattoo NFT marketplace

pnpm workspace with two packages: root (Astro + React + Cloudflare) and `contracts/` (Solidity/Foundry).

- The app lives at the repo root — NOT in a subdirectory. The root `package.json` has the app + all frontend deps.
- `pnpm dev` — start the dev server (Astro). This is the main development command.
- `pnpm test` — run unit tests (Vitest). Run it after implementing features.
- `pnpm test:e2e` — run Playwright e2e tests.
- `pnpm build` — build for production (Astro + Cloudflare).
- `pnpm typecheck` — TypeScript type checking (via `astro check` if configured, or `tsc --noEmit`).
- `cd contracts && forge build` — compile Solidity contracts.
- `cd contracts && forge test` — run Solidity tests.

Environment: Astro 5 + React 18 + Cloudflare Pages + D1 (SQLite via Drizzle ORM) + RainbowKit/wagmi/viem for wallet connection + NFTPort for metadata.
