import { getRequestConfig } from "next-intl/server";
import { cookies } from "next/headers";
import { defaultLocale } from "./config";

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

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const locale = cookieStore.get("NEXT_LOCALE")?.value || defaultLocale;
  const messageFile = getMessageFile(locale);

  return {
    locale,
    messages: (await import(`./messages/${messageFile}.json`)).default,
  };
});
