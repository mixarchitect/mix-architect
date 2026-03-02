"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabaseBrowserClient";
import { Panel, PanelBody, PanelHeader } from "@/components/ui/panel";
import { Button } from "@/components/ui/button";
import { Rule } from "@/components/ui/rule";
import { TagInput } from "@/components/ui/tag-input";
import { ArrowLeft, Sparkles, LayoutTemplate, Star, ArrowRight } from "lucide-react";
import { useSubscription } from "@/lib/subscription-context";
import { cn } from "@/lib/cn";
import type { ReleaseTemplate } from "@/types/template";

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const TYPE_OPTIONS = [
  { value: "single", label: "Single" },
  { value: "ep", label: "EP" },
  { value: "album", label: "Album" },
];

const FORMAT_OPTIONS = [
  { value: "stereo", label: "Stereo" },
  { value: "atmos", label: "Dolby Atmos" },
  { value: "both", label: "Stereo + Atmos" },
];

const GENRE_SUGGESTIONS = [
  "Rock", "Pop", "Hip-Hop", "R&B", "Electronic", "Country", "Jazz",
  "Classical", "Indie", "Alternative", "Metal", "Folk", "Soul", "Funk",
  "Blues", "Reggae", "Latin", "Punk", "Lo-Fi", "Ambient",
];

/* ------------------------------------------------------------------ */
/*  PillSelect                                                         */
/* ------------------------------------------------------------------ */

function PillSelect({
  options,
  value,
  onChange,
}: {
  options: { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex gap-2 flex-wrap">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className="px-4 py-2 text-sm font-medium rounded-md transition-colors"
          style={
            value === opt.value
              ? { background: "var(--signal)", color: "var(--signal-on)" }
              : { background: "var(--panel2)", color: "var(--text-muted)" }
          }
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Template Picker Mini Card                                          */
/* ------------------------------------------------------------------ */

function TemplateMiniCard({
  template,
  selected,
  onClick,
}: {
  template: ReleaseTemplate;
  selected: boolean;
  onClick: () => void;
}) {
  const specParts = [
    template.default_loudness,
    template.default_sample_rate,
    template.default_bit_depth,
    template.delivery_formats.length > 0 && template.delivery_formats.join(", "),
  ].filter(Boolean);

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "text-left p-3 rounded-lg border transition-all",
        selected
          ? "border-signal bg-signal/5 ring-1 ring-signal"
          : "border-border bg-panel hover:border-border-strong",
      )}
    >
      <div className="flex items-center gap-1.5">
        <span className="text-sm font-medium text-text truncate">
          {template.name}
        </span>
        {template.is_default && (
          <Star size={10} className="text-signal fill-current shrink-0" />
        )}
      </div>
      {specParts.length > 0 && (
        <div className="mt-1 text-[11px] text-muted truncate">
          {specParts.join(" \u00B7 ")}
        </div>
      )}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function NewReleasePage() {
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [releaseType, setReleaseType] = useState("single");
  const [format, setFormat] = useState("stereo");
  const [genreTags, setGenreTags] = useState<string[]>([]);
  const [targetDate, setTargetDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [upgrading, setUpgrading] = useState(false);

  // Template picker state
  const [templates, setTemplates] = useState<ReleaseTemplate[]>([]);
  const [templatesLoading, setTemplatesLoading] = useState(true);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const router = useRouter();
  const supabase = createSupabaseBrowserClient();
  const sub = useSubscription();
  const isFree = sub.plan !== "pro" || (sub.status !== "active" && sub.status !== "trialing");

  // Fetch templates on mount
  useEffect(() => {
    async function loadTemplates() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setTemplatesLoading(false);
        setShowForm(true);
        return;
      }

      const { data } = await supabase
        .from("release_templates")
        .select("*")
        .eq("user_id", user.id)
        .order("usage_count", { ascending: false })
        .order("updated_at", { ascending: false });

      const tpls = (data ?? []) as ReleaseTemplate[];
      setTemplates(tpls);
      setTemplatesLoading(false);

      // If no templates, skip straight to form
      if (tpls.length === 0) {
        setShowForm(true);
        return;
      }

      // Auto-select the default template
      const defaultTpl = tpls.find((t) => t.is_default);
      if (defaultTpl) {
        setSelectedTemplateId(defaultTpl.id);
      }
    }
    loadTemplates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Apply template to form state
  function applyTemplate(template: ReleaseTemplate) {
    if (template.release_type) setReleaseType(template.release_type);
    if (template.format) setFormat(template.format);
    if (template.genre_tags.length > 0) setGenreTags(template.genre_tags);
    if (template.client_name) setArtist(template.client_name);
  }

  function handlePickTemplate() {
    const tpl = templates.find((t) => t.id === selectedTemplateId);
    if (tpl) applyTemplate(tpl);
    setShowForm(true);
  }

  function handleStartFromScratch() {
    setSelectedTemplateId(null);
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const {
        data: { user },
        error: userErr,
      } = await supabase.auth.getUser();
      if (userErr || !user) throw userErr ?? new Error("Not authenticated");

      // Check release limit on free plan
      const { data: canCreate } = await supabase.rpc("can_create_release", {
        p_user_id: user.id,
      });
      if (canCreate === false) {
        setError(
          "You\u2019ve reached the release limit on the Free plan. Upgrade to Pro for unlimited releases.",
        );
        setLoading(false);
        return;
      }

      // Find the selected template for metadata
      const selectedTemplate = templates.find((t) => t.id === selectedTemplateId);

      const { data: release, error: insertErr } = await supabase
        .from("releases")
        .insert({
          user_id: user.id,
          title,
          artist: artist || null,
          release_type: releaseType,
          format,
          genre_tags: genreTags,
          target_date: targetDate || null,
          template_id: selectedTemplate?.id ?? null,
          template_name: selectedTemplate?.name ?? null,
        })
        .select()
        .single();

      if (insertErr) throw insertErr;

      // Bump template usage count
      if (selectedTemplate) {
        supabase
          .from("release_templates")
          .update({
            usage_count: selectedTemplate.usage_count + 1,
            last_used_at: new Date().toISOString(),
          })
          .eq("id", selectedTemplate.id)
          .then(); // fire and forget
      }

      if (releaseType === "single") {
        const { data: track } = await supabase
          .from("tracks")
          .insert({ release_id: release.id, track_number: 1, title })
          .select()
          .single();

        if (track) {
          // If template has spec defaults, apply them
          const specDefaults: Record<string, unknown> = { track_id: track.id };
          if (selectedTemplate?.default_sample_rate)
            specDefaults.sample_rate = selectedTemplate.default_sample_rate;
          if (selectedTemplate?.default_bit_depth)
            specDefaults.bit_depth = selectedTemplate.default_bit_depth;
          if (selectedTemplate?.default_loudness)
            specDefaults.target_loudness = selectedTemplate.default_loudness;
          if (selectedTemplate?.delivery_formats?.length)
            specDefaults.delivery_formats = selectedTemplate.delivery_formats;
          if (selectedTemplate?.default_special_reqs)
            specDefaults.special_reqs = selectedTemplate.default_special_reqs;

          const intentDefaults: Record<string, unknown> = { track_id: track.id };
          if (selectedTemplate?.default_emotional_tags?.length)
            intentDefaults.emotional_tags = selectedTemplate.default_emotional_tags;

          await Promise.all([
            supabase.from("track_intent").insert(intentDefaults),
            supabase.from("track_specs").insert(specDefaults),
          ]);
        }
      }

      router.push(`/app/releases/${release.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <Link
          href="/app"
          className="text-sm text-muted hover:text-text transition-colors flex items-center gap-1"
        >
          <ArrowLeft size={14} />
          Back to Releases
        </Link>
      </div>

      {isFree && (
        <div
          className="flex items-center gap-3 px-4 py-3 rounded-lg mb-4 text-sm"
          style={{ background: "var(--panel-2)" }}
        >
          <Sparkles size={16} className="text-signal shrink-0" />
          <span className="text-muted">
            Free plan includes 1 release.{" "}
            <button
              type="button"
              onClick={async () => {
                setUpgrading(true);
                try {
                  const res = await fetch("/api/stripe/checkout", { method: "POST" });
                  const data = await res.json();
                  if (data.url) window.location.href = data.url;
                  else setUpgrading(false);
                } catch {
                  setUpgrading(false);
                }
              }}
              disabled={upgrading}
              className="text-signal font-semibold hover:underline"
            >
              {upgrading ? "Redirecting\u2026" : "Upgrade to Pro"}
            </button>
            {" "}for unlimited releases.
          </span>
        </div>
      )}

      {/* ── Template Picker Step ── */}
      {!showForm && !templatesLoading && templates.length > 0 && (
        <Panel>
          <PanelHeader>
            <div className="flex items-center gap-2">
              <LayoutTemplate size={20} className="text-signal" />
              <h2 className="text-lg font-semibold text-text">
                Start from a template
              </h2>
            </div>
            <p className="mt-1 text-sm text-muted">
              Pre-fill your release settings, or start from scratch.
            </p>
          </PanelHeader>
          <Rule />
          <PanelBody className="pt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
              {templates.map((t) => (
                <TemplateMiniCard
                  key={t.id}
                  template={t}
                  selected={selectedTemplateId === t.id}
                  onClick={() =>
                    setSelectedTemplateId(
                      selectedTemplateId === t.id ? null : t.id,
                    )
                  }
                />
              ))}
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="primary"
                disabled={!selectedTemplateId}
                onClick={handlePickTemplate}
              >
                Use Template
                <ArrowRight size={14} className="ml-1.5" />
              </Button>
              <button
                type="button"
                onClick={handleStartFromScratch}
                className="text-sm text-muted hover:text-text transition-colors"
              >
                Start from scratch
              </button>
            </div>
          </PanelBody>
        </Panel>
      )}

      {/* ── Release Form ── */}
      {showForm && (
        <Panel>
          <PanelHeader>
            <h1 className="text-2xl font-semibold h2 text-text">New Release</h1>
            <p className="mt-1 text-sm text-muted">
              Set up your project &mdash; you can always edit these details later.
            </p>
          </PanelHeader>
          <Rule />
          <PanelBody className="pt-5">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-1.5">
                <label className="label text-muted">Release title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="input"
                  placeholder="Midnight Drive EP"
                />
              </div>

              <div className="space-y-1.5">
                <label className="label text-muted">Artist / Client</label>
                <input
                  type="text"
                  value={artist}
                  onChange={(e) => setArtist(e.target.value)}
                  className="input"
                  placeholder="Artist or client name"
                />
              </div>

              <div className="space-y-1.5">
                <label className="label text-muted">Release type</label>
                <PillSelect
                  options={TYPE_OPTIONS}
                  value={releaseType}
                  onChange={setReleaseType}
                />
              </div>

              <div className="space-y-1.5">
                <label className="label text-muted">Format</label>
                <PillSelect
                  options={FORMAT_OPTIONS}
                  value={format}
                  onChange={setFormat}
                />
              </div>

              <div className="space-y-1.5">
                <label className="label text-muted">Genre tags</label>
                <TagInput
                  value={genreTags}
                  onChange={setGenreTags}
                  suggestions={GENRE_SUGGESTIONS}
                  placeholder="Type and press Enter to add"
                />
              </div>

              <div className="space-y-1.5">
                <label className="label text-muted">Target release date</label>
                <input
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="input"
                />
              </div>

              {error && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800">
                  {error}
                </p>
              )}

              <div className="flex items-center gap-3 pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  disabled={loading || !title.trim()}
                >
                  {loading ? "Creating\u2026" : "Create Release"}
                </Button>
                {templates.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="text-sm text-muted hover:text-text transition-colors"
                  >
                    Change template
                  </button>
                )}
              </div>
            </form>
          </PanelBody>
        </Panel>
      )}
    </div>
  );
}
