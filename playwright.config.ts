import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  retries: 1,
  fullyParallel: false,
  timeout: 30_000,
  expect: { timeout: 10_000 },
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: "http://localhost:4321",
    screenshot: "only-on-failure",
    video: "off",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    // pnpm isn't on PATH on this dev box (hence the absolute default);
    // CI sets E2E_DEV_COMMAND="pnpm dev" (see .github/workflows/e2e.yml).
    command: process.env.E2E_DEV_COMMAND ?? "$HOME/.local/share/pnpm/pnpm dev",
    // Probe the health endpoint, not just the port: /api/health returns
    // 200 only when D1 + KV are live, so tests never start before the
    // seeded sandbox is actually ready. (503 = keep waiting.) The URL
    // carries the port; Playwright 1.60 doesn't allow both `port`+`url`.
    url: "http://localhost:4321/api/health",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
