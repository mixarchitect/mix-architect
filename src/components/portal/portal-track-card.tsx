"use client";

import { PortalAudioPlayer } from "@/components/portal/portal-audio-player";
import { ApprovalControls, PortalStatusBadge } from "@/components/portal/approval-controls";
import { PortalReferenceItem } from "@/components/portal/portal-reference-item";
import { ChevronRight } from "lucide-react";
import type { PortalTrack, ApprovalStatus } from "@/lib/portal-types";
import { formatLabel } from "@/lib/format-labels";

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
  showLyrics?: boolean;
  paymentGated: boolean;
  onStatusChange?: (newStatus: ApprovalStatus) => void;
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
  showLyrics,
  paymentGated,
  onStatusChange,
}: PortalTrackCardProps) {
  const hasAudio = track.versions.length > 0;
  const isApproved = track.approvalStatus === "approved";
  const isDelivered = track.approvalStatus === "delivered";

  // Detail sections
  const hasDirection =
    showDirection &&
    track.intent &&
    (track.intent.mix_vision ||
      (track.intent.emotional_tags?.length ?? 0) > 0 ||
      track.intent.anti_references);
  const hasSpecs = showSpecs && (track.specs?.format_override || releaseFormat);
  const hasRefs = showReferences && track.references.length > 0;
  const hasDist = showDistribution && track.distribution != null;
  const hasLyrics = showLyrics && !!track.lyrics;
  const hasDetails = hasDirection || hasSpecs || hasRefs || hasDist || hasLyrics;

  // Measured LUFS from the latest audio version (live measurement, not target)
  const latestVersion = track.versions.length > 0 ? track.versions[track.versions.length - 1] : null;
  const measuredLufs = latestVersion?.measured_lufs ?? null;

  // Latest change request note (for highlighting)
  const latestChangeNote =
    track.approvalStatus === "changes_requested"
      ? track.comments.find((c) => !c.timecode_seconds && !c.audio_version_id)
      : null;

  // Status-colored left border (inline style to avoid CSS cascade issues with border-border shorthand)
  const borderLeftColor =
    track.approvalStatus === "approved"
      ? "var(--status-green)"
      : track.approvalStatus === "delivered"
        ? "var(--status-blue)"
        : track.approvalStatus === "changes_requested"
          ? "var(--signal)"
          : hasAudio
            ? "color-mix(in srgb, var(--signal) 40%, transparent)"
            : "var(--border)";

  return (
    <section
      className="rounded-lg border border-border bg-panel overflow-hidden border-l-[3px]"
      style={{ borderLeftColor }}
    >
      {/* Track header with inline status badge */}
      <div className="flex items-start justify-between px-4 md:px-6 pt-5 pb-3 gap-3">
        <h2 className="text-base md:text-lg font-bold text-text min-w-0 pt-0.5">
          <span className="text-muted text-sm mr-2">
            {String(track.track_number).padStart(2, "0")}
          </span>
          {track.title}
        </h2>
        <div className="shrink-0">
          <PortalStatusBadge status={track.approvalStatus} />
        </div>
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
            onStatusChange={onStatusChange}
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

            {/* Specs — show measured LUFS (live) + format */}
            {hasSpecs && (
              <div>
                <div className="text-[10px] text-faint font-medium uppercase tracking-wider mb-1.5">
                  Specs
                </div>
                <div className="flex flex-wrap gap-4 text-sm">
                  {measuredLufs != null && (
                    <span>
                      <span className="text-muted">Loudness: </span>
                      <span className="text-text">
                        {measuredLufs.toFixed(1)} LUFS
                      </span>
                    </span>
                  )}
                  <span>
                    <span className="text-muted">Format: </span>
                    <span className="text-text">
                      {formatLabel(track.specs?.format_override || releaseFormat)}
                    </span>
                  </span>
                </div>
              </div>
            )}

            {/* References — with artwork + links */}
            {hasRefs && (
              <div>
                <div className="text-[10px] text-faint font-medium uppercase tracking-wider mb-2">
                  References
                </div>
                <div className="space-y-2">
                  {track.references.map((ref) => (
                    <PortalReferenceItem key={ref.id} reference={ref} />
                  ))}
                </div>
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
                      <span className="text-text">
                        {track.distribution.isrc}
                      </span>
                    </span>
                  )}
                  {track.distribution.iswc && (
                    <span>
                      <span className="text-muted">ISWC: </span>
                      <span className="text-text">
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

            {hasLyrics && (
              <div>
                <div className="text-[10px] text-faint font-medium uppercase tracking-wider mb-1.5">
                  Lyrics
                </div>
                <pre className="text-sm whitespace-pre-wrap font-sans text-text leading-relaxed">
                  {track.lyrics}
                </pre>
              </div>
            )}
          </div>
        </details>
      )}
    </section>
  );
}
