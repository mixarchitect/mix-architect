"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabaseBrowserClient";
import { Panel, PanelBody, PanelHeader } from "@/components/ui/panel";
import { Button } from "@/components/ui/button";
import { Rule } from "@/components/ui/rule";
import { Pill } from "@/components/ui/pill";
import { TagInput } from "@/components/ui/tag-input";
import { ArrowLeft, ImageIcon, Upload, X, Trash2, UserPlus } from "lucide-react";
import { canEdit, canEditPayment, canManageTeam, type ReleaseRole } from "@/lib/permissions";
import { useUnsavedChanges } from "@/hooks/use-unsaved-changes";
import { useLocale, useTranslations } from "next-intl";
import { formatMoney } from "@/lib/format-money";
import { supportedCurrencies } from "@/i18n/config";

type MemberRow = {
  id: string;
  invited_email: string;
  role: string;
  accepted_at: string | null;
  user_id: string | null;
};

type Props = {
  releaseId: string;
  role: ReleaseRole;
  initialMembers: MemberRow[];
};

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
  { value: "no_fee", label: "No Fee" },
  { value: "unpaid", label: "Unpaid" },
  { value: "partial", label: "Partial" },
  { value: "paid", label: "Paid" },
];

const CURRENCY_OPTIONS = supportedCurrencies.map((c) => c.code);

const GENRE_SUGGESTIONS = [
  "Rock", "Pop", "Hip-Hop", "R&B", "Electronic", "Country", "Jazz",
  "Classical", "Indie", "Alternative", "Metal", "Folk", "Soul", "Funk",
  "Blues", "Reggae", "Latin", "Punk", "Lo-Fi", "Ambient",
];

function PillSelect({
  options,
  value,
  onChange,
  disabled,
}: {
  options: { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex gap-2 flex-wrap">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => !disabled && onChange(opt.value)}
          disabled={disabled}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-colors${disabled ? " opacity-60 cursor-default" : ""}`}
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

export function SettingsForm({ releaseId, role, initialMembers }: Props) {
  const locale = useLocale();
  const t = useTranslations("releaseSettings");
  const tCommon = useTranslations("common");
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const router = useRouter();
  const editable = canEdit(role);
  const paymentEditable = canEditPayment(role);
  const teamEditable = canManageTeam(role);

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
  const [clientPhone, setClientPhone] = useState("");
  const [deliveryNotes, setDeliveryNotes] = useState("");
  const [paymentsEnabled, setPaymentsEnabled] = useState(false);
  const [feeTotal, setFeeTotal] = useState("");
  const [feeCurrency, setFeeCurrency] = useState("USD");
  const [paymentStatus, setPaymentStatus] = useState("no_fee");
  const [paidAmount, setPaidAmount] = useState("");
  const [paymentNotes, setPaymentNotes] = useState("");
  const [coverArtUrl, setCoverArtUrl] = useState("");
  const [coverArtMode, setCoverArtMode] = useState<"none" | "preview">("none");
  const [uploading, setUploading] = useState(false);

  // Distribution state
  const [distributor, setDistributor] = useState("");
  const [recordLabel, setRecordLabel] = useState("");
  const [upc, setUpc] = useState("");
  const [copyrightHolder, setCopyrightHolder] = useState("");
  const [copyrightYear, setCopyrightYear] = useState("");
  const [phonogramCopyright, setPhonogramCopyright] = useState("");
  const [catalogNumber, setCatalogNumber] = useState("");

  // Team state
  const [members, setMembers] = useState<MemberRow[]>(initialMembers);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"collaborator" | "client">("collaborator");
  const [inviting, setInviting] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [resendingId, setResendingId] = useState<string | null>(null);
  const [resentId, setResentId] = useState<string | null>(null);
  const [confirmRemoveId, setConfirmRemoveId] = useState<string | null>(null);

  // ── Unsaved-changes guard ──
  const initialSnapshot = useRef("");
  const currentSnapshot = JSON.stringify({
    title, artist, releaseType, format, status, globalDirection, genreTags,
    targetDate, clientName, clientEmail, clientPhone, deliveryNotes, feeTotal, feeCurrency,
    paymentStatus, paidAmount, paymentNotes, distributor, recordLabel, upc,
    copyrightHolder, copyrightYear, phonogramCopyright, catalogNumber,
  });
  const isDirty = initialSnapshot.current !== "" && currentSnapshot !== initialSnapshot.current;
  const guardedNavigate = useUnsavedChanges(isDirty);

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
        setClientPhone(data.client_phone ?? "");
        setDeliveryNotes(data.delivery_notes ?? "");
        setFeeTotal(data.fee_total != null ? String(data.fee_total) : "");
        setFeeCurrency(data.fee_currency ?? "USD");
        setPaymentStatus(data.payment_status ?? "no_fee");
        setPaidAmount(data.paid_amount != null ? String(data.paid_amount) : "");
        setPaymentNotes(data.payment_notes ?? "");
        if (data.cover_art_url) {
          setCoverArtUrl(data.cover_art_url);
          setCoverArtMode("preview");
        }
        setDistributor(data.distributor ?? "");
        setRecordLabel(data.record_label ?? "");
        setUpc(data.upc ?? "");
        setCopyrightHolder(data.copyright_holder ?? "");
        setCopyrightYear(data.copyright_year ?? "");
        setPhonogramCopyright(data.phonogram_copyright ?? "");
        setCatalogNumber(data.catalog_number ?? "");
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

      // Capture initial snapshot for dirty detection
      if (data) {
        requestAnimationFrame(() => {
          initialSnapshot.current = JSON.stringify({
            title: data.title ?? "",
            artist: data.artist ?? "",
            releaseType: data.release_type ?? "single",
            format: data.format ?? "stereo",
            status: data.status ?? "draft",
            globalDirection: data.global_direction ?? "",
            genreTags: data.genre_tags ?? [],
            targetDate: data.target_date ?? "",
            clientName: data.client_name ?? "",
            clientEmail: data.client_email ?? "",
            clientPhone: data.client_phone ?? "",
            deliveryNotes: data.delivery_notes ?? "",
            feeTotal: data.fee_total != null ? String(data.fee_total) : "",
            feeCurrency: data.fee_currency ?? "USD",
            paymentStatus: data.payment_status ?? "no_fee",
            paidAmount: data.paid_amount != null ? String(data.paid_amount) : "",
            paymentNotes: data.payment_notes ?? "",
            distributor: data.distributor ?? "",
            recordLabel: data.record_label ?? "",
            upc: data.upc ?? "",
            copyrightHolder: data.copyright_holder ?? "",
            copyrightYear: data.copyright_year ?? "",
            phonogramCopyright: data.phonogram_copyright ?? "",
            catalogNumber: data.catalog_number ?? "",
          });
        });
      }
    }
    load();
  }, [supabase, releaseId]);

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      const updateData: Record<string, unknown> = {
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
        client_phone: clientPhone || null,
        delivery_notes: deliveryNotes || null,
        cover_art_url: coverArtUrl || null,
        distributor: distributor || null,
        record_label: recordLabel || null,
        upc: upc || null,
        copyright_holder: copyrightHolder || null,
        copyright_year: copyrightYear || null,
        phonogram_copyright: phonogramCopyright || null,
        catalog_number: catalogNumber || null,
      };

      // Only include payment fields if the user can edit them
      if (paymentEditable) {
        updateData.fee_total = feeTotal ? parseFloat(feeTotal) : null;
        updateData.fee_currency = feeCurrency;
        updateData.payment_status = paymentStatus;
        updateData.paid_amount = paidAmount ? parseFloat(paidAmount) : 0;
        updateData.payment_notes = paymentNotes || null;
      }

      const { error: updateErr } = await supabase
        .from("releases")
        .update(updateData)
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
    const MAX_SIZE = 5 * 1024 * 1024;
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

  async function handleInvite() {
    if (!inviteEmail.trim()) return;
    setInviting(true);
    setInviteError(null);
    try {
      const { data, error: insertErr } = await supabase
        .from("release_members")
        .insert({
          release_id: releaseId,
          invited_email: inviteEmail.trim().toLowerCase(),
          role: inviteRole,
        })
        .select("id, invited_email, role, accepted_at, user_id")
        .single();

      if (insertErr) {
        if (insertErr.code === "23505") {
          setInviteError("This email has already been invited.");
        } else {
          throw insertErr;
        }
      } else if (data) {
        setMembers([...members, data as MemberRow]);
        const sentEmail = inviteEmail.trim().toLowerCase();
        const sentRole = inviteRole;
        setInviteEmail("");

        // Fire-and-forget email send
        try {
          const { data: { user } } = await supabase.auth.getUser();
          await fetch("/api/send-invite", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: sentEmail,
              role: sentRole,
              releaseTitle: title,
              inviterEmail: user?.email ?? "A team member",
              releaseId,
            }),
          });
        } catch {
          // Email failure doesn't affect the invite record
        }
      }
    } catch (err) {
      setInviteError(err instanceof Error ? err.message : "Failed to invite");
    } finally {
      setInviting(false);
    }
  }

  async function handleResendInvite(member: MemberRow) {
    setResendingId(member.id);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const res = await fetch("/api/send-invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: member.invited_email,
          role: member.role,
          releaseTitle: title,
          inviterEmail: user?.email ?? "A team member",
          releaseId,
        }),
      });
      if (res.ok) {
        setResentId(member.id);
        setTimeout(() => setResentId(null), 2000);
      }
    } catch {
      // Silently fail
    } finally {
      setResendingId(null);
    }
  }

  async function handleRemoveMember(memberId: string) {
    const prev = [...members];
    setMembers(members.filter((m) => m.id !== memberId));
    try {
      const { error: delErr } = await supabase
        .from("release_members")
        .delete()
        .eq("id", memberId);
      if (delErr) throw delErr;
    } catch {
      setMembers(prev);
    }
  }

  if (loading) {
    return <div className="text-sm text-muted py-12 text-center">Loading&hellip;</div>;
  }

  return (
    <div className="max-w-xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <button
          type="button"
          onClick={() => guardedNavigate(() => router.push(`/app/releases/${releaseId}`))}
          className="text-sm text-muted hover:text-text transition-colors flex items-center gap-1"
        >
          <ArrowLeft size={14} />
          {t("backToRelease")}
        </button>
      </div>

      <Panel>
        <PanelHeader>
          <h1 className="text-2xl font-semibold h2 text-text">
            {t("title")}
          </h1>
          <p className="mt-1 text-sm text-muted">
            {editable ? t("editDescription") : t("viewDescription")}
          </p>
        </PanelHeader>
        <Rule />
        <PanelBody className="pt-5 space-y-6">
          {/* Cover Art */}
          <div className="space-y-3">
            <label className="label text-muted">{t("coverArt")}</label>
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

              {editable && (
                <div className="flex flex-col gap-2 pt-1">
                  <div>
                    <label
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md cursor-pointer transition-colors"
                      style={{ background: "var(--panel2)", color: "var(--text-muted)" }}
                    >
                      <Upload size={14} />
                      {uploading ? tCommon("uploading") : t("uploadImage")}
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
                    <span className="text-[10px] text-muted uppercase tracking-wider">{t("pasteUrl")}</span>
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
                      <X size={12} /> {t("remove")}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          <Rule />

          <div className="space-y-1.5">
            <label className="label text-muted">{t("releaseTitle")}</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={!editable}
              className="input"
            />
          </div>

          <div className="space-y-1.5">
            <label className="label text-muted">{t("artistClient")}</label>
            <input
              type="text"
              value={artist}
              onChange={(e) => setArtist(e.target.value)}
              disabled={!editable}
              className="input"
              placeholder={t("artistPlaceholder")}
            />
          </div>

          <div className="space-y-1.5">
            <label className="label text-muted">{t("releaseType")}</label>
            <PillSelect options={TYPE_OPTIONS} value={releaseType} onChange={setReleaseType} disabled={!editable} />
          </div>

          <div className="space-y-1.5">
            <label className="label text-muted">{t("format")}</label>
            <PillSelect options={FORMAT_OPTIONS} value={format} onChange={setFormat} disabled={!editable} />
          </div>

          <div className="space-y-1.5">
            <label className="label text-muted">{t("status")}</label>
            <PillSelect options={STATUS_OPTIONS} value={status} onChange={setStatus} disabled={!editable} />
          </div>

          <div className="space-y-1.5">
            <label className="label text-muted">{t("globalDirection")}</label>
            <textarea
              value={globalDirection}
              onChange={(e) => setGlobalDirection(e.target.value)}
              disabled={!editable}
              className="input min-h-[100px] resize-y text-sm"
              placeholder={t("globalDirectionPlaceholder")}
            />
          </div>

          <div className="space-y-1.5">
            <label className="label text-muted">{t("genreTags")}</label>
            <TagInput
              value={genreTags}
              onChange={editable ? setGenreTags : undefined}
              suggestions={GENRE_SUGGESTIONS}
              placeholder={editable ? "Type and press Enter" : ""}
              disabled={!editable}
            />
          </div>

          <div className="space-y-1.5">
            <label className="label text-muted">{t("targetDate")}</label>
            <input
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              disabled={!editable}
              className="input"
            />
          </div>

          <Rule />

          <div className="space-y-1.5">
            <label className="label text-muted">{t("clientName")}</label>
            <input
              type="text"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              disabled={!editable}
              className="input"
              placeholder={t("clientNamePlaceholder")}
            />
          </div>

          <div className="space-y-1.5">
            <label className="label text-muted">{t("clientEmail")}</label>
            <input
              type="email"
              value={clientEmail}
              onChange={(e) => setClientEmail(e.target.value)}
              disabled={!editable}
              className="input"
              placeholder={t("clientEmailPlaceholder")}
            />
          </div>

          <div className="space-y-1.5">
            <label className="label text-muted">{t("clientPhone")}</label>
            <input
              type="tel"
              value={clientPhone}
              onChange={(e) => setClientPhone(e.target.value)}
              disabled={!editable}
              className="input"
              placeholder={t("clientPhonePlaceholder")}
            />
          </div>

          <div className="space-y-1.5">
            <label className="label text-muted">{t("deliveryNotes")}</label>
            <textarea
              value={deliveryNotes}
              onChange={(e) => setDeliveryNotes(e.target.value)}
              disabled={!editable}
              className="input min-h-[80px] resize-y text-sm"
              placeholder={t("deliveryNotesPlaceholder")}
            />
          </div>

          <Rule />
          <div className="label-sm text-muted">{t("distribution")}</div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="label text-muted">{t("distributor")}</label>
              <input
                type="text"
                value={distributor}
                onChange={(e) => setDistributor(e.target.value)}
                disabled={!editable}
                className="input"
                placeholder={t("distributorPlaceholder")}
              />
            </div>
            <div className="space-y-1.5">
              <label className="label text-muted">{t("recordLabel")}</label>
              <input
                type="text"
                value={recordLabel}
                onChange={(e) => setRecordLabel(e.target.value)}
                disabled={!editable}
                className="input"
                placeholder={t("recordLabelPlaceholder")}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="label text-muted">{t("upc")}</label>
              <input
                type="text"
                value={upc}
                onChange={(e) => setUpc(e.target.value)}
                disabled={!editable}
                className="input"
                placeholder="Universal Product Code"
              />
            </div>
            <div className="space-y-1.5">
              <label className="label text-muted">{t("catalogNumber")}</label>
              <input
                type="text"
                value={catalogNumber}
                onChange={(e) => setCatalogNumber(e.target.value)}
                disabled={!editable}
                className="input"
                placeholder="Label catalog #"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="label text-muted">&copy; {t("copyrightHolder")}</label>
              <input
                type="text"
                value={copyrightHolder}
                onChange={(e) => setCopyrightHolder(e.target.value)}
                disabled={!editable}
                className="input"
                placeholder="e.g., Artist Name"
              />
            </div>
            <div className="space-y-1.5">
              <label className="label text-muted">{t("copyrightYear")}</label>
              <input
                type="text"
                value={copyrightYear}
                onChange={(e) => setCopyrightYear(e.target.value)}
                disabled={!editable}
                className="input"
                placeholder="e.g., 2026"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="label text-muted">&#8471; {t("phonogramCopyright")}</label>
            <input
              type="text"
              value={phonogramCopyright}
              onChange={(e) => setPhonogramCopyright(e.target.value)}
              disabled={!editable}
              className="input"
              placeholder="e.g., 2026 Artist Name"
            />
          </div>

          {paymentsEnabled && (
            <>
              <Rule />
              <div className="label-sm text-muted">{t("payment")}</div>
              <div className="space-y-1.5">
                <label className="label text-muted">{t("paymentStatus")}</label>
                <PillSelect options={PAYMENT_STATUS_OPTIONS} value={paymentStatus} onChange={setPaymentStatus} disabled={!paymentEditable} />
              </div>
              {paymentStatus !== "no_fee" && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="label text-muted">{t("projectFee")}</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={feeTotal}
                        onChange={(e) => setFeeTotal(e.target.value)}
                        disabled={!paymentEditable}
                        className="input"
                        placeholder="0.00"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="label text-muted">{t("currency")}</label>
                      <select
                        value={feeCurrency}
                        onChange={(e) => setFeeCurrency(e.target.value)}
                        disabled={!paymentEditable}
                        className="input"
                      >
                        {supportedCurrencies.map((c) => (
                          <option key={c.code} value={c.code}>{c.symbol} {c.code}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  {paymentStatus === "partial" && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="label text-muted">{t("paidAmount")}</label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={paidAmount}
                          onChange={(e) => setPaidAmount(e.target.value)}
                          disabled={!paymentEditable}
                          className="input"
                          placeholder="0.00"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="label text-muted">{t("balanceDue")}</label>
                        <div className="input bg-transparent flex items-center text-sm text-muted tabular-nums">
                          {formatMoney(parseFloat(feeTotal || "0") - parseFloat(paidAmount || "0"), feeCurrency, locale)}
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
              <div className="space-y-1.5">
                <label className="label text-muted">{t("paymentNotes")}</label>
                <textarea
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  disabled={!paymentEditable}
                  className="input min-h-[60px] resize-y text-sm"
                  placeholder={t("paymentNotesPlaceholder")}
                />
              </div>
            </>
          )}

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
              {error}
            </p>
          )}

          {editable && (
            <div className="flex items-center gap-3 pt-2">
              <Button variant="primary" onClick={handleSave} disabled={saving}>
                {saving ? tCommon("saving") : t("saveChanges")}
              </Button>
              <Button
                variant="ghost"
                onClick={() => guardedNavigate(() => router.push(`/app/releases/${releaseId}`))}
              >
                {tCommon("cancel")}
              </Button>
            </div>
          )}

          {!editable && (
            <div className="pt-2">
              <Link href={`/app/releases/${releaseId}`}>
                <Button variant="secondary">{t("backToRelease")}</Button>
              </Link>
            </div>
          )}
        </PanelBody>
      </Panel>

      {/* Team Management, Owner only */}
      {teamEditable && (
        <Panel className="mt-6">
          <PanelHeader>
            <h2 className="text-base font-semibold text-text">{t("team")}</h2>
            <p className="mt-1 text-sm text-muted">
              {t("teamDesc")}
            </p>
          </PanelHeader>
          <Rule />
          <PanelBody className="pt-5 space-y-5">
            {/* Invite form */}
            <div className="space-y-3">
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleInvite();
                  }
                }}
                placeholder={t("emailPlaceholder")}
                className="input"
              />
              <div className="flex gap-2">
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as "collaborator" | "client")}
                  className="input w-[140px]"
                >
                  <option value="collaborator">{t("collaborator")}</option>
                  <option value="client">{t("client")}</option>
                </select>
                <Button
                  variant="primary"
                  onClick={handleInvite}
                  disabled={inviting || !inviteEmail.trim()}
                  className="h-10"
                >
                  <UserPlus size={14} />
                  {inviting ? t("inviting") : t("invite")}
                </Button>
              </div>
              {inviteError && (
                <p className="text-xs text-red-500">{inviteError}</p>
              )}
            </div>

            {/* Member list */}
            {members.length > 0 ? (
              <div className="space-y-2">
                {members.map((m) => (
                  <div
                    key={m.id}
                    className="flex items-center justify-between px-4 py-3 rounded-md border border-border bg-panel"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="min-w-0">
                        <div className="text-sm text-text font-medium truncate">
                          {m.invited_email}
                        </div>
                        <div className="text-[10px] text-faint mt-0.5">
                          {m.accepted_at ? t("active") : t("pendingInvite")}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Pill className="text-[10px]">
                        {m.role === "collaborator" ? t("collaborator") : t("client")}
                      </Pill>
                      {!m.accepted_at && (
                        <>
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-100 text-amber-700">
                            {t("pending")}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleResendInvite(m)}
                            disabled={resendingId === m.id}
                            className="text-[10px] text-muted hover:text-text transition-colors px-1.5 py-0.5 disabled:opacity-50"
                          >
                            {resentId === m.id
                              ? t("sent")
                              : resendingId === m.id
                                ? t("sending")
                                : t("resend")}
                          </button>
                        </>
                      )}
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setConfirmRemoveId(confirmRemoveId === m.id ? null : m.id)}
                          className="p-1 rounded text-faint hover:text-red-500 transition-colors"
                          title="Remove member"
                        >
                          <Trash2 size={14} />
                        </button>

                        {confirmRemoveId === m.id && (
                          <div className="absolute right-0 top-full mt-1 w-56 rounded-md border border-border bg-panel shadow-lg p-3 z-20 space-y-2">
                            <p className="text-xs text-muted">
                              {t("removeMemberConfirm", { email: m.invited_email })}
                            </p>
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  handleRemoveMember(m.id);
                                  setConfirmRemoveId(null);
                                }}
                                className="flex-1 px-2 py-1.5 text-xs font-medium text-white bg-red-500 hover:bg-red-600 rounded transition-colors"
                              >
                                {tCommon("confirm")}
                              </button>
                              <button
                                type="button"
                                onClick={() => setConfirmRemoveId(null)}
                                className="flex-1 px-2 py-1.5 text-xs font-medium text-muted hover:text-text border border-border rounded transition-colors"
                              >
                                {tCommon("cancel")}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted text-center py-4">
                {t("noTeamMembers")}
              </p>
            )}
          </PanelBody>
        </Panel>
      )}
    </div>
  );
}
