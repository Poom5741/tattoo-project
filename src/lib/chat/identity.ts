/**
 * Canonical client identity resolution for booking + chat.
 *
 * Rules (ticket #109):
 *   1. Authenticated users (passkey wallet session): use locals.user.id.
 *   2. Anonymous users: use a server-generated UUID stored in an HttpOnly
 *      `anon_client_id` cookie. Never derive identity from the `contact` field.
 *   3. The `buyerWallet` body field is NOT trusted as identity — it is
 *      user-supplied and not cryptographically verified at the booking endpoint.
 *   4. `contact` and `name` are display-only metadata.
 */

import { randomUUID } from "crypto";

export const ANON_COOKIE = "anon_client_id";
const ANON_MAX_AGE = 60 * 60 * 24 * 90; // 90 days

function getCookieValue(cookieHeader: string, name: string): string | null {
  const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

export interface ResolveClientResult {
  /** Canonical client identifier (wallet address or anon UUID). */
  clientId: string;
  /** True when a new anon cookie was generated this request. */
  isNewAnon: boolean;
  /** Set-Cookie header value to append when isNewAnon is true. */
  setCookieHeader: string | null;
}

/**
 * Resolve the canonical client identity for a request.
 *
 * Priority:
 *   1. locals.user.id (authenticated passkey wallet session)
 *   2. Existing anon_client_id cookie
 *   3. Generate a new UUID and set-cookie
 */
export function resolveClientId(
  request: Request,
  user: { id: string } | null | undefined,
): ResolveClientResult {
  const cookieHeader = request.headers.get("cookie") ?? "";

  // 1. Authenticated — wallet address from passkey session
  if (user?.id) {
    return { clientId: user.id, isNewAnon: false, setCookieHeader: null };
  }

  // 2. Existing anon cookie
  const existing = getCookieValue(cookieHeader, ANON_COOKIE);
  if (existing && isValidUuid(existing)) {
    return { clientId: existing, isNewAnon: false, setCookieHeader: null };
  }

  // 3. Generate new anon identity
  const newId = randomUUID();
  const isSecure = request.url.startsWith("https://");
  const secureFlag = isSecure ? "Secure; " : "";
  const setCookieHeader = `${ANON_COOKIE}=${newId}; Path=/; HttpOnly; ${secureFlag}SameSite=Lax; Max-Age=${ANON_MAX_AGE}`;

  return { clientId: newId, isNewAnon: true, setCookieHeader };
}

/**
 * Read an anon client id from the cookie header, if present and valid.
 * Returns null when no anon cookie exists or the user is authenticated.
 */
export function readAnonClientId(
  cookieHeader: string,
  user: { id: string } | null | undefined,
): string | null {
  if (user?.id) return null;
  const val = getCookieValue(cookieHeader, ANON_COOKIE);
  if (val && isValidUuid(val)) return val;
  return null;
}

function isValidUuid(s: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);
}
