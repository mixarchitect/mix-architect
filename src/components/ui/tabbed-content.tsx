"use client";

import { Children, useState, useCallback, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/lib/cn";

type Tab = { id: string; label: string; count?: number; moneyEasterEgg?: boolean };

type Props = {
  tabs: Tab[];
  initialTab: string;
  className?: string;
  children: React.ReactNode;
};

const MONEY_QUOTES = [
  "That\u2019s what I want",
  "Get away",
  "Mo money, mo problems",
];

/**
 * TabbedContent renders a tab bar and ALL children simultaneously.
 * Inactive panels are hidden with `hidden` attribute (display:none).
 * URL is synced via replaceState — no server round-trip on tab switch.
 *
 * Children must be in the same order as `tabs`. Falsy children (from
 * conditional rendering like `{condition && <Panel>}`) are filtered out
 * so the remaining children align 1:1 with the tabs array.
 */
export function TabbedContent({ tabs, initialTab, className, children }: Props) {
  // Filter out falsy children (false, null, undefined) so indexes match tabs
  const panels = Children.toArray(children);
  const [currentTab, setCurrentTab] = useState(initialTab);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Easter egg tooltip state for the Money tab
  const [easterEgg, setEasterEgg] = useState<string | null>(null);
  const easterEggTimeout = useRef<ReturnType<typeof setTimeout>>(undefined);

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
          <div
            key={tab.id}
            className="relative inline-flex"
            onMouseEnter={
              tab.moneyEasterEgg
                ? () => {
                    clearTimeout(easterEggTimeout.current);
                    easterEggTimeout.current = setTimeout(() => {
                      setEasterEgg(MONEY_QUOTES[Math.floor(Math.random() * MONEY_QUOTES.length)]);
                    }, 200);
                  }
                : undefined
            }
            onMouseLeave={
              tab.moneyEasterEgg
                ? () => {
                    clearTimeout(easterEggTimeout.current);
                    setEasterEgg(null);
                  }
                : undefined
            }
          >
            <button
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
            {tab.moneyEasterEgg && easterEgg && (
              <span
                className="absolute top-full mt-2 left-1/2 -translate-x-1/2 z-50 px-2 py-1 rounded-md text-[11px] whitespace-nowrap pointer-events-none bg-text text-panel italic"
                role="tooltip"
              >
                {easterEgg}
              </span>
            )}
          </div>
        ))}
      </div>

      {tabs.map((tab, i) => (
        <div key={tab.id} role="tabpanel" hidden={currentTab !== tab.id}>
          {panels[i]}
        </div>
      ))}
    </div>
  );
}
