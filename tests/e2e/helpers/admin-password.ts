/**
 * Shared admin password for e2e tests.
 *
 * Reads from the ADMIN_PASSWORD environment variable. Throws when accessed
 * if the variable is not set, so tests fail loudly instead of silently using
 * a hardcoded secret.
 */
function getAdminPassword(): string {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) {
    throw new Error(
      "ADMIN_PASSWORD environment variable is required for e2e tests. " +
        "Set it in your shell or .env.test before running Playwright.",
    );
  }
  return password;
}

export { getAdminPassword };
