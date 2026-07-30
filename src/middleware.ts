import { defineMiddleware } from "astro:middleware";
import { detectLocale } from "@/lib/i18n";
import { createAuth } from "@/lib/auth/server";

type AuthUser = {
  id: string;
  name: string | null;
  email: string;
  emailVerified: boolean;
  image: string | null;
  createdAt: Date;
  updatedAt: Date;
};

type AuthSession = {
  id: string;
  token: string;
  userId: string;
  expiresAt: Date;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: Date;
  updatedAt: Date;
};

declare namespace App {
  interface Locals extends Runtime {
    locale: string;
    user: AuthUser | null;
    session: AuthSession | null;
  }
}

export const onRequest = defineMiddleware(async (context, next) => {
  const cookieHeader = context.request.headers.get("cookie") ?? "";
  const acceptLanguage = context.request.headers.get("accept-language") ?? "";
  context.locals.locale = detectLocale(cookieHeader, acceptLanguage);

  try {
    const env = context.locals.runtime.env as Env;
    const auth = createAuth(env, context.url.origin);
    const session = await auth.api.getSession({
      headers: new Headers({ cookie: cookieHeader }),
    });
    context.locals.user = session?.user ?? null;
    context.locals.session = session?.session ?? null;
  } catch (e) {
    console.error("Auth middleware error:", e);
    context.locals.user = null;
    context.locals.session = null;
  }

  return next();
});
