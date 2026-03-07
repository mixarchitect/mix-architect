"use client";

import { useState, useMemo, useCallback } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import Fuse, { type FuseResultMatch } from "fuse.js";
import { cn } from "@/lib/cn";
import { articles, CATEGORY_LABELS } from "@/lib/help/articles";
import type { HelpArticle, ArticleCategory } from "@/lib/help/types";
import { ArticleView } from "@/components/ui/article-view";

const CATEGORIES = Object.keys(CATEGORY_LABELS) as ArticleCategory[];

const fuse = new Fuse(articles, {
  keys: ["title", "summary", "tags", "content.heading", "content.body"],
  threshold: 0.35,
  ignoreLocation: true,
  includeScore: true,
  includeMatches: true,
});

type SearchResult = { article: HelpArticle; matches: readonly FuseResultMatch[] };

export function KnowledgeBase({ query = "" }: { query?: string }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [selectedCategory, setSelectedCategory] =
    useState<ArticleCategory | null>(null);

  const articleParam = searchParams.get("article");
  const activeArticle = useMemo(() => {
    if (!articleParam) return null;
    return articles.find((a) => a.id === articleParam) ?? null;
  }, [articleParam]);

  const setActiveArticle = useCallback(
    (article: HelpArticle | null, searchQuery?: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (article) {
        params.set("article", article.id);
        if (searchQuery) params.set("q", searchQuery);
        else params.delete("q");
      } else {
        params.delete("article");
        params.delete("q");
      }
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [searchParams, router, pathname],
  );

  const results = useMemo((): SearchResult[] | null => {
    if (!query.trim()) return null;
    return fuse.search(query).map((r) => ({ article: r.item, matches: r.matches ?? [] }));
  }, [query]);

  // Search always returns all articles regardless of category filter
  const displayedResults = results;

  const displayedArticles = useMemo(() => {
    if (displayedResults) return displayedResults.map((r) => r.article);
    if (selectedCategory) return articles.filter((a) => a.category === selectedCategory);
    return articles;
  }, [displayedResults, selectedCategory]);

  // Grouped view (no search query)
  const grouped = useMemo(() => {
    if (displayedResults) return null;
    const map: Record<string, HelpArticle[]> = {};
    for (const article of displayedArticles) {
      if (!map[article.category]) map[article.category] = [];
      map[article.category].push(article);
    }
    return map;
  }, [displayedResults, displayedArticles]);

  const handleBack = useCallback(
    (category?: ArticleCategory) => {
      setSelectedCategory(category ?? null);
      setActiveArticle(null);
    },
    [setActiveArticle],
  );

  const highlightQuery = searchParams.get("q") ?? undefined;

  if (activeArticle) {
    return <ArticleView article={activeArticle} onBack={handleBack} highlight={highlightQuery} />;
  }

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-[180px_1fr] gap-6">
        {/* Category sidebar (desktop) */}
        <aside className="hidden md:block">
          <nav className="space-y-1">
            <button
              type="button"
              onClick={() => setSelectedCategory(null)}
              className={cn(
                "block w-full text-left px-3 py-2 rounded-md text-sm transition-colors",
                !selectedCategory
                  ? "text-signal bg-signal-muted font-medium"
                  : "text-muted hover:text-text hover:bg-panel2",
              )}
            >
              All
            </button>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={cn(
                  "block w-full text-left px-3 py-2 rounded-md text-sm transition-colors",
                  selectedCategory === cat
                    ? "text-signal bg-signal-muted font-medium"
                    : "text-muted hover:text-text hover:bg-panel2",
                )}
              >
                {CATEGORY_LABELS[cat]}
              </button>
            ))}
          </nav>
        </aside>

        {/* Category chips (mobile) */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar md:hidden mb-2">
          <button
            type="button"
            onClick={() => setSelectedCategory(null)}
            className={cn(
              "pill whitespace-nowrap",
              !selectedCategory && "pill-active",
            )}
          >
            All
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={cn(
                "pill whitespace-nowrap",
                selectedCategory === cat && "pill-active",
              )}
            >
              {CATEGORY_LABELS[cat]}
            </button>
          ))}
        </div>

        {/* Article list */}
        <div>
          {displayedResults ? (
            /* Flat search results */
            <div className="space-y-2">
              {displayedResults.length === 0 ? (
                <p className="text-muted text-sm py-8 text-center">
                  No articles found for &ldquo;{query}&rdquo;
                </p>
              ) : (
                displayedResults.map((r) => (
                  <ArticleCard
                    key={r.article.id}
                    article={r.article}
                    matches={r.matches}
                    query={query}
                    onClick={() => setActiveArticle(r.article, query)}
                  />
                ))
              )}
            </div>
          ) : grouped ? (
            /* Grouped by category */
            <div className="space-y-6">
              {Object.entries(grouped).map(([cat, items]) => (
                <div key={cat}>
                  <div className="label text-faint mb-3">
                    {CATEGORY_LABELS[cat] ?? cat}
                  </div>
                  <div className="space-y-2">
                    {items.map((article) => (
                      <ArticleCard
                        key={article.id}
                        article={article}
                        onClick={() => setActiveArticle(article)}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

/* ── Highlight helper ── */

/** Find the query in matched text and show a highlighted snippet around it. */
function MatchSnippet({ matches, query }: { matches: readonly FuseResultMatch[]; query: string }) {
  if (!query) return null;
  // Prefer body matches for context, fall back to heading, then summary
  const best = matches.find((m) => m.key === "content.body")
    ?? matches.find((m) => m.key === "content.heading")
    ?? matches.find((m) => m.key === "summary");
  if (!best?.value) return null;

  const text = best.value;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return null;

  const matchEnd = idx + query.length;
  // Show ~40 chars before and after
  const snippetStart = Math.max(0, idx - 40);
  const snippetEnd = Math.min(text.length, matchEnd + 40);
  const before = (snippetStart > 0 ? "..." : "") + text.slice(snippetStart, idx);
  const matched = text.slice(idx, matchEnd);
  const after = text.slice(matchEnd, snippetEnd) + (snippetEnd < text.length ? "..." : "");

  return (
    <p className="text-xs text-muted mt-1 line-clamp-2">
      {before}
      <mark className="bg-signal/20 text-text rounded-sm px-0.5">{matched}</mark>
      {after}
    </p>
  );
}

/* ── Article Card ── */

function ArticleCard({
  article,
  matches,
  query,
  onClick,
}: {
  article: HelpArticle;
  matches?: readonly FuseResultMatch[];
  query?: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left bg-panel border border-border hover:border-border-strong rounded-lg p-4 transition-all cursor-pointer"
    >
      <div className="font-medium text-sm text-text">{article.title}</div>
      {matches?.length && query ? (
        <MatchSnippet matches={matches} query={query} />
      ) : (
        <p className="text-muted text-xs mt-1 line-clamp-2">{article.summary}</p>
      )}
    </button>
  );
}
