import Link from "next/link";
import { FilledArrowRight } from "@/components/ui/filled-icon";
import { getTranslations } from "next-intl/server";

export async function Hero() {
  const t = await getTranslations("landing");
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
          {(() => {
            const full = t("headline");
            const lastDot = full.lastIndexOf(". ");
            if (lastDot === -1) return full;
            const main = full.slice(0, lastDot + 2);
            const accent = full.slice(lastDot + 2);
            return (
              <>
                {main}
                <span className="text-[#0D9488]">{accent}</span>
              </>
            );
          })()}
        </h1>

        <p className="mt-8 text-lg md:text-xl text-zinc-300 max-w-2xl mx-auto leading-relaxed">
          {t("subheadline")}
        </p>

        {/* Persona callouts */}
        <div className="mt-14 flex flex-col gap-4 max-w-2xl mx-auto">
          {/* Artists */}
          <div className="rounded-xl bg-[#1a1a1a]/80 backdrop-blur-sm border border-white/[0.06] p-6 text-left">
            <div className="grid grid-cols-1 md:grid-cols-[200px_1px_1fr] gap-4 md:gap-6">
              <div>
                <div className="text-lg font-medium text-[#0D9488]">{t("forArtists")}</div>
                <p className="text-sm text-zinc-500 mt-1.5 leading-relaxed">{t("forArtistsDesc")}</p>
              </div>
              <div className="h-px w-full bg-[#0D9488]/40 md:h-auto md:w-px" />
              <div className="flex flex-col gap-2">
                {(["artistFeature1", "artistFeature2", "artistFeature3"] as const).map((key) => (
                  <span key={key} className="text-sm text-zinc-400">{t(key)}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Engineers & Producers */}
          <div className="rounded-xl bg-[#1a1a1a]/80 backdrop-blur-sm border border-white/[0.06] p-6 text-left">
            <div className="grid grid-cols-1 md:grid-cols-[200px_1px_1fr] gap-4 md:gap-6">
              <div>
                <div className="text-lg font-medium text-[#0D9488]">{t("forEngineers")}</div>
                <p className="text-sm text-zinc-500 mt-1.5 leading-relaxed">{t("forEngineersDesc")}</p>
              </div>
              <div className="h-px w-full bg-[#0D9488]/40 md:h-auto md:w-px" />
              <div className="flex flex-col gap-2">
                {(["engineerFeature1", "engineerFeature2", "engineerFeature3"] as const).map((key) => (
                  <span key={key} className="text-sm text-zinc-400">{t(key)}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* CTAs */}
        <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/auth/sign-in?mode=signup"
            className="h-14 w-full sm:w-64 text-base font-semibold inline-flex items-center justify-center gap-2 rounded-xl bg-[#0D9488] text-white hover:bg-[#0fb9ab] transition-colors whitespace-nowrap"
          >
            {t("startFree")}
            <FilledArrowRight size={18} />
          </Link>
          <a
            href="#features"
            className="h-14 w-full sm:w-64 text-base font-medium inline-flex items-center justify-center gap-2 rounded-xl bg-[#1a1a1a] border border-white/20 text-zinc-200 hover:border-white/40 hover:text-white transition-colors whitespace-nowrap"
          >
            {t("seeHowItWorks")}
          </a>
        </div>

        <p className="mt-8 text-sm text-zinc-400">
          {t("freeToTry")}
        </p>
      </div>
    </section>
  );
}
