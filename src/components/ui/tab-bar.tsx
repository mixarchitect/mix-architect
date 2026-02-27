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
    <div role="tablist" className={cn("flex gap-0 border-b border-border", className)}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          role="tab"
          aria-selected={activeTab === tab.id}
          onClick={() => onTabChange(tab.id)}
          className={cn(
            "px-4 py-2.5 text-sm font-medium transition-colors relative",
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
  );
}
