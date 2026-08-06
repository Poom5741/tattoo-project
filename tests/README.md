# Tests

## Structure

```
tests/
  unit/
    plate.test.ts          — Plate component DOM snapshot + prop behaviour
    voucher.test.ts        — Voucher signer determinism + Zod schema rejection
    legacy-cleanup.test.ts — Base layout localStorage key removal
  e2e/
    visual.spec.ts         — Playwright visual regression (toHaveScreenshot)
    flows/                 — Multi-page user-flow specs
  load/
    voucher.test.ts        — Documented spec for 50-concurrent POST idempotency
```

## Run-time prerequisites

### Unit tests (`pnpm test`)

| Test | Status | Prerequisite |
|------|--------|--------------|
| `plate.test.ts` | Ready to run | `@testing-library/react` must be installed (`pnpm add -D @testing-library/react`) |
| `legacy-cleanup.test.ts` | Ready to run | None beyond vitest + happy-dom |
| `voucher.test.ts` | Blocked | `src/lib/voucher.ts` created in T6 (Phase 4) |

Install missing devDependency before running:
```bash
pnpm add -D @testing-library/react happy-dom
```

### E2E visual tests (`npx playwright test`)

| Prerequisite | Notes |
|--------------|-------|
| `pnpm dev` running on port 4321 | Dev server with Cloudflare adapter |
| `npx playwright install chromium` | One-time browser download |
| D1 database seeded | `/api/designs` must return data |

Visual regression uses Playwright's native `toHaveScreenshot()`. The
**first run** generates the baseline PNGs next to
`tests/e2e/visual.spec.ts` (under `visual.spec.ts-snapshots/`); commit
them. Subsequent runs diff against the baseline at 2 % tolerance.

### Load test (`tests/load/voucher.test.ts`)

This file is a **documented manual test**, not an automated runner. The single
test case inside is marked `it.skip`. To actually run the load test:

```bash
# 1. Start the dev server
pnpm dev

# 2. Fire 50 concurrent POSTs with the same designId
npx autocannon -c 50 -m POST \
  -H "content-type=application/json" \
  -b '{"designId":"1","recipient":"0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"}' \
  http://localhost:4321/api/voucher
```

Expected: **1 × 200**, **49 × 409**. If more than 2 × 200 appear, the
idempotency guard in the voucher route is broken.

### Smoke test (`scripts/smoke.sh`)

Hits the live deployment (or any URL passed as `$1`) and checks four endpoints.

```bash
bash scripts/smoke.sh                          # tests https://suknid.pages.dev
bash scripts/smoke.sh http://localhost:8788    # tests local wrangler pages dev
```

Requires: `curl`, `jq`, a running deployment with seeded D1 data (15 designs).
