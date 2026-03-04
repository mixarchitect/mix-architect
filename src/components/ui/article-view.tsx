"use client";

import { ChevronLeft } from "lucide-react";
import type { HelpArticle } from "@/lib/help/types";

type Props = {
  article: HelpArticle;
  onBack: () => void;
};

export function ArticleView({ article, onBack }: Props) {
  return (
    <div className="max-w-2xl">
      {/* Back link */}
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-1 text-muted hover:text-text text-sm mb-6 transition-colors"
      >
        <ChevronLeft size={16} strokeWidth={1.5} />
        Back to articles
      </button>

      {/* Title */}
      <h2 className="text-lg font-semibold h3 mb-6">{article.title}</h2>

      {/* Sections */}
      <div className="space-y-6">
        {article.content.map((section, i) => (
          <div key={i}>
            {section.heading && (
              <h3 className="text-sm font-semibold mb-2">{section.heading}</h3>
            )}
            <p className="text-sm text-muted leading-relaxed">{section.body}</p>

            {section.tip && (
              <div className="mt-3 bg-signal-muted border border-signal/20 text-text rounded-lg px-4 py-3 text-sm leading-relaxed">
                {section.tip}
              </div>
            )}

            {section.warning && (
              <div className="mt-3 bg-status-orange/10 border border-status-orange/20 text-text rounded-lg px-4 py-3 text-sm leading-relaxed">
                {section.warning}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
