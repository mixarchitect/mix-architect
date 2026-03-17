"use client";

import { useState, useCallback } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/lib/cn";

type Tab = { id: string; label: string; count?: number };

type Props = {
  tabs: Tab[];
  initialTab: string;
  className?: string;
  children: React.ReactNode[];
};

/**
 * TabbedContent renders a tab bar and ALL children simultaneously.
 * Inactive panels are hidden with `hidden` attribute (display:none).
 * URL is synced via replaceState — no server round-trip on tab switch.
 *
 * Children must be in the same order as `tabs`.
 */
export function TabbedContent({ tabs, initialTab, className, children }: Props) {
  const [currentTab, setCurrentTab] = useState(initialTab);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleTabChange = useCallback(
    (tabId: string) => {
      setCurrentTab(tabId);
      const params = new URLSearchParams(searchParams.toString());
      if (tabId === tabs[0]?.id) {
        params.delete("tab");
      } else {
        params.set("tab", tabId);
      }
      const qs = params.toString();
      window.history.replaceState(null, "", `${pathname}${qs ? `?${qs}` : ""}`);
    },
    [pathname, searchParams, tabs],
  );

  return (
    <div>
      <div
        role="tablist"
        className={cn(
          "flex gap-0 border-b border-border overflow-x-auto no-scrollbar mb-6",
          className,
        )}
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={currentTab === tab.id}
            onClick={() => handleTabChange(tab.id)}
            className={cn(
              "px-4 py-2.5 text-sm font-medium transition-colors relative whitespace-nowrap",
              currentTab === tab.id ? "text-text" : "text-muted hover:text-text",
            )}
          >
            {tab.label}
            {tab.count != null && (
              <span className="ml-1.5 text-faint">{tab.count}</span>
            )}
            {currentTab === tab.id && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-signal" />
            )}
          </button>
        ))}
      </div>

      {tabs.map((tab, i) => (
        <div key={tab.id} role="tabpanel" hidden={currentTab !== tab.id}>
          {children[i]}
        </div>
      ))}
    </div>
  );
}
