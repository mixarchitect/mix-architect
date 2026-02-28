"use client";

import { useRef, useState, useEffect } from "react";
import type { PortalRelease } from "@/lib/portal-types";
import { formatLabel } from "@/lib/format-labels";

type ApprovalCounts = {
  approved: number;
  awaiting: number;
  changesRequested: number;
  delivered: number;
};

type PortalHeaderProps = {
  release: PortalRelease;
  trackCount: number;
  engineerName: string | null;
  approvalCounts: ApprovalCounts;
};

export function PortalHeader({
  release,
  trackCount,
  engineerName,
  approvalCounts,
}: PortalHeaderProps) {
  const typeLabel =
    release.release_type === "ep"
      ? "EP"
      : release.release_type.charAt(0).toUpperCase() +
        release.release_type.slice(1);

  const total = approvalCounts.approved + approvalCounts.awaiting + approvalCounts.changesRequested + approvalCounts.delivered;
  const doneCount = approvalCounts.approved + approvalCounts.delivered;

  // Sticky compact header on scroll
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [isCompact, setIsCompact] = useState(false);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      ([entry]) => setIsCompact(!entry.isIntersecting),
      { threshold: 0 },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      {/* Sentinel element — when this scrolls out of view, compact header appears */}
      <div ref={sentinelRef} className="h-0" />

      {/* Compact sticky header */}
      {isCompact && (
        <div className="fixed top-0 left-0 right-0 z-30 bg-white/90 dark:bg-[#1a1a1a]/90 backdrop-blur-md border-b border-border print:hidden">
          <div className="max-w-3xl mx-auto px-6 py-3 flex items-center gap-4">
            {release.cover_art_url && (
              <img
                src={release.cover_art_url}
                alt=""
                className="w-8 h-8 rounded object-cover"
              />
            )}
            <div className="min-w-0 flex-1">
              <div className="text-sm font-bold text-text truncate">{release.title}</div>
            </div>
            <div className="shrink-0">
              <ProgressBar
                approved={approvalCounts.approved}
                delivered={approvalCounts.delivered}
                changesRequested={approvalCounts.changesRequested}
                awaiting={approvalCounts.awaiting}
                compact
              />
            </div>
          </div>
        </div>
      )}

      {/* Full header */}
      <header className="text-center mb-10">
        {release.cover_art_url && (
          <img
            src={release.cover_art_url}
            alt={`${release.title} cover art`}
            className="w-[200px] h-[200px] rounded-xl object-cover mx-auto mb-6 shadow-lg"
          />
        )}
        <h1 className="text-3xl font-bold text-text tracking-tight">{release.title}</h1>
        {release.artist && (
          <p className="text-lg text-muted mt-1">{release.artist}</p>
        )}
        <div className="flex items-center justify-center gap-2 mt-3 text-xs text-faint flex-wrap">
          <span>{typeLabel}</span>
          <span>&middot;</span>
          <span>{formatLabel(release.format)}</span>
          <span>&middot;</span>
          <span>
            {trackCount} track{trackCount !== 1 ? "s" : ""}
          </span>
          {engineerName && (
            <>
              <span>&middot;</span>
              <span className="text-muted">by {engineerName}</span>
            </>
          )}
        </div>

        {/* Progress bar */}
        {total > 0 && (
          <div className="flex justify-center mt-6">
            <ProgressBar
              approved={approvalCounts.approved}
              delivered={approvalCounts.delivered}
              changesRequested={approvalCounts.changesRequested}
              awaiting={approvalCounts.awaiting}
            />
          </div>
        )}
      </header>
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Progress Bar                                                        */
/* ------------------------------------------------------------------ */

function ProgressBar({
  approved,
  delivered,
  changesRequested,
  awaiting,
  compact = false,
}: {
  approved: number;
  delivered: number;
  changesRequested: number;
  awaiting: number;
  compact?: boolean;
}) {
  const total = approved + delivered + changesRequested + awaiting;
  const doneCount = approved + delivered;

  if (total === 0) return null;

  const segments: { count: number; color: string }[] = [
    { count: approved + delivered, color: "bg-status-green" },
    { count: changesRequested, color: "bg-signal" },
    { count: awaiting, color: "bg-black/[0.06] dark:bg-white/[0.08]" },
  ];

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted whitespace-nowrap">
          {doneCount}/{total}
        </span>
        <div className="h-1.5 w-24 rounded-full bg-black/[0.04] dark:bg-white/[0.06] flex overflow-hidden gap-px">
          {segments.map((seg, i) =>
            seg.count > 0 ? (
              <div
                key={i}
                className={`${seg.color} transition-all duration-500`}
                style={{ width: `${(seg.count / total) * 100}%` }}
              />
            ) : null,
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-xs">
      <div className="flex items-center justify-between text-xs text-muted mb-2">
        <span>
          {doneCount} of {total} approved
        </span>
        {changesRequested > 0 && (
          <span className="text-signal">
            {changesRequested} revision{changesRequested !== 1 ? "s" : ""}
          </span>
        )}
      </div>
      <div className="h-1.5 rounded-full bg-black/[0.04] dark:bg-white/[0.06] flex overflow-hidden gap-px">
        {segments.map((seg, i) =>
          seg.count > 0 ? (
            <div
              key={i}
              className={`${seg.color} rounded-full transition-all duration-500`}
              style={{ width: `${(seg.count / total) * 100}%` }}
            />
          ) : null,
        )}
      </div>
    </div>
  );
}
