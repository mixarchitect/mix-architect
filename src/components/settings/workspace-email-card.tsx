"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Lock, Loader2, Check } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabaseBrowserClient";
import { useSubscription } from "@/lib/subscription-context";
import { getEntitlements } from "@/lib/entitlements";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Studio branded email (lightweight). Client emails send under the studio's
 * name + logo/accent from the shared mixarchitect.com address; this card lets
 * the owner set the Reply-To so client replies reach the studio. Gated on the
 * `brandedEmail` entitlement — Free/Pro see an upgrade prompt.
 */
export function WorkspaceEmailCard() {
  const t = useTranslations("settings.brandedEmail");
  const tc = useTranslations("common");
  const sub = useSubscription();
  const gated = !getEntitlements(sub.plan).brandedEmail;

  const [loading, setLoading] = useState(true);
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);
  const [ownerEmail, setOwnerEmail] = useState("");
  const [replyTo, setReplyTo] = useState("");
  const [savedReplyTo, setSavedReplyTo] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (gated) {
      setLoading(false);
      return;
    }
    (async () => {
      try {
        const supabase = createSupabaseBrowserClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;
        setOwnerEmail(user.email ?? "");

        const { data: ws } = await supabase
          .from("workspaces")
          .select("id")
          .eq("owner_user_id", user.id)
          .order("created_at", { ascending: true })
          .limit(1)
          .maybeSingle();
        if (!ws) return;
        setWorkspaceId(ws.id);

        const { data: branding } = await supabase
          .from("workspace_branding")
          .select("reply_to_email")
          .eq("workspace_id", ws.id)
          .maybeSingle();
        const val = branding?.reply_to_email ?? "";
        setReplyTo(val);
        setSavedReplyTo(val);
      } finally {
        setLoading(false);
      }
    })();
  }, [gated]);

  async function handleSave() {
    setError("");
    const trimmed = replyTo.trim();
    if (trimmed && !EMAIL_RE.test(trimmed)) {
      setError(t("replyToInvalid"));
      return;
    }
    if (!workspaceId) return;
    setSaving(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const { error: err } = await supabase.from("workspace_branding").upsert(
        {
          workspace_id: workspaceId,
          reply_to_email: trimmed || null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "workspace_id" },
      );
      if (err) throw err;
      setSavedReplyTo(trimmed);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("saveFailed"));
    } finally {
      setSaving(false);
    }
  }

  /* ── Gated (Free / Pro) ─────────────────────────────────────────── */
  if (gated) {
    return (
      <div className="rounded-xl border border-border p-6" style={{ background: "var(--panel)" }}>
        <div className="flex items-center gap-2">
          <Lock size={16} className="text-muted" />
          <h2 className="text-sm font-semibold text-text">{t("title")}</h2>
        </div>
        <p className="mt-2 text-sm text-muted">{t("gatedDesc")}</p>
        <Link
          href="/app/settings?upgrade=studio"
          className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors"
          style={{ background: "var(--signal)", color: "var(--signal-on)" }}
        >
          {t("upgradeCta")}
        </Link>
      </div>
    );
  }

  /* ── Active (Studio) ────────────────────────────────────────────── */
  const dirty = replyTo.trim() !== savedReplyTo.trim();

  return (
    <div className="rounded-xl border border-border p-6 space-y-5" style={{ background: "var(--panel)" }}>
      <div>
        <h2 className="text-sm font-semibold text-text">{t("title")}</h2>
        <p className="mt-1 text-sm text-muted">{t("desc")}</p>
      </div>

      {error && <p className="text-xs text-red-500">{error}</p>}

      {loading ? (
        <div className="flex items-center gap-2 text-sm text-muted">
          <Loader2 size={14} className="animate-spin" /> {tc("loading")}
        </div>
      ) : (
        <div className="space-y-2">
          <span className="text-xs font-medium text-muted uppercase tracking-wider">{t("replyToLabel")}</span>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <input
              type="email"
              value={replyTo}
              onChange={(e) => setReplyTo(e.target.value)}
              placeholder={ownerEmail || t("replyToPlaceholder")}
              className="input text-sm flex-1"
            />
            <button
              type="button"
              onClick={handleSave}
              disabled={!dirty || saving}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium rounded-md transition-colors disabled:opacity-40"
              style={{ background: "var(--signal)", color: "var(--signal-on)" }}
            >
              {saving ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
              {tc("save")}
            </button>
          </div>
          <p className="text-[10px] text-faint">{t("replyToHelp")}</p>
        </div>
      )}
    </div>
  );
}
