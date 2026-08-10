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

// Map an ISO 3166-1 alpha-2 country (from Vercel's x-vercel-ip-country
// geo header) to a supported locale. Only countries with one clear
// dominant supported language are listed; multilingual countries
// (e.g. BE, CH, SG) are intentionally absent so the browser's
// Accept-Language decides instead of a coin-flip on region.
const countryToLocale: Record<string, Locale> = {
  US: "en-US",
  GB: "en-GB",
  CA: "en-CA",
  AU: "en-AU",
  NZ: "en-AU",
  IE: "en-IE",
  NG: "en-NG",
  DE: "de-DE",
  AT: "de-DE",
  FR: "fr-FR",
  ES: "es-ES",
  MX: "es-MX",
  AR: "es-MX",
  CO: "es-MX",
  CL: "es-MX",
  PE: "es-MX",
  VE: "es-MX",
  EC: "es-MX",
  GT: "es-MX",
  BO: "es-MX",
  DO: "es-MX",
  HN: "es-MX",
  PY: "es-MX",
  SV: "es-MX",
  NI: "es-MX",
  CR: "es-MX",
  PA: "es-MX",
  UY: "es-MX",
  BR: "pt-BR",
  PT: "pt-BR",
  SE: "sv-SE",
  IN: "hi-IN",
  JP: "ja-JP",
  KR: "ko-KR",
  CN: "zh-CN",
};

/**
 * Match an Accept-Language header against supported locales.
 * Tries exact match first (e.g., pt-BR), then language prefix (e.g., fr → fr-FR).
 * `geoLocale` (from the visitor's country) refines prefix matches: a bare
 * "en" from Canada resolves to en-CA rather than en-US, but an explicit
 * regional tag like en-GB is respected regardless of location. When the
 * header matches no supported language at all, falls back to the geo
 * locale, then the default.
 */
function detectLocaleFromHeader(
  acceptLanguage: string,
  geoLocale: Locale | undefined,
): Locale {
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

    // Language prefix match (e.g., fr → fr-FR, es → es-ES), preferring the
    // visitor's regional variant when it speaks the same language
    const lang = tag.split("-")[0].toLowerCase();
    if (geoLocale && geoLocale.split("-")[0].toLowerCase() === lang) {
      return geoLocale;
    }
    const prefix = locales.find((l) => l.split("-")[0].toLowerCase() === lang);
    if (prefix) return prefix;
  }

  return geoLocale ?? defaultLocale;
}

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get("NEXT_LOCALE")?.value;
  // Ignore unknown cookie values so a stale/hand-edited cookie can't
  // point getMessageFile at a message file that doesn't exist
  let locale: string | undefined = locales.includes(cookieLocale as Locale)
    ? cookieLocale
    : undefined;

  // No explicit choice: browser Accept-Language decides the language,
  // with the geo country (Vercel sets x-vercel-ip-country in prod;
  // absent in local dev) refining the regional variant and serving as
  // the fallback when the browser language is unsupported or missing
  if (!locale) {
    const headerStore = await headers();
    const country = headerStore.get("x-vercel-ip-country")?.toUpperCase();
    const geoLocale = country ? countryToLocale[country] : undefined;
    const acceptLanguage = headerStore.get("accept-language");
    locale = acceptLanguage
      ? detectLocaleFromHeader(acceptLanguage, geoLocale)
      : geoLocale ?? defaultLocale;
  }

  const messageFile = getMessageFile(locale);

  // Deep-merge the requested locale's messages over the English source so
  // any key missing from a translation falls back to English instead of
  // rendering as a raw key path. en is the source of truth; locale values
  // always win per-leaf.
  const enMessages = (await import("./messages/en.json")).default;
  const localeMessages =
    messageFile === "en"
      ? enMessages
      : (await import(`./messages/${messageFile}.json`)).default;

  return {
    locale,
    messages: deepMergeMessages(
      enMessages as MessageTree,
      localeMessages as MessageTree,
    ),
  };
});

type MessageTree = { [key: string]: string | MessageTree };

/** Recursively overlay `override` onto `base`; leaf values in `override` win. */
function deepMergeMessages(base: MessageTree, override: MessageTree): MessageTree {
  const out: MessageTree = { ...base };
  for (const [key, value] of Object.entries(override)) {
    const existing = out[key];
    if (
      value &&
      typeof value === "object" &&
      existing &&
      typeof existing === "object"
    ) {
      out[key] = deepMergeMessages(existing, value);
    } else {
      out[key] = value;
    }
  }
  return out;
}
