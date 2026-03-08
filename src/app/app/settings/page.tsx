"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { Sun, Moon, Monitor, Sparkles, CreditCard, Gift, Download } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabaseBrowserClient";
import { Panel, PanelBody, PanelHeader } from "@/components/ui/panel";
import { Button } from "@/components/ui/button";
import { Rule } from "@/components/ui/rule";
import { TagInput } from "@/components/ui/tag-input";
import { AutoSaveIndicator } from "@/components/ui/auto-save-indicator";
import { useSubscription } from "@/lib/subscription-context";
import { useUnsavedChanges } from "@/hooks/use-unsaved-changes";

const FORMAT_OPTIONS = [
  { value: "stereo", label: "Stereo" },
  { value: "atmos", label: "Dolby Atmos" },
  { value: "both", label: "Stereo + Atmos" },
];

const THEME_OPTIONS = [
  { value: "light", label: "Light", Icon: Sun },
  { value: "dark", label: "Dark", Icon: Moon },
  { value: "system", label: "System", Icon: Monitor },
] as const;

export default function SettingsPage() {
  const router = useRouter();
  const { theme: currentTheme, setTheme } = useTheme();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);

  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<
    "idle" | "saving" | "saved" | "error"
  >("idle");

  const [displayName, setDisplayName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [format, setFormat] = useState("stereo");
  const [sampleRate, setSampleRate] = useState("48kHz");
  const [bitDepth, setBitDepth] = useState("24-bit");
  const [defaultElements, setDefaultElements] = useState<string[]>([
    "Kick", "Snare", "Bass", "Guitars", "Keys/Synths",
    "Lead Vocal", "BGVs", "FX/Ear Candy",
  ]);
  const [paymentsEnabled, setPaymentsEnabled] = useState(false);

  // ── Unsaved-changes guard ──
  const initialSnapshot = useRef("");
  const currentSnapshot = JSON.stringify({
    displayName, companyName, format, sampleRate, bitDepth, defaultElements,
  });
  const isDirty = initialSnapshot.current !== "" && currentSnapshot !== initialSnapshot.current;
  useUnsavedChanges(isDirty);

  useEffect(() => {
    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setEmail(user.email ?? "");
        setDisplayName(user.user_metadata?.display_name ?? "");

        const { data } = await supabase
          .from("user_defaults")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle();

        if (data) {
          setFormat(data.default_format ?? "stereo");
          setSampleRate(data.default_sample_rate ?? "48kHz");
          setBitDepth(data.default_bit_depth ?? "24-bit");
          setDefaultElements(data.default_elements ?? []);
          setPaymentsEnabled(data.payments_enabled ?? false);
          setCompanyName(data.company_name ?? "");
        }

        // Capture initial snapshot for dirty detection
        requestAnimationFrame(() => {
          initialSnapshot.current = JSON.stringify({
            displayName: user.user_metadata?.display_name ?? "",
            companyName: data?.company_name ?? "",
            format: data?.default_format ?? "stereo",
            sampleRate: data?.default_sample_rate ?? "48kHz",
            bitDepth: data?.default_bit_depth ?? "24-bit",
            defaultElements: data?.default_elements ?? [],
          });
        });
      }
      setLoading(false);
    }
    load();
  }, [supabase]);

  async function handleSave() {
    setSaveStatus("saving");
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      await supabase.auth.updateUser({
        data: { display_name: displayName },
      });

      const { error } = await supabase.from("user_defaults").upsert(
        {
          user_id: user.id,
          default_format: format,
          default_sample_rate: sampleRate,
          default_bit_depth: bitDepth,
          default_elements: defaultElements,
          payments_enabled: paymentsEnabled,
          company_name: companyName || null,
        },
        { onConflict: "user_id" },
      );

      if (error) throw error;
      initialSnapshot.current = currentSnapshot; // reset dirty state
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2000);
    } catch {
      setSaveStatus("error");
    }
  }

  if (loading) {
    return <div className="text-sm text-muted py-12 text-center">Loading&hellip;</div>;
  }

  return (
    <div className="max-w-xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-semibold h2 text-text">Settings</h1>
        <AutoSaveIndicator status={saveStatus} />
      </div>

      <div className="space-y-6">
        {/* Appearance */}
        <Panel>
          <PanelHeader>
            <h2 className="text-base font-semibold text-text">Appearance</h2>
            <p className="text-sm text-muted mt-1">
              Choose your preferred color theme.
            </p>
          </PanelHeader>
          <Rule />
          <PanelBody className="pt-5">
            <div className="flex gap-2">
              {THEME_OPTIONS.map((opt) => {
                const active = currentTheme === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={async () => {
                      setTheme(opt.value);
                      const { data: { user } } = await supabase.auth.getUser();
                      if (user) {
                        await supabase.from("user_defaults").upsert(
                          { user_id: user.id, theme: opt.value },
                          { onConflict: "user_id" },
                        );
                      }
                    }}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors"
                    style={
                      active
                        ? { background: "var(--signal)", color: "var(--signal-on)" }
                        : { background: "var(--panel-2)", color: "var(--muted)" }
                    }
                  >
                    <opt.Icon size={16} strokeWidth={1.5} />
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </PanelBody>
        </Panel>

        {/* Profile */}
        <Panel>
          <PanelHeader>
            <h2 className="text-base font-semibold text-text">Profile</h2>
          </PanelHeader>
          <Rule />
          <PanelBody className="pt-5 space-y-4">
            <div className="space-y-1.5">
              <label className="label text-muted">Display name</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="input"
                placeholder="Your name"
              />
            </div>
            <div className="space-y-1.5">
              <label className="label text-muted">Company name (optional)</label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="input"
                placeholder="Studio or business name"
              />
            </div>
            <div className="space-y-1.5">
              <label className="label text-muted">Email</label>
              <input
                type="email"
                value={email}
                disabled
                className="input opacity-60"
              />
            </div>
            <Button variant="primary" onClick={handleSave}>
              Save Profile
            </Button>
          </PanelBody>
        </Panel>

        {/* Mix Defaults */}
        <Panel>
          <PanelHeader>
            <h2 className="text-base font-semibold text-text">Mix Defaults</h2>
            <p className="text-sm text-muted mt-1">
              These values will be used as defaults for new tracks.
            </p>
          </PanelHeader>
          <Rule />
          <PanelBody className="pt-5 space-y-6">
            <div className="space-y-1.5">
              <label className="label text-muted">Default format</label>
              <div className="flex gap-2">
                {FORMAT_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setFormat(opt.value)}
                    className="px-4 py-2 text-sm font-medium rounded-md transition-colors"
                    style={
                      format === opt.value
                        ? { background: "var(--signal)", color: "var(--signal-on)" }
                        : { background: "var(--panel2)", color: "var(--text-muted)" }
                    }
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="label text-muted">Default sample rate</label>
              <select
                value={sampleRate}
                onChange={(e) => setSampleRate(e.target.value)}
                className="input"
              >
                <option value="44.1kHz">44.1kHz</option>
                <option value="48kHz">48kHz</option>
                <option value="96kHz">96kHz</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="label text-muted">Default bit depth</label>
              <select
                value={bitDepth}
                onChange={(e) => setBitDepth(e.target.value)}
                className="input"
              >
                <option value="16-bit">16-bit</option>
                <option value="24-bit">24-bit</option>
                <option value="32-bit float">32-bit float</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="label text-muted">Default element list</label>
              <TagInput
                value={defaultElements}
                onChange={setDefaultElements}
                placeholder="Add element names"
              />
            </div>

            <Button variant="primary" onClick={handleSave}>
              Save Defaults
            </Button>
          </PanelBody>
        </Panel>

        {/* Payment Tracking */}
        <Panel>
          <PanelHeader>
            <h2 className="text-base font-semibold text-text">Payment Tracking</h2>
            <p className="text-sm text-muted mt-1">
              Track fees and payment status on releases and tracks. Turn this off if you&apos;re mixing your own projects.
            </p>
          </PanelHeader>
          <Rule />
          <PanelBody className="pt-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-text">Enable payment tracking</div>
                <div className="text-xs text-muted mt-0.5">Shows fee and paid/unpaid status on releases and tracks</div>
              </div>
              <button
                type="button"
                onClick={async () => {
                  const prev = paymentsEnabled;
                  const next = !prev;
                  setPaymentsEnabled(next);
                  try {
                    const { data: { user } } = await supabase.auth.getUser();
                    if (!user) throw new Error("Not authenticated");
                    const { error } = await supabase.from("user_defaults").upsert(
                      { user_id: user.id, payments_enabled: next },
                      { onConflict: "user_id" },
                    );
                    if (error) throw error;
                    router.refresh();
                  } catch {
                    setPaymentsEnabled(prev);
                  }
                }}
                className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
                  paymentsEnabled ? "bg-signal" : "bg-black/20 dark:bg-white/20"
                }`}
              >
                <span
                  className="inline-block h-5 w-5 rounded-full bg-white shadow transition-transform"
                  style={{ transform: paymentsEnabled ? "translateX(22px)" : "translateX(3px)" }}
                />
              </button>
            </div>
          </PanelBody>
        </Panel>

        {/* Your Data */}
        <Panel>
          <PanelHeader>
            <h2 className="text-base font-semibold text-text">Your Data</h2>
            <p className="text-sm text-muted mt-1">
              Download a complete copy of your Mix Architect data, including all
              release metadata, payment records, and audio files.
            </p>
          </PanelHeader>
          <Rule />
          <PanelBody className="pt-5">
            <ExportDataButton />
          </PanelBody>
        </Panel>

        {/* Subscription */}
        <SubscriptionPanel />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Subscription Panel                                                 */
/* ------------------------------------------------------------------ */

function SubscriptionPanel() {
  const sub = useSubscription();
  const [upgrading, setUpgrading] = useState(false);
  const [managingBilling, setManagingBilling] = useState(false);

  const isPro = sub.plan === "pro" && (sub.status === "active" || sub.status === "trialing");
  const isCanceling = isPro && sub.cancelAtPeriodEnd;
  const isAdminGranted = sub.grantedByAdmin;

  async function handleUpgrade() {
    setUpgrading(true);
    try {
      const res = await fetch("/api/stripe/checkout", { method: "POST" });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        console.error("[settings] checkout error:", data.error);
        setUpgrading(false);
      }
    } catch (err) {
      console.error("[settings] checkout failed:", err);
      setUpgrading(false);
    }
  }

  async function handleManageBilling() {
    setManagingBilling(true);
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        console.error("[settings] portal error:", data.error);
        setManagingBilling(false);
      }
    } catch (err) {
      console.error("[settings] portal failed:", err);
      setManagingBilling(false);
    }
  }

  return (
    <Panel>
      <PanelHeader>
        <h2 className="text-base font-semibold text-text">Subscription</h2>
        <p className="text-sm text-muted mt-1">
          Manage your Mix Architect plan.
        </p>
      </PanelHeader>
      <Rule />
      <PanelBody className="pt-5 space-y-4">
        {/* Current plan display */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isPro ? (
              isAdminGranted ? (
                <Gift size={18} className="text-signal" />
              ) : (
                <Sparkles size={18} className="text-signal" />
              )
            ) : (
              <CreditCard size={18} className="text-muted" />
            )}
            <div>
              <div className="text-sm font-semibold text-text">
                {isPro ? "Pro" : "Free"}
                {isAdminGranted && (
                  <span className="ml-1.5 text-xs font-medium text-signal">Complimentary</span>
                )}
              </div>
              <div className="text-xs text-muted mt-0.5">
                {isPro
                  ? isAdminGranted
                    ? "Unlimited releases"
                    : "$14/month \u00b7 Unlimited releases"
                  : "1 release included"}
              </div>
            </div>
          </div>

          {/* Plan badge */}
          <span
            className="px-2.5 py-1 text-xs font-semibold rounded-full"
            style={{
              background: isPro ? "var(--signal)" : "var(--panel-2)",
              color: isPro ? "var(--signal-on)" : "var(--muted)",
            }}
          >
            {isPro ? "PRO" : "FREE"}
          </span>
        </div>

        {/* Canceling notice */}
        {isCanceling && sub.currentPeriodEnd && (
          <div
            className="text-xs px-3 py-2 rounded-md"
            style={{ background: "var(--panel-2)" }}
          >
            Your Pro plan will end on{" "}
            <span className="font-semibold text-text">
              {new Date(sub.currentPeriodEnd).toLocaleDateString(undefined, {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </span>
            . You can resubscribe from Manage Billing.
          </div>
        )}

        {/* Actions */}
        {!isPro && (
          <Button variant="primary" onClick={handleUpgrade} disabled={upgrading}>
            <Sparkles size={16} />
            {upgrading ? "Redirecting\u2026" : "Upgrade to Pro"}
          </Button>
        )}

        {isPro && !isAdminGranted && (
          <Button variant="secondary" onClick={handleManageBilling} disabled={managingBilling}>
            <CreditCard size={16} />
            {managingBilling ? "Redirecting\u2026" : "Manage Billing"}
          </Button>
        )}
      </PanelBody>
    </Panel>
  );
}

/* ------------------------------------------------------------------ */
/*  Export Data Button                                                  */
/* ------------------------------------------------------------------ */

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

type ExportEstimate = {
  estimatedBytes: number;
  releaseCount: number;
  trackCount: number;
  audioFileCount: number;
};

function ExportDataButton() {
  const [loading, setLoading] = useState(false);
  const [estimate, setEstimate] = useState<ExportEstimate | null>(null);
  const [exporting, setExporting] = useState(false);
  const [downloadedBytes, setDownloadedBytes] = useState(0);
  const [error, setError] = useState<string | null>(null);

  async function handleEstimate() {
    setLoading(true);
    setError(null);
    setEstimate(null);
    try {
      const res = await fetch("/api/export?estimate=true");
      if (!res.ok) {
        const body = await res.json().catch(() => ({ error: "Failed to estimate" }));
        throw new Error(body.error || "Failed to estimate");
      }
      const data: ExportEstimate = await res.json();
      setEstimate(data);
    } catch (err) {
      console.error("[settings] estimate failed:", err);
      setError(err instanceof Error ? err.message : "Failed to estimate");
    } finally {
      setLoading(false);
    }
  }

  async function handleDownload() {
    setExporting(true);
    setDownloadedBytes(0);
    setError(null);
    try {
      const res = await fetch("/api/export");
      if (!res.ok) {
        const body = await res.json().catch(() => ({ error: "Export failed" }));
        throw new Error(body.error || "Export failed");
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error("No response body");

      const chunks: Uint8Array[] = [];
      let received = 0;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
        received += value.length;
        setDownloadedBytes(received);
      }

      const blob = new Blob(chunks as BlobPart[], { type: "application/zip" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const timestamp = new Date().toISOString().slice(0, 10);
      a.download = `mix-architect-export-${timestamp}.zip`;
      a.click();
      URL.revokeObjectURL(url);
      setEstimate(null);
    } catch (err) {
      console.error("[settings] export failed:", err);
      setError(err instanceof Error ? err.message : "Export failed");
    } finally {
      setExporting(false);
    }
  }

  const totalBytes = estimate?.estimatedBytes ?? 0;
  const progress = totalBytes > 0 ? Math.min((downloadedBytes / totalBytes) * 100, 100) : 0;

  return (
    <div className="space-y-3">
      {!estimate ? (
        <Button variant="secondary" onClick={handleEstimate} disabled={loading}>
          <Download size={16} />
          {loading ? "Calculating\u2026" : "Export My Data"}
        </Button>
      ) : (
        <div className="space-y-3">
          <div className="rounded-lg bg-panel-2 border border-border p-4">
            <p className="text-sm text-text">
              Your export is approximately{" "}
              <span className="font-semibold">{formatBytes(totalBytes)}</span>
            </p>
            <p className="text-xs text-muted mt-1">
              {estimate.releaseCount} {estimate.releaseCount === 1 ? "release" : "releases"},{" "}
              {estimate.trackCount} {estimate.trackCount === 1 ? "track" : "tracks"},{" "}
              {estimate.audioFileCount} audio {estimate.audioFileCount === 1 ? "file" : "files"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="primary" onClick={handleDownload} disabled={exporting}>
              <Download size={16} />
              {exporting ? "Downloading\u2026" : "Download"}
            </Button>
            {!exporting && (
              <Button variant="secondary" onClick={() => setEstimate(null)}>
                Cancel
              </Button>
            )}
          </div>
          {exporting && (
            <div className="space-y-1.5">
              <div className="h-2 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
                <div
                  className="h-full rounded-full bg-signal transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-xs text-muted">
                {formatBytes(downloadedBytes)} / {formatBytes(totalBytes)}
              </p>
            </div>
          )}
        </div>
      )}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
