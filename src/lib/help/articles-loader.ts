import type { HelpArticle } from "./types";
import { articles as articlesEn } from "./articles";

type ArticleModule = { articles: HelpArticle[] };

// Explicit dynamic imports so Next.js can statically analyze and bundle each file
const loaders: Record<string, () => Promise<ArticleModule>> = {
  de: () => import("./articles.de"),
  fr: () => import("./articles.fr"),
  es: () => import("./articles.es"),
  "es-MX": () => import("./articles.es-MX"),
  "pt-BR": () => import("./articles.pt-BR"),
  sv: () => import("./articles.sv"),
  hi: () => import("./articles.hi"),
  ja: () => import("./articles.ja"),
  ko: () => import("./articles.ko"),
  zh: () => import("./articles.zh"),
};

/** Resolve locale to loader key (e.g. "fr-FR" → "fr", "pt-BR" → "pt-BR") */
function resolveKey(locale: string): string | undefined {
  if (loaders[locale]) return locale;
  const lang = locale.split("-")[0];
  if (loaders[lang]) return lang;
  return undefined;
}

export async function getArticlesAsync(
  locale: string,
): Promise<HelpArticle[]> {
  if (!locale || locale === "en" || locale.startsWith("en-")) return articlesEn;
  const key = resolveKey(locale);
  if (!key) return articlesEn;
  try {
    const mod = await loaders[key]();
    return mod.articles;
  } catch {
    return articlesEn;
  }
}
