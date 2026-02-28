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
  const hasIntent =
    showDirection && track.intent && (track.intent.mix_vision || (track.intent.emotional_tags?.length ?? 0) > 0);
  const hasSpecs = showSpecs && track.specs?.target_loudness;
  const hasRefs = showReferences && track.references.length > 0;
  const hasAntiRefs = showDirection && track.intent?.anti_references;

  return (
    <section>
      <Rule className="mb-6" />

      {/* Track header */}
      <h2 className="text-lg font-bold text-text mb-4">
        <span className="font-mono text-muted mr-2">
          TRACK {String(track.track_number).padStart(2, "0")}
        </span>
        &mdash; {String(track.title).toUpperCase()}
      </h2>

      {/* Intent */}
      {hasIntent && (
        <div className="mb-4 space-y-2">
          {track.intent!.mix_vision && (
            <div>
              <span className="text-xs text-muted font-medium">Intent: </span>
              <span className="text-sm text-text">
                {track.intent!.mix_vision}
              </span>
            </div>
          )}
          {(track.intent!.emotional_tags?.length ?? 0) > 0 && (
            <div>
              <span className="text-xs text-muted font-medium">
                Keywords:{" "}
              </span>
              <span className="text-sm text-text">
                {track.intent!.emotional_tags!.join(", ")}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Specs */}
      {hasSpecs && (
        <div className="mb-4 flex flex-wrap gap-4 text-sm">
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
      )}

      {/* References */}
      {hasRefs && (
        <div className="mb-4">
          <div className="text-xs text-muted font-medium mb-1">References</div>
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

      {/* Anti-references */}
      {hasAntiRefs && (
        <div className="mb-4">
          <div className="text-xs text-muted font-medium mb-1">
            Anti-references
          </div>
          <p className="text-sm text-text italic">
            &ldquo;{track.intent!.anti_references}&rdquo;
          </p>
        </div>
      )}

      {/* Samply link */}
      {track.samply_url && (
        <div className="mb-4">
          <span className="text-xs text-muted font-medium">Samply: </span>
          <a
            href={track.samply_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-signal hover:underline"
          >
            View on Samply &rarr;
          </a>
        </div>
      )}

      {/* Audio player */}
      {track.versions.length > 0 && (
        <div className="mt-4">
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

      {/* Approval controls */}
      <ApprovalControls
        shareToken={shareToken}
        trackId={track.id}
        initialStatus={track.approvalStatus}
      />
    </section>
  );
}
