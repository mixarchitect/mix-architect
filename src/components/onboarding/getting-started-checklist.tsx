"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Check, X, PlayCircle, ArrowRight } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabaseBrowserClient";
import { cn } from "@/lib/cn";

export type ChecklistProgress = {
  hasRelease: boolean;
  hasTrack: boolean;
  hasAudio: boolean;
  hasShared: boolean;
  /** Deep link to the user's most recent release, when one exists. */
  releaseHref: string | null;
};

/**
 * Getting-started checklist for new users.
 *
 * Steps complete themselves from real data, so this doubles as a progress
 * meter rather than a to-do the user has to maintain. It also carries the
 * only re-entry point into the product tour — before this, the tour was
 * reachable from a single button on the onboarding confirmation screen and
 * was lost forever if the user chose "Go to dashboard".
 */
export function GettingStartedChecklist({
  progress,
  userId,
  showPortalStep,
}: {
  progress: ChecklistProgress;
  userId: string;
  showPortalStep: boolean;
}) {
  const t = useTranslations("dashboard.checklist");
  const [dismissed, setDismissed] = useState(false);

  const steps = [
    {
      key: "release",
      done: progress.hasRelease,
      label: t("stepRelease"),
      href: "/app/releases/new",
    },
    {
      key: "track",
      done: progress.hasTrack,
      label: t("stepTrack"),
      href: progress.releaseHref ?? "/app/releases/new",
    },
    {
      key: "audio",
      done: progress.hasAudio,
      label: t("stepAudio"),
      href: progress.releaseHref ?? "/app/releases/new",
    },
    ...(showPortalStep
      ? [
          {
            key: "share",
            done: progress.hasShared,
            label: t("stepShare"),
            href: progress.releaseHref ?? "/app/releases/new",
          },
        ]
      : []),
  ];

  const doneCount = steps.filter((s) => s.done).length;
  const allDone = doneCount === steps.length;

  // Hide once everything is done — no dismiss needed.
  if (dismissed || allDone) return null;

  // Next incomplete step drives the primary CTA.
  const nextStep = steps.find((s) => !s.done);

  async function handleDismiss() {
    setDismissed(true);
    try {
      const supabase = createSupabaseBrowserClient();
      await supabase
        .from("user_defaults")
        .update({ checklist_dismissed: true })
        .eq("user_id", userId);
    } catch {
      /* dismissal is a convenience — a failure just means it returns later */
    }
  }

  return (
    <div
      className="relative rounded-xl border border-border p-5 mb-8"
      style={{ background: "var(--panel)" }}
    >
      <button
        type="button"
        onClick={handleDismiss}
        aria-label={t("dismiss")}
        className="absolute top-4 right-4 text-faint hover:text-text transition-colors"
      >
        <X size={16} />
      </button>

      <h2 className="text-sm font-semibold text-text pr-8">{t("title")}</h2>
      <p className="mt-1 text-sm text-muted pr-8">{t("subtitle")}</p>

      {/* Progress bar */}
      <div className="mt-4 flex items-center gap-3">
        <div className="h-1.5 flex-1 rounded-full overflow-hidden" style={{ background: "var(--panel-2)" }}>
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${(doneCount / steps.length) * 100}%`,
              background: "var(--signal)",
            }}
          />
        </div>
        <span className="text-xs text-muted tabular-nums shrink-0">
          {t("progress", { done: doneCount, total: steps.length })}
        </span>
      </div>

      <ol className="mt-4 space-y-2">
        {steps.map((step) => (
          <li key={step.key} className="flex items-center gap-3">
            <span
              className={cn(
                "flex items-center justify-center w-5 h-5 rounded-full border shrink-0 transition-colors",
                step.done ? "border-transparent" : "border-border",
              )}
              style={step.done ? { background: "var(--signal)" } : undefined}
            >
              {step.done && <Check size={12} style={{ color: "var(--signal-on)" }} />}
            </span>
            <span
              className={cn(
                "text-sm",
                step.done ? "text-faint line-through" : "text-text",
              )}
            >
              {step.label}
            </span>
          </li>
        ))}
      </ol>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        {nextStep && (
          <Link
            href={nextStep.href}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-md transition-colors"
            style={{ background: "var(--signal)", color: "var(--signal-on)" }}
          >
            {t("continue")}
            <ArrowRight size={14} />
          </Link>
        )}
        <Link
          href="/app/releases/new?tour=true"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-signal hover:underline"
        >
          <PlayCircle size={14} />
          {t("takeTour")}
        </Link>
      </div>
    </div>
  );
}
