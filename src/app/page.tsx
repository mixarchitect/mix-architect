import type { Metadata } from "next";
import { getLocale, getMessages } from "next-intl/server";
import { NextIntlClientProvider } from "next-intl";
import { LandingNav } from "@/components/landing/nav";
import { Hero } from "@/components/landing/hero";
import { FeatureShowcase } from "@/components/landing/feature-showcase";
import { AudioToolsGrid } from "@/components/landing/audio-tools-grid";
import { Pricing } from "@/components/landing/pricing";
// FounderNote (the "Trusted by engineers and artists" testimonials
// block) is intentionally not rendered yet — its current quotes are
// placeholder copy. Re-import and add <FounderNote /> back to the
// page below once real customer quotes are in
// src/i18n/messages/*.json under landing.testimonial1*/testimonial2*.
// import { FounderNote } from "@/components/landing/founder-note";
import { AboutFounder } from "@/components/landing/about-founder";
import { FinalCTA } from "@/components/landing/final-cta";
import { LandingFooter } from "@/components/landing/footer";
import { FeaturedReleaseSection } from "@/components/landing/featured-release-section";
import { getActiveFeaturedRelease } from "@/lib/services/featured-releases";
import { existsSync } from "node:fs";
import path from "node:path";

export const revalidate = 3600; // ISR: regenerate landing page at most once per hour

export const metadata: Metadata = {
  title: "Mix Architect | Release Management for Artists & Audio Professionals",
  description:
    "Plan releases, build mix briefs, review audio with timestamped comments, and track payments. Free to start.",
  openGraph: {
    title:
      "Mix Architect | Release Management for Artists & Audio Professionals",
    description:
      "Plan releases, build mix briefs, review audio with timestamped comments, and track payments. Free to start.",
    siteName: "Mix Architect",
  },
};

export default async function HomePage() {
  const [featuredRelease, locale, messages] = await Promise.all([
    getActiveFeaturedRelease(),
    getLocale(),
    getMessages(),
  ]);

  // Render the founder portrait only once the asset is actually in place;
  // otherwise the section falls back to a monogram (no broken image).
  const founderPhotoExists = existsSync(
    path.join(process.cwd(), "public", "founder.jpg"),
  );

  return (
    <NextIntlClientProvider locale={locale} messages={{ landing: (messages as Record<string, unknown>).landing }}>
      <main id="main-content" tabIndex={-1} className="min-h-screen bg-[#0A0A0A] focus:outline-none">
        <LandingNav />
        <Hero />
        <FeatureShowcase />
        <AudioToolsGrid />
        <Pricing />
        {featuredRelease && <FeaturedReleaseSection release={featuredRelease} />}
        <AboutFounder photoExists={founderPhotoExists} />
        {/* <FounderNote /> — hidden until we have real customer quotes. */}
        <FinalCTA />
        <LandingFooter />
      </main>
    </NextIntlClientProvider>
  );
}
