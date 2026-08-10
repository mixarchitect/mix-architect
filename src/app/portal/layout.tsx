import { getLocale, getMessages } from "next-intl/server";
import { NextIntlClientProvider } from "next-intl";
import { AudioProvider } from "@/lib/audio-context";
import { PortalMiniPlayer } from "@/components/portal/portal-mini-player";

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [locale, messages] = await Promise.all([getLocale(), getMessages()]);

  return (
    // The provider must wrap the mini player too, not just the page - every
    // portal component reads the "portal" messages slice.
    <NextIntlClientProvider
      locale={locale}
      messages={{ portal: (messages as Record<string, unknown>).portal }}
    >
      <AudioProvider>
        {children}
        <PortalMiniPlayer />
      </AudioProvider>
    </NextIntlClientProvider>
  );
}
