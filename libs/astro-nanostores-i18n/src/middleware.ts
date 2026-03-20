import { defineMiddleware } from "astro:middleware";
import { i18n } from "astro:config/client";
import { parseLocale } from "astro-utils-i18n";
import { currentLocale } from "astro-nanostores-i18n/runtime";

const locales = i18n?.locales.flatMap((locale) => (typeof locale === "string" ? locale : locale.codes)) || [];
const defaultLocale = i18n?.defaultLocale || "";

export const onRequest = defineMiddleware(async (context, next) => {
  const locale = parseLocale(context.url.pathname, locales, defaultLocale);
  currentLocale.set(locale);
  return next();
});
