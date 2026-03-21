import Image from "next/image";
import Link from "next/link";
import { getTranslations } from "next-intl/server";

export async function LandingFooter() {
  const t = await getTranslations("landing");
  return (
    <footer className="px-6 py-12 border-t border-white/8">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <Image
            src="/mix-architect-logo-white.svg"
            alt="Mix Architect"
            width={140}
            height={28}
            className="h-6 w-auto opacity-50"
          />

          <nav aria-label="Footer" className="flex flex-wrap justify-center gap-6 text-sm text-zinc-400">
            <a
              href="#features"
              className="hover:text-white/70 transition-colors"
            >
              {t("navFeatures")}
            </a>
            <a
              href="#pricing"
              className="hover:text-white/70 transition-colors"
            >
              {t("navPricing")}
            </a>
            <Link
              href="/featured"
              className="hover:text-white/70 transition-colors"
            >
              {t("navFeatured")}
            </Link>
            <Link
              href="/changelog"
              className="hover:text-white/70 transition-colors"
            >
              {t("navChangelog")}
            </Link>
            <span className="cursor-default">{t("navHelpCenter")}</span>
            <span className="cursor-default">{t("navContact")}</span>
          </nav>

          <div className="flex items-center gap-4 text-xs text-zinc-500">
            <span className="cursor-default">{t("navTerms")}</span>
            <span className="cursor-default">{t("navPrivacy")}</span>
          </div>
        </div>

        <div className="mt-8 text-center text-xs text-zinc-500">
          &copy; {new Date().getFullYear()} Mix Architect
        </div>
      </div>
    </footer>
  );
}
