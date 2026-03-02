import Link from "next/link";
import { FilledArrowRight } from "@/components/ui/filled-icon";

export function FinalCTA() {
  return (
    <section className="px-6 py-20 md:py-28">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-white">
          Your next release deserves better
          <br className="hidden sm:block" />
          than a spreadsheet
        </h2>
        <p className="mt-4 text-white/50 text-lg">
          Start planning for free. Upgrade when you&apos;re ready.
        </p>
        <div className="mt-8">
          <Link
            href="/auth/sign-in"
            className="btn-primary h-14 px-10 text-base inline-flex items-center gap-2"
          >
            Get Started Free
            <FilledArrowRight size={18} />
          </Link>
        </div>
      </div>
    </section>
  );
}
