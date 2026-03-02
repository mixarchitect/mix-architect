import { Quote } from "lucide-react";

const testimonials = [
  {
    quote:
      "I used to lose track of revisions across email threads and Dropbox folders. Now every mix note, reference, and approval lives in one place.",
    name: "Marcus Chen",
    role: "Freelance Mixing Engineer",
  },
  {
    quote:
      "The client portal alone is worth it. My clients can review mixes and approve tracks without me sending a single email.",
    name: "Aria Voss",
    role: "Independent Artist & Producer",
  },
];

export function FounderNote() {
  return (
    <section className="px-6 py-20 md:py-28">
      <div className="mx-auto max-w-5xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white">
            Trusted by engineers and artists
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="rounded-2xl bg-[#1a1a1a] border border-white/8 p-8"
            >
              <Quote size={24} className="text-[#0D9488]/40 mb-4" />
              <blockquote className="text-white/70 leading-relaxed mb-6">
                &ldquo;{t.quote}&rdquo;
              </blockquote>
              <div>
                <div className="text-sm font-semibold text-white">
                  {t.name}
                </div>
                <div className="text-xs text-white/40">{t.role}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
