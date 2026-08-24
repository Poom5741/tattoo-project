/**
 * Security headers — applied to every response.
 *
 * Pure function: takes a Response, returns a Response with the standard
 * security headers set. The middleware is a thin caller of this.
 *
 * CSP allowlist:
 *   - Tawk.to live-chat widget (script-src, connect-src, frame-src)
 *   - Google Fonts (style-src, font-src, connect-src)
 *
 * The CSP is intentionally permissive on script-src (`'unsafe-inline'`
 * `'unsafe-eval'`) because Astro injects inline scripts for hydration
 * and Tawk.to's loader uses eval. Tighten once the hydration path is
 * audit-free.
 */

const CSP_DIRECTIVES = [
  "default-src 'self'",
  // Astro hydration injects inline scripts; Tawk.to's widget loader uses eval.
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://embed.tawk.to https://fonts.googleapis.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
  // https: wildcard keeps external plate / artist imagery loadable.
  "img-src 'self' data: https: blob:",
  "connect-src 'self' https://embed.tawk.to https://fonts.googleapis.com",
  "frame-src https://embed.tawk.to",
];

const PERMISSIONS_POLICY = "camera=(), microphone=(), geolocation=()";

export function applySecurityHeaders(response: Response): Response {
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", PERMISSIONS_POLICY);
  response.headers.set("Content-Security-Policy", CSP_DIRECTIVES.join("; "));
  return response;
}
