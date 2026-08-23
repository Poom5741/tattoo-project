import { execSync } from "child_process";

export default async function globalSetup() {
  console.log("[Playwright globalSetup] Running seed-dev-d1.ts to ensure Miniflare D1 databases are fully migrated and seeded...");
  try {
    execSync("pnpm db:seed:dev", { stdio: "inherit" });
  } catch (err) {
    console.error("[Playwright globalSetup] Failed to seed D1 database:", err);
    throw err;
  }
}
