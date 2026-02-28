"use client";

import { Rule } from "@/components/ui/rule";
import { PortalAudioPlayer } from "@/components/portal/portal-audio-player";
import { ApprovalControls } from "@/components/portal/approval-controls";
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
  paymentGated,
}: PortalTrackCardProps) {
  const hasDirection =
    showDirection && track.intent && (track.intent.mix_vision || (track.intent.emotional_tags?.length ?? 0) > 0 || track.intent.anti_references);
  const hasSpecs = showSpecs && track.specs?.target_loudness;
  const hasRefs = showReferences && track.references.length > 0;

  return (
    <section>
      <Rule className="mb-6" />

      {/* Track header */}
      <h2 className="text-lg font-bold text-text mb-6">
        <span className="font-mono text-muted mr-2">
          TRACK {String(track.track_number).padStart(2, "0")}
        </span>
        &mdash; {String(track.title).toUpperCase()}
      </h2>

      {/* Mix Direction */}
      {hasDirection && (
        <div className="mb-6">
          <div className="text-[10px] text-faint font-medium uppercase tracking-wider mb-1">
            Mix Direction
          </div>
          <p className="text-xs text-muted mb-3">
            The creative vision and sonic direction for this track.
          </p>
          <div className="space-y-2">
            {track.intent!.mix_vision && (
              <p className="text-sm text-text">
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
              <div className="mt-2">
                <span className="text-xs text-muted font-medium">Avoid: </span>
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
        <div className="mb-6">
          <div className="text-[10px] text-faint font-medium uppercase tracking-wider mb-2">
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
        <div className="mb-6">
          <div className="text-[10px] text-faint font-medium uppercase tracking-wider mb-1">
            References
          </div>
          <p className="text-xs text-muted mb-3">
            Reference tracks that inform the direction of this mix.
          </p>
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

      {/* Audio */}
      {track.versions.length > 0 && (
        <div className="mb-6">
          <div className="text-[10px] text-faint font-medium uppercase tracking-wider mb-1">
            Audio
          </div>
          <p className="text-xs text-muted mb-3">
            Double-click the waveform to leave a timestamped comment.
          </p>
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

      {/* Approval */}
      <div>
        <div className="text-[10px] text-faint font-medium uppercase tracking-wider mb-1">
          Approval
        </div>
        <p className="text-xs text-muted mb-3">
          Review the mix and approve or request changes.
        </p>
        <ApprovalControls
          shareToken={shareToken}
          trackId={track.id}
          initialStatus={track.approvalStatus}
        />
      </div>
    </section>
  );
}
