"use client";

import { useState, useCallback } from "react";
import { PortalHeader } from "@/components/portal/portal-header";
import { PortalTrackCard } from "@/components/portal/portal-track-card";
import { PortalFooter } from "@/components/portal/portal-footer";
import { PortalReferenceItem } from "@/components/portal/portal-reference-item";
import { ChevronRight } from "lucide-react";
import type { PortalRelease, PortalTrack, PortalShare, ApprovalStatus } from "@/lib/portal-types";
import type { BriefReference } from "@/lib/db-types";

type PortalClientProps = {
  shareToken: string;
  share: PortalShare;
  release: PortalRelease;
  tracks: PortalTrack[];
  globalDirection: string | null;
  globalRefs: BriefReference[];
};

export function PortalClient({
  shareToken,
  share,
  release,
  tracks: initialTracks,
  globalDirection,
  globalRefs,
}: PortalClientProps) {
  const [tracks, setTracks] = useState(initialTracks);
  const paymentGated =
    share.require_payment_for_download && release.payment_status !== "paid";

  // Update a single track's approval status reactively (no page reload)
  const handleStatusChange = useCallback((trackId: string, newStatus: ApprovalStatus) => {
    setTracks((prev) =>
      prev.map((t) =>
        t.id === trackId ? { ...t, approvalStatus: newStatus } : t,
      ),
    );
  }, []);

  // Compute approval counts for the progress bar (re-derived on each render)
  const approvalCounts = {
    approved: tracks.filter((t) => t.approvalStatus === "approved").length,
    awaiting: tracks.filter((t) => t.approvalStatus === "awaiting_review").length,
    changesRequested: tracks.filter((t) => t.approvalStatus === "changes_requested").length,
    delivered: tracks.filter((t) => t.approvalStatus === "delivered").length,
  };

  const hasGlobalContext =
    (share.show_direction && globalDirection) ||
    (share.show_references && globalRefs.length > 0);

  return (
    <main className="portal-page min-h-screen bg-white dark:bg-[#1a1a1a] py-12 px-4 md:px-6 pb-24">
      <div className="max-w-3xl mx-auto">
        {/* ═══ Zone 1: Release Header ═══ */}
        <PortalHeader
          release={release}
          trackCount={tracks.length}
          engineerName={release.engineer_name}
          approvalCounts={approvalCounts}
        />

        {/* ═══ Global Mix Brief (collapsible) ═══ */}
        {hasGlobalContext && (
          <details className="mb-8 group rounded-lg border border-border bg-panel overflow-hidden">
            <summary className="cursor-pointer list-none flex items-center gap-2 px-5 py-3.5 hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors">
              <ChevronRight
                size={16}
                className="text-muted transition-transform group-open:rotate-90 shrink-0"
              />
              <span className="text-sm font-semibold text-muted">
                Global Mix Brief
              </span>
            </summary>
            <div className="border-t border-border px-5 py-5 space-y-4">
              {share.show_direction && globalDirection && (
                <div>
                  <div className="text-[10px] text-faint font-medium uppercase tracking-wider mb-1.5">
                    Direction
                  </div>
                  <p className="text-sm text-text leading-relaxed italic">
                    &ldquo;{globalDirection}&rdquo;
                  </p>
                </div>
              )}
              {share.show_references && globalRefs.length > 0 && (
                <div>
                  <div className="text-[10px] text-faint font-medium uppercase tracking-wider mb-1.5">
                    References
                  </div>
                  <div className="space-y-2">
                    {globalRefs.map((ref) => (
                      <PortalReferenceItem key={ref.id} reference={ref} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </details>
        )}

        {/* ═══ Zone 2: Track List ═══ */}
        <div className="space-y-4 md:space-y-6">
          {tracks.map((track) => (
            <PortalTrackCard
              key={track.id}
              shareToken={shareToken}
              track={track}
              releaseId={release.id}
              releaseTitle={release.title}
              releaseFormat={release.format}
              coverArtUrl={release.cover_art_url}
              showDirection={share.show_direction}
              showSpecs={share.show_specs}
              showReferences={share.show_references}
              showDistribution={share.show_distribution}
              showLyrics={share.show_lyrics}
              paymentGated={paymentGated}
              onStatusChange={(newStatus) => handleStatusChange(track.id, newStatus)}
            />
          ))}

          {tracks.length === 0 && (
            <div className="rounded-lg border border-border bg-panel p-12 text-center">
              <p className="text-sm text-muted">
                No tracks are available on this portal yet.
              </p>
            </div>
          )}
        </div>

        {/* ═══ Zone 3: Footer ═══ */}
        <PortalFooter
          showPayment={share.show_payment_status}
          release={release}
          showDistribution={share.show_distribution}
          releaseDistribution={release.distribution}
          tracks={tracks}
          engineerName={release.engineer_name}
          paymentGated={paymentGated}
        />
      </div>
    </main>
  );
}
