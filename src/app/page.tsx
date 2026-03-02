import type { Metadata } from "next";
import { LandingNav } from "@/components/landing/nav";
import { Hero } from "@/components/landing/hero";
import { FeatureShowcase } from "@/components/landing/feature-showcase";
import { PersonaSplit } from "@/components/landing/persona-split";
import { AudioToolsGrid } from "@/components/landing/audio-tools-grid";
import { Pricing } from "@/components/landing/pricing";
import { FounderNote } from "@/components/landing/founder-note";
import { FinalCTA } from "@/components/landing/final-cta";
import { LandingFooter } from "@/components/landing/footer";

export const metadata: Metadata = {
  title: "Mix Architect — Release Management for Artists & Audio Professionals",
  description:
    "Plan releases, build mix briefs, review audio with timestamped comments, and track payments. Free to start.",
  openGraph: {
    title:
      "Mix Architect — Release Management for Artists & Audio Professionals",
    description:
      "Plan releases, build mix briefs, review audio with timestamped comments, and track payments. Free to start.",
    siteName: "Mix Architect",
  },
};

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#0A0A0A]">
      <LandingNav />
      <Hero />
      <FeatureShowcase />
      <PersonaSplit />
      <AudioToolsGrid />
      <Pricing />
      <FounderNote />
      <FinalCTA />
      <LandingFooter />
    </main>
  );
}
