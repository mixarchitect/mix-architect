import type { Metadata } from "next";
import { getLocale, getMessages } from "next-intl/server";
import { NextIntlClientProvider } from "next-intl";
import { getPublishedEntries } from "@/lib/services/changelog";
import { LandingNav } from "@/components/landing/nav";
import { LandingFooter } from "@/components/landing/footer";
import { ChangelogFeed } from "./changelog-feed";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "What's New — Mix Architect",
  description:
    "The latest features, improvements, and updates to Mix Architect — release management for independent artists and audio engineers.",
  openGraph: {
    title: "What's New — Mix Architect",
    description:
      "See what we've been building. The latest features and improvements to Mix Architect.",
    url: "https://mixarchitect.com/changelog",
    type: "website",
  },
  alternates: {
    types: {
      "application/rss+xml": "/changelog/feed.xml",
    },
  },
};

export default async function ChangelogPage() {
  const [{ entries, totalCount }, locale, messages] = await Promise.all([
    getPublishedEntries(1, 15),
    getLocale(),
    getMessages(),
  ]);

  return (
    <NextIntlClientProvider locale={locale} messages={{ landing: (messages as Record<string, unknown>).landing }}>
    <main id="main-content" tabIndex={-1} className="min-h-screen bg-bg focus:outline-none">
      <LandingNav locale={locale} />
      <div className="mx-auto max-w-3xl px-6 py-16 md:py-24">
        <h1 className="text-3xl font-bold text-text">What&apos;s New</h1>
        <p className="mt-2 text-muted">
          The latest updates, features, and improvements to Mix Architect.
        </p>

        <ChangelogFeed
          initialEntries={entries}
          initialTotalCount={totalCount}
        />
      </div>
      <LandingFooter />
    </main>
    </NextIntlClientProvider>
  );
}
