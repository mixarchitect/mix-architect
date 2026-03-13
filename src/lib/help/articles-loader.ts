import type { HelpArticle } from "./types";
import { articles as articlesEn } from "./articles";

const SUPPORTED_LOCALES = [
  "de", "fr", "es", "es-MX", "pt-BR", "sv", "hi", "ja", "ko", "zh",
];

/** Resolve locale to file key (e.g. "fr-FR" → "fr", "pt-BR" → "pt-BR") */
function resolveKey(locale: string): string | undefined {
  if (SUPPORTED_LOCALES.includes(locale)) return locale;
  const lang = locale.split("-")[0];
  if (SUPPORTED_LOCALES.includes(lang)) return lang;
  return undefined;
}

export async function getArticlesAsync(
  locale: string,
): Promise<HelpArticle[]> {
  if (!locale || locale === "en" || locale.startsWith("en-")) return articlesEn;
  const key = resolveKey(locale);
  if (!key) return articlesEn;
  try {
    // Dynamic import with variable path so TS doesn't require the files at compile time
    const mod = await import(`./articles.${key}`) as { articles: HelpArticle[] };
    return mod.articles;
  } catch {
    return articlesEn;
  }
}
