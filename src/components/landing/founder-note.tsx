import { Quote } from "lucide-react";
import { getTranslations } from "next-intl/server";

export async function FounderNote() {
  const t = await getTranslations("landing");

  const testimonials = [
    {
      quote: t("testimonial1Quote"),
      name: t("testimonial1Name"),
      role: t("testimonial1Role"),
    },
    {
      quote: t("testimonial2Quote"),
      name: t("testimonial2Name"),
      role: t("testimonial2Role"),
    },
  ];

  return (
    <section className="px-6 py-20 md:py-28">
      <div className="mx-auto max-w-5xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white">
            {t("testimonialsHeadline")}
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {testimonials.map((item) => (
            <div
              key={item.name}
              className="rounded-2xl bg-[#1a1a1a] border border-white/8 p-8 min-h-[200px] flex flex-col"
            >
              <Quote size={24} className="text-[#0D9488]/40 mb-4" />
              <blockquote className="text-white/70 leading-relaxed mb-6 flex-1">
                &ldquo;{item.quote}&rdquo;
              </blockquote>
              <div>
                <div className="text-sm font-semibold text-white">
                  {item.name}
                </div>
                <div className="text-xs text-white/40">{item.role}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
