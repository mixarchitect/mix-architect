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
      <div className="sticky top-6 mx-1 rounded-md border border-border bg-panel shadow-paper">
        <div className="flex flex-col gap-1 p-2">
          {items.map((it) => {
            const active = pathname?.startsWith(it.href);
            return (
              <Link
                key={it.href}
                href={it.href}
                aria-label={it.label}
                className={cn(
                  "h-10 w-10 grid place-items-center rounded-md border border-transparent",
                  "text-muted hover:text-text hover:border-border hover:bg-panel2 transition duration-200 ease-out",
                  active && "text-text border-border bg-panel2"
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

