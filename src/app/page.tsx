import type { Metadata } from "next";
import { LandingNav } from "@/components/landing/nav";
import { Hero } from "@/components/landing/hero";
import { FeatureShowcase } from "@/components/landing/feature-showcase";
import { AudioToolsGrid } from "@/components/landing/audio-tools-grid";
import { Pricing } from "@/components/landing/pricing";
import { FounderNote } from "@/components/landing/founder-note";
import { FinalCTA } from "@/components/landing/final-cta";
import { LandingFooter } from "@/components/landing/footer";
import { FeaturedReleaseSection } from "@/components/landing/featured-release-section";
import { getActiveFeaturedRelease } from "@/lib/services/featured-releases";

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
  const featuredRelease = await getActiveFeaturedRelease();

  return (
    <main id="main-content" tabIndex={-1} className="min-h-screen bg-[#0A0A0A] focus:outline-none">
      <LandingNav />
      <Hero />
      <FeatureShowcase />
      <AudioToolsGrid />
      {featuredRelease && <FeaturedReleaseSection release={featuredRelease} />}
      <Pricing />
      <FounderNote />
      <FinalCTA />
      <LandingFooter />
    </main>
  );
}
