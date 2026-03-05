"use client";

import { useState, useMemo, useCallback } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import Fuse from "fuse.js";
import { cn } from "@/lib/cn";
import { Search, ChevronLeft } from "lucide-react";
import { articles, CATEGORY_LABELS } from "@/lib/help/articles";
import type { HelpArticle, ArticleCategory } from "@/lib/help/types";
import { ArticleView } from "@/components/ui/article-view";

const CATEGORIES = Object.keys(CATEGORY_LABELS) as ArticleCategory[];

const fuse = new Fuse(articles, {
  keys: ["title", "summary", "tags", "content.body"],
  threshold: 0.35,
  includeScore: true,
});

export function KnowledgeBase() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] =
    useState<ArticleCategory | null>(null);

  const articleParam = searchParams.get("article");
  const activeArticle = useMemo(() => {
    if (!articleParam) return null;
    return articles.find((a) => a.id === articleParam) ?? null;
  }, [articleParam]);

  const setActiveArticle = useCallback(
    (article: HelpArticle | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (article) {
        params.set("article", article.id);
      } else {
        params.delete("article");
      }
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [searchParams, router, pathname],
  );

  const results = useMemo(() => {
    if (!query.trim()) return null;
    return fuse.search(query).map((r) => r.item);
  }, [query]);

  const displayedArticles = useMemo(() => {
    const source = results ?? articles;
    if (selectedCategory) {
      return source.filter((a) => a.category === selectedCategory);
    }
    return source;
  }, [results, selectedCategory]);

  // Grouped view (no search query)
  const grouped = useMemo(() => {
    if (results) return null;
    const map: Record<string, HelpArticle[]> = {};
    for (const article of displayedArticles) {
      if (!map[article.category]) map[article.category] = [];
      map[article.category].push(article);
    }
    return map;
  }, [results, displayedArticles]);

  if (activeArticle) {
    return (
      <ArticleView
        article={activeArticle}
        onBack={() => setActiveArticle(null)}
      />
    );
  }

  return (
    <div>
      {/* Search */}
      <div className="relative mb-6">
        <Search
          size={16}
          strokeWidth={1.5}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-faint pointer-events-none"
        />
        <input
          type="text"
          className="input pl-10"
          placeholder="Search articles..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

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
          {results ? (
            /* Flat search results */
            <div className="space-y-2">
              {displayedArticles.length === 0 ? (
                <p className="text-muted text-sm py-8 text-center">
                  No articles found for &ldquo;{query}&rdquo;
                </p>
              ) : (
                displayedArticles.map((article) => (
                  <ArticleCard
                    key={article.id}
                    article={article}
                    onClick={() => setActiveArticle(article)}
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

/* ── Article Card ── */

function ArticleCard({
  article,
  onClick,
}: {
  article: HelpArticle;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left bg-panel border border-border hover:border-border-strong rounded-lg p-4 transition-all cursor-pointer"
    >
      <div className="font-medium text-sm text-text">{article.title}</div>
      <p className="text-muted text-xs mt-1 line-clamp-2">{article.summary}</p>
    </button>
  );
}
