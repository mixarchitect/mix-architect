"use client";

import { PortalHeader } from "@/components/portal/portal-header";
import { PortalTrackCard } from "@/components/portal/portal-track-card";
import { PortalFooter } from "@/components/portal/portal-footer";
import { Rule } from "@/components/ui/rule";
import type { PortalRelease, PortalTrack, PortalShare } from "@/lib/portal-types";
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
  tracks,
  globalDirection,
  globalRefs,
}: PortalClientProps) {
  const paymentGated =
    share.require_payment_for_download && release.payment_status !== "paid";

  return (
    <main className="min-h-screen bg-bg py-12 px-6">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <PortalHeader release={release} trackCount={tracks.length} />

        {/* Global direction + references */}
        {(share.show_direction && globalDirection) ||
        (share.show_references && globalRefs.length > 0) ? (
          <div className="rounded-lg border border-border bg-panel p-8 mb-8">
            {share.show_direction && globalDirection && (
              <div className="mb-4">
                <div className="text-xs text-muted font-medium mb-1">
                  Global Direction
                </div>
                <p className="text-sm text-text leading-relaxed italic">
                  &ldquo;{globalDirection}&rdquo;
                </p>
              </div>
            )}

            {share.show_references && globalRefs.length > 0 && (
              <div>
                <div className="text-xs text-muted font-medium mb-1">
                  Global References
                </div>
                <ul className="text-sm text-text space-y-1">
                  {globalRefs.map((ref) => (
                    <li key={ref.id}>
                      &bull; {ref.song_title}
                      {ref.artist ? ` \u2014 ${ref.artist}` : ""}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : null}

        {/* Payment status banner */}
        {share.show_payment_status && release.fee_total != null && (
          <div className="rounded-lg border border-border bg-panel px-6 py-4 mb-8">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted font-medium uppercase tracking-wider">
                Payment
              </span>
              <span
                className={`text-xs font-medium px-2 py-0.5 rounded ${
                  release.payment_status === "paid"
                    ? "bg-status-green/10 text-status-green"
                    : release.payment_status === "partial"
                      ? "bg-signal-muted text-signal"
                      : "bg-muted/10 text-muted"
                }`}
              >
                {release.payment_status === "paid"
                  ? "Paid"
                  : release.payment_status === "partial"
                    ? "Partial"
                    : "Unpaid"}
              </span>
            </div>
          </div>
        )}

        {/* Tracks */}
        <div className="rounded-lg border border-border bg-panel p-8 space-y-10">
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
              paymentGated={paymentGated}
            />
          ))}

          {tracks.length === 0 && (
            <p className="text-center text-sm text-muted py-8">
              No tracks are available on this portal yet.
            </p>
          )}
        </div>

        <Rule className="my-8" />
        <PortalFooter />
      </div>
    </main>
  );
}
