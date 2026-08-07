import { defineMiddleware } from "astro:middleware";
import { detectLocale } from "@/lib/i18n";
import { createAuth } from "@/lib/auth/server";
import { getArtistSession } from "@/lib/artist/auth";
import {
  applySecurityHeaders,
  checkRateLimit,
  classifyProtectedRoute,
  getClientIp,
  rateLimitResponse,
  type RateLimitBucket,
} from "@/lib/security";

/** Per-bucket limits. Tied to ticket 02 acceptance criteria. */
const RATE_LIMIT_CONFIG: Record<RateLimitBucket, { limit: number; windowSeconds: number }> = {
  auth: { limit: 5, windowSeconds: 60 },
  submit: { limit: 20, windowSeconds: 60 },
};

function getCookieValue(cookieHeader: string, name: string): string | null {
  const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

export const onRequest = defineMiddleware(async (context, next) => {
  const cookieHeader = context.request.headers.get("cookie") ?? "";
  const acceptLanguage = context.request.headers.get("accept-language") ?? "";
  context.locals.locale = detectLocale(cookieHeader, acceptLanguage);

  // Dev role switcher: override auth when dev_role cookie is set
  const devRoleValue = getCookieValue(cookieHeader, "dev_role");
  const validRoles = ["buyer", "artist", "admin"] as const;
  const devRole = validRoles.includes(devRoleValue as any) ? (devRoleValue as "buyer" | "artist" | "admin") : null;
  const isDevMode = !!devRole;
  context.locals.devRole = devRole;

  const url = new URL(context.request.url);

  // Rate limiting: gate the brute-force / spam surfaces before any
  // expensive work (auth handshake, DB writes).
  const bucket = classifyProtectedRoute(url.pathname, context.request.method);
  if (bucket) {
    try {
      const env = context.locals.runtime.env as Env;
      const ip = getClientIp(context.request);
      const cfg = RATE_LIMIT_CONFIG[bucket];
      const decision = await checkRateLimit(env.SESSION, {
        ip,
        bucket,
        limit: cfg.limit,
        windowSeconds: cfg.windowSeconds,
      });
      if (!decision.allowed) {
        return rateLimitResponse(decision);
      }
    } catch (e) {
      // Rate-limit failures should never break the request — log and continue.
      console.error("Rate limit check error:", e);
    }
  }

  // Check artist session for protected /artist/ routes (e.g. /artist/inbox)
  if (url.pathname.startsWith("/artist/inbox")) {
    const env = context.locals.runtime.env as Env;
    const artistSession = await getArtistSession(cookieHeader, env.SESSION);
    if (!artistSession) {
      return context.redirect("/artist/portal");
    }
    context.locals.artistSession = artistSession;
  }

  try {
    const env = context.locals.runtime.env as Env;
    
    // Check client passkey wallet session first (takes priority)
    const clientToken = getCookieValue(cookieHeader, "client_token");
    let clientSession: { address: string } | null = null;
    if (clientToken) {
      try {
        const val = await env.SESSION.get(`client:${clientToken}`);
        if (val) clientSession = JSON.parse(val);
      } catch (e) {
        console.error("Client session read error:", e);
      }
    }

    if (clientSession) {
      const now = new Date();
      context.locals.user = {
        id: clientSession.address,
        name: `${clientSession.address.slice(0, 6)}…${clientSession.address.slice(-4)}`,
        email: `${clientSession.address}@passkey.wallet`,
        emailVerified: true,
        createdAt: now,
        updatedAt: now,
      } as any;
      context.locals.session = {
        id: clientToken!,
        userId: clientSession.address,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        token: clientToken!,
        createdAt: now,
        updatedAt: now,
      } as any;
    } else {
      const auth = createAuth(env, context.url.origin);
      const session = await auth.api.getSession({
        headers: new Headers({ cookie: cookieHeader }),
      });
      context.locals.user = session?.user ?? null;
      context.locals.session = session?.session ?? null;
    }

    // Dev mode override: fake user session for admin/artist roles
    if (isDevMode && !context.locals.user) {
      const now = new Date();
      if (devRole === "admin") {
        context.locals.user = {
          id: "dev-admin",
          name: "Dev Admin",
          email: "admin@dev.local",
          emailVerified: true,
          createdAt: now,
          updatedAt: now,
        } as any;
        context.locals.session = {
          id: "dev-session",
          userId: "dev-admin",
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          token: "dev-token",
          createdAt: now,
          updatedAt: now,
        } as any;
      } else if (devRole === "artist") {
        context.locals.user = {
          id: "dev-artist",
          name: "Dev Artist",
          email: "artist@dev.local",
          emailVerified: true,
          createdAt: now,
          updatedAt: now,
        } as any;
        context.locals.session = {
          id: "dev-session",
          userId: "dev-artist",
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          token: "dev-token",
          createdAt: now,
          updatedAt: now,
        } as any;
      } else if (devRole === "buyer") {
        context.locals.user = {
          id: "test-client",
          name: "Dev Buyer (test-client)",
          email: "buyer@dev.local",
          emailVerified: true,
          createdAt: now,
          updatedAt: now,
        } as any;
        context.locals.session = {
          id: "dev-session",
          userId: "test-client",
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          token: "dev-token",
          createdAt: now,
          updatedAt: now,
        } as any;
      }
    }
  } catch (e) {
    console.error("Auth middleware error:", e);
    context.locals.user = null;
    context.locals.session = null;
  }

  const response = await next();
  return applySecurityHeaders(response);
});
