/**
 * Shared admin password for e2e tests.
 *
 * Reads from the ADMIN_PASSWORD environment variable. Throws at import time
 * if the variable is not set, so tests fail loudly instead of silently using
 * a hardcoded secret.
 */
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
if (!ADMIN_PASSWORD) {
  throw new Error(
    "ADMIN_PASSWORD environment variable is required for e2e tests. " +
      "Set it in your shell or .env.test before running Playwright.",
  );
}

export { ADMIN_PASSWORD };
