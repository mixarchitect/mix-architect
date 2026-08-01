import Image from "next/image";
import { getTranslations } from "next-intl/server";

/**
 * "Why I built this" — founder section.
 *
 * Adds a human face and a credibility anchor before the final CTA. Copy
 * lives in `landing.about*` so it translates like the rest of the page.
 *
 * PHOTO: drop a portrait at public/founder.jpg (square, ≥400×400 — it
 * renders at 176px and is cropped to a circle). Until that file exists the
 * layout falls back to the initials monogram, so the section never shows a
 * broken image.
 */
export async function AboutFounder({ photoExists = false }: { photoExists?: boolean }) {
  const t = await getTranslations("landing");

  const paragraphs = [t("aboutBody1"), t("aboutBody2")];

  return (
    <section id="about" className="px-6 py-24 border-t border-white/8">
      <div className="mx-auto max-w-4xl">
        <div className="flex flex-col md:flex-row md:items-start gap-10">
          {/* Portrait */}
          <div className="shrink-0 mx-auto md:mx-0">
            {photoExists ? (
              <Image
                src="/founder.jpg"
                alt={t("aboutName")}
                width={176}
                height={176}
                className="w-44 h-44 rounded-full object-cover border border-white/10"
              />
            ) : (
              <div
                className="w-44 h-44 rounded-full border border-white/10 flex items-center justify-center text-4xl font-semibold text-white/70"
                style={{ background: "#141414" }}
                aria-hidden="true"
              >
                MG
              </div>
            )}
          </div>

          {/* Copy */}
          <div className="min-w-0 text-center md:text-left">
            <span className="text-sm font-medium tracking-wide text-teal-400/80">
              {t("aboutEyebrow")}
            </span>
            <h2 className="mt-3 text-3xl font-bold text-white tracking-tight">
              {t("aboutHeadline")}
            </h2>

            {paragraphs.map((p, i) => (
              <p key={i} className="mt-4 text-zinc-400 leading-relaxed">
                {p}
              </p>
            ))}

            <div className="mt-6 pt-6 border-t border-white/8">
              <div className="text-sm font-semibold text-white">{t("aboutName")}</div>
              <div className="text-sm text-zinc-400">{t("aboutRole")}</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
