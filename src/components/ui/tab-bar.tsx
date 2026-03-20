"use client";

import { cn } from "@/lib/cn";

type Tab = { id: string; label: string };

type Props = {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (id: string) => void;
  className?: string;
};

export function TabBar({ tabs, activeTab, onTabChange, className }: Props) {
  return (
    <div className={cn("relative", className)}>
      <div role="tablist" className="flex gap-0 border-b border-border overflow-x-auto no-scrollbar scroll-px-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "px-4 py-3 md:py-2.5 text-sm font-medium transition-colors relative whitespace-nowrap shrink-0",
              activeTab === tab.id ? "text-text" : "text-muted hover:text-text"
            )}
          >
            {tab.label}
            {activeTab === tab.id && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-signal" />
            )}
          </button>
        ))}
      </div>
      {/* Scroll hint gradient (right edge) */}
      <div className="absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-[var(--bg)] to-transparent pointer-events-none md:hidden" />
    </div>
  );
}
