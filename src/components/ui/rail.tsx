"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import * as React from "react";
import { cn } from "@/lib/cn";

type Item = { href: string; icon: React.ReactNode; label: string };

export function Rail({ items }: { items: Item[] }) {
  const pathname = usePathname();

  return (
    <nav className="w-14 shrink-0">
      <div className="sticky top-6 rounded-lg border border-border bg-panel shadow-DEFAULT">
        <div className="flex flex-col gap-1 p-2">
          {items.map((it) => {
            const active =
              pathname === it.href ||
              (it.href !== "/app" && pathname?.startsWith(it.href));
            return (
              <Link
                key={it.href}
                href={it.href}
                aria-label={it.label}
                className={cn(
                  "h-10 w-10 grid place-items-center rounded-md",
                  "border border-transparent",
                  "text-muted",
                  "transition-all duration-150 ease-out",
                  "hover:text-text hover:border-border hover:bg-panel2",
                  "focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-signal-muted",
                  active && "text-signal border-signal/20 bg-signal-muted"
                )}
              >
                {it.icon}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
