"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabaseBrowserClient";
import { Panel, PanelHeader, PanelBody } from "@/components/ui/panel";
import { Rule } from "@/components/ui/rule";
import { Button } from "@/components/ui/button";
import { TagInput } from "@/components/ui/tag-input";
import { useToast } from "@/components/ui/toast";
import { ChevronDown, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { DELIVERY_FORMATS } from "@/lib/conversion-formats";
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

const EMOTIONAL_SUGGESTIONS = [
  "aggressive", "intimate", "spacious", "gritty", "polished", "warm",
  "dark", "bright", "raw", "lush", "punchy", "dreamy", "lo-fi",
  "cinematic", "minimal", "dense", "ethereal", "hypnotic", "nostalgic",
  "euphoric", "melancholic", "organic", "synthetic", "chaotic", "smooth",
  "haunting", "playful", "anthemic", "delicate", "heavy", "airy",
];

/* ------------------------------------------------------------------ */
/*  PillSelect (inline, matches releases/new/page.tsx)                 */
/* ------------------------------------------------------------------ */

function PillSelect({
  options,
  value,
  onChange,
}: {
  options: { value: string; label: string }[];
  value: string | null;
  onChange: (v: string | null) => void;
}) {
  return (
    <div className="flex gap-2 flex-wrap">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(value === opt.value ? null : opt.value)}
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
/*  Collapsible section                                                */
/* ------------------------------------------------------------------ */

function Section({
  title,
  configured,
  defaultOpen = true,
  children,
}: {
  title: string;
  configured?: boolean;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-3 text-sm font-medium text-text hover:text-signal transition-colors"
      >
        <span className="flex items-center gap-2">
          {title}
          {configured && (
            <span className="w-1.5 h-1.5 rounded-full bg-signal" />
          )}
        </span>
        <ChevronDown
          size={14}
          className={cn(
            "text-muted transition-transform duration-150",
            open && "rotate-180",
          )}
        />
      </button>
      {open && <div className="pb-4 space-y-4">{children}</div>}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Props                                                              */
/* ------------------------------------------------------------------ */

type Props = {
  initialData?: ReleaseTemplate | null;
};

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function TemplateForm({ initialData }: Props) {
  const router = useRouter();
  const { toast } = useToast();
  const isEdit = !!initialData;

  // ── Basics ──
  const [name, setName] = useState(initialData?.name ?? "");
  const [description, setDescription] = useState(initialData?.description ?? "");
  const [isDefault, setIsDefault] = useState(initialData?.is_default ?? false);

  // ── Release settings ──
  const [releaseType, setReleaseType] = useState<string | null>(
    initialData?.release_type ?? null,
  );
  const [format, setFormat] = useState<string | null>(
    initialData?.format ?? null,
  );
  const [genreTags, setGenreTags] = useState<string[]>(
    initialData?.genre_tags ?? [],
  );

  // ── Specs ──
  const [sampleRate, setSampleRate] = useState(
    initialData?.default_sample_rate ?? "",
  );
  const [bitDepth, setBitDepth] = useState(
    initialData?.default_bit_depth ?? "",
  );
  const [deliveryFormats, setDeliveryFormats] = useState<string[]>(
    initialData?.delivery_formats ?? [],
  );
  const [specialReqs, setSpecialReqs] = useState(
    initialData?.default_special_reqs ?? "",
  );

  // ── Intent ──
  const [emotionalTags, setEmotionalTags] = useState<string[]>(
    initialData?.default_emotional_tags ?? [],
  );

  // ── Distribution ──
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const dist = (initialData?.distribution_fields ?? {}) as Record<string, any>;
  const [distributor, setDistributor] = useState(dist.distributor ?? "");
  const [recordLabel, setRecordLabel] = useState(dist.record_label ?? "");
  const [copyrightHolder, setCopyrightHolder] = useState(dist.copyright_holder ?? "");
  const [language, setLanguage] = useState(dist.language ?? "");
  const [primaryGenre, setPrimaryGenre] = useState(dist.primary_genre ?? "");
  const [secondaryGenre, setSecondaryGenre] = useState(dist.secondary_genre ?? "");

  // ── Rights holders (per-person entries) ──
  type RightsHolder = {
    id: string;
    person_name: string;
    pro_org: string;
    member_account: string;
    writer_ipi: string;
    publisher_name: string;
    publisher_member_id: string;
    publisher_ipi: string;
    sound_exchange_id: string;
    label_name: string;
  };
  const [rightsHolders, setRightsHolders] = useState<RightsHolder[]>(
    () => {
      const saved = (dist.rights_holders ?? []) as Partial<RightsHolder>[];
      return Array.isArray(saved) ? saved.map((rh, i) => ({
        id: rh.id ?? `rh-${i}-${Date.now()}`,
        person_name: rh.person_name ?? "",
        pro_org: rh.pro_org ?? "",
        member_account: rh.member_account ?? "",
        writer_ipi: rh.writer_ipi ?? "",
        publisher_name: rh.publisher_name ?? "",
        publisher_member_id: rh.publisher_member_id ?? "",
        publisher_ipi: rh.publisher_ipi ?? "",
        sound_exchange_id: rh.sound_exchange_id ?? "",
        label_name: rh.label_name ?? "",
      })) : [];
    },
  );

  // ── Client ──
  const [clientName, setClientName] = useState(initialData?.client_name ?? "");
  const [clientEmail, setClientEmail] = useState(initialData?.client_email ?? "");

  // ── Payment ──
  const [paymentStatus, setPaymentStatus] = useState(initialData?.default_payment_status ?? "");
  const [feeCurrency, setFeeCurrency] = useState(initialData?.default_fee_currency ?? "");
  const [paymentNotes, setPaymentNotes] = useState(initialData?.default_payment_notes ?? "");

  // ── Submit state ──
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ── Configured indicators ──
  const hasRelease = !!releaseType || !!format || genreTags.length > 0;
  const hasSpecs =
    !!sampleRate || !!bitDepth || deliveryFormats.length > 0 || !!specialReqs;
  const hasIntent = emotionalTags.length > 0;
  const hasDist =
    !!distributor || !!recordLabel || !!copyrightHolder || !!language || !!primaryGenre ||
    rightsHolders.length > 0;
  const hasClient = !!clientName || !!clientEmail;
  const hasPayment = !!paymentStatus || !!feeCurrency || !!paymentNotes;

  // ── Rights holder helpers ──
  function addRightsHolder() {
    setRightsHolders((prev) => [
      ...prev,
      {
        id: `rh-${Date.now()}`,
        person_name: "",
        pro_org: "",
        member_account: "",
        writer_ipi: "",
        publisher_name: "",
        publisher_member_id: "",
        publisher_ipi: "",
        sound_exchange_id: "",
        label_name: "",
      },
    ]);
  }

  function updateRightsHolder(id: string, field: keyof RightsHolder, value: string) {
    setRightsHolders((prev) =>
      prev.map((rh) => (rh.id === id ? { ...rh, [field]: value } : rh)),
    );
  }

  function removeRightsHolder(id: string) {
    setRightsHolders((prev) => prev.filter((rh) => rh.id !== id));
  }

  // ── Format pill toggle ──
  function toggleFormat(fmt: string) {
    setDeliveryFormats((prev) =>
      prev.includes(fmt) ? prev.filter((f) => f !== fmt) : [...prev, fmt],
    );
  }

  // ── Submit ──
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const supabase = createSupabaseBrowserClient();
      const {
        data: { user },
        error: userErr,
      } = await supabase.auth.getUser();
      if (userErr || !user) throw userErr ?? new Error("Not authenticated");

      // If setting as default, clear existing default
      if (isDefault) {
        await supabase
          .from("release_templates")
          .update({ is_default: false })
          .eq("user_id", user.id)
          .eq("is_default", true)
          .neq("id", initialData?.id ?? "00000000-0000-0000-0000-000000000000");
      }

      // Build distribution_fields jsonb
      const distributionFields: Record<string, unknown> = {};
      if (distributor) distributionFields.distributor = distributor;
      if (recordLabel) distributionFields.record_label = recordLabel;
      if (copyrightHolder) distributionFields.copyright_holder = copyrightHolder;
      if (language) distributionFields.language = language;
      if (primaryGenre) distributionFields.primary_genre = primaryGenre;
      if (secondaryGenre) distributionFields.secondary_genre = secondaryGenre;
      if (rightsHolders.length > 0) {
        distributionFields.rights_holders = rightsHolders
          .filter((rh) => rh.person_name.trim())
          .map(({ id: _id, ...rest }) => rest);
      }

      const payload = {
        name,
        description: description || null,
        release_type: releaseType,
        format,
        genre_tags: genreTags,
        default_sample_rate: sampleRate || null,
        default_bit_depth: bitDepth || null,
        delivery_formats: deliveryFormats,
        default_special_reqs: specialReqs || null,
        default_emotional_tags: emotionalTags,
        distribution_fields: distributionFields,
        client_name: clientName || null,
        client_email: clientEmail || null,
        default_payment_status: paymentStatus || null,
        default_fee_currency: feeCurrency || null,
        default_payment_notes: paymentNotes || null,
        is_default: isDefault,
      };

      if (isEdit && initialData) {
        const { error: updateErr } = await supabase
          .from("release_templates")
          .update(payload)
          .eq("id", initialData.id);
        if (updateErr) throw updateErr;
        toast("Template updated", { variant: "success" });
        router.refresh();
      } else {
        const { data: template, error: insertErr } = await supabase
          .from("release_templates")
          .insert({ ...payload, user_id: user.id })
          .select()
          .single();
        if (insertErr) throw insertErr;
        toast("Template created", { variant: "success" });
        router.push(`/app/templates/${template.id}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Panel>
      <PanelHeader>
        <h1 className="text-2xl font-semibold h2 text-text">
          {isEdit ? "Edit Template" : "New Template"}
        </h1>
        <p className="mt-1 text-sm text-muted">
          {isEdit
            ? "Update your saved release configuration."
            : "Save a reusable set of release settings to start new projects faster."}
        </p>
      </PanelHeader>
      <Rule />
      <PanelBody className="pt-5">
        <form onSubmit={handleSubmit} className="space-y-1">
          {/* ── Basics ── */}
          <Section title="Basics" configured={!!name || !!description} defaultOpen>
            <div className="space-y-1.5">
              <label className="label text-muted">Template name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input"
                placeholder="e.g. Streaming Master, Label X Standard"
              />
            </div>
            <div className="space-y-1.5">
              <label className="label text-muted">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="input min-h-[72px] resize-y text-sm"
                placeholder="When to use this template..."
              />
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isDefault}
                onChange={(e) => setIsDefault(e.target.checked)}
                className="accent-signal"
              />
              <span className="text-sm text-text">Set as default template</span>
              <span className="text-xs text-muted">(auto-selected for new releases)</span>
            </label>
          </Section>

          <Rule />

          {/* ── Release Settings ── */}
          <Section title="Release Settings" configured={hasRelease}>
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
          </Section>

          <Rule />

          {/* ── Technical Specs ── */}
          <Section title="Technical Specs" configured={hasSpecs}>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="label text-muted">Sample rate</label>
                <select
                  value={sampleRate}
                  onChange={(e) => setSampleRate(e.target.value)}
                  className="input"
                >
                  <option value="">Not set</option>
                  <option value="44.1 kHz">44.1 kHz</option>
                  <option value="48 kHz">48 kHz</option>
                  <option value="88.2 kHz">88.2 kHz</option>
                  <option value="96 kHz">96 kHz</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="label text-muted">Bit depth</label>
                <select
                  value={bitDepth}
                  onChange={(e) => setBitDepth(e.target.value)}
                  className="input"
                >
                  <option value="">Not set</option>
                  <option value="16-bit">16-bit</option>
                  <option value="24-bit">24-bit</option>
                  <option value="32-bit float">32-bit float</option>
                </select>
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="label text-muted">Delivery formats</label>
              <div className="flex flex-wrap gap-2">
                {DELIVERY_FORMATS.map((fmt) => {
                  const selected = deliveryFormats.includes(fmt);
                  return (
                    <button
                      key={fmt}
                      type="button"
                      onClick={() => toggleFormat(fmt)}
                      className={`inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${
                        selected
                          ? "bg-signal/10 border-signal text-signal"
                          : "border-border text-muted hover:text-text hover:border-border-strong"
                      }`}
                    >
                      {fmt}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="label text-muted">Special requirements</label>
              <textarea
                value={specialReqs}
                onChange={(e) => setSpecialReqs(e.target.value)}
                className="input min-h-[72px] resize-y text-sm"
                placeholder="e.g. Radio edit needed, TV sync version, vinyl master..."
              />
            </div>
          </Section>

          <Rule />

          {/* ── Intent Defaults ── */}
          <Section title="Intent Defaults" configured={hasIntent} defaultOpen={false}>
            <div className="space-y-1.5">
              <label className="label text-muted">Default emotional tags</label>
              <TagInput
                value={emotionalTags}
                onChange={setEmotionalTags}
                suggestions={EMOTIONAL_SUGGESTIONS}
                placeholder="Type or click suggestions below"
              />
            </div>
          </Section>

          <Rule />

          {/* ── Distribution Metadata ── */}
          <Section title="Distribution Metadata" configured={hasDist} defaultOpen={false}>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="label text-muted">Distributor</label>
                <input
                  type="text"
                  value={distributor}
                  onChange={(e) => setDistributor(e.target.value)}
                  className="input"
                  placeholder="e.g. DistroKid, TuneCore"
                />
              </div>
              <div className="space-y-1.5">
                <label className="label text-muted">Record label</label>
                <input
                  type="text"
                  value={recordLabel}
                  onChange={(e) => setRecordLabel(e.target.value)}
                  className="input"
                  placeholder="e.g. Independent"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="label text-muted">Copyright holder</label>
              <input
                type="text"
                value={copyrightHolder}
                onChange={(e) => setCopyrightHolder(e.target.value)}
                className="input"
                placeholder="e.g. Artist Name"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="label text-muted">Language</label>
                <input
                  type="text"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="input"
                  placeholder="e.g. English"
                />
              </div>
              <div className="space-y-1.5">
                <label className="label text-muted">Primary genre</label>
                <input
                  type="text"
                  value={primaryGenre}
                  onChange={(e) => setPrimaryGenre(e.target.value)}
                  className="input"
                  placeholder="e.g. Rock"
                />
              </div>
            </div>
            {primaryGenre && (
              <div className="space-y-1.5">
                <label className="label text-muted">Secondary genre</label>
                <input
                  type="text"
                  value={secondaryGenre}
                  onChange={(e) => setSecondaryGenre(e.target.value)}
                  className="input"
                  placeholder="e.g. Alternative"
                />
              </div>
            )}

            <div className="pt-2 pb-1">
              <div className="flex items-center justify-between">
                <div className="label-sm text-muted">RIGHTS &amp; PUBLISHING</div>
                <button
                  type="button"
                  onClick={addRightsHolder}
                  className="text-xs text-muted hover:text-text transition-colors"
                >
                  + Add Person
                </button>
              </div>
            </div>
            {rightsHolders.length === 0 && (
              <p className="text-xs text-muted text-center py-3">
                Add people to pre-fill songwriters, publishers, and master owners on new releases.
              </p>
            )}
            {rightsHolders.map((rh) => (
              <RightsHolderRow
                key={rh.id}
                holder={rh}
                onUpdate={(field, value) => updateRightsHolder(rh.id, field as keyof RightsHolder, value)}
                onRemove={() => removeRightsHolder(rh.id)}
              />
            ))}
          </Section>

          <Rule />

          {/* ── Client Defaults ── */}
          <Section title="Client Defaults" configured={hasClient} defaultOpen={false}>
            <p className="text-[11px] text-muted leading-relaxed -mt-2 mb-2">
              Pre-fill client info for mix engineers who work with repeat clients.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="label text-muted">Client name</label>
                <input
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="input"
                  placeholder="Client or artist name"
                />
              </div>
              <div className="space-y-1.5">
                <label className="label text-muted">Client email</label>
                <input
                  type="email"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  className="input"
                  placeholder="client@example.com"
                />
              </div>
            </div>
          </Section>

          <Rule />

          {/* ── Payment Defaults ── */}
          <Section title="Payment Defaults" configured={hasPayment} defaultOpen={false}>
            <p className="text-[11px] text-muted leading-relaxed -mt-2 mb-2">
              Pre-fill payment status and currency for new releases.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="label text-muted">Payment status</label>
                <select
                  value={paymentStatus}
                  onChange={(e) => setPaymentStatus(e.target.value)}
                  className="input"
                >
                  <option value="">Not set</option>
                  <option value="no_fee">No Fee</option>
                  <option value="unpaid">Unpaid</option>
                  <option value="partial">Partial</option>
                  <option value="paid">Paid</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="label text-muted">Currency</label>
                <select
                  value={feeCurrency}
                  onChange={(e) => setFeeCurrency(e.target.value)}
                  className="input"
                >
                  <option value="">Not set</option>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                  <option value="CAD">CAD</option>
                  <option value="AUD">AUD</option>
                </select>
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="label text-muted">Payment notes</label>
              <textarea
                value={paymentNotes}
                onChange={(e) => setPaymentNotes(e.target.value)}
                className="input min-h-[72px] resize-y text-sm"
                placeholder="e.g. Net 30, 50% deposit upfront..."
              />
            </div>
          </Section>

          {/* ── Error ── */}
          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800">
              {error}
            </p>
          )}

          {/* ── Submit ── */}
          <div className="pt-4">
            <Button
              type="submit"
              variant="primary"
              disabled={loading || !name.trim()}
            >
              {loading
                ? isEdit
                  ? "Saving\u2026"
                  : "Creating\u2026"
                : isEdit
                  ? "Save Changes"
                  : "Create Template"}
            </Button>
          </div>
        </form>
      </PanelBody>
    </Panel>
  );
}

/* ------------------------------------------------------------------ */
/*  RightsHolderRow                                                    */
/* ------------------------------------------------------------------ */

function RightsHolderRow({
  holder,
  onUpdate,
  onRemove,
}: {
  holder: {
    person_name: string;
    pro_org: string;
    member_account: string;
    writer_ipi: string;
    publisher_name: string;
    publisher_member_id: string;
    publisher_ipi: string;
    sound_exchange_id: string;
    label_name: string;
  };
  onUpdate: (field: string, value: string) => void;
  onRemove: () => void;
}) {
  return (
    <div className="rounded-md border border-border" style={{ background: "var(--panel)" }}>
      {/* Name + remove */}
      <div className="flex items-center gap-3 px-4 py-3">
        <input
          type="text"
          value={holder.person_name}
          onChange={(e) => onUpdate("person_name", e.target.value)}
          placeholder="Person or entity name"
          className="flex-1 text-sm text-text bg-transparent border-none outline-none placeholder:text-faint"
        />
        <button
          type="button"
          onClick={onRemove}
          className="p-1 rounded text-faint hover:text-red-500 transition-colors shrink-0"
          title="Remove"
        >
          <X size={14} />
        </button>
      </div>

      {/* Fields grid */}
      <div className="px-4 pb-3 border-t border-border pt-3 space-y-2">
        <div className="grid grid-cols-3 gap-2">
          <div className="space-y-1">
            <label className="text-[10px] text-faint">PRO (ASCAP/BMI)</label>
            <input
              type="text"
              value={holder.pro_org}
              onChange={(e) => onUpdate("pro_org", e.target.value)}
              placeholder="e.g., BMI"
              className="w-full text-xs text-text bg-transparent border border-border rounded px-2 py-1 outline-none focus:border-signal placeholder:text-faint"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] text-faint">Member Account #</label>
            <input
              type="text"
              value={holder.member_account}
              onChange={(e) => onUpdate("member_account", e.target.value)}
              placeholder="Account #"
              className="w-full text-xs text-text bg-transparent border border-border rounded px-2 py-1 outline-none focus:border-signal placeholder:text-faint"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] text-faint">Writer IPI</label>
            <input
              type="text"
              value={holder.writer_ipi}
              onChange={(e) => onUpdate("writer_ipi", e.target.value)}
              placeholder="IPI #"
              className="w-full text-xs text-text bg-transparent border border-border rounded px-2 py-1 outline-none focus:border-signal placeholder:text-faint"
            />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div className="space-y-1">
            <label className="text-[10px] text-faint">Publisher Name</label>
            <input
              type="text"
              value={holder.publisher_name}
              onChange={(e) => onUpdate("publisher_name", e.target.value)}
              placeholder="Publisher"
              className="w-full text-xs text-text bg-transparent border border-border rounded px-2 py-1 outline-none focus:border-signal placeholder:text-faint"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] text-faint">Publisher Member ID</label>
            <input
              type="text"
              value={holder.publisher_member_id}
              onChange={(e) => onUpdate("publisher_member_id", e.target.value)}
              placeholder="Member ID"
              className="w-full text-xs text-text bg-transparent border border-border rounded px-2 py-1 outline-none focus:border-signal placeholder:text-faint"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] text-faint">Publisher IPI</label>
            <input
              type="text"
              value={holder.publisher_ipi}
              onChange={(e) => onUpdate("publisher_ipi", e.target.value)}
              placeholder="IPI #"
              className="w-full text-xs text-text bg-transparent border border-border rounded px-2 py-1 outline-none focus:border-signal placeholder:text-faint"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <label className="text-[10px] text-faint">SoundExchange ID</label>
            <input
              type="text"
              value={holder.sound_exchange_id}
              onChange={(e) => onUpdate("sound_exchange_id", e.target.value)}
              placeholder="e.g., 1000139051"
              className="w-full text-xs text-text bg-transparent border border-border rounded px-2 py-1 outline-none focus:border-signal placeholder:text-faint"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] text-faint">Label Name</label>
            <input
              type="text"
              value={holder.label_name}
              onChange={(e) => onUpdate("label_name", e.target.value)}
              placeholder="e.g., Self-Released"
              className="w-full text-xs text-text bg-transparent border border-border rounded px-2 py-1 outline-none focus:border-signal placeholder:text-faint"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
