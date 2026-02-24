"use client";

import { useState, useEffect, useMemo } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabaseBrowserClient";
import { Panel, PanelBody, PanelHeader } from "@/components/ui/panel";
import { Button } from "@/components/ui/button";
import { Rule } from "@/components/ui/rule";
import { TagInput } from "@/components/ui/tag-input";
import { AutoSaveIndicator } from "@/components/ui/auto-save-indicator";

const FORMAT_OPTIONS = [
  { value: "stereo", label: "Stereo" },
  { value: "atmos", label: "Dolby Atmos" },
  { value: "both", label: "Stereo + Atmos" },
];

export default function SettingsPage() {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);

  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<
    "idle" | "saving" | "saved" | "error"
  >("idle");

  const [displayName, setDisplayName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [loudness, setLoudness] = useState("-14 LUFS");
  const [format, setFormat] = useState("stereo");
  const [sampleRate, setSampleRate] = useState("48kHz");
  const [bitDepth, setBitDepth] = useState("24-bit");
  const [defaultElements, setDefaultElements] = useState<string[]>([
    "Kick", "Snare", "Bass", "Guitars", "Keys/Synths",
    "Lead Vocal", "BGVs", "FX/Ear Candy",
  ]);
  const [paymentsEnabled, setPaymentsEnabled] = useState(false);

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
          setLoudness(data.default_loudness ?? "-14 LUFS");
          setFormat(data.default_format ?? "stereo");
          setSampleRate(data.default_sample_rate ?? "48kHz");
          setBitDepth(data.default_bit_depth ?? "24-bit");
          setDefaultElements(data.default_elements ?? []);
          setPaymentsEnabled(data.payments_enabled ?? false);
          setCompanyName(data.company_name ?? "");
        }
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
          default_loudness: loudness,
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
    <div className="max-w-xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold h2 text-text">Settings</h1>
        <AutoSaveIndicator status={saveStatus} />
      </div>

      <div className="space-y-6">
        {/* Profile */}
        <Panel>
          <PanelHeader>
            <h2 className="text-base font-semibold text-text">Profile</h2>
          </PanelHeader>
          <Rule />
          <PanelBody className="pt-5 space-y-4">
            <div className="space-y-1.5">
              <label className="label text-faint">Display name</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="input"
                placeholder="Your name"
              />
            </div>
            <div className="space-y-1.5">
              <label className="label text-faint">Company name (optional)</label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="input"
                placeholder="Studio or business name"
              />
            </div>
            <div className="space-y-1.5">
              <label className="label text-faint">Email</label>
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
          <PanelBody className="pt-5 space-y-5">
            <div className="space-y-1.5">
              <label className="label text-faint">Default target loudness</label>
              <select
                value={loudness}
                onChange={(e) => setLoudness(e.target.value)}
                className="input"
              >
                <option value="-14 LUFS">-14 LUFS — Spotify / YouTube</option>
                <option value="-16 LUFS">-16 LUFS — Apple Music / Tidal</option>
                <option value="-12 LUFS">-12 LUFS — Louder master</option>
                <option value="-11 LUFS">-11 LUFS — Club / DJ</option>
                <option value="-9 LUFS">-9 LUFS — Competitive / radio</option>
                <option value="-23 LUFS">-23 LUFS — Broadcast (EBU R128)</option>
                <option value="-24 LUFS">-24 LUFS — Broadcast (ATSC A/85)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="label text-faint">Default format</label>
              <div className="flex gap-2">
                {FORMAT_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setFormat(opt.value)}
                    className="px-4 py-2 text-sm font-medium rounded-md transition-colors"
                    style={
                      format === opt.value
                        ? { background: "var(--signal)", color: "#fff" }
                        : { background: "var(--panel2)", color: "var(--text-muted)" }
                    }
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="label text-faint">Default sample rate</label>
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
              <label className="label text-faint">Default bit depth</label>
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
              <label className="label text-faint">Default element list</label>
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
                  } catch {
                    setPaymentsEnabled(prev);
                  }
                }}
                className="relative inline-flex h-7 w-12 items-center rounded-full transition-colors"
                style={{ background: paymentsEnabled ? "var(--signal)" : "#ccc" }}
              >
                <span
                  className="inline-block h-5 w-5 rounded-full bg-white shadow transition-transform"
                  style={{ transform: paymentsEnabled ? "translateX(22px)" : "translateX(3px)" }}
                />
              </button>
            </div>
          </PanelBody>
        </Panel>
      </div>
    </div>
  );
}
