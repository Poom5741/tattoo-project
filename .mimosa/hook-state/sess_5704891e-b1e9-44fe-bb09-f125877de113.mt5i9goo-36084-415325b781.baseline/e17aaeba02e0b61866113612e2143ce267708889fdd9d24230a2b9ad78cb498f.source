/**
 * Security headers — unit tests (TDD).
 *
 * Tests the pure `applySecurityHeaders(response)` function from
 * `src/lib/security/headers.ts`. This is the seam under test: the middleware
 * just calls this function on every response.
 *
 * Part of ticket 02 of the .wayfinder map.
 */

import { describe, it, expect } from "vitest";
import { applySecurityHeaders } from "@/lib/security/headers";

function newResponse() {
  return new Response("body", { status: 200, headers: { "content-type": "text/plain" } });
}

describe("applySecurityHeaders", () => {
  it("sets X-Content-Type-Options to nosniff", () => {
    const res = applySecurityHeaders(newResponse());
    expect(res.headers.get("X-Content-Type-Options")).toBe("nosniff");
  });

  it("sets X-Frame-Options to DENY", () => {
    const res = applySecurityHeaders(newResponse());
    expect(res.headers.get("X-Frame-Options")).toBe("DENY");
  });

  it("sets Referrer-Policy to strict-origin-when-cross-origin", () => {
    const res = applySecurityHeaders(newResponse());
    expect(res.headers.get("Referrer-Policy")).toBe("strict-origin-when-cross-origin");
  });

  it("sets Permissions-Policy that disables camera, microphone, and geolocation", () => {
    const res = applySecurityHeaders(newResponse());
    const policy = res.headers.get("Permissions-Policy") ?? "";
    expect(policy).toContain("camera=()");
    expect(policy).toContain("microphone=()");
    expect(policy).toContain("geolocation=()");
  });

  it("sets a Content-Security-Policy with default-src 'self'", () => {
    const res = applySecurityHeaders(newResponse());
    const csp = res.headers.get("Content-Security-Policy") ?? "";
    expect(csp).toContain("default-src 'self'");
  });

  it("CSP allows the Tawk.to embed in script-src, frame-src, and connect-src", () => {
    const res = applySecurityHeaders(newResponse());
    const csp = res.headers.get("Content-Security-Policy") ?? "";
    expect(csp).toMatch(/script-src[^;]*https:\/\/embed\.tawk\.to/);
    expect(csp).toMatch(/frame-src[^;]*https:\/\/embed\.tawk\.to/);
    expect(csp).toMatch(/connect-src[^;]*https:\/\/embed\.tawk\.to/);
  });

  it("CSP allows Google Fonts in style-src, font-src, and connect-src", () => {
    const res = applySecurityHeaders(newResponse());
    const csp = res.headers.get("Content-Security-Policy") ?? "";
    expect(csp).toMatch(/style-src[^;]*https:\/\/fonts\.googleapis\.com/);
    expect(csp).toMatch(/font-src[^;]*https:\/\/fonts\.gstatic\.com/);
    expect(csp).toMatch(/connect-src[^;]*https:\/\/fonts\.googleapis\.com/);
  });

  it("returns a Response (same status and body as input)", async () => {
    const original = new Response("hello", { status: 201 });
    const res = applySecurityHeaders(original);
    expect(res.status).toBe(201);
    expect(await res.text()).toBe("hello");
  });
});
