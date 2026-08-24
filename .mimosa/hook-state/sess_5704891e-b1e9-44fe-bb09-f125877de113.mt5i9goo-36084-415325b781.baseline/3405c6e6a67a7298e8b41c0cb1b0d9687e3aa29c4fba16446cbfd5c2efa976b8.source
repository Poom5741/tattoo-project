/**
 * Security primitives — barrel export.
 *
 * Used by the Astro middleware to apply security headers and rate
 * limiting on every request. See individual modules for the seam.
 */

export { applySecurityHeaders } from "./headers";
export {
  checkRateLimit,
  getClientIp,
  classifyProtectedRoute,
  rateLimitResponse,
  type RateLimitBucket,
  type RateLimitDecision,
  type RateLimitOptions,
} from "./rate-limit";
