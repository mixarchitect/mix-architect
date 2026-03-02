import Link from "next/link";
import Image from "next/image";

export function LandingNav() {
  return (
    <nav aria-label="Main" className="fixed top-6 left-1/2 -translate-x-1/2 z-50">
      <div className="w-[calc(100vw-24px)] sm:w-[92vw] md:w-[78vw] lg:w-[1100px] max-w-6xl flex items-center gap-3 bg-black/80 backdrop-blur-md border border-white/10 rounded-full px-3 py-3 shadow-float">
        <Link href="/" className="flex items-center pl-2 pr-4">
          <Image
            src="/mix-architect-logo-white.svg"
            alt="Mix Architect"
            width={180}
            height={36}
            priority
            className="h-8 w-auto"
          />
        </Link>

        <div className="hidden md:flex flex-1 items-center justify-center gap-1 text-sm">
          <a
            href="#features"
            className="px-4 py-2 rounded-full text-white/60 hover:text-white hover:bg-white/8 transition-colors"
          >
            Features
          </a>
          <a
            href="#pricing"
            className="px-4 py-2 rounded-full text-white/60 hover:text-white hover:bg-white/8 transition-colors"
          >
            Pricing
          </a>
        </div>

        <div className="flex items-center gap-2 ml-auto md:ml-0">
          <Link
            href="/auth/sign-in"
            className="px-4 py-2 text-sm text-white/60 hover:text-white transition-colors"
          >
            Sign in
          </Link>
          <Link
            href="/auth/sign-in"
            className="px-5 py-2 text-sm font-semibold text-[#1a1a1a] bg-[#0D9488] rounded-full hover:bg-[#0fb9ab] transition-colors"
          >
            Start Free
          </Link>
        </div>
      </div>
    </nav>
  );
}
