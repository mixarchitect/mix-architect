"use client";

import { useTranslations } from "next-intl";
import { Archive, Sparkles, Loader2 } from "lucide-react";

/**
 * Shown only after an admin account reset, when the user has parked releases.
 * They choose to bring the old work back or start clean. "Start fresh" leaves
 * the releases soft-deleted rather than destroying them, so an admin can still
 * recover them if the user changes their mind.
 */
export function RestoreReleasesStep({
  count,
  saving,
  onDecide,
  onBack,
}: {
  count: number;
  saving: boolean;
  onDecide: (decision: "restore" | "discard") => void;
  onBack: () => void;
}) {
  const t = useTranslations("onboarding.restoreReleases");

  return (
    <div>
      <h1 className="text-2xl font-semibold text-text text-center">
        {t("title")}
      </h1>
      <p className="mt-2 text-sm text-muted text-center">
        {t("subtitle", { count })}
      </p>

      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button
          type="button"
          disabled={saving}
          onClick={() => onDecide("restore")}
          className="text-left rounded-xl border border-border p-5 transition-colors hover:border-signal disabled:opacity-50"
          style={{ background: "var(--panel-2)" }}
        >
          <Archive size={20} className="text-signal" />
          <div className="mt-3 text-sm font-semibold text-text">
            {t("restoreTitle")}
          </div>
          <div className="mt-1 text-xs text-muted">
            {t("restoreDesc", { count })}
          </div>
        </button>

        <button
          type="button"
          disabled={saving}
          onClick={() => onDecide("discard")}
          className="text-left rounded-xl border border-border p-5 transition-colors hover:border-signal disabled:opacity-50"
          style={{ background: "var(--panel-2)" }}
        >
          <Sparkles size={20} className="text-muted" />
          <div className="mt-3 text-sm font-semibold text-text">
            {t("discardTitle")}
          </div>
          <div className="mt-1 text-xs text-muted">{t("discardDesc")}</div>
        </button>
      </div>

      <p className="mt-4 text-xs text-faint text-center">{t("recoverNote")}</p>

      <div className="mt-6 flex items-center justify-center gap-4">
        {saving && (
          <span className="inline-flex items-center gap-2 text-xs text-muted">
            <Loader2 size={12} className="animate-spin" />
            {t("saving")}
          </span>
        )}
        {!saving && (
          <button
            type="button"
            onClick={onBack}
            className="text-xs text-muted hover:text-text transition-colors"
          >
            {t("back")}
          </button>
        )}
      </div>
    </div>
  );
}
