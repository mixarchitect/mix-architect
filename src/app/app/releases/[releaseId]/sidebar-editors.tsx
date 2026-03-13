"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabaseBrowserClient";
import { searchItunesApi, buildPlatformUrl, type ItunesResult } from "@/lib/itunes-search";
import { Panel, PanelBody } from "@/components/ui/panel";
import { Button } from "@/components/ui/button";
import { ReferenceCard } from "@/components/ui/reference-card";
import { StatusIndicator } from "@/components/ui/status-dot";
import { Pencil, Check, X, ImageIcon, Upload } from "lucide-react";
import { canEdit, canEditCreative, canEditPayment, type ReleaseRole } from "@/lib/permissions";
import { sendNotification } from "@/lib/notifications/client";
import { InternalNotesEditor } from "@/components/ui/internal-notes-editor";
import { useLocale, useTranslations } from "next-intl";
import { formatMoney } from "@/lib/format-money";

// ── Status Editor ──

const RELEASE_STATUSES = ["draft", "in_progress", "ready"] as const;
type ReleaseStatus = (typeof RELEASE_STATUSES)[number];

function releaseStatusColor(s: string): "green" | "orange" | "blue" {
  if (s === "ready") return "green";
  if (s === "in_progress") return "orange";
  return "blue";
}

const statusLabelKey: Record<string, string> = {
  ready: "statusReady",
  in_progress: "statusInProgress",
  draft: "statusDraft",
};

type StatusEditorProps = {
  releaseId: string;
  initialStatus: string;
  role?: ReleaseRole;
};

export function StatusEditor({ releaseId, initialStatus, role }: StatusEditorProps) {
  const t = useTranslations("releaseDetail");
  const [status, setStatus] = useState<ReleaseStatus>(
    (RELEASE_STATUSES.includes(initialStatus as ReleaseStatus) ? initialStatus : "draft") as ReleaseStatus,
  );
  const router = useRouter();

  function statusLabel(s: string) {
    return t(statusLabelKey[s] ?? "statusDraft");
  }

  async function cycleStatus() {
    const idx = RELEASE_STATUSES.indexOf(status);
    const next = RELEASE_STATUSES[(idx + 1) % RELEASE_STATUSES.length];
    const prev = status;
    setStatus(next);
    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase
        .from("releases")
        .update({ status: next })
        .eq("id", releaseId);
      if (error) throw error;
      router.refresh();
      sendNotification({
        type: "status_change",
        title: t("markedStatus", { status: statusLabel(next) }),
        releaseId,
      });
    } catch {
      setStatus(prev);
    }
  }

  if (!canEdit(role ?? "owner")) {
    return (
      <StatusIndicator
        color={releaseStatusColor(status)}
        label={statusLabel(status)}
      />
    );
  }

  return (
    <button
      type="button"
      onClick={cycleStatus}
      className="cursor-pointer hover:opacity-80 transition-opacity"
    >
      <StatusIndicator
        color={releaseStatusColor(status)}
        label={statusLabel(status)}
      />
    </button>
  );
}

// ── Helper: auto-promote release from draft ──

async function autoPromoteRelease(releaseId: string, currentStatus: string) {
  if (currentStatus !== "draft") return;
  const supabase = createSupabaseBrowserClient();
  await supabase.from("releases").update({ status: "in_progress" }).eq("id", releaseId);
}

// ── Global Direction Editor ──

type DirectionEditorProps = {
  releaseId: string;
  initialValue: string | null;
  initialStatus?: string;
  role?: ReleaseRole;
};

export function GlobalDirectionEditor({ releaseId, initialValue, initialStatus, role }: DirectionEditorProps) {
  const t = useTranslations("releaseDetail");
  const tc = useTranslations("common");
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(initialValue ?? "");
  const [saving, setSaving] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (editing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.selectionStart = textareaRef.current.value.length;
    }
  }, [editing]);

  async function handleSave() {
    setSaving(true);
    const supabase = createSupabaseBrowserClient();
    try {
      const { error } = await supabase
        .from("releases")
        .update({ global_direction: value || null })
        .eq("id", releaseId);
      if (error) throw error;
      if (initialStatus) await autoPromoteRelease(releaseId, initialStatus);
      setEditing(false);
      router.refresh();
    } catch {
      // Keep editing open so user can retry
    } finally {
      setSaving(false);
    }
  }

  return (
    <Panel>
      <PanelBody className="py-5">
        <div className="flex items-center justify-between mb-2">
          <div className="label-sm text-muted">{t("globalDirection")}</div>
          {!editing && canEdit(role ?? "owner") && (
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="text-muted hover:text-text transition-colors"
            >
              <Pencil size={13} />
            </button>
          )}
        </div>
        {editing ? (
          <div className="space-y-2">
            <textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="input min-h-[80px] resize-y text-sm w-full"
              placeholder={t("directionPlaceholder")}
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md transition-colors"
                style={{ background: "var(--signal)", color: "var(--signal-on)" }}
              >
                <Check size={12} />
                {saving ? tc("saving") : tc("save")}
              </button>
              <button
                type="button"
                onClick={() => {
                  setValue(initialValue ?? "");
                  setEditing(false);
                }}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md text-muted hover:text-text transition-colors"
                style={{ background: "var(--panel2)" }}
              >
                <X size={12} />
                {tc("cancel")}
              </button>
            </div>
          </div>
        ) : value ? (
          <p className="text-sm text-text leading-relaxed">{value}</p>
        ) : (
          <p className="text-sm text-muted italic px-1 py-3">{t("noDirection")}</p>
        )}
      </PanelBody>
    </Panel>
  );
}

type Ref = {
  id: string;
  song_title: string;
  artist: string | null;
  note: string | null;
  url: string | null;
  artwork_url: string | null;
  sort_order: number;
};

type RefsEditorProps = {
  releaseId: string;
  initialRefs: Ref[];
  initialStatus?: string;
  role?: ReleaseRole;
};

export function GlobalReferencesEditor({ releaseId, initialRefs, initialStatus, role }: RefsEditorProps) {
  const t = useTranslations("releaseDetail");
  const tc = useTranslations("common");
  const [refs, setRefs] = useState<Ref[]>(initialRefs);
  const [showForm, setShowForm] = useState(false);
  const [refTitle, setRefTitle] = useState("");
  const [refArtist, setRefArtist] = useState("");
  const [refNote, setRefNote] = useState("");
  const [refUrl, setRefUrl] = useState("");
  const [refArtwork, setRefArtwork] = useState("");
  const [refPlatform, setRefPlatform] = useState<"apple" | "spotify" | "tidal" | "youtube">("apple");
  const [itunesResults, setItunesResults] = useState<ItunesResult[]>([]);
  const [showItunesResults, setShowItunesResults] = useState(false);
  const itunesDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const router = useRouter();

  useEffect(() => {
    return () => {
      if (itunesDebounceRef.current) clearTimeout(itunesDebounceRef.current);
    };
  }, []);

  function resetForm() {
    setRefTitle("");
    setRefArtist("");
    setRefNote("");
    setRefUrl("");
    setRefArtwork("");
    setShowForm(false);
    setShowItunesResults(false);
    setItunesResults([]);
  }

  function searchItunes(query: string) {
    if (itunesDebounceRef.current) clearTimeout(itunesDebounceRef.current);
    if (!query.trim()) {
      setItunesResults([]);
      setShowItunesResults(false);
      return;
    }
    itunesDebounceRef.current = setTimeout(async () => {
      const results = await searchItunesApi(query);
      setItunesResults(results);
      setShowItunesResults(results.length > 0);
    }, 400);
  }

  function selectItunesResult(result: ItunesResult) {
    setRefTitle(result.trackName);
    setRefArtist(result.artistName);
    setRefUrl(buildPlatformUrl(refPlatform, result.trackName, result.artistName, result.trackViewUrl));
    setRefArtwork(result.artworkUrl100);
    setShowItunesResults(false);
  }

  async function handleAddRef() {
    if (!refTitle.trim()) return;
    const supabase = createSupabaseBrowserClient();
    const nextOrder =
      refs.length > 0
        ? Math.max(...refs.map((r) => r.sort_order ?? 0)) + 1
        : 0;
    const { data } = await supabase
      .from("mix_references")
      .insert({
        release_id: releaseId,
        track_id: null,
        song_title: refTitle.trim(),
        artist: refArtist || null,
        note: refNote || null,
        url: refUrl || null,
        artwork_url: refArtwork || null,
        sort_order: nextOrder,
      })
      .select()
      .single();
    if (data) {
      setRefs([...refs, data as Ref]);
    }
    if (initialStatus) await autoPromoteRelease(releaseId, initialStatus);
    resetForm();
    router.refresh();
  }

  async function handleDeleteRef(refId: string) {
    const supabase = createSupabaseBrowserClient();
    const removed = refs.find((r) => r.id === refId);
    setRefs((prev) => prev.filter((r) => r.id !== refId));
    try {
      const { error } = await supabase.from("mix_references").delete().eq("id", refId);
      if (error) throw error;
      router.refresh();
    } catch {
      if (removed) setRefs((prev) => [...prev, removed]);
    }
  }

  return (
    <Panel>
      <PanelBody className="py-5">
        <div className="flex items-center justify-between mb-2">
          <div className="label-sm text-muted">{t("globalReferences")}</div>
          {!showForm && canEditCreative(role ?? "owner") && (
            <button
              type="button"
              onClick={() => setShowForm(true)}
              className="text-xs text-muted hover:text-text transition-colors"
            >
              {t("addRef")}
            </button>
          )}
        </div>

        {showForm && (
          <div className="space-y-2 p-3 rounded-md border border-border bg-panel2 mb-3">
            <div className="flex gap-1">
              {(["apple", "spotify", "tidal", "youtube"] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setRefPlatform(p)}
                  className={`flex-1 px-1.5 py-1 text-[10px] font-medium rounded transition-colors ${
                    refPlatform === p
                      ? "bg-panel text-text border border-border-strong shadow-sm"
                      : "text-faint hover:text-muted"
                  }`}
                >
                  {p === "apple" ? "Apple" : p === "spotify" ? "Spotify" : p === "tidal" ? "Tidal" : "YouTube"}
                </button>
              ))}
            </div>
            <div className="relative">
              <input
                value={refTitle}
                onChange={(e) => {
                  setRefTitle(e.target.value);
                  searchItunes(e.target.value);
                }}
                onFocus={() => { if (itunesResults.length > 0) setShowItunesResults(true); }}
                placeholder={t("searchSong")}
                className="input text-xs h-8 py-1"
                autoFocus
              />
              {showItunesResults && itunesResults.length > 0 && (
                <div className="absolute z-30 left-0 right-0 mt-1 rounded-md border border-border bg-panel shadow-lg overflow-hidden">
                  {itunesResults.map((r, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => selectItunesResult(r)}
                      className="w-full flex items-center gap-2.5 px-2.5 py-2 hover:bg-panel2 transition-colors text-left"
                    >
                      {r.artworkUrl100 && (
                        <img
                          src={r.artworkUrl100}
                          alt=""
                          className="w-8 h-8 rounded-[3px] shrink-0"
                        />
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-medium text-text truncate">{r.trackName}</div>
                        <div className="text-[10px] text-muted truncate">{r.artistName}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            {refArtwork && (
              <div className="flex items-center gap-2">
                <img src={refArtwork} alt="" className="w-10 h-10 rounded-[3px]" />
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-medium text-text truncate">{refTitle}</div>
                  <div className="text-[10px] text-muted truncate">{refArtist}</div>
                </div>
              </div>
            )}
            {!refArtwork && (
              <input
                value={refArtist}
                onChange={(e) => setRefArtist(e.target.value)}
                placeholder={t("artistLabel")}
                className="input text-xs h-8 py-1"
              />
            )}
            <input
              value={refNote}
              onChange={(e) => setRefNote(e.target.value)}
              placeholder={t("whatToReference")}
              className="input text-xs h-8 py-1"
            />
            <input
              value={refUrl}
              onChange={(e) => setRefUrl(e.target.value)}
              placeholder={t("linkPlaceholder")}
              className="input text-xs h-8 py-1"
            />
            <div className="flex gap-2">
              <Button
                variant="primary"
                onClick={handleAddRef}
                disabled={!refTitle.trim()}
                className="h-7 text-xs px-3"
              >
                Add
              </Button>
              <Button
                variant="ghost"
                onClick={resetForm}
                className="h-7 text-xs px-3"
              >
                {tc("cancel")}
              </Button>
            </div>
          </div>
        )}

        {refs.length > 0 ? (
          <div className="space-y-2">
            {refs.map((ref) => (
              <ReferenceCard
                key={ref.id}
                songTitle={ref.song_title}
                artist={ref.artist}
                note={ref.note}
                url={ref.url}
                artworkUrl={ref.artwork_url}
                onDelete={canEditCreative(role ?? "owner") ? () => handleDeleteRef(ref.id) : undefined}
              />
            ))}
          </div>
        ) : !showForm ? (
          <p className="text-sm text-muted italic px-1 py-3">{t("noReferences")}</p>
        ) : null}
      </PanelBody>
    </Panel>
  );
}

type CoverArtEditorProps = {
  releaseId: string;
  initialUrl: string | null;
  role?: ReleaseRole;
};

export function CoverArtEditor({ releaseId, initialUrl, role }: CoverArtEditorProps) {
  const t = useTranslations("releaseDetail");
  const tc = useTranslations("common");
  const [editing, setEditing] = useState(false);
  const [url, setUrl] = useState(initialUrl ?? "");
  const [urlInput, setUrlInput] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleUpload(file: File) {
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      setError(t("imageSizeLimit"));
      return;
    }
    const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif"];
    if (!ALLOWED_TYPES.includes(file.type)) {
      setError(t("invalidImageType"));
      return;
    }
    setUploading(true);
    setError("");
    const supabase = createSupabaseBrowserClient();
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
      const newUrl = urlData.publicUrl + `?t=${Date.now()}`;
      setUrl(newUrl);
      await supabase.from("releases").update({ cover_art_url: newUrl }).eq("id", releaseId);
      setEditing(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("uploadFailed"));
    } finally {
      setUploading(false);
    }
  }

  async function handleUrlSave() {
    if (!urlInput.trim()) return;
    setError("");
    const supabase = createSupabaseBrowserClient();
    try {
      await supabase.from("releases").update({ cover_art_url: urlInput.trim() }).eq("id", releaseId);
      setUrl(urlInput.trim());
      setUrlInput("");
      setEditing(false);
      router.refresh();
    } catch {
      setError(t("urlSaveFailed"));
    }
  }

  async function handleRemove() {
    setError("");
    const supabase = createSupabaseBrowserClient();
    try {
      await supabase.from("releases").update({ cover_art_url: null }).eq("id", releaseId);
      setUrl("");
      setEditing(false);
      router.refresh();
    } catch {
      setError(t("removeFailed"));
    }
  }

  if (editing) {
    return (
      <div className="rounded-lg border border-border overflow-hidden">
        {/* Preview */}
        <div
          className="w-full aspect-square flex items-center justify-center"
          style={{ background: "var(--panel2)" }}
        >
          {url ? (
            <img src={url} alt="Cover art" className="w-full h-full object-cover" />
          ) : (
            <ImageIcon size={48} className="text-muted opacity-30" />
          )}
        </div>

        {/* Controls */}
        <div className="p-3 space-y-2" style={{ background: "var(--panel)" }}>
          {error && (
            <p className="text-xs text-red-500">{error}</p>
          )}

          <div className="flex items-center gap-2">
            <label
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md cursor-pointer transition-colors"
              style={{ background: "var(--panel2)", color: "var(--text-muted)" }}
            >
              <Upload size={14} />
              {uploading ? tc("uploading") : "Upload"}
              <input
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp,image/gif"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleUpload(f);
                }}
                disabled={uploading}
              />
            </label>
            {url && (
              <button
                type="button"
                onClick={handleRemove}
                className="inline-flex items-center gap-1 text-xs text-red-500 hover:text-red-400 transition-colors"
              >
                <X size={12} /> Remove
              </button>
            )}
          </div>

          <div className="space-y-1">
            <span className="text-[10px] text-muted uppercase tracking-wider">{t("pasteUrl")}</span>
            <div className="flex gap-1.5">
              <input
                type="url"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                className="input text-xs flex-1"
                placeholder="https://..."
              />
              <button
                type="button"
                onClick={handleUrlSave}
                disabled={!urlInput.trim()}
                className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-md transition-colors disabled:opacity-40"
                style={{ background: "var(--signal)", color: "var(--signal-on)" }}
              >
                <Check size={12} />
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setUrlInput("");
              setError("");
              setEditing(false);
            }}
            className="inline-flex items-center gap-1 text-xs text-muted hover:text-text transition-colors"
          >
            <X size={12} /> {tc("cancel")}
          </button>
        </div>
      </div>
    );
  }

  // Display mode
  if (!canEdit(role ?? "owner")) {
    // Read-only: show image without edit overlay
    return url ? (
      <div className="w-full rounded-lg overflow-hidden border border-border">
        <img src={url} alt="Cover art" className="w-full aspect-square object-cover block" />
      </div>
    ) : null;
  }

  return (
    <button
      type="button"
      onClick={() => setEditing(true)}
      className="group relative w-full rounded-lg overflow-hidden border border-border block cursor-pointer"
    >
      {url ? (
        <img src={url} alt="Cover art" className="w-full aspect-square object-cover block" />
      ) : (
        <div
          className="w-full aspect-square flex flex-col items-center justify-center gap-2"
          style={{ background: "var(--panel2)" }}
        >
          <ImageIcon size={40} className="text-muted opacity-30" />
          <span className="text-xs text-muted">{t("addCoverArt")}</span>
        </div>
      )}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
        <Pencil size={20} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    </button>
  );
}

// ── Payment Editor ──

const PAYMENT_STATUSES = ["no_fee", "unpaid", "partial", "paid"] as const;
type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

function paymentStatusColor(s: string): "green" | "orange" | "blue" {
  if (s === "paid") return "green";
  if (s === "partial") return "orange";
  return "blue";
}

const paymentLabelKey: Record<string, string> = {
  no_fee: "noFee",
  paid: "paid",
  partial: "partial",
  unpaid: "unpaid",
};

function formatCurrency(amount: number | null, currency: string, locale: string): string {
  if (amount == null) return "\u2014";
  return new Intl.NumberFormat(locale, { style: "currency", currency }).format(amount);
}

type PaymentEditorProps = {
  releaseId: string;
  initialPaymentStatus: string;
  initialFeeTotal: number | null;
  initialPaidAmount: number | null;
  initialFeeCurrency: string;
  initialPaymentNotes: string | null;
  role?: ReleaseRole;
};

export function PaymentEditor({
  releaseId,
  initialPaymentStatus,
  initialFeeTotal,
  initialPaidAmount,
  initialFeeCurrency,
  initialPaymentNotes,
  role,
}: PaymentEditorProps) {
  const locale = useLocale();
  const t = useTranslations("releaseDetail");
  const tp = useTranslations("releases.payment");
  const ts = useTranslations("releaseSettings");
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>(
    (PAYMENT_STATUSES.includes(initialPaymentStatus as PaymentStatus) ? initialPaymentStatus : "no_fee") as PaymentStatus,
  );
  const [feeTotal, setFeeTotal] = useState(initialFeeTotal);
  const [paidAmount, setPaidAmount] = useState(initialPaidAmount ?? 0);
  const [editingFee, setEditingFee] = useState(false);
  const [feeInput, setFeeInput] = useState(initialFeeTotal != null ? String(initialFeeTotal) : "");
  const [editingPaid, setEditingPaid] = useState(false);
  const [paidInput, setPaidInput] = useState(String(initialPaidAmount ?? 0));
  const router = useRouter();

  function paymentLabel(s: string) {
    return tp(paymentLabelKey[s] ?? "unpaid");
  }

  async function cyclePaymentStatus() {
    const idx = PAYMENT_STATUSES.indexOf(paymentStatus);
    const next = PAYMENT_STATUSES[(idx + 1) % PAYMENT_STATUSES.length];
    const prev = paymentStatus;
    setPaymentStatus(next);
    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase
        .from("releases")
        .update({ payment_status: next })
        .eq("id", releaseId);
      if (error) throw error;
      router.refresh();
      sendNotification({
        type: "payment_update",
        title: t("paymentChanged", { status: paymentLabel(next) }),
        releaseId,
      });
    } catch {
      setPaymentStatus(prev);
    }
  }

  async function saveFee() {
    const parsed = feeInput.trim() ? parseFloat(feeInput) : null;
    if (feeInput.trim() && isNaN(parsed!)) return;
    const prev = feeTotal;
    setFeeTotal(parsed);
    setEditingFee(false);
    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase
        .from("releases")
        .update({ fee_total: parsed })
        .eq("id", releaseId);
      if (error) throw error;
      router.refresh();
    } catch {
      setFeeTotal(prev);
    }
  }

  async function savePaid() {
    const parsed = paidInput.trim() ? parseFloat(paidInput) : 0;
    if (paidInput.trim() && isNaN(parsed)) return;
    const prev = paidAmount;
    setPaidAmount(parsed);
    setEditingPaid(false);
    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase
        .from("releases")
        .update({ paid_amount: parsed })
        .eq("id", releaseId);
      if (error) throw error;
      router.refresh();
    } catch {
      setPaidAmount(prev);
    }
  }

  const balance = (feeTotal ?? 0) - paidAmount;

  return (
    <Panel>
      <PanelBody className="py-5 space-y-3">
        <div className="label-sm text-muted mb-1">{ts("payment")}</div>
        <div className="space-y-3">
          <div className="flex justify-between text-sm items-center">
            <span className="text-muted">{t("statusLabel")}</span>
            {canEditPayment(role ?? "owner") ? (
              <button
                type="button"
                onClick={cyclePaymentStatus}
                className="cursor-pointer hover:opacity-80 transition-opacity"
              >
                <StatusIndicator
                  color={paymentStatusColor(paymentStatus)}
                  label={paymentLabel(paymentStatus)}
                />
              </button>
            ) : (
              <StatusIndicator
                color={paymentStatusColor(paymentStatus)}
                label={paymentLabel(paymentStatus)}
              />
            )}
          </div>
          {paymentStatus !== "no_fee" && (
            <div className="flex justify-between text-sm items-center">
              <span className="text-muted">{t("feeLabel")}</span>
              {canEditPayment(role ?? "owner") ? (
                editingFee ? (
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={feeInput}
                      onChange={(e) => setFeeInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") saveFee();
                        if (e.key === "Escape") {
                          setFeeInput(feeTotal != null ? String(feeTotal) : "");
                          setEditingFee(false);
                        }
                      }}
                      className="input text-xs h-7 w-24 py-0.5 px-2 text-right"
                      autoFocus
                      placeholder="0.00"
                    />
                    <button
                      type="button"
                      onClick={saveFee}
                      className="text-signal hover:opacity-80 transition-opacity"
                    >
                      <Check size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setFeeInput(feeTotal != null ? String(feeTotal) : "");
                        setEditingFee(false);
                      }}
                      className="text-muted hover:text-text transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setFeeInput(feeTotal != null ? String(feeTotal) : "");
                      setEditingFee(true);
                    }}
                    className="text-text text-xs cursor-pointer hover:opacity-80 transition-opacity"
                  >
                    {formatCurrency(feeTotal, initialFeeCurrency, locale)}
                  </button>
                )
              ) : (
                <span className="text-text text-xs">
                  {formatCurrency(feeTotal, initialFeeCurrency, locale)}
                </span>
              )}
            </div>
          )}
          {paymentStatus === "partial" && (
            <>
              <div className="flex justify-between text-sm items-center">
                <span className="text-muted">{t("paidLabel")}</span>
                {canEditPayment(role ?? "owner") ? (
                  editingPaid ? (
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={paidInput}
                        onChange={(e) => setPaidInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") savePaid();
                          if (e.key === "Escape") {
                            setPaidInput(String(paidAmount));
                            setEditingPaid(false);
                          }
                        }}
                        className="input text-xs h-7 w-24 py-0.5 px-2 text-right"
                        autoFocus
                        placeholder="0.00"
                      />
                      <button
                        type="button"
                        onClick={savePaid}
                        className="text-signal hover:opacity-80 transition-opacity"
                      >
                        <Check size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setPaidInput(String(paidAmount));
                          setEditingPaid(false);
                        }}
                        className="text-muted hover:text-text transition-colors"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setPaidInput(String(paidAmount));
                        setEditingPaid(true);
                      }}
                      className="text-text text-xs cursor-pointer hover:opacity-80 transition-opacity"
                    >
                      {formatCurrency(paidAmount, initialFeeCurrency, locale)}
                    </button>
                  )
                ) : (
                  <span className="text-text text-xs">
                    {formatCurrency(paidAmount, initialFeeCurrency, locale)}
                  </span>
                )}
              </div>
              <div className="flex justify-between text-sm items-center pt-1 border-t border-border/50">
                <span className="text-muted font-medium">{t("balanceLabel")}</span>
                <span className="text-xs font-medium" style={{ color: balance > 0 ? "var(--signal)" : "var(--text)" }}>
                  {formatCurrency(balance, initialFeeCurrency, locale)}
                </span>
              </div>
            </>
          )}
          {initialPaymentNotes && (
            <div className="text-xs text-muted italic pt-1 border-t border-border/50">
              {initialPaymentNotes}
            </div>
          )}
        </div>
      </PanelBody>
    </Panel>
  );
}

// ── Release Internal Notes Editor ──

type ReleaseNotesEditorProps = {
  releaseId: string;
  initialValue: string;
};

export function ReleaseNotesEditor({ releaseId, initialValue }: ReleaseNotesEditorProps) {
  const t = useTranslations("releaseDetail");
  const handleSave = async (value: string) => {
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase
      .from("releases")
      .update({ internal_notes: value || null })
      .eq("id", releaseId);
    if (error) throw error;
  };

  return (
    <InternalNotesEditor
      label={t("releaseNotes")}
      initialValue={initialValue}
      onSave={handleSave}
      placeholder={t("releaseNotesPlaceholder")}
    />
  );
}

// ── Client Notes Editor ──

type ClientNotesEditorProps = {
  clientEmail?: string;
  artistName?: string;
  initialNotes: string;
};

export function ClientNotesEditor({ clientEmail, artistName, initialNotes }: ClientNotesEditorProps) {
  const t = useTranslations("releaseDetail");
  const noteKey = clientEmail || (artistName ? `artist:${artistName.toLowerCase()}` : null);

  const handleSave = async (value: string) => {
    if (!noteKey) return;
    const supabase = createSupabaseBrowserClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");
    const { error } = await supabase
      .from("client_notes")
      .upsert(
        { engineer_id: user.id, client_email: noteKey, notes: value },
        { onConflict: "engineer_id,client_email" },
      );
    if (error) throw error;
  };

  if (!noteKey) return null;

  return (
    <InternalNotesEditor
      label={t("clientNotes")}
      initialValue={initialNotes}
      onSave={handleSave}
      placeholder={t("clientNotesPlaceholder")}
    />
  );
}
