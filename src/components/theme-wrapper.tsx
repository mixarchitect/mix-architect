import { headers } from "next/headers";
import { ThemeProvider } from "@/lib/theme-provider";

/**
 * Async Server Component that reads the CSP nonce from middleware
 * and passes it to the client-side ThemeProvider.
 *
 * Awaiting headers() here opts every route into dynamic rendering (the
 * earlier claim that this preserved static generation was wrong: dynamic
 * APIs in a child force the route dynamic just like in the layout).
 * That's fine today: all pages are already dynamic via per-request
 * locale resolution (src/i18n/request.ts) and Supabase cookie auth.
 */
export async function ThemeWrapper({ children }: { children: React.ReactNode }) {
  const headerList = await headers();
  const nonce = headerList.get("x-nonce") ?? undefined;

  return <ThemeProvider nonce={nonce}>{children}</ThemeProvider>;
}
