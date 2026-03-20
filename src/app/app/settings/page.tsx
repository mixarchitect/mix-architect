"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useTranslations } from "next-intl";
import { Sun, Moon, Monitor, Sparkles, CreditCard, Gift, Download, CalendarDays, Copy, Check, RefreshCw, HardDrive, Cloud, Unplug, Mail } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabaseBrowserClient";
import { Panel, PanelBody, PanelHeader } from "@/components/ui/panel";
import { Button } from "@/components/ui/button";
import { Rule } from "@/components/ui/rule";
import { TagInput } from "@/components/ui/tag-input";
import { AutoSaveIndicator } from "@/components/ui/auto-save-indicator";
import { useSubscription } from "@/lib/subscription-context";
import { useUnsavedChanges } from "@/hooks/use-unsaved-changes";
import {
  locales,
  localeDisplayNames,
  localeFlagEmojis,
  localeCurrencyMap,
  supportedCurrencies,
  type Locale,
} from "@/i18n/config";
import { formatCurrency } from "@/lib/currency";

export default function SettingsPage() {
  const router = useRouter();
  const { theme: currentTheme, setTheme } = useTheme();
  const t = useTranslations("settings");
  const tc = useTranslations("common");
  const tTheme = useTranslations("theme");
  const tFormat = useTranslations("formatLabels");
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);

  const formatOptions = useMemo(() => [
    { value: "stereo", label: tFormat("stereo") },
    { value: "atmos", label: tFormat("atmos") },
    { value: "both", label: tFormat("stereoAtmos") },
  ], [tFormat]);

  const themeOptions = useMemo(() => [
    { value: "light", label: tTheme("light"), Icon: Sun },
    { value: "dark", label: tTheme("dark"), Icon: Moon },
    { value: "system", label: tTheme("system"), Icon: Monitor },
  ] as const, [tTheme]);

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
  const [defaultHourlyRate, setDefaultHourlyRate] = useState("");
  const [locale, setLocale] = useState<Locale>("en-US");
  const [defaultCurrency, setDefaultCurrency] = useState("USD");
  const [persona, setPersona] = useState<"artist" | "engineer" | "both" | "other">("artist");
  const [paymentsManuallySet, setPaymentsManuallySet] = useState(false);

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
        setDisplayName(user.user_metadata?.display_name ?? user.user_metadata?.full_name ?? "");

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
          setDefaultHourlyRate(data.default_hourly_rate != null ? String(data.default_hourly_rate) : "");
          setCompanyName(data.company_name ?? "");
          setLocale((data.locale as Locale) ?? "en-US");
          setDefaultCurrency(data.default_currency ?? "USD");
          setPersona(data.persona ?? "artist");
          setPaymentsManuallySet(data.payments_manually_set ?? false);
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
    return <div className="text-sm text-muted py-12 text-center">{tc("loading")}</div>;
  }

  return (
    <div className="max-w-xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-semibold h2 text-text">{t("title")}</h1>
        <AutoSaveIndicator status={saveStatus} />
      </div>

      <div className="space-y-6">
        {/* Profile */}
        <Panel>
          <PanelHeader>
            <h2 className="text-base font-semibold text-text">{t("profile.title")}</h2>
          </PanelHeader>
          <Rule />
          <PanelBody className="pt-5 space-y-4">
            <div className="space-y-1.5">
              <label className="label text-muted">{t("profile.displayName")}</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="input"
                placeholder={t("profile.displayNamePlaceholder")}
              />
            </div>
            <div className="space-y-1.5">
              <label className="label text-muted">{t("profile.companyName")}</label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="input"
                placeholder={t("profile.companyNamePlaceholder")}
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="settings-email" className="label text-muted">{t("profile.email")}</label>
              <input
                id="settings-email"
                type="email"
                value={email}
                disabled
                className="input opacity-60"
              />
            </div>
            <Button variant="primary" onClick={handleSave}>
              {t("profile.save")}
            </Button>
          </PanelBody>
        </Panel>

        {/* Subscription */}
        <SubscriptionPanel />

        {/* Region & Currency */}
        <Panel>
          <PanelHeader>
            <h2 className="text-base font-semibold text-text">{t("regionCurrency.title")}</h2>
          </PanelHeader>
          <Rule />
          <PanelBody className="pt-5 space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="settings-locale" className="label text-muted">{t("regionCurrency.locale")}</label>
              <select
                id="settings-locale"
                value={locale}
                onChange={async (e) => {
                  const newLocale = e.target.value as Locale;
                  setLocale(newLocale);
                  // Auto-update currency to match locale
                  const mappedCurrency = localeCurrencyMap[newLocale];
                  setDefaultCurrency(mappedCurrency);
                  // Save immediately
                  const { data: { user } } = await supabase.auth.getUser();
                  if (user) {
                    await supabase.from("user_defaults").upsert(
                      { user_id: user.id, locale: newLocale, default_currency: mappedCurrency },
                      { onConflict: "user_id" },
                    );
                    document.cookie = `NEXT_LOCALE=${newLocale};path=/;max-age=${60 * 60 * 24 * 365};samesite=lax`;
                    router.refresh();
                  }
                }}
                className="input"
              >
                {locales.map((l) => (
                  <option key={l} value={l}>
                    {localeFlagEmojis[l]} {localeDisplayNames[l]}
                  </option>
                ))}
              </select>
              <p className="text-xs text-muted">{t("regionCurrency.localeHelp")}</p>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="settings-currency" className="label text-muted">{t("regionCurrency.defaultCurrency")}</label>
              <select
                id="settings-currency"
                value={defaultCurrency}
                onChange={async (e) => {
                  const newCurrency = e.target.value;
                  setDefaultCurrency(newCurrency);
                  const { data: { user } } = await supabase.auth.getUser();
                  if (user) {
                    await supabase.from("user_defaults").upsert(
                      { user_id: user.id, default_currency: newCurrency },
                      { onConflict: "user_id" },
                    );
                  }
                }}
                className="input"
              >
                {supportedCurrencies.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.symbol} {c.code} — {c.label}
                  </option>
                ))}
              </select>
              <p className="text-xs text-muted">{t("regionCurrency.defaultCurrencyHelp")}</p>
            </div>

            <div className="rounded-lg px-3 py-2" style={{ background: "var(--panel2)" }}>
              <span className="text-xs text-muted">{t("regionCurrency.preview")}: </span>
              <span className="text-sm font-medium text-text">
                {formatCurrency(1234.56, defaultCurrency, locale)}
              </span>
            </div>
          </PanelBody>
        </Panel>

        {/* Appearance */}
        <Panel>
          <PanelHeader>
            <h2 className="text-base font-semibold text-text">{t("appearance.title")}</h2>
            <p className="text-sm text-muted mt-1">
              {t("appearance.description")}
            </p>
          </PanelHeader>
          <Rule />
          <PanelBody className="pt-5">
            <div className="flex gap-2">
              {themeOptions.map((opt) => {
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

        {/* Persona */}
        <Panel>
          <PanelHeader>
            <h2 className="text-base font-semibold text-text">{t("persona.title")}</h2>
          </PanelHeader>
          <Rule />
          <PanelBody className="pt-5 space-y-3">
            {([
              { id: "artist" as const, label: t("persona.artistLabel") },
              { id: "engineer" as const, label: t("persona.engineerLabel") },
              { id: "both" as const, label: t("persona.bothLabel") },
              { id: "other" as const, label: t("persona.otherLabel") },
            ] as const).map((opt) => (
              <label key={opt.id} className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="radio"
                  name="persona"
                  value={opt.id}
                  checked={persona === opt.id}
                  onChange={async () => {
                    setPersona(opt.id);
                    const updateData: Record<string, unknown> = { persona: opt.id };
                    // Auto-toggle payments if not manually overridden
                    if (!paymentsManuallySet) {
                      const newPayments = opt.id !== "artist";
                      setPaymentsEnabled(newPayments);
                      updateData.payments_enabled = newPayments;
                    }
                    const { data: { user } } = await supabase.auth.getUser();
                    if (user) {
                      await supabase.from("user_defaults").upsert(
                        { user_id: user.id, ...updateData },
                        { onConflict: "user_id" },
                      );
                      router.refresh();
                    }
                  }}
                  className="accent-[var(--signal)]"
                />
                <span className="text-sm text-text group-hover:text-text/80 transition-colors">
                  {opt.label}
                </span>
              </label>
            ))}
            <p className="text-xs text-muted pt-1">
              {t("persona.note")}
            </p>
          </PanelBody>
        </Panel>

        {/* Payment Tracking */}
        <Panel>
          <PanelHeader>
            <h2 className="text-base font-semibold text-text">{t("paymentTracking.title")}</h2>
            <p className="text-sm text-muted mt-1">
              {t("paymentTracking.description")}
            </p>
          </PanelHeader>
          <Rule />
          <PanelBody className="pt-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-text">{t("paymentTracking.enable")}</div>
                <div className="text-xs text-muted mt-0.5">{t("paymentTracking.enableHelp")}</div>
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
                      { user_id: user.id, payments_enabled: next, payments_manually_set: true },
                      { onConflict: "user_id" },
                    );
                    if (error) throw error;
                    setPaymentsManuallySet(true);
                    router.refresh();
                  } catch {
                    setPaymentsEnabled(prev);
                  }
                }}
                role="switch"
                aria-checked={paymentsEnabled}
                aria-label="Enable payments"
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
            {paymentsEnabled && (
              <div>
                <label className="text-sm font-medium text-text">Default hourly rate</label>
                <p className="text-xs text-muted mt-0.5 mb-2">Pre-fills the rate when logging time on releases</p>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={defaultHourlyRate}
                    onChange={(e) => setDefaultHourlyRate(e.target.value)}
                    className="input text-sm h-9 w-32"
                    placeholder="0.00"
                    onBlur={async () => {
                      const parsed = defaultHourlyRate.trim() ? parseFloat(defaultHourlyRate) : null;
                      if (defaultHourlyRate.trim() && (isNaN(parsed!) || parsed! < 0)) return;
                      try {
                        const { data: { user } } = await supabase.auth.getUser();
                        if (!user) return;
                        await supabase.from("user_defaults").upsert(
                          { user_id: user.id, default_hourly_rate: parsed },
                          { onConflict: "user_id" },
                        );
                      } catch {
                        // fail silently
                      }
                    }}
                  />
                  <span className="text-sm text-muted">/hr</span>
                </div>
              </div>
            )}
          </PanelBody>
        </Panel>

        {/* Email Notifications */}
        <EmailPreferencesPanel />

        {/* Integrations */}
        <IntegrationsPanel />

        {/* Mix Defaults */}
        <Panel>
          <PanelHeader>
            <h2 className="text-base font-semibold text-text">{t("mixDefaults.title")}</h2>
            <p className="text-sm text-muted mt-1">
              {t("mixDefaults.description")}
            </p>
          </PanelHeader>
          <Rule />
          <PanelBody className="pt-5 space-y-6">
            <div className="space-y-1.5">
              <label className="label text-muted">{t("mixDefaults.format")}</label>
              <div className="flex gap-2">
                {formatOptions.map((opt) => (
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
              <label htmlFor="settings-sample-rate" className="label text-muted">{t("mixDefaults.sampleRate")}</label>
              <select
                id="settings-sample-rate"
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
              <label htmlFor="settings-bit-depth" className="label text-muted">{t("mixDefaults.bitDepth")}</label>
              <select
                id="settings-bit-depth"
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
              <label className="label text-muted">{t("mixDefaults.elementList")}</label>
              <TagInput
                value={defaultElements}
                onChange={setDefaultElements}
                placeholder={t("mixDefaults.elementListPlaceholder")}
              />
            </div>

            <Button variant="primary" onClick={handleSave}>
              {t("mixDefaults.save")}
            </Button>
          </PanelBody>
        </Panel>

        {/* Calendar Subscription */}
        <CalendarPanel />

        {/* Your Data */}
        <Panel>
          <PanelHeader>
            <h2 className="text-base font-semibold text-text">{t("data.title")}</h2>
            <p className="text-sm text-muted mt-1">
              {t("data.description")}
            </p>
          </PanelHeader>
          <Rule />
          <PanelBody className="pt-5">
            <ExportDataButton />
          </PanelBody>
        </Panel>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Email Preferences Panel                                             */
/* ------------------------------------------------------------------ */

type EmailPrefKey =
  | "release_live"
  | "new_comment"
  | "client_feedback"
  | "payment_reminder"
  | "payment_received"
  | "weekly_digest"
  | "subscription_confirmed"
  | "subscription_cancelled";

const EMAIL_PREF_ITEMS: { key: EmailPrefKey; labelKey: string; helpKey: string }[] = [
  { key: "release_live", labelKey: "releaseLive", helpKey: "releaseLiveHelp" },
  { key: "new_comment", labelKey: "newComment", helpKey: "newCommentHelp" },
  { key: "client_feedback", labelKey: "clientFeedback", helpKey: "clientFeedbackHelp" },
  { key: "weekly_digest", labelKey: "weeklyDigest", helpKey: "weeklyDigestHelp" },
  { key: "payment_reminder", labelKey: "paymentReminder", helpKey: "paymentReminderHelp" },
  { key: "payment_received", labelKey: "paymentReceived", helpKey: "paymentReceivedHelp" },
  { key: "subscription_confirmed", labelKey: "subscriptionConfirmed", helpKey: "subscriptionConfirmedHelp" },
  { key: "subscription_cancelled", labelKey: "subscriptionCancelled", helpKey: "subscriptionCancelledHelp" },
];

function EmailPreferencesPanel() {
  const t = useTranslations("settings.emailNotifications");
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [prefs, setPrefs] = useState<Record<EmailPrefKey, boolean>>({
    release_live: true,
    new_comment: true,
    client_feedback: true,
    payment_reminder: true,
    payment_received: true,
    weekly_digest: true,
    subscription_confirmed: true,
    subscription_cancelled: true,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      const { data } = await supabase
        .from("email_preferences")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (data) {
        setPrefs({
          release_live: data.release_live ?? true,
          new_comment: data.new_comment ?? true,
          client_feedback: data.client_feedback ?? true,
          payment_reminder: data.payment_reminder ?? true,
          payment_received: data.payment_received ?? true,
          weekly_digest: data.weekly_digest ?? true,
          subscription_confirmed: data.subscription_confirmed ?? true,
          subscription_cancelled: data.subscription_cancelled ?? true,
        });
      }
      setLoading(false);
    }
    load();
  }, [supabase]);

  async function handleToggle(key: EmailPrefKey) {
    const prev = prefs[key];
    const next = !prev;
    setPrefs((p) => ({ ...p, [key]: next }));

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("email_preferences")
        .upsert(
          { user_id: user.id, [key]: next },
          { onConflict: "user_id" },
        );

      if (error) throw error;
    } catch {
      // Revert on failure
      setPrefs((p) => ({ ...p, [key]: prev }));
    }
  }

  if (loading) return null;

  return (
    <Panel>
      <PanelHeader>
        <div className="flex items-center gap-2">
          <Mail size={18} className="text-muted" />
          <h2 className="text-base font-semibold text-text">{t("title")}</h2>
        </div>
        <p className="text-sm text-muted mt-1">{t("description")}</p>
      </PanelHeader>
      <Rule />
      <PanelBody className="pt-5 space-y-1">
        {EMAIL_PREF_ITEMS.map((item) => (
          <div key={item.key} className="flex items-center justify-between py-2.5">
            <div>
              <div className="text-sm font-medium text-text">{t(item.labelKey)}</div>
              <div className="text-xs text-muted mt-0.5">{t(item.helpKey)}</div>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={prefs[item.key]}
              aria-label={t(item.labelKey)}
              onClick={() => handleToggle(item.key)}
              className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
                prefs[item.key] ? "bg-signal" : "bg-black/20 dark:bg-white/20"
              }`}
            >
              <span
                className="inline-block h-5 w-5 rounded-full bg-white shadow transition-transform"
                style={{ transform: prefs[item.key] ? "translateX(22px)" : "translateX(3px)" }}
              />
            </button>
          </div>
        ))}
      </PanelBody>
    </Panel>
  );
}

/* ------------------------------------------------------------------ */
/*  Subscription Panel                                                 */
/* ------------------------------------------------------------------ */

function SubscriptionPanel() {
  const t = useTranslations("settings.subscription");
  const tc = useTranslations("common");
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
        <h2 className="text-base font-semibold text-text">{t("title")}</h2>
        <p className="text-sm text-muted mt-1">
          {t("description")}
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
                {isPro ? t("pro") : t("free")}
                {isAdminGranted && (
                  <span className="ml-1.5 text-xs font-medium text-signal">{t("complimentary")}</span>
                )}
              </div>
              <div className="text-xs text-muted mt-0.5">
                {isPro
                  ? isAdminGranted
                    ? t("unlimitedReleases")
                    : t("proPrice")
                  : t("freeLimit")}
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
            {t("cancelNote", {
              date: new Date(sub.currentPeriodEnd).toLocaleDateString(undefined, {
                month: "long",
                day: "numeric",
                year: "numeric",
              }),
            })}
          </div>
        )}

        {/* Actions */}
        {!isPro && (
          <Button variant="primary" onClick={handleUpgrade} disabled={upgrading}>
            <Sparkles size={16} />
            {upgrading ? tc("redirecting") : t("upgradeToPro")}
          </Button>
        )}

        {isPro && !isAdminGranted && (
          <Button variant="secondary" onClick={handleManageBilling} disabled={managingBilling}>
            <CreditCard size={16} />
            {managingBilling ? tc("redirecting") : t("manageBilling")}
          </Button>
        )}
      </PanelBody>
    </Panel>
  );
}

/* ------------------------------------------------------------------ */
/*  Calendar Subscription Panel                                         */
/* ------------------------------------------------------------------ */

function CalendarPanel() {
  const t = useTranslations("settings.calendar");
  const tc = useTranslations("common");
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [feedToken, setFeedToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const feedUrl = feedToken
    ? `${window.location.origin}/api/calendar/feed/${feedToken}`
    : null;

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from("user_defaults")
          .select("calendar_feed_token")
          .eq("user_id", user.id)
          .maybeSingle();
        setFeedToken(data?.calendar_feed_token ?? null);
      }
      setLoading(false);
    }
    load();
  }, [supabase]);

  async function handleGenerate() {
    setGenerating(true);
    try {
      const res = await fetch("/api/calendar/generate-token", { method: "POST" });
      const data = await res.json();
      if (data.token) {
        setFeedToken(data.token);
      }
    } finally {
      setGenerating(false);
    }
  }

  async function handleCopy() {
    if (!feedUrl) return;
    try {
      await navigator.clipboard.writeText(feedUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API may fail without user gesture or in insecure contexts
    }
  }

  if (loading) return null;

  return (
    <Panel>
      <PanelHeader>
        <h2 className="text-base font-semibold text-text">{t("title")}</h2>
        <p className="text-sm text-muted mt-1">{t("description")}</p>
      </PanelHeader>
      <Rule />
      <PanelBody className="pt-5 space-y-4">
        {feedUrl ? (
          <>
            <div className="space-y-1.5">
              <label className="label text-muted">{t("feedUrl")}</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  aria-label="Calendar feed URL"
                  value={feedUrl}
                  className="input flex-1 text-xs"
                  onClick={(e) => (e.target as HTMLInputElement).select()}
                />
                <Button variant="secondary" className="px-3 shrink-0" onClick={handleCopy}>
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                </Button>
              </div>
            </div>

            <div className="rounded-lg px-3 py-2 space-y-1.5" style={{ background: "var(--panel2)" }}>
              <p className="text-xs font-medium text-text">{t("setupTitle")}</p>
              <ul className="text-xs text-muted space-y-1 list-disc list-inside">
                <li>{t("setupGoogle")}</li>
                <li>{t("setupApple")}</li>
                <li>{t("setupOutlook")}</li>
              </ul>
            </div>

            <Button variant="secondary" onClick={handleGenerate} disabled={generating}>
              <RefreshCw size={14} />
              {generating ? tc("saving") : t("regenerate")}
            </Button>
            <p className="text-xs text-muted">{t("regenerateWarning")}</p>
          </>
        ) : (
          <Button variant="primary" onClick={handleGenerate} disabled={generating}>
            <CalendarDays size={16} />
            {generating ? tc("saving") : t("enableFeed")}
          </Button>
        )}
      </PanelBody>
    </Panel>
  );
}

/* ------------------------------------------------------------------ */
/*  Integrations Panel                                                  */
/* ------------------------------------------------------------------ */

const PROVIDER_DISPLAY: Record<string, { icon: React.ElementType; nameKey: string }> = {
  google_drive: { icon: HardDrive, nameKey: "googleDrive" },
  dropbox: { icon: Cloud, nameKey: "dropbox" },
};

type IntegrationItem = {
  id: string;
  provider: string;
  provider_email: string | null;
};

function IntegrationsPanel() {
  const t = useTranslations("settings.integrations");
  const [integrations, setIntegrations] = useState<IntegrationItem[]>([]);
  const [availableProviders, setAvailableProviders] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState<string | null>(null);
  const [disconnecting, setDisconnecting] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/integrations");
        if (res.ok) {
          const data = await res.json();
          setIntegrations(data.integrations ?? []);
          setAvailableProviders(data.availableProviders ?? []);
        }
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Check URL params for connection result
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const result = params.get("integration");
    if (result === "connected") {
      // Refresh the list
      fetch("/api/integrations")
        .then((res) => res.json())
        .then((data) => {
          setIntegrations(data.integrations ?? []);
          setAvailableProviders(data.availableProviders ?? []);
        });
      // Clean URL
      const url = new URL(window.location.href);
      url.searchParams.delete("integration");
      url.searchParams.delete("provider");
      window.history.replaceState({}, "", url.toString());
    } else if (result === "error") {
      const url = new URL(window.location.href);
      url.searchParams.delete("integration");
      url.searchParams.delete("message");
      window.history.replaceState({}, "", url.toString());
    }
  }, []);

  async function handleConnect(provider: string) {
    setConnecting(provider);
    try {
      const res = await fetch(`/api/integrations/${provider}/connect`, {
        method: "POST",
      });
      const data = await res.json();
      if (data.authUrl) {
        window.location.href = data.authUrl;
      }
    } finally {
      setConnecting(null);
    }
  }

  async function handleDisconnect(id: string, provider: string) {
    if (!confirm(t("disconnectConfirm", { provider: PROVIDER_DISPLAY[provider]?.nameKey ? t(`providers.${PROVIDER_DISPLAY[provider].nameKey}`) : provider }))) {
      return;
    }
    setDisconnecting(id);
    try {
      const res = await fetch(`/api/integrations/disconnect/${id}`, { method: "DELETE" });
      if (res.ok) {
        setIntegrations((prev) => prev.filter((i) => i.id !== id));
      }
    } finally {
      setDisconnecting(null);
    }
  }

  if (loading) return null;
  if (availableProviders.length === 0) return null;

  const connectedMap = new Map(
    integrations.map((i) => [i.provider, i]),
  );

  return (
    <Panel>
      <PanelHeader>
        <h2 className="text-base font-semibold text-text">{t("title")}</h2>
        <p className="text-sm text-muted mt-1">{t("description")}</p>
      </PanelHeader>
      <Rule />
      <PanelBody className="pt-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {availableProviders.map((provider) => {
            const display = PROVIDER_DISPLAY[provider];
            if (!display) return null;
            const Icon = display.icon;
            const connected = connectedMap.get(provider);
            const isConnecting = connecting === provider;
            const isDisconnecting = disconnecting === connected?.id;

            return (
              <div
                key={provider}
                className="rounded-lg border border-border p-4 flex flex-col gap-3"
                style={{ background: "var(--panel-2)" }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: "var(--panel)" }}
                  >
                    <Icon size={18} className="text-text" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-text">
                      {t(`providers.${display.nameKey}`)}
                    </div>
                    <div className="text-xs text-muted truncate">
                      {connected
                        ? t("connected", { email: connected.provider_email ?? "" })
                        : t("notConnected")}
                    </div>
                  </div>
                </div>
                {connected ? (
                  <button
                    type="button"
                    onClick={() => handleDisconnect(connected.id, provider)}
                    disabled={isDisconnecting}
                    className="flex items-center justify-center gap-1.5 text-xs font-medium text-red-500 hover:text-red-400 transition-colors py-1.5 rounded-md"
                    style={{ background: "var(--panel)" }}
                  >
                    <Unplug size={12} />
                    {isDisconnecting ? t("disconnecting") : t("disconnect")}
                  </button>
                ) : (
                  <Button
                    variant="primary"
                    className="text-xs h-8"
                    onClick={() => handleConnect(provider)}
                    disabled={isConnecting}
                  >
                    {isConnecting ? t("connecting") : t("connect")}
                  </Button>
                )}
              </div>
            );
          })}
        </div>
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
  const t = useTranslations("settings.data");
  const tc = useTranslations("common");
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
          {loading ? tc("calculating") : t("exportButton")}
        </Button>
      ) : (
        <div className="space-y-3">
          <div className="rounded-lg bg-panel-2 border border-border p-4">
            <p className="text-sm text-text">
              {t("exportSize", { size: formatBytes(totalBytes) })}
            </p>
            <p className="text-xs text-muted mt-1">
              {t("exportSummary", {
                releaseCount: estimate.releaseCount,
                trackCount: estimate.trackCount,
                audioFileCount: estimate.audioFileCount,
              })}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="primary" onClick={handleDownload} disabled={exporting}>
              <Download size={16} />
              {exporting ? tc("downloading") : t("download")}
            </Button>
            {!exporting && (
              <Button variant="secondary" onClick={() => setEstimate(null)}>
                {tc("cancel")}
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
