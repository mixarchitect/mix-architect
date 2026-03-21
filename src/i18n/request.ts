import { getRequestConfig } from "next-intl/server";
import { cookies, headers } from "next/headers";
import { defaultLocale, locales, type Locale } from "./config";

// Map locale codes to message file names
// Most use language-only (en, es, fr), but some need the full code
// to distinguish regional variants (pt-BR vs pt-PT, es-MX vs es-ES)
const localeToFile: Record<string, string> = {
  "pt-BR": "pt-BR",
  "es-MX": "es-MX",
};

function getMessageFile(locale: string): string {
  return localeToFile[locale] || locale.split("-")[0];
}

/**
 * Match an Accept-Language header against supported locales.
 * Tries exact match first (e.g., pt-BR), then language prefix (e.g., fr → fr-FR).
 */
function detectLocaleFromHeader(acceptLanguage: string): Locale {
  // Parse Accept-Language into sorted preference list
  const preferred = acceptLanguage
    .split(",")
    .map((entry) => {
      const [tag, q] = entry.trim().split(";q=");
      return { tag: tag.trim().replace("_", "-"), quality: q ? parseFloat(q) : 1 };
    })
    .sort((a, b) => b.quality - a.quality);

  for (const { tag } of preferred) {
    // Exact match (e.g., pt-BR → pt-BR)
    const exact = locales.find((l) => l.toLowerCase() === tag.toLowerCase());
    if (exact) return exact;

    // Language prefix match (e.g., fr → fr-FR, es → es-ES)
    const lang = tag.split("-")[0].toLowerCase();
    const prefix = locales.find((l) => l.split("-")[0].toLowerCase() === lang);
    if (prefix) return prefix;
  }

  return defaultLocale;
}

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  let locale = cookieStore.get("NEXT_LOCALE")?.value;

  // Auto-detect from browser Accept-Language when no cookie is set
  if (!locale) {
    const headerStore = await headers();
    const acceptLanguage = headerStore.get("accept-language");
    locale = acceptLanguage ? detectLocaleFromHeader(acceptLanguage) : defaultLocale;
  }

  const messageFile = getMessageFile(locale);

  return {
    locale,
    messages: (await import(`./messages/${messageFile}.json`)).default,
  };
});
