import Image from "next/image";
import Link from "next/link";

export function LandingFooter() {
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

          <nav aria-label="Footer" className="flex flex-wrap justify-center gap-6 text-sm text-white/40">
            <a
              href="#features"
              className="hover:text-white/70 transition-colors"
            >
              Features
            </a>
            <a
              href="#pricing"
              className="hover:text-white/70 transition-colors"
            >
              Pricing
            </a>
            <Link
              href="/featured"
              className="hover:text-white/70 transition-colors"
            >
              Featured
            </Link>
            <Link
              href="/changelog"
              className="hover:text-white/70 transition-colors"
            >
              Changelog
            </Link>
            <span className="cursor-default">Help Center</span>
            <span className="cursor-default">Contact</span>
          </nav>

          <div className="flex items-center gap-4 text-xs text-white/30">
            {/* Placeholder links for future legal pages */}
            <span className="cursor-default">Terms</span>
            <span className="cursor-default">Privacy</span>
          </div>
        </div>

        <div className="mt-8 text-center text-xs text-white/25">
          &copy; {new Date().getFullYear()} Mix Architect
        </div>
      </div>
    </footer>
  );
}
