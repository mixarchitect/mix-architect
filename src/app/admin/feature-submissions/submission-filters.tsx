"use client";

import Link from "next/link";
import { cn } from "@/lib/cn";

const TABS = [
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "declined", label: "Declined" },
  { value: "all", label: "All" },
] as const;

export function SubmissionFilters({ current }: { current: string }) {
  return (
    <div className="flex gap-1 border-b border-border">
      {TABS.map((tab) => (
        <Link
          key={tab.value}
          href={`/admin/feature-submissions?status=${tab.value}`}
          className={cn(
            "px-3 py-2 text-xs font-medium transition-colors border-b-2 -mb-px",
            current === tab.value
              ? "border-teal-500 text-teal-500"
              : "border-transparent text-muted hover:text-text",
          )}
        >
          {tab.label}
        </Link>
      ))}
    </div>
  );
}
