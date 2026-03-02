"use client";

import Link from "next/link";
import { StatusDot } from "@/components/ui/status-dot";
import { getStatusColor } from "@/lib/timeline-utils";
import type { DashboardRelease } from "@/types/release";
import { ArrowRight } from "lucide-react";

interface TimelineReleaseCardProps {
  release: DashboardRelease;
}

export function TimelineReleaseCard({ release }: TimelineReleaseCardProps) {
  const color = getStatusColor(release.status);

  return (
    <Link
      href={`/app/releases/${release.id}`}
      className="surface flex flex-col gap-1.5 px-3.5 py-3 min-w-[180px] max-w-[220px] hover:border-border-strong transition-colors group"
    >
      <div className="flex items-center gap-2">
        <StatusDot color={color} />
        <span className="text-sm font-medium text-text truncate">
          {release.title}
        </span>
      </div>
      {release.artist && (
        <span className="text-xs text-muted truncate">{release.artist}</span>
      )}
      <span className="text-xs text-signal flex items-center gap-1 mt-0.5 group-hover:underline">
        Set date
        <ArrowRight size={11} />
      </span>
    </Link>
  );
}
