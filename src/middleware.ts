import { defineMiddleware } from "astro:middleware";
import { detectLocale } from "@/lib/i18n";

export const onRequest = defineMiddleware((context, next) => {
  const cookieHeader = context.request.headers.get("cookie") ?? "";
  const acceptLanguage = context.request.headers.get("accept-language") ?? "";
  context.locals.locale = detectLocale(cookieHeader, acceptLanguage);
  return next();
});
