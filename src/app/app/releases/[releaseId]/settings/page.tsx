"use client";

import { use, useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabaseBrowserClient";
import { Panel, PanelBody, PanelHeader } from "@/components/ui/panel";
import { Button } from "@/components/ui/button";
import { Rule } from "@/components/ui/rule";
import { TagInput } from "@/components/ui/tag-input";
import { ArrowLeft, ImageIcon, Upload, X } from "lucide-react";

type Props = { params: Promise<{ releaseId: string }> };

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

const STATUS_OPTIONS = [
  { value: "draft", label: "Draft" },
  { value: "in_progress", label: "In Progress" },
  { value: "ready", label: "Ready" },
];

const PAYMENT_STATUS_OPTIONS = [
  { value: "unpaid", label: "Unpaid" },
  { value: "partial", label: "Partial" },
  { value: "paid", label: "Paid" },
];

const CURRENCY_OPTIONS = ["USD", "EUR", "GBP", "CAD", "AUD"];

function PillSelect({ options, value, onChange }: { options: { value: string; label: string }[]; value: string; onChange: (v: string) => void }) {
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
              ? { background: "var(--signal)", color: "#fff" }
              : { background: "var(--panel2)", color: "var(--text-muted)" }
          }
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

export default function ReleaseSettingsPage({ params }: Props) {
  const { releaseId } = use(params);
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [releaseType, setReleaseType] = useState("single");
  const [format, setFormat] = useState("stereo");
  const [status, setStatus] = useState("draft");
  const [globalDirection, setGlobalDirection] = useState("");
  const [genreTags, setGenreTags] = useState<string[]>([]);
  const [targetDate, setTargetDate] = useState("");
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [deliveryNotes, setDeliveryNotes] = useState("");
  const [paymentsEnabled, setPaymentsEnabled] = useState(false);
  const [feeTotal, setFeeTotal] = useState("");
  const [feeCurrency, setFeeCurrency] = useState("USD");
  const [paymentStatus, setPaymentStatus] = useState("unpaid");
  const [paymentNotes, setPaymentNotes] = useState("");
  const [coverArtUrl, setCoverArtUrl] = useState("");
  const [coverArtMode, setCoverArtMode] = useState<"none" | "preview">("none");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    async function load() {
      const [{ data }, { data: { user } }] = await Promise.all([
        supabase.from("releases").select("*").eq("id", releaseId).maybeSingle(),
        supabase.auth.getUser(),
      ]);

      if (data) {
        setTitle(data.title ?? "");
        setArtist(data.artist ?? "");
        setReleaseType(data.release_type ?? "single");
        setFormat(data.format ?? "stereo");
        setStatus(data.status ?? "draft");
        setGlobalDirection(data.global_direction ?? "");
        setGenreTags(data.genre_tags ?? []);
        setTargetDate(data.target_date ?? "");
        setClientName(data.client_name ?? "");
        setClientEmail(data.client_email ?? "");
        setDeliveryNotes(data.delivery_notes ?? "");
        setFeeTotal(data.fee_total != null ? String(data.fee_total) : "");
        setFeeCurrency(data.fee_currency ?? "USD");
        setPaymentStatus(data.payment_status ?? "unpaid");
        setPaymentNotes(data.payment_notes ?? "");
        if (data.cover_art_url) {
          setCoverArtUrl(data.cover_art_url);
          setCoverArtMode("preview");
        }
      }

      if (user) {
        const { data: defaults } = await supabase
          .from("user_defaults")
          .select("payments_enabled")
          .eq("user_id", user.id)
          .maybeSingle();
        setPaymentsEnabled(defaults?.payments_enabled ?? false);
      }

      setLoading(false);
    }
    load();
  }, [supabase, releaseId]);

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      const { error: updateErr } = await supabase
        .from("releases")
        .update({
          title,
          artist: artist || null,
          release_type: releaseType,
          format,
          status,
          global_direction: globalDirection || null,
          genre_tags: genreTags,
          target_date: targetDate || null,
          client_name: clientName || null,
          client_email: clientEmail || null,
          delivery_notes: deliveryNotes || null,
          fee_total: feeTotal ? parseFloat(feeTotal) : null,
          fee_currency: feeCurrency,
          payment_status: paymentStatus,
          payment_notes: paymentNotes || null,
          cover_art_url: coverArtUrl || null,
        })
        .eq("id", releaseId);

      if (updateErr) throw updateErr;
      router.push(`/app/releases/${releaseId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  async function handleCoverUpload(file: File) {
    const MAX_SIZE = 5 * 1024 * 1024; // 5MB
    if (file.size > MAX_SIZE) {
      setError("Image must be under 5MB");
      return;
    }
    const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif"];
    if (!ALLOWED_TYPES.includes(file.type)) {
      setError("Invalid image type. Use PNG, JPG, WebP, or GIF.");
      return;
    }
    setUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const ext = file.type.split("/")[1] === "jpeg" ? "jpg" : file.type.split("/")[1];
      const path = `${user.id}/${releaseId}.${ext}`;
      const { error: uploadErr } = await supabase.storage
        .from("cover-art")
        .upload(path, file, { upsert: true });
      if (uploadErr) throw uploadErr;
      const { data: urlData } = supabase.storage
        .from("cover-art")
        .getPublicUrl(path);
      const url = urlData.publicUrl + `?t=${Date.now()}`;
      setCoverArtUrl(url);
      setCoverArtMode("preview");
      await supabase.from("releases").update({ cover_art_url: url }).eq("id", releaseId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function handleRemoveCover() {
    setCoverArtUrl("");
    setCoverArtMode("none");
    await supabase.from("releases").update({ cover_art_url: null }).eq("id", releaseId);
  }

  if (loading) {
    return <div className="text-sm text-muted py-12 text-center">Loading&hellip;</div>;
  }

  return (
    <div className="max-w-xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <Link
          href={`/app/releases/${releaseId}`}
          className="text-sm text-muted hover:text-text transition-colors flex items-center gap-1"
        >
          <ArrowLeft size={14} />
          Back to Release
        </Link>
      </div>

      <Panel>
        <PanelHeader>
          <h1 className="text-2xl font-semibold h2 text-text">
            Release Settings
          </h1>
          <p className="mt-1 text-sm text-muted">
            Edit the details for this release.
          </p>
        </PanelHeader>
        <Rule />
        <PanelBody className="pt-5 space-y-6">
          {/* Cover Art */}
          <div className="space-y-3">
            <label className="label text-muted">Cover Art</label>
            <div className="flex items-start gap-4">
              <div
                className="relative w-[160px] h-[160px] rounded-lg border border-border overflow-hidden flex-shrink-0 flex items-center justify-center"
                style={{ background: "var(--panel2)" }}
              >
                {coverArtMode === "preview" && coverArtUrl ? (
                  <img
                    src={coverArtUrl}
                    alt="Cover art"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <ImageIcon size={40} className="text-muted opacity-30" />
                )}
              </div>

              <div className="flex flex-col gap-2 pt-1">
                <div>
                  <label
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md cursor-pointer transition-colors"
                    style={{ background: "var(--panel2)", color: "var(--text-muted)" }}
                  >
                    <Upload size={14} />
                    {uploading ? "Uploading\u2026" : "Upload Image"}
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/jpg,image/webp,image/gif"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) handleCoverUpload(f);
                      }}
                      disabled={uploading}
                    />
                  </label>
                  <p className="text-[10px] text-muted mt-1">PNG, JPG, WebP, or GIF</p>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] text-muted uppercase tracking-wider">or paste URL</span>
                  <input
                    type="url"
                    value={coverArtMode === "preview" && !coverArtUrl.startsWith("http") ? "" : coverArtUrl}
                    onChange={(e) => {
                      setCoverArtUrl(e.target.value);
                      setCoverArtMode(e.target.value ? "preview" : "none");
                    }}
                    className="input text-xs"
                    placeholder="https://..."
                  />
                </div>

                {coverArtMode === "preview" && coverArtUrl && (
                  <button
                    type="button"
                    onClick={handleRemoveCover}
                    className="inline-flex items-center gap-1 text-xs text-red-500 hover:text-red-400 transition-colors"
                  >
                    <X size={12} /> Remove
                  </button>
                )}
              </div>
            </div>
          </div>

          <Rule />

          <div className="space-y-1.5">
            <label className="label text-muted">Release title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input"
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
            <PillSelect options={TYPE_OPTIONS} value={releaseType} onChange={setReleaseType} />
          </div>

          <div className="space-y-1.5">
            <label className="label text-muted">Format</label>
            <PillSelect options={FORMAT_OPTIONS} value={format} onChange={setFormat} />
          </div>

          <div className="space-y-1.5">
            <label className="label text-muted">Status</label>
            <PillSelect options={STATUS_OPTIONS} value={status} onChange={setStatus} />
          </div>

          <div className="space-y-1.5">
            <label className="label text-muted">Global mix direction</label>
            <textarea
              value={globalDirection}
              onChange={(e) => setGlobalDirection(e.target.value)}
              className="input min-h-[100px] resize-y text-sm"
              placeholder="Overall sonic vision for this release..."
            />
          </div>

          <div className="space-y-1.5">
            <label className="label text-muted">Genre tags</label>
            <TagInput
              value={genreTags}
              onChange={setGenreTags}
              placeholder="Type and press Enter"
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

          <Rule />

          <div className="space-y-1.5">
            <label className="label text-muted">Client name</label>
            <input
              type="text"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              className="input"
              placeholder="Client / label contact"
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

          <div className="space-y-1.5">
            <label className="label text-muted">Delivery notes</label>
            <textarea
              value={deliveryNotes}
              onChange={(e) => setDeliveryNotes(e.target.value)}
              className="input min-h-[80px] resize-y text-sm"
              placeholder="Global delivery specs..."
            />
          </div>

          {paymentsEnabled && (
            <>
              <Rule />
              <div className="label-sm text-muted">PAYMENT</div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="label text-muted">Project fee</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={feeTotal}
                    onChange={(e) => setFeeTotal(e.target.value)}
                    className="input"
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="label text-muted">Currency</label>
                  <select
                    value={feeCurrency}
                    onChange={(e) => setFeeCurrency(e.target.value)}
                    className="input"
                  >
                    {CURRENCY_OPTIONS.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="label text-muted">Payment status</label>
                <PillSelect options={PAYMENT_STATUS_OPTIONS} value={paymentStatus} onChange={setPaymentStatus} />
              </div>
              <div className="space-y-1.5">
                <label className="label text-muted">Payment notes</label>
                <textarea
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  className="input min-h-[60px] resize-y text-sm"
                  placeholder="Payment terms, deposit info, due date..."
                />
              </div>
            </>
          )}

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
              {error}
            </p>
          )}

          <div className="flex items-center gap-3 pt-2">
            <Button variant="primary" onClick={handleSave} disabled={saving}>
              {saving ? "Saving\u2026" : "Save Changes"}
            </Button>
            <Link href={`/app/releases/${releaseId}`}>
              <Button variant="ghost">Cancel</Button>
            </Link>
          </div>
        </PanelBody>
      </Panel>
    </div>
  );
}
