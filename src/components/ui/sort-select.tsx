"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/cn";

const SORT_OPTIONS = [
  { value: "modified", label: "Last Modified" },
  { value: "created", label: "Last Created" },
  { value: "az", label: "A \u2013 Z" },
] as const;

export function SortSelect() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const current = searchParams.get("sort") ?? "modified";

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  useEffect(() => {
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    if (open) document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [open]);

  function handleSelect(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "modified") {
      params.delete("sort"); // default — keep URL clean
    } else {
      params.set("sort", value);
    }
    const qs = params.toString();
    router.push(qs ? `/app?${qs}` : "/app");
    setOpen(false);
  }

  const activeLabel = SORT_OPTIONS.find((o) => o.value === current)?.label ?? "Last Modified";

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={cn(
          "flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-md border transition-colors cursor-pointer",
          open
            ? "border-signal text-text bg-panel"
            : "border-border text-muted bg-transparent hover:border-border-strong hover:text-text",
        )}
      >
        {activeLabel}
        <ChevronDown size={12} className={cn("transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div className="absolute right-0 mt-1 w-44 rounded-md border border-border bg-panel shadow-lg py-1 z-20">
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => handleSelect(opt.value)}
              className="w-full flex items-center justify-between gap-2 px-3 py-2 text-sm text-text hover:bg-panel2 transition-colors text-left"
            >
              {opt.label}
              {current === opt.value && <Check size={14} className="text-signal shrink-0" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
