"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, Disc3, Music2, Bookmark, CornerDownLeft, X, User } from "lucide-react";
import { cn } from "@/lib/cn";
import { useSearch, type SearchResult, type SearchResultType } from "@/hooks/use-search";

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

const TYPE_ICON: Record<SearchResultType, typeof Disc3> = {
  artist: User,
  release: Disc3,
  track: Music2,
  reference: Bookmark,
};

const TYPE_LABEL: Record<SearchResultType, string> = {
  artist: "Artists",
  release: "Releases",
  track: "Tracks",
  reference: "References",
};

export function CommandPalette({ isOpen, onClose }: Props) {
  const router = useRouter();
  const { query, results, isSearching, search, clear } = useSearch();
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(-1);

  // Focus input when palette opens
  useEffect(() => {
    if (isOpen) {
      requestAnimationFrame(() => {
        inputRef.current?.focus();
      });
    } else {
      clear();
    }
  }, [isOpen, clear]);

  // Wrap search to reset active index on each keystroke
  const handleSearch = useCallback(
    (term: string) => {
      setActiveIndex(term.trim() ? 0 : -1);
      search(term);
    },
    [search],
  );

  const navigateTo = useCallback(
    (result: SearchResult) => {
      onClose();
      router.push(result.href);
    },
    [onClose, router],
  );

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") {
      e.preventDefault();
      onClose();
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) =>
        prev < results.length - 1 ? prev + 1 : 0,
      );
      return;
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) =>
        prev > 0 ? prev - 1 : results.length - 1,
      );
      return;
    }

    if (e.key === "Enter" && activeIndex >= 0 && activeIndex < results.length) {
      e.preventDefault();
      navigateTo(results[activeIndex]);
      return;
    }
  }

  // Scroll active item into view
  useEffect(() => {
    if (activeIndex < 0 || !listRef.current) return;
    const item = listRef.current.querySelector(`[data-index="${activeIndex}"]`);
    item?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  if (!isOpen) return null;

  // Group results by type: releases, tracks, references
  const grouped: { type: SearchResultType; items: SearchResult[] }[] = [];
  const order: SearchResultType[] = ["artist", "release", "track", "reference"];
  for (const type of order) {
    const items = results.filter((r) => r.type === type);
    if (items.length > 0) grouped.push({ type, items });
  }

  let flatIndex = 0;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm cmd-palette-backdrop"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Palette */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Search releases, tracks, and references"
        className="fixed inset-0 z-50 flex items-start justify-center pt-[min(20vh,160px)] px-4"
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        onKeyDown={handleKeyDown}
      >
        <div className="w-full max-w-lg surface-float cmd-palette-panel overflow-hidden">
          {/* Search input */}
          <div className="flex items-center gap-3 px-4 h-14 border-b border-border">
            <Search size={18} strokeWidth={1.5} className="text-muted shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search releases, tracks, references..."
              className="flex-1 bg-transparent text-base text-text placeholder:text-faint outline-none"
              aria-label="Search"
              aria-autocomplete="list"
              aria-controls="cmd-palette-results"
              aria-activedescendant={
                activeIndex >= 0 ? `cmd-result-${activeIndex}` : undefined
              }
            />
            {isSearching && (
              <div className="w-4 h-4 border-2 border-signal border-t-transparent rounded-full animate-spin" />
            )}
            <button
              type="button"
              onClick={onClose}
              title="Close (Esc)"
              className="p-1 rounded text-faint hover:text-text transition-colors shrink-0"
            >
              <X size={16} strokeWidth={1.5} />
            </button>
          </div>

          {/* Results */}
          <div
            ref={listRef}
            id="cmd-palette-results"
            role="listbox"
            className="max-h-[min(50vh,400px)] overflow-y-auto"
          >
            {query.trim() && !isSearching && results.length === 0 && (
              <div className="px-4 py-8 text-center text-sm text-muted">
                No results for &ldquo;{query}&rdquo;
              </div>
            )}

            {!query.trim() && (
              <div className="px-4 py-8 text-center text-sm text-muted">
                Start typing to search...
              </div>
            )}

            {grouped.map((group) => {
              const startIndex = flatIndex;
              const groupItems = group.items.map((item, i) => {
                const itemIndex = startIndex + i;
                const Icon = TYPE_ICON[item.type];
                return (
                  <button
                    key={item.id}
                    id={`cmd-result-${itemIndex}`}
                    data-index={itemIndex}
                    role="option"
                    aria-selected={activeIndex === itemIndex}
                    onClick={() => navigateTo(item)}
                    onMouseEnter={() => setActiveIndex(itemIndex)}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors duration-75",
                      activeIndex === itemIndex
                        ? "bg-signal-muted"
                        : "hover:bg-panel2",
                    )}
                  >
                    <Icon
                      size={16}
                      strokeWidth={1.5}
                      className={cn(
                        "shrink-0",
                        activeIndex === itemIndex ? "text-signal" : "text-muted",
                      )}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-text truncate">
                        {item.title}
                      </div>
                      {item.subtitle && (
                        <div className="text-xs text-muted truncate">
                          {item.subtitle}
                        </div>
                      )}
                    </div>
                    {activeIndex === itemIndex && (
                      <CornerDownLeft size={14} className="text-faint shrink-0" />
                    )}
                  </button>
                );
              });
              flatIndex += group.items.length;
              return (
                <div key={group.type}>
                  <div className="px-4 pt-3 pb-1">
                    <span className="label-sm text-faint">
                      {TYPE_LABEL[group.type]}
                    </span>
                  </div>
                  {groupItems}
                </div>
              );
            })}
          </div>

          {/* Footer hint */}
          {results.length > 0 && (
            <div className="flex items-center gap-4 px-4 py-2 border-t border-border text-[10px] text-faint">
              <span className="inline-flex items-center gap-1">
                <kbd className="px-1 py-0.5 border border-border rounded">&uarr;&darr;</kbd>
                navigate
              </span>
              <span className="inline-flex items-center gap-1">
                <kbd className="px-1 py-0.5 border border-border rounded">&crarr;</kbd>
                open
              </span>
              <span className="inline-flex items-center gap-1">
                <kbd className="px-1 py-0.5 border border-border rounded">esc</kbd>
                close
              </span>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
