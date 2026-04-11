"use client";

import { useState, useEffect } from "react";
import { Megaphone, Clock, Star, X as XIcon, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import {
  checkEligibilityAction,
  getSubmissionAction,
  submitForFeatureAction,
  withdrawSubmissionAction,
} from "@/actions/feature-submissions";
import type { FeatureSubmission } from "@/types/feature-submission";

interface Props {
  releaseId: string;
  releaseTitle: string;
  artist: string;
  releaseType: string;
  trackCount: number;
  coverArtUrl: string | null;
}

export function SubmitForFeatureButton({
  releaseId,
  releaseTitle,
  artist,
  releaseType,
  trackCount,
  coverArtUrl,
}: Props) {
  const [submission, setSubmission] = useState<FeatureSubmission | null>(null);
  const [eligible, setEligible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const [sub, elig] = await Promise.all([
        getSubmissionAction(releaseId),
        checkEligibilityAction(releaseId),
      ]);
      if (cancelled) return;
      setSubmission(sub);
      setEligible(elig.eligible);
      setLoading(false);
    }
    load();
    return () => { cancelled = true; };
  }, [releaseId]);

  if (loading) return null;

  // State: Already submitted
  if (submission) {
    if (submission.status === "pending") {
      return (
        <PendingBadge
          submission={submission}
          releaseId={releaseId}
          onWithdrawn={() => {
            setSubmission(null);
            setEligible(true);
          }}
        />
      );
    }
    if (submission.status === "approved") {
      return (
        <a
          href={submission.featured_release_id ? `/app/featured` : "#"}
          className="flex items-center gap-1.5 text-xs text-teal-500 hover:text-teal-400 transition-colors"
        >
          <Star size={13} strokeWidth={1.5} />
          Featured on Blog
          {submission.featured_release_id && <ExternalLink size={11} />}
        </a>
      );
    }
    if (submission.status === "declined") {
      return (
        <span className="text-xs text-zinc-500 flex items-center gap-1.5">
          <XIcon size={13} strokeWidth={1.5} />
          Submission Declined
        </span>
      );
    }
  }

  // Not eligible — hide entirely
  if (!eligible) return null;

  return (
    <>
      <Button
        variant="secondary"
        className="h-8 text-xs gap-1.5"
        onClick={() => setModalOpen(true)}
      >
        <Megaphone size={13} strokeWidth={1.5} />
        Submit for Feature
      </Button>

      {modalOpen && (
        <SubmissionModal
          releaseId={releaseId}
          releaseTitle={releaseTitle}
          artist={artist}
          releaseType={releaseType}
          trackCount={trackCount}
          coverArtUrl={coverArtUrl}
          onClose={() => setModalOpen(false)}
          onSubmitted={(sub) => {
            setSubmission(sub);
            setModalOpen(false);
          }}
        />
      )}
    </>
  );
}

/* ─── Pending badge with withdraw ─────────────────────────── */

function PendingBadge({
  submission,
  releaseId,
  onWithdrawn,
}: {
  submission: FeatureSubmission;
  releaseId: string;
  onWithdrawn: () => void;
}) {
  const [withdrawing, setWithdrawing] = useState(false);

  async function handleWithdraw() {
    if (!confirm("Withdraw your submission? You can resubmit later.")) return;
    setWithdrawing(true);
    const result = await withdrawSubmissionAction(submission.id, releaseId);
    if (result.success) {
      onWithdrawn();
    } else {
      alert(result.error ?? "Could not withdraw.");
    }
    setWithdrawing(false);
  }

  return (
    <div className="flex items-center gap-2">
      <span className="flex items-center gap-1.5 text-xs text-amber-500">
        <Clock size={13} strokeWidth={1.5} />
        Submitted for Feature
      </span>
      <button
        type="button"
        onClick={handleWithdraw}
        disabled={withdrawing}
        className="text-[10px] text-zinc-500 hover:text-zinc-300 transition-colors underline underline-offset-2"
      >
        {withdrawing ? "..." : "Withdraw"}
      </button>
    </div>
  );
}

/* ─── Submission Modal ────────────────────────────────────── */

function SubmissionModal({
  releaseId,
  releaseTitle,
  artist,
  releaseType,
  trackCount,
  coverArtUrl,
  onClose,
  onSubmitted,
}: {
  releaseId: string;
  releaseTitle: string;
  artist: string;
  releaseType: string;
  trackCount: number;
  coverArtUrl: string | null;
  onClose: () => void;
  onSubmitted: (sub: FeatureSubmission) => void;
}) {
  const [pitchNote, setPitchNote] = useState("");
  const [permission, setPermission] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handleKey);
    };
  }, [onClose]);

  async function handleSubmit() {
    setError(null);
    setSubmitting(true);
    const result = await submitForFeatureAction({
      releaseId,
      pitchNote: pitchNote.trim() || undefined,
      permissionGranted: permission,
    });
    if (result.success) {
      // Refetch to get the full submission object
      const { getSubmissionAction } = await import("@/actions/feature-submissions");
      const sub = await getSubmissionAction(releaseId);
      if (sub) onSubmitted(sub);
      else onClose();
    } else {
      setError(result.error ?? "Something went wrong.");
    }
    setSubmitting(false);
  }

  const typeLabel =
    releaseType === "ep" ? "EP" : releaseType.charAt(0).toUpperCase() + releaseType.slice(1);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-50"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Submit for What We're Spinning"
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        <div
          className="bg-panel border border-border rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 pt-5 pb-3">
            <h2 className="text-base font-semibold text-text">
              Submit for What We&apos;re Spinning
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-muted hover:text-text transition-colors"
              aria-label="Close"
            >
              <XIcon size={16} strokeWidth={1.5} />
            </button>
          </div>

          <div className="px-5 pb-5 space-y-5">
            {/* Release preview */}
            <div className="flex items-center gap-3 rounded-lg border border-border bg-panel2 p-3">
              {coverArtUrl ? (
                <img
                  src={coverArtUrl}
                  alt=""
                  className="w-12 h-12 rounded-md object-cover shrink-0"
                />
              ) : (
                <div className="w-12 h-12 rounded-md bg-zinc-800 shrink-0" />
              )}
              <div className="min-w-0">
                <p className="text-sm font-medium text-text truncate">
                  {releaseTitle}
                </p>
                <p className="text-xs text-muted truncate">{artist}</p>
                <p className="text-[10px] text-zinc-500">
                  {trackCount} {trackCount === 1 ? "track" : "tracks"} &middot; {typeLabel}
                </p>
              </div>
            </div>

            {/* Pitch note */}
            <div>
              <label className="block text-xs text-muted mb-1.5">
                Why should we feature this release? (optional)
              </label>
              <textarea
                value={pitchNote}
                onChange={(e) => setPitchNote(e.target.value.slice(0, 500))}
                maxLength={500}
                rows={3}
                className="w-full bg-panel2 border border-border rounded-lg px-3 py-2 text-sm text-text placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-teal-500/50 resize-none"
                placeholder="Share what makes this release special..."
              />
              <p className="text-[10px] text-zinc-600 text-right mt-1">
                {pitchNote.length}/500
              </p>
            </div>

            {/* Permission checkbox */}
            <label className="flex items-start gap-2.5 cursor-pointer group">
              <input
                type="checkbox"
                checked={permission}
                onChange={(e) => setPermission(e.target.checked)}
                className="mt-0.5 accent-teal-500 shrink-0"
              />
              <span className="text-xs text-muted leading-relaxed group-hover:text-text transition-colors">
                I grant Mix Architect permission to feature this release on
                the blog, including cover art and audio playback.
              </span>
            </label>

            {/* Error */}
            {error && (
              <p className="text-xs text-red-400 bg-red-400/10 rounded-md px-3 py-2">
                {error}
              </p>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between gap-3 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="text-xs text-muted hover:text-text transition-colors"
              >
                Cancel
              </button>
              <Button
                variant="primary"
                className="h-9 text-xs"
                disabled={!permission || submitting}
                onClick={handleSubmit}
              >
                {submitting ? "Submitting..." : "Submit for Review"}
              </Button>
            </div>

            <p className="text-[10px] text-zinc-600 text-center">
              Your submission will be reviewed by the Mix Architect team.
              We feature new releases on our blog weekly.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
