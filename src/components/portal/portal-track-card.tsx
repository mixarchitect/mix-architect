"use client";

import { cn } from "@/lib/cn";
import { PortalAudioPlayer } from "@/components/portal/portal-audio-player";
import { ApprovalControls, PortalStatusBadge } from "@/components/portal/approval-controls";
import { ChevronRight } from "lucide-react";
import type { PortalTrack } from "@/lib/portal-types";

type PortalTrackCardProps = {
  shareToken: string;
  track: PortalTrack;
  releaseId: string;
  releaseTitle: string;
  releaseFormat: string;
  coverArtUrl: string | null;
  showDirection: boolean;
  showSpecs: boolean;
  showReferences: boolean;
  showDistribution: boolean;
  paymentGated: boolean;
};

export function PortalTrackCard({
  shareToken,
  track,
  releaseId,
  releaseTitle,
  releaseFormat,
  coverArtUrl,
  showDirection,
  showSpecs,
  showReferences,
  showDistribution,
  paymentGated,
}: PortalTrackCardProps) {
  const hasAudio = track.versions.length > 0;
  const isApproved = track.approvalStatus === "approved";
  const isDelivered = track.approvalStatus === "delivered";
  const isActioned = isApproved || isDelivered;

  // Detail sections
  const hasDirection =
    showDirection &&
    track.intent &&
    (track.intent.mix_vision ||
      (track.intent.emotional_tags?.length ?? 0) > 0 ||
      track.intent.anti_references);
  const hasSpecs = showSpecs && track.specs?.target_loudness;
  const hasRefs = showReferences && track.references.length > 0;
  const hasDist = showDistribution && track.distribution != null;
  const hasDetails = hasDirection || hasSpecs || hasRefs || hasDist;

  // Latest change request note (for highlighting)
  const latestChangeNote =
    track.approvalStatus === "changes_requested"
      ? track.comments.find((c) => !c.timecode_seconds && !c.audio_version_id)
      : null;

  // Status-colored left border
  const borderColor =
    track.approvalStatus === "approved"
      ? "border-l-status-green"
      : track.approvalStatus === "delivered"
        ? "border-l-status-blue"
        : track.approvalStatus === "changes_requested"
          ? "border-l-signal"
          : hasAudio
            ? "border-l-signal/40"
            : "border-l-border";

  return (
    <section
      className={cn(
        "rounded-lg border border-border bg-panel overflow-hidden border-l-[3px]",
        borderColor,
      )}
    >
      {/* Track header with inline status badge */}
      <div className="flex items-center justify-between px-4 md:px-6 pt-5 pb-3 gap-3">
        <h2 className="text-base md:text-lg font-bold text-text min-w-0">
          <span className="font-mono text-muted text-sm mr-2">
            {String(track.track_number).padStart(2, "0")}
          </span>
          {track.title}
        </h2>
        <PortalStatusBadge status={track.approvalStatus} />
      </div>

      {/* ── Audio player (primary content) ── */}
      {hasAudio && (
        <div className="px-4 md:px-6 pb-4">
          <PortalAudioPlayer
            shareToken={shareToken}
            trackId={track.id}
            releaseId={releaseId}
            versions={track.versions}
            initialComments={track.comments}
            coverArtUrl={coverArtUrl}
            trackTitle={track.title}
            releaseTitle={releaseTitle}
            downloadEnabled={track.downloadEnabled}
            paymentGated={paymentGated}
          />
        </div>
      )}

      {/* ── No audio state ── */}
      {!hasAudio && (
        <div className="px-4 md:px-6 py-6 text-center">
          <p className="text-sm text-faint italic">No audio shared yet</p>
        </div>
      )}

      {/* ── Change request highlight ── */}
      {track.approvalStatus === "changes_requested" && latestChangeNote && (
        <div className="mx-4 md:mx-6 mb-4 bg-signal-muted border border-signal/20 rounded-lg p-3">
          <div className="text-[11px] text-signal font-medium mb-1">
            Changes Requested
          </div>
          <p className="text-sm text-text leading-relaxed">
            {latestChangeNote.content}
          </p>
        </div>
      )}

      {/* ── Action buttons (only for tracks with audio, not delivered) ── */}
      {hasAudio && !isDelivered && (
        <div className="px-4 md:px-6 pb-4">
          <ApprovalControls
            shareToken={shareToken}
            trackId={track.id}
            initialStatus={track.approvalStatus}
            approvalDate={track.approvalDate}
          />
        </div>
      )}

      {/* ── Details accordion ── */}
      {hasDetails && (
        <details className="group border-t border-border">
          <summary className="cursor-pointer list-none flex items-center gap-2 px-4 md:px-6 py-3 text-xs font-medium text-muted hover:text-text transition-colors select-none">
            <ChevronRight
              size={14}
              className="transition-transform group-open:rotate-90 shrink-0"
            />
            Details
          </summary>
          <div className="px-4 md:px-6 pb-5 space-y-5">
            {/* Mix Direction */}
            {hasDirection && (
              <div>
                <div className="text-[10px] text-faint font-medium uppercase tracking-wider mb-1.5">
                  Mix Direction
                </div>
                <div className="space-y-2">
                  {track.intent!.mix_vision && (
                    <p className="text-sm text-text leading-relaxed">
                      {track.intent!.mix_vision}
                    </p>
                  )}
                  {(track.intent!.emotional_tags?.length ?? 0) > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {track.intent!.emotional_tags!.map((tag) => (
                        <span
                          key={tag}
                          className="text-xs text-muted bg-black/5 dark:bg-white/5 px-2 py-0.5 rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  {track.intent!.anti_references && (
                    <div>
                      <span className="text-xs text-muted font-medium">
                        Avoid:{" "}
                      </span>
                      <span className="text-sm text-text italic">
                        &ldquo;{track.intent!.anti_references}&rdquo;
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Specs */}
            {hasSpecs && (
              <div>
                <div className="text-[10px] text-faint font-medium uppercase tracking-wider mb-1.5">
                  Specs
                </div>
                <div className="flex flex-wrap gap-4 text-sm">
                  <span>
                    <span className="text-muted">Loudness: </span>
                    <span className="font-mono text-text">
                      {track.specs!.target_loudness}
                    </span>
                  </span>
                  <span>
                    <span className="text-muted">Format: </span>
                    <span className="font-mono text-text">
                      {track.specs!.format_override || releaseFormat}
                    </span>
                  </span>
                </div>
              </div>
            )}

            {/* References */}
            {hasRefs && (
              <div>
                <div className="text-[10px] text-faint font-medium uppercase tracking-wider mb-1.5">
                  References
                </div>
                <ul className="text-sm text-text space-y-1">
                  {track.references.map((ref, idx) => (
                    <li key={ref.id}>
                      {idx + 1}. {ref.song_title}
                      {ref.artist ? ` \u2014 ${ref.artist}` : ""}
                      {ref.note && (
                        <span className="text-muted italic">
                          {" "}
                          &ldquo;{ref.note}&rdquo;
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Distribution */}
            {hasDist && track.distribution && (
              <div>
                <div className="text-[10px] text-faint font-medium uppercase tracking-wider mb-1.5">
                  Distribution
                </div>
                <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
                  {track.distribution.isrc && (
                    <span>
                      <span className="text-muted">ISRC: </span>
                      <span className="font-mono text-text">
                        {track.distribution.isrc}
                      </span>
                    </span>
                  )}
                  {track.distribution.iswc && (
                    <span>
                      <span className="text-muted">ISWC: </span>
                      <span className="font-mono text-text">
                        {track.distribution.iswc}
                      </span>
                    </span>
                  )}
                  {track.distribution.producer && (
                    <span>
                      <span className="text-muted">Producer: </span>
                      <span className="text-text">
                        {track.distribution.producer}
                      </span>
                    </span>
                  )}
                  {track.distribution.composers && (
                    <span>
                      <span className="text-muted">Composers: </span>
                      <span className="text-text">
                        {track.distribution.composers}
                      </span>
                    </span>
                  )}
                  {track.distribution.language && (
                    <span>
                      <span className="text-muted">Language: </span>
                      <span className="text-text">
                        {track.distribution.language}
                      </span>
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </details>
      )}
    </section>
  );
}
