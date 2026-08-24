/**
 * Better Auth client configuration.
 *
 * Creates a client for the frontend to use with Better Auth
 * API routes. Import and use anywhere in client-side code.
 */

import { createAuthClient } from "better-auth/client";

export const authClient = createAuthClient({
  baseURL: typeof window !== "undefined" ? window.location.origin : "",
});
