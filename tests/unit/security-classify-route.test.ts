/**
 * Route classification for rate limiting — unit tests (TDD).
 *
 * The middleware uses `classifyProtectedRoute(path, method)` to decide
 * whether a request belongs to the `auth` (5/min) or `submit` (20/min)
 * rate-limit bucket. Anything else returns `null` (no rate limit).
 *
 * Part of ticket 02 of the .wayfinder map.
 */

import { describe, it, expect } from "vitest";
import { classifyProtectedRoute } from "@/lib/security/rate-limit";

describe("classifyProtectedRoute", () => {
  describe("auth bucket (5 req/min)", () => {
    it("classifies POST /api/admin/login as auth", () => {
      expect(classifyProtectedRoute("/api/admin/login", "POST")).toBe("auth");
    });
    it("classifies POST /api/auth/artist-login as auth", () => {
      expect(classifyProtectedRoute("/api/auth/artist-login", "POST")).toBe("auth");
    });
    it("classifies POST /api/auth/sign-in/email as auth", () => {
      expect(classifyProtectedRoute("/api/auth/sign-in/email", "POST")).toBe("auth");
    });
    it("classifies any POST under /api/auth/sign-in/* as auth", () => {
      expect(classifyProtectedRoute("/api/auth/sign-in/passkey", "POST")).toBe("auth");
    });
    it("classifies POST /api/auth/client-login as auth", () => {
      expect(classifyProtectedRoute("/api/auth/client-login", "POST")).toBe("auth");
    });
    it("ignores GET on auth paths (read-only fetches are not rate-limited here)", () => {
      expect(classifyProtectedRoute("/api/admin/login", "GET")).toBeNull();
    });
  });

  describe("submit bucket (20 req/min)", () => {
    it("classifies POST /api/bookings as submit", () => {
      expect(classifyProtectedRoute("/api/bookings", "POST")).toBe("submit");
    });
    it("classifies POST /api/chat/send as submit", () => {
      expect(classifyProtectedRoute("/api/chat/send", "POST")).toBe("submit");
    });
    it("classifies POST /api/chat/messages/* as submit", () => {
      expect(classifyProtectedRoute("/api/chat/messages/abc-123", "POST")).toBe("submit");
    });
    it("ignores GET on submit paths (loading messages is not rate-limited here)", () => {
      expect(classifyProtectedRoute("/api/chat/messages/abc-123", "GET")).toBeNull();
    });
  });

  describe("unprotected routes", () => {
    it("returns null for /", () => {
      expect(classifyProtectedRoute("/", "POST")).toBeNull();
    });
    it("returns null for /api/designs", () => {
      expect(classifyProtectedRoute("/api/designs", "GET")).toBeNull();
    });
    it("returns null for /api/market", () => {
      expect(classifyProtectedRoute("/api/market", "POST")).toBeNull();
    });
    it("returns null for /api/health", () => {
      expect(classifyProtectedRoute("/api/health", "POST")).toBeNull();
    });
    it("returns null for non-API paths", () => {
      expect(classifyProtectedRoute("/booking", "POST")).toBeNull();
      expect(classifyProtectedRoute("/inbox", "POST")).toBeNull();
    });
  });
});
