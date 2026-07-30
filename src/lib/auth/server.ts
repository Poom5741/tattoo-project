/**
 * Better Auth server configuration.
 *
 * Creates a Better Auth instance with D1 database adapter and Google OAuth.
 * The handler is mounted at /api/auth/[...all] in the Astro catch-all route.
 */

import { betterAuth } from "better-auth";
import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "./schema";

export function createAuth(env: Env, origin: string) {
  const db = drizzle(env.DB);
  const baseURL = env.BETTER_AUTH_URL || origin;

  return betterAuth({
    secret: env.BETTER_AUTH_SECRET || "dev-secret-do-not-use-in-production",
    baseURL,
    database: drizzleAdapter(db, {
      provider: "sqlite",
      schema,
    }),
    socialProviders: {
      google: {
        clientId: env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
      },
    },
    passkey: {
      enabled: true,
      rpName: "SAKNID",
      rpID: new URL(baseURL).hostname,
    },
    // ponytail: disabling email+password keeps initial auth surface small;
    // enable when onboarding requires password fallback.
  });
}
