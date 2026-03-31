"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  locales,
  localeDisplayNames,
  localeFlagEmojis,
  defaultLocale,
  type Locale,
} from "@/i18n/config";

export function LocaleSwitcher({ locale }: { locale: string }) {
  const [open, setOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const optionRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const router = useRouter();

  // Resolve current locale safely
  const current: Locale = locales.includes(locale as Locale)
    ? (locale as Locale)
    : defaultLocale;

  const flag = localeFlagEmojis[current];
  const code = current.split("-")[0].toUpperCase();

  // Close on click-outside, Escape, and scroll
  useEffect(() => {
    if (!open) return;

    function handleMouseDown(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    function handleScroll() {
      setOpen(false);
    }

    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("keydown", handleKeyDown);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [open]);

  // Reset focused index when dropdown opens/closes
  useEffect(() => {
    if (open) {
      setFocusedIndex(locales.indexOf(current));
    } else {
      setFocusedIndex(-1);
    }
  }, [open, current]);

  // Focus the active option element when focusedIndex changes
  useEffect(() => {
    if (open && focusedIndex >= 0) {
      optionRefs.current[focusedIndex]?.focus();
    }
  }, [open, focusedIndex]);

  const handleSelect = useCallback(
    (selected: Locale) => {
      setOpen(false);
      if (selected === current) return;
      document.cookie = `NEXT_LOCALE=${selected};path=/;max-age=${60 * 60 * 24 * 365};samesite=lax`;
      router.refresh();
    },
    [current, router],
  );

  function handleKeyDownOnList(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setFocusedIndex((i) => (i + 1) % locales.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setFocusedIndex((i) => (i - 1 + locales.length) % locales.length);
    } else if (e.key === "Enter" && focusedIndex >= 0) {
      e.preventDefault();
      handleSelect(locales[focusedIndex]);
    } else if (e.key === "Tab") {
      setOpen(false);
    }
  }

  return (
    <div ref={wrapperRef} className="relative">
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label="Select language"
        className="flex items-center gap-1.5 border border-white/10 rounded-lg px-1.5 sm:px-2 py-2 min-h-[44px] text-sm text-zinc-300 hover:border-[#14B8A6]/50 hover:text-white transition-colors cursor-pointer"
      >
        <span className="text-base leading-none">{flag}</span>
        <span className="hidden sm:inline text-xs font-medium">{code}</span>
      </button>

      {/* Dropdown */}
      {open && (
        <div
          role="listbox"
          aria-label="Languages"
          onKeyDown={handleKeyDownOnList}
          className="absolute right-0 top-full mt-2 z-50 min-w-[260px] max-h-[min(50vh,400px)] overflow-y-auto overscroll-contain rounded-lg bg-[#1a1a1a] border border-white/10 ring-1 ring-white/5 py-1 shadow-float animate-in fade-in slide-in-from-top-1 duration-150 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-white/15 [&::-webkit-scrollbar-thumb]:rounded-full"
        >
          {locales.map((loc, i) => {
            const isActive = loc === current;
            return (
              <button
                key={loc}
                ref={(el) => { optionRefs.current[i] = el; }}
                role="option"
                aria-selected={isActive}
                type="button"
                onClick={() => handleSelect(loc)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm transition-colors cursor-pointer outline-none focus-visible:bg-white/5 ${
                  isActive
                    ? "text-[#14B8A6] border-l-2 border-[#14B8A6] pl-[10px]"
                    : "text-zinc-300 hover:bg-white/5 hover:text-white border-l-2 border-transparent pl-[10px]"
                }`}
              >
                <span className="text-base leading-none">{localeFlagEmojis[loc]}</span>
                <span>{localeDisplayNames[loc]}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
