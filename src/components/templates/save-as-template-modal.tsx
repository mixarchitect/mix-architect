"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabaseBrowserClient";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { X, LayoutTemplate } from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type Props = {
  releaseId: string;
  releaseTitle: string;
  onClose: () => void;
};

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function SaveAsTemplateModal({ releaseId, releaseTitle, onClose }: Props) {
  const [name, setName] = useState(`${releaseTitle} Template`);
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Section toggles (all checked by default)
  const [includeReleaseSettings, setIncludeReleaseSettings] = useState(true);
  const [includeTechSpecs, setIncludeTechSpecs] = useState(true);
  const [includeIntent, setIncludeIntent] = useState(true);
  const [includeDistribution, setIncludeDistribution] = useState(true);
  const [includeClient, setIncludeClient] = useState(true);

  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { toast } = useToast();

  // Auto-focus name input on mount
  useEffect(() => {
    inputRef.current?.select();
  }, []);

  // Close on Escape
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  async function handleSave() {
    if (!name.trim()) return;
    setSaving(true);
    setError(null);

    const supabase = createSupabaseBrowserClient();

    try {
      const {
        data: { user },
        error: userErr,
      } = await supabase.auth.getUser();
      if (userErr || !user) throw userErr ?? new Error("Not authenticated");

      // Soft cap: 50 templates per user
      const { count } = await supabase
        .from("release_templates")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id);
      if (count !== null && count >= 50) {
        setError("You've reached the template limit (50). Delete an existing template first.");
        setSaving(false);
        return;
      }

      // Fetch release data
      const { data: release, error: releaseErr } = await supabase
        .from("releases")
        .select("*")
        .eq("id", releaseId)
        .single();
      if (releaseErr || !release) throw releaseErr ?? new Error("Release not found");

      // Fetch first track's specs and intent
      const { data: tracks } = await supabase
        .from("tracks")
        .select("id")
        .eq("release_id", releaseId)
        .order("track_number")
        .limit(1);

      let trackSpecs: Record<string, unknown> | null = null;
      let trackIntent: Record<string, unknown> | null = null;

      if (tracks && tracks.length > 0) {
        const [specsRes, intentRes] = await Promise.all([
          supabase
            .from("track_specs")
            .select("*")
            .eq("track_id", tracks[0].id)
            .maybeSingle(),
          supabase
            .from("track_intent")
            .select("*")
            .eq("track_id", tracks[0].id)
            .maybeSingle(),
        ]);
        trackSpecs = specsRes.data;
        trackIntent = intentRes.data;
      }

      // Build template from release + track data
      const templateData: Record<string, unknown> = {
        user_id: user.id,
        name: name.trim(),
        description: description.trim() || null,
        release_type: null,
        format: null,
        genre_tags: [],
        default_loudness: null,
        default_sample_rate: null,
        default_bit_depth: null,
        delivery_formats: [],
        default_special_reqs: null,
        default_emotional_tags: [],
        distribution_fields: {},
        client_name: null,
        client_email: null,
        is_default: false,
      };

      if (includeReleaseSettings) {
        templateData.release_type = release.release_type ?? null;
        templateData.format = release.format ?? null;
        templateData.genre_tags = release.genre_tags ?? [];
      }

      if (includeTechSpecs && trackSpecs) {
        templateData.default_sample_rate = trackSpecs.sample_rate ?? null;
        templateData.default_bit_depth = trackSpecs.bit_depth ?? null;
        templateData.default_loudness = trackSpecs.target_loudness ?? null;
        templateData.delivery_formats = trackSpecs.delivery_formats ?? [];
        templateData.default_special_reqs = trackSpecs.special_reqs ?? null;
      }

      if (includeIntent && trackIntent) {
        templateData.default_emotional_tags = trackIntent.emotional_tags ?? [];
      }

      if (includeDistribution) {
        const distFields: Record<string, unknown> = {};
        if (release.distributor) distFields.distributor = release.distributor;
        if (release.record_label) distFields.record_label = release.record_label;
        if (release.copyright_holder) distFields.copyright_holder = release.copyright_holder;
        if (release.copyright_year) distFields.copyright_year = release.copyright_year;
        if (release.phonogram_copyright) distFields.phonogram_copyright = release.phonogram_copyright;
        templateData.distribution_fields = distFields;
      }

      if (includeClient) {
        templateData.client_name = release.client_name ?? null;
        templateData.client_email = release.client_email ?? null;
      }

      const { error: insertErr } = await supabase
        .from("release_templates")
        .insert(templateData);

      if (insertErr) throw insertErr;

      toast("Template created", { variant: "success" });
      onClose();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create template");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Dialog */}
      <div
        className="fixed inset-0 z-50 flex items-start justify-center pt-[min(20vh,160px)] px-4"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <div
          className="w-full max-w-md rounded-xl border border-border shadow-2xl"
          style={{ background: "var(--panel)" }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <div className="flex items-center gap-2">
              <LayoutTemplate size={18} className="text-signal" />
              <h2 className="text-base font-semibold text-text">
                Save as Template
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-7 h-7 grid place-items-center rounded-md text-faint hover:text-text hover:bg-panel2 transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          {/* Body */}
          <div className="px-5 py-4 space-y-4">
            {/* Name */}
            <div className="space-y-1.5">
              <label className="label text-muted text-xs">Template name *</label>
              <input
                ref={inputRef}
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input"
                placeholder="My Template"
              />
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="label text-muted text-xs">Description</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="input"
                placeholder="Optional description"
              />
            </div>

            {/* Section toggles */}
            <div className="space-y-1.5">
              <label className="label text-muted text-xs">Include sections</label>
              <div className="space-y-2">
                <Checkbox
                  label="Release settings"
                  detail="Type, format, genre tags"
                  checked={includeReleaseSettings}
                  onChange={setIncludeReleaseSettings}
                />
                <Checkbox
                  label="Technical specs"
                  detail="Sample rate, bit depth, loudness, delivery formats"
                  checked={includeTechSpecs}
                  onChange={setIncludeTechSpecs}
                />
                <Checkbox
                  label="Intent defaults"
                  detail="Emotional tags"
                  checked={includeIntent}
                  onChange={setIncludeIntent}
                />
                <Checkbox
                  label="Distribution metadata"
                  detail="Distributor, label, copyright"
                  checked={includeDistribution}
                  onChange={setIncludeDistribution}
                />
                <Checkbox
                  label="Client defaults"
                  detail="Client name, email"
                  checked={includeClient}
                  onChange={setIncludeClient}
                />
              </div>
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800">
                {error}
              </p>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="text-sm text-muted hover:text-text transition-colors"
            >
              Cancel
            </button>
            <Button
              variant="primary"
              onClick={handleSave}
              disabled={saving || !name.trim()}
            >
              {saving ? "Saving\u2026" : "Create Template"}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Checkbox helper                                                    */
/* ------------------------------------------------------------------ */

function Checkbox({
  label,
  detail,
  checked,
  onChange,
}: {
  label: string;
  detail: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-start gap-2.5 cursor-pointer group">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 rounded border-border accent-[var(--signal)]"
      />
      <div className="min-w-0">
        <div className="text-sm text-text group-hover:text-signal transition-colors">
          {label}
        </div>
        <div className="text-[11px] text-muted">{detail}</div>
      </div>
    </label>
  );
}
