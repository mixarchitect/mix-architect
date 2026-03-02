import Link from "next/link";
import { Music, Headphones } from "lucide-react";
import { FilledArrowRight } from "@/components/ui/filled-icon";

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background video */}
      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover"
        >
          <source src="/recordingconsole.mov" type="video/quicktime" />
          <source src="/recordingconsole.mov" type="video/mp4" />
        </video>
        {/* Dark overlay for readability */}
        <div className="absolute inset-0 bg-black/75" />
        {/* Bottom fade to page bg */}
        <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-[#0A0A0A] to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-4xl text-center px-6 pt-32 pb-24">
        <h1 className="text-[28px] sm:text-[40px] md:text-[56px] font-bold leading-[1.05] tracking-tight text-white">
          Plan releases. Review mixes.
          <br />
          Track payments.{" "}
          <span className="text-[#0D9488]">All in one place.</span>
        </h1>

        <p className="mt-8 text-lg md:text-xl text-white/60 max-w-2xl mx-auto leading-relaxed">
          Mix Architect is the release management platform built for
          independent artists and audio professionals.
        </p>

        {/* Persona callouts */}
        <div className="mt-14 grid gap-5 sm:grid-cols-2 max-w-2xl mx-auto">
          <div className="flex items-start gap-4 rounded-xl bg-black/60 backdrop-blur-md border border-white/10 p-6 text-left">
            <div className="shrink-0 w-10 h-10 rounded-lg bg-[#0D9488]/15 flex items-center justify-center">
              <Music size={20} className="text-[#0D9488]" />
            </div>
            <div>
              <div className="text-sm font-semibold text-white">
                For Artists
              </div>
              <p className="mt-1.5 text-sm text-white/60 leading-relaxed">
                Releasing your own music? Organize every step from mix brief to
                distribution.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 rounded-xl bg-black/60 backdrop-blur-md border border-white/10 p-6 text-left">
            <div className="shrink-0 w-10 h-10 rounded-lg bg-[#0D9488]/15 flex items-center justify-center">
              <Headphones size={20} className="text-[#0D9488]" />
            </div>
            <div>
              <div className="text-sm font-semibold text-white">
                For Engineers & Producers
              </div>
              <p className="mt-1.5 text-sm text-white/60 leading-relaxed">
                Working with clients? Manage projects, share reviews, and track
                who owes what.
              </p>
            </div>
          </div>
        </div>

        {/* CTAs */}
        <div className="mt-12 flex flex-wrap justify-center gap-4">
          <Link
            href="/auth/sign-in"
            className="h-14 px-10 text-base font-semibold inline-flex items-center justify-center gap-2 rounded-xl bg-[#0D9488] text-white hover:bg-[#0fb9ab] transition-colors"
          >
            Start Free
            <FilledArrowRight size={18} />
          </Link>
          <a
            href="#features"
            className="h-14 px-10 text-base font-medium inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 text-white/80 hover:border-white/40 hover:text-white transition-colors"
          >
            See How It Works
          </a>
        </div>

        <p className="mt-8 text-sm text-white/40">
          Free to use. No credit card required.
        </p>
      </div>
    </section>
  );
}
