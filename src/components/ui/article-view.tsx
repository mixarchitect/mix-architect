"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import type { HelpArticle, ArticleCategory } from "@/lib/help/types";
import { ScreenMockup } from "@/components/ui/screen-mockup";

/** Wrap occurrences of `highlight` in <mark> tags within a plain string. */
function HighlightText({ text, highlight }: { text: string; highlight?: string }) {
  if (!highlight) return <>{text}</>;
  const idx = text.toLowerCase().indexOf(highlight.toLowerCase());
  if (idx === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-signal/20 text-text rounded-sm">{text.slice(idx, idx + highlight.length)}</mark>
      <HighlightText text={text.slice(idx + highlight.length)} highlight={highlight} />
    </>
  );
}

/** Parse `[text](/path)` links in plain-text strings.
 *  Help article links (?article=) navigate in-place; others open in a new tab. */
function RichText({ text, highlight }: { text: string; highlight?: string }) {
  const parts = text.split(/(\[[^\]]+\]\([^)]+\))/g);
  return (
    <>
      {parts.map((part, i) => {
        const match = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
        if (match) {
          const href = match[2];
          const isHelpArticle = href.startsWith("/app/help?article=");
          return (
            <Link
              key={i}
              href={href}
              {...(!isHelpArticle && { target: "_blank" })}
              className="text-signal underline underline-offset-2 hover:text-text transition-colors"
            >
              {match[1]}
            </Link>
          );
        }
        return <span key={i}><HighlightText text={part} highlight={highlight} /></span>;
      })}
    </>
  );
}

type Props = {
  article: HelpArticle;
  onBack: (category?: ArticleCategory) => void;
  highlight?: string;
};

export function ArticleView({ article, onBack, highlight }: Props) {
  const t = useTranslations("help");
  const categoryLabel = t(`categories.${article.category}`);
  const containerRef = useRef<HTMLDivElement>(null);

  // Scroll to the first highlighted <mark> on mount
  useEffect(() => {
    if (!highlight || !containerRef.current) return;
    requestAnimationFrame(() => {
      const mark = containerRef.current?.querySelector("mark");
      mark?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  }, [highlight]);

  return (
    <div className="max-w-2xl" ref={containerRef}>
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm mb-6 flex-wrap">
        <button
          type="button"
          onClick={() => onBack()}
          className="text-muted hover:text-text transition-colors"
        >
          {t("articles")}
        </button>
        <span className="text-faint">/</span>
        <button
          type="button"
          onClick={() => onBack(article.category)}
          className="text-muted hover:text-text transition-colors"
        >
          {categoryLabel}
        </button>
        <span className="text-faint">/</span>
        <span className="text-text truncate">{article.title}</span>
      </nav>

      {/* Title */}
      <h2 className="text-lg font-semibold h3 mb-6">{article.title}</h2>

      {/* Sections */}
      <div className="space-y-6">
        {article.content.map((section, i) => (
          <div key={i}>
            {section.heading && (
              <h3 className="text-sm font-semibold mb-2">
                <HighlightText text={section.heading} highlight={highlight} />
              </h3>
            )}
            <p className="text-sm text-muted leading-relaxed">
              <RichText text={section.body} highlight={highlight} />
            </p>

            {section.mockup && <ScreenMockup mockupId={section.mockup} />}

            {section.tip && (
              <div className="mt-3 bg-signal-muted border border-signal/20 text-text rounded-lg px-4 py-3 text-sm leading-relaxed">
                <RichText text={section.tip} highlight={highlight} />
              </div>
            )}

            {section.warning && (
              <div className="mt-3 bg-status-orange/10 border border-status-orange/20 text-text rounded-lg px-4 py-3 text-sm leading-relaxed">
                <RichText text={section.warning} highlight={highlight} />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
