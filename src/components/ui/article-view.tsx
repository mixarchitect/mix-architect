"use client";

import Link from "next/link";
import type { HelpArticle, ArticleCategory } from "@/lib/help/types";
import { CATEGORY_LABELS } from "@/lib/help/articles";
import { ScreenMockup } from "@/components/ui/screen-mockup";

/** Parse `[text](/path)` links in plain-text strings.
 *  Help article links (?article=) navigate in-place; others open in a new tab. */
function RichText({ text }: { text: string }) {
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
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}

type Props = {
  article: HelpArticle;
  onBack: (category?: ArticleCategory) => void;
};

export function ArticleView({ article, onBack }: Props) {
  const categoryLabel = CATEGORY_LABELS[article.category];

  return (
    <div className="max-w-2xl">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm mb-6 flex-wrap">
        <button
          type="button"
          onClick={() => onBack()}
          className="text-muted hover:text-text transition-colors"
        >
          Help Articles
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
              <h3 className="text-sm font-semibold mb-2">{section.heading}</h3>
            )}
            <p className="text-sm text-muted leading-relaxed">
              <RichText text={section.body} />
            </p>

            {section.mockup && <ScreenMockup mockupId={section.mockup} />}

            {section.tip && (
              <div className="mt-3 bg-signal-muted border border-signal/20 text-text rounded-lg px-4 py-3 text-sm leading-relaxed">
                <RichText text={section.tip} />
              </div>
            )}

            {section.warning && (
              <div className="mt-3 bg-status-orange/10 border border-status-orange/20 text-text rounded-lg px-4 py-3 text-sm leading-relaxed">
                <RichText text={section.warning} />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
