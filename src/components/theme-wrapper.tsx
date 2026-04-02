import { headers } from "next/headers";
import { ThemeProvider } from "@/lib/theme-provider";

/**
 * Async Server Component that reads the CSP nonce from middleware
 * and passes it to the client-side ThemeProvider.
 *
 * This keeps the root layout synchronous (preserving static generation
 * for public pages) while still threading the nonce to next-themes.
 */
export async function ThemeWrapper({ children }: { children: React.ReactNode }) {
  const headerList = await headers();
  const nonce = headerList.get("x-nonce") ?? undefined;

  return <ThemeProvider nonce={nonce}>{children}</ThemeProvider>;
}
