globalThis.process ??= {};
globalThis.process.env ??= {};
import { d as defineMiddleware, s as sequence } from "./chunks/render-context_DSMwA7ze.mjs";
import { d as detectLocale } from "./chunks/index_LvGhOnDK.mjs";
import { b as createAuth } from "./chunks/index_dnGMJJD3.mjs";
import { g as getArtistSession } from "./chunks/auth_CBLJGIc-.mjs";
import "./chunks/astro-designed-error-pages_B4uZLXrS.mjs";
import "./chunks/astro/server_B1Q-Dpks.mjs";
const onRequest$2 = defineMiddleware(async (context, next) => {
  const cookieHeader = context.request.headers.get("cookie") ?? "";
  const acceptLanguage = context.request.headers.get("accept-language") ?? "";
  context.locals.locale = detectLocale(cookieHeader, acceptLanguage);
  const url = new URL(context.request.url);
  if (url.pathname.startsWith("/artist/inbox")) {
    const env = context.locals.runtime.env;
    const artistSession = await getArtistSession(cookieHeader, env.SESSION);
    if (!artistSession) {
      return context.redirect("/artist/portal");
    }
    context.locals.artistSession = artistSession;
  }
  try {
    const env = context.locals.runtime.env;
    const auth = createAuth(env, context.url.origin);
    const session = await auth.api.getSession({
      headers: new Headers({ cookie: cookieHeader })
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
const onRequest$1 = (context, next) => {
  if (context.isPrerendered) {
    context.locals.runtime ??= {
      env: process.env
    };
  }
  return next();
};
const onRequest = sequence(
  onRequest$1,
  onRequest$2
);
export {
  onRequest
};
