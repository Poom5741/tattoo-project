import { defineMiddleware } from "astro:middleware";
import { detectLocale } from "@/lib/i18n";
import { createAuth } from "@/lib/auth/server";
import { getArtistSession } from "@/lib/artist/auth";

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

  // Check artist session for protected /artist/ routes (e.g. /artist/inbox)
  if (url.pathname.startsWith("/artist/inbox")) {
    const env = context.locals.runtime.env as Env;
    if (isDevMode && devRole === "admin") {
      // Dev mode: admin can access artist inbox
      context.locals.artistSession = { artistId: "mara", name: "Dev Admin (Mara)", walletAddress: "0x1234...abcd" };
    } else if (isDevMode && devRole === "artist") {
      // Dev mode: simulate artist session
      context.locals.artistSession = { artistId: "mara", name: "Dev Artist (Mara)", walletAddress: "0x1234...abcd" };
    } else {
      const artistSession = await getArtistSession(cookieHeader, env.SESSION);
      if (!artistSession) {
        return context.redirect("/artist/portal");
      }
      context.locals.artistSession = artistSession;
    }
  }

  try {
    const env = context.locals.runtime.env as Env;
    const auth = createAuth(env, context.url.origin);
    const session = await auth.api.getSession({
      headers: new Headers({ cookie: cookieHeader }),
    });
    context.locals.user = session?.user ?? null;
    context.locals.session = session?.session ?? null;

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
      }
    }
  } catch (e) {
    console.error("Auth middleware error:", e);
    context.locals.user = null;
    context.locals.session = null;
  }

  return next();
});
