"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback } from "react";
import { cn } from "@/lib/cn";

type Tab = { id: string; label: string; count?: number };

type Props = {
  tabs: Tab[];
  activeTab: string;
  className?: string;
};

export function ContentTabs({ tabs, activeTab, className }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleTabChange = useCallback(
    (tabId: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (tabId === tabs[0]?.id) {
        params.delete("tab");
      } else {
        params.set("tab", tabId);
      }
      const qs = params.toString();
      router.push(`${pathname}${qs ? `?${qs}` : ""}`, { scroll: false });
    },
    [router, pathname, searchParams, tabs],
  );

  return (
    <div
      role="tablist"
      className={cn(
        "flex gap-0 border-b border-border overflow-x-auto no-scrollbar",
        className,
      )}
    >
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          role="tab"
          aria-selected={activeTab === tab.id}
          onClick={() => handleTabChange(tab.id)}
          className={cn(
            "px-4 py-2.5 text-sm font-medium transition-colors relative whitespace-nowrap",
            activeTab === tab.id ? "text-text" : "text-muted hover:text-text",
          )}
        >
          {tab.label}
          {tab.count != null && (
            <span className="ml-1.5 text-faint">{tab.count}</span>
          )}
          {activeTab === tab.id && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-signal" />
          )}
        </button>
      ))}
    </div>
  );
}
