# Visual Baselines

PNG baseline images for the visual regression test suite.

## Generating baselines

```bash
pnpm baseline:capture
```

This captures the prototype's Home screen at 3 viewports:

| File                   | Viewport      |
|------------------------|---------------|
| `home-390.png`         | 390 × 844     |
| `home-768.png`         | 768 × 1024    |
| `home-1440.png`        | 1440 × 900    |

## Limitations

The prototype (`_handoff/tattoo-project/project/SUKNID.html`) uses an internal
React state router — navigation between screens is driven by component state, not
URL changes. Only the initial Home render can be captured deterministically by an
automated script.

Other screen baselines (Market, Design Detail, Artists, Booking, Checkout, Wallet)
must be captured manually:

1. Open the prototype in a browser.
2. Navigate to the target screen.
3. Use Playwright's `page.screenshot()` or browser DevTools to save a PNG.
4. Name the file `<screen>-<viewport-width>.png` and place it here.

## Tolerance

Visual tests use pixelmatch at **2 % tolerance** (≈ 2 % of pixels may differ).
Increase tolerance in `tests/e2e/visual.spec.ts` if anti-aliasing differences
cause false failures on different platforms.
