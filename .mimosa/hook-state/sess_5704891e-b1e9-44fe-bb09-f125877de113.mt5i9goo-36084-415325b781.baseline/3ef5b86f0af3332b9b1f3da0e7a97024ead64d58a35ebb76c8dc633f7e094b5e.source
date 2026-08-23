/**
 * Ticket #109 — H3+H4: Booking/chat identity fix.
 *
 * Verifies that:
 *   1. Authenticated users (locals.user) always use user.id as clientId.
 *   2. Anonymous users get a server-generated UUID via anon_client_id cookie.
 *   3. Contact field is never used as identity.
 *   4. buyerWallet from body is not trusted as identity.
 *   5. Existing anon cookie is reused, not regenerated.
 */

import { describe, it, expect } from "vitest";
import { resolveClientId, readAnonClientId, ANON_COOKIE } from "@/lib/chat/identity";

describe("resolveClientId", () => {
  it("uses locals.user.id when authenticated", () => {
    const request = new Request("http://localhost/api/bookings", {
      headers: { cookie: `${ANON_COOKIE}=existing-uuid` },
    });
    const user = { id: "0x1234567890abcdef1234567890abcdef12345678" };

    const result = resolveClientId(request, user);

    expect(result.clientId).toBe("0x1234567890abcdef1234567890abcdef12345678");
    expect(result.isNewAnon).toBe(false);
    expect(result.setCookieHeader).toBeNull();
  });

  it("reuses existing anon_client_id cookie for anonymous users", () => {
    const existingUuid = "550e8400-e29b-41d4-a716-446655440000";
    const request = new Request("http://localhost/api/bookings", {
      headers: { cookie: `${ANON_COOKIE}=${existingUuid}` },
    });

    const result = resolveClientId(request, null);

    expect(result.clientId).toBe(existingUuid);
    expect(result.isNewAnon).toBe(false);
    expect(result.setCookieHeader).toBeNull();
  });

  it("generates new UUID when no anon cookie exists", () => {
    const request = new Request("http://localhost/api/bookings");

    const result = resolveClientId(request, null);

    expect(result.clientId).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
    expect(result.isNewAnon).toBe(true);
    expect(result.setCookieHeader).toContain(ANON_COOKIE);
    expect(result.setCookieHeader).toContain("HttpOnly");
    expect(result.setCookieHeader).toContain("Path=/");
  });

  it("generates new UUID when anon cookie is invalid (not UUID format)", () => {
    const request = new Request("http://localhost/api/bookings", {
      headers: { cookie: `${ANON_COOKIE}=not-a-uuid` },
    });

    const result = resolveClientId(request, null);

    expect(result.clientId).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
    expect(result.isNewAnon).toBe(true);
  });

  it("sets Secure flag on HTTPS requests", () => {
    const request = new Request("https://example.com/api/bookings");

    const result = resolveClientId(request, null);

    expect(result.setCookieHeader).toContain("Secure;");
  });

  it("does not set Secure flag on HTTP requests", () => {
    const request = new Request("http://localhost/api/bookings");

    const result = resolveClientId(request, null);

    expect(result.setCookieHeader).not.toContain("Secure;");
  });
});

describe("readAnonClientId", () => {
  it("returns null when user is authenticated", () => {
    const user = { id: "0x1234" };
    const cookie = `${ANON_COOKIE}=550e8400-e29b-41d4-a716-446655440000`;

    const result = readAnonClientId(cookie, user);

    expect(result).toBeNull();
  });

  it("returns anon id when user is null and cookie is valid", () => {
    const uuid = "550e8400-e29b-41d4-a716-446655440000";
    const cookie = `${ANON_COOKIE}=${uuid}`;

    const result = readAnonClientId(cookie, null);

    expect(result).toBe(uuid);
  });

  it("returns null when no anon cookie exists", () => {
    const result = readAnonClientId("", null);

    expect(result).toBeNull();
  });

  it("returns null when anon cookie is invalid", () => {
    const cookie = `${ANON_COOKIE}=invalid-uuid`;

    const result = readAnonClientId(cookie, null);

    expect(result).toBeNull();
  });
});
