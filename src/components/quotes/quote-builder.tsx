"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { ArrowLeft, Plus, Trash2, GripVertical, Import } from "lucide-react";
import Link from "next/link";
import { Panel, PanelBody } from "@/components/ui/panel";
import { Rule } from "@/components/ui/rule";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/currency";
import { createQuote, updateQuote, sendQuote, deleteQuote, createPaymentSchedule } from "@/actions/quotes";
import type { Quote, QuoteLineItem } from "@/types/payments";

type LineItemDraft = {
  id?: string;
  description: string;
  quantity: number;
  unit_price: number;
  track_id?: string | null;
  sort_order: number;
};

type Release = {
  id: string;
  title: string;
  client_name: string | null;
  client_email: string | null;
  fee_total: number | null;
  fee_currency: string | null;
};

type ScheduleInstallment = {
  label: string;
  amount: number;
  due_date: string;
};

type Props = {
  releases: Release[];
  prefilledReleaseId?: string;
  releaseTracks?: { id: string; title: string; fee: number | null }[];
  defaultCurrency: string;
  locale: string;
  existingQuote?: Quote;
  defaultDocumentType?: "quote" | "invoice";
};

type Mode = "single" | "schedule";

export function QuoteBuilder({
  releases,
  prefilledReleaseId,
  releaseTracks = [],
  defaultCurrency,
  locale,
  existingQuote,
  defaultDocumentType,
}: Props) {
  const router = useRouter();
  const t = useTranslations("quotes");
  const isEditing = !!existingQuote;

  // ── Form State ──
  const [documentType, setDocumentType] = useState<"quote" | "invoice">(existingQuote?.document_type ?? defaultDocumentType ?? "quote");
  const isInvoice = documentType === "invoice";
  const [mode, setMode] = useState<Mode>("single");
  const [releaseId, setReleaseId] = useState(existingQuote?.release_id ?? prefilledReleaseId ?? "");
  const [title, setTitle] = useState(existingQuote?.title ?? "");
  const [clientName, setClientName] = useState(existingQuote?.client_name ?? "");
  const [clientEmail, setClientEmail] = useState(existingQuote?.client_email ?? "");
  const [currency, setCurrency] = useState(existingQuote?.currency ?? defaultCurrency);
  const [discountAmount, setDiscountAmount] = useState(existingQuote?.discount_amount ?? 0);
  const [taxAmount, setTaxAmount] = useState(existingQuote?.tax_amount ?? 0);
  const [notes, setNotes] = useState(existingQuote?.notes ?? "");
  const [internalNotes, setInternalNotes] = useState(existingQuote?.internal_notes ?? "");
  const [terms, setTerms] = useState(existingQuote?.terms ?? "");
  const [dueDate, setDueDate] = useState(existingQuote?.due_date ?? "");
  const [expiresAt, setExpiresAt] = useState(existingQuote?.expires_at?.split("T")[0] ?? "");

  const [lineItems, setLineItems] = useState<LineItemDraft[]>(
    existingQuote?.line_items?.map((li) => ({
      id: li.id,
      description: li.description,
      quantity: li.quantity,
      unit_price: li.unit_price,
      track_id: li.track_id,
      sort_order: li.sort_order,
    })) ?? [{ description: "", quantity: 1, unit_price: 0, sort_order: 0 }],
  );

  // Schedule state
  const [installments, setInstallments] = useState<ScheduleInstallment[]>([
    { label: "Deposit", amount: 0, due_date: "" },
    { label: "On delivery", amount: 0, due_date: "" },
  ]);

  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // ── Derived ──
  const selectedRelease = releases.find((r) => r.id === releaseId);

  // Auto-fill client info when release changes
  function handleReleaseChange(newReleaseId: string) {
    setReleaseId(newReleaseId);
    const rel = releases.find((r) => r.id === newReleaseId);
    if (rel) {
      if (rel.client_name && !clientName) setClientName(rel.client_name);
      if (rel.client_email && !clientEmail) setClientEmail(rel.client_email);
      if (rel.fee_currency) setCurrency(rel.fee_currency);
    }
  }

  const subtotal = useMemo(
    () => lineItems.reduce((sum, li) => sum + li.quantity * li.unit_price, 0),
    [lineItems],
  );
  const total = subtotal - discountAmount + taxAmount;

  const scheduleTotal = useMemo(
    () => installments.reduce((sum, inst) => sum + inst.amount, 0),
    [installments],
  );

  // ── Line Item Handlers ──
  function addLineItem() {
    setLineItems((prev) => [
      ...prev,
      { description: "", quantity: 1, unit_price: 0, sort_order: prev.length },
    ]);
  }

  function removeLineItem(idx: number) {
    setLineItems((prev) => prev.filter((_, i) => i !== idx).map((li, i) => ({ ...li, sort_order: i })));
  }

  function updateLineItem(idx: number, field: keyof LineItemDraft, value: string | number) {
    setLineItems((prev) =>
      prev.map((li, i) => (i === idx ? { ...li, [field]: value } : li)),
    );
  }

  function importFromTrackFees() {
    const items = releaseTracks
      .filter((t) => t.fee && t.fee > 0)
      .map((t, i) => ({
        description: t.title,
        quantity: 1,
        unit_price: t.fee!,
        track_id: t.id,
        sort_order: i,
      }));
    if (items.length > 0) setLineItems(items);
  }

  // ── Schedule Handlers ──
  function addInstallment() {
    setInstallments((prev) => [...prev, { label: "", amount: 0, due_date: "" }]);
  }

  function removeInstallment(idx: number) {
    if (installments.length <= 2) return;
    setInstallments((prev) => prev.filter((_, i) => i !== idx));
  }

  function updateInstallment(idx: number, field: keyof ScheduleInstallment, value: string | number) {
    setInstallments((prev) =>
      prev.map((inst, i) => (i === idx ? { ...inst, [field]: value } : inst)),
    );
  }

  function applyPreset(type: "5050" | "deposit_balance" | "three") {
    const base = selectedRelease?.fee_total ?? 1000;
    if (type === "5050") {
      const half = Math.round(base / 2 * 100) / 100;
      setInstallments([
        { label: "First payment", amount: half, due_date: "" },
        { label: "Final payment", amount: base - half, due_date: "" },
      ]);
    } else if (type === "deposit_balance") {
      const deposit = Math.round(base * 0.5 * 100) / 100;
      setInstallments([
        { label: "Deposit", amount: deposit, due_date: "" },
        { label: "Balance", amount: base - deposit, due_date: "" },
      ]);
    } else {
      const third = Math.round(base / 3 * 100) / 100;
      setInstallments([
        { label: "Deposit", amount: third, due_date: "" },
        { label: "Midpoint", amount: third, due_date: "" },
        { label: "Final delivery", amount: base - third * 2, due_date: "" },
      ]);
    }
  }

  // ── Save / Send ──
  async function handleSave() {
    setSaving(true);
    try {
      if (mode === "schedule") {
        const result = await createPaymentSchedule({
          release_id: releaseId,
          client_name: clientName || null,
          client_email: clientEmail || null,
          currency,
          notes: notes || null,
          terms: terms || null,
          installments: installments.map((inst) => ({
            label: inst.label,
            amount: inst.amount,
            due_date: inst.due_date || null,
          })),
        });
        if (result.error) {
          alert(result.error);
          return;
        }
        router.push(releaseId ? `/app/releases/${releaseId}?tab=financials` : "/app/quotes");
      } else if (isEditing && existingQuote) {
        const result = await updateQuote(existingQuote.id, {
          release_id: releaseId || null,
          title: title || null,
          client_name: clientName || null,
          client_email: clientEmail || null,
          currency,
          discount_amount: discountAmount,
          tax_amount: taxAmount,
          notes: notes || null,
          internal_notes: internalNotes || null,
          terms: terms || null,
          due_date: dueDate || null,
          expires_at: expiresAt ? new Date(expiresAt).toISOString() : null,
          line_items: lineItems.map((li) => ({
            id: li.id,
            description: li.description,
            quantity: li.quantity,
            unit_price: li.unit_price,
            track_id: li.track_id ?? null,
            sort_order: li.sort_order,
          })),
        });
        if (result.error) {
          alert(result.error);
          return;
        }
        router.push(releaseId ? `/app/releases/${releaseId}?tab=financials` : "/app/quotes");
      } else {
        const result = await createQuote({
          release_id: releaseId || null,
          document_type: documentType,
          title: title || null,
          client_name: clientName || null,
          client_email: clientEmail || null,
          currency,
          discount_amount: discountAmount,
          tax_amount: taxAmount,
          notes: notes || null,
          internal_notes: internalNotes || null,
          terms: terms || null,
          due_date: dueDate || null,
          expires_at: expiresAt ? new Date(expiresAt).toISOString() : null,
          line_items: lineItems.map((li) => ({
            description: li.description,
            quantity: li.quantity,
            unit_price: li.unit_price,
            track_id: li.track_id ?? null,
            sort_order: li.sort_order,
          })),
        });
        if (result.error) {
          alert(result.error);
          return;
        }
        router.push(releaseId ? `/app/releases/${releaseId}?tab=financials` : "/app/quotes");
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleSend() {
    if (!clientEmail) {
      alert(t("builder.emailRequired"));
      return;
    }
    setSending(true);
    try {
      // Save first, then send
      if (!isEditing) {
        const result = await createQuote({
          release_id: releaseId || null,
          document_type: documentType,
          title: title || null,
          client_name: clientName || null,
          client_email: clientEmail || null,
          currency,
          discount_amount: discountAmount,
          tax_amount: taxAmount,
          notes: notes || null,
          internal_notes: internalNotes || null,
          terms: terms || null,
          due_date: dueDate || null,
          expires_at: expiresAt ? new Date(expiresAt).toISOString() : null,
          line_items: lineItems.map((li) => ({
            description: li.description,
            quantity: li.quantity,
            unit_price: li.unit_price,
            track_id: li.track_id ?? null,
            sort_order: li.sort_order,
          })),
        });
        if (result.error || !result.quote) {
          alert(result.error);
          return;
        }
        await sendQuote(result.quote.id);
      } else if (existingQuote) {
        await sendQuote(existingQuote.id);
      }
      router.push(releaseId ? `/app/releases/${releaseId}?tab=financials` : "/app/quotes");
    } finally {
      setSending(false);
    }
  }

  async function handleDelete() {
    if (!existingQuote) return;
    setDeleting(true);
    await deleteQuote(existingQuote.id);
    router.push(releaseId ? `/app/releases/${releaseId}?tab=financials` : "/app/quotes");
  }

  const backHref = releaseId ? `/app/releases/${releaseId}?tab=financials` : "/app/quotes";
  const hasTrackFees = releaseTracks.some((t) => t.fee && t.fee > 0);
  const isReadonly = existingQuote && existingQuote.status !== "draft";
  const canDelete = existingQuote && ["draft", "sent", "viewed"].includes(existingQuote.status);
  const isDraft = existingQuote?.status === "draft";

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link
          href={backHref}
          className="text-sm text-muted hover:text-text transition-colors flex items-center gap-1"
        >
          <ArrowLeft size={14} />
          {t("builder.back")}
        </Link>
        <h1 className="text-xl font-semibold text-text">
          {isEditing
            ? `${isInvoice ? t("builder.editInvoiceTitle") : t("builder.editTitle")} ${existingQuote.quote_number}`
            : isInvoice ? t("builder.newInvoiceTitle") : t("builder.newTitle")}
        </h1>
      </div>

      {/* Document type selector */}
      {!isEditing && (
        <div className="flex gap-2 mb-4">
          <button
            type="button"
            onClick={() => setDocumentType("quote")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              documentType === "quote"
                ? "bg-signal text-white"
                : "bg-panel2 text-muted hover:text-text"
            }`}
          >
            {t("builder.typeQuote")}
          </button>
          <button
            type="button"
            onClick={() => setDocumentType("invoice")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              documentType === "invoice"
                ? "bg-signal text-white"
                : "bg-panel2 text-muted hover:text-text"
            }`}
          >
            {t("builder.typeInvoice")}
          </button>
        </div>
      )}

      {/* Mode toggle (only for new quotes) */}
      {!isEditing && documentType === "quote" && (
        <div className="flex gap-2 mb-6">
          <button
            type="button"
            onClick={() => setMode("single")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              mode === "single"
                ? "bg-signal text-white"
                : "bg-panel2 text-muted hover:text-text"
            }`}
          >
            {t("builder.singleQuote")}
          </button>
          <button
            type="button"
            onClick={() => setMode("schedule")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              mode === "schedule"
                ? "bg-signal text-white"
                : "bg-panel2 text-muted hover:text-text"
            }`}
          >
            {t("builder.paymentSchedule")}
          </button>
        </div>
      )}

      <div className="space-y-4">
        {/* Client & Release Info */}
        <Panel>
          <PanelBody className="py-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="label text-muted">{t("builder.release")}</label>
                <select
                  value={releaseId}
                  onChange={(e) => handleReleaseChange(e.target.value)}
                  className="input text-sm"
                  disabled={isReadonly}
                >
                  <option value="">{t("builder.noRelease")}</option>
                  {releases.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.title}
                    </option>
                  ))}
                </select>
              </div>
              {mode === "single" && (
                <div className="space-y-1.5">
                  <label className="label text-muted">{t("builder.title")}</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="input text-sm"
                    placeholder={t("builder.titlePlaceholder")}
                    disabled={isReadonly}
                  />
                </div>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="label text-muted">{t("builder.clientName")}</label>
                <input
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="input text-sm"
                  disabled={isReadonly}
                />
              </div>
              <div className="space-y-1.5">
                <label className="label text-muted">{t("builder.clientEmail")}</label>
                <input
                  type="email"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  className="input text-sm"
                  disabled={isReadonly}
                />
              </div>
            </div>
          </PanelBody>
        </Panel>

        {/* Single Quote: Line Items */}
        {mode === "single" && (
          <Panel>
            <PanelBody className="py-5">
              <div className="flex items-center justify-between mb-4">
                <span className="label text-muted">{t("builder.lineItems")}</span>
                <div className="flex items-center gap-2">
                  {hasTrackFees && !isReadonly && (
                    <button
                      type="button"
                      onClick={importFromTrackFees}
                      className="flex items-center gap-1 text-xs text-signal hover:underline"
                    >
                      <Import size={12} />
                      {t("builder.importFees")}
                    </button>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                {lineItems.map((li, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <GripVertical size={14} className="text-muted mt-2.5 shrink-0 cursor-grab" />
                    <input
                      type="text"
                      value={li.description}
                      onChange={(e) => updateLineItem(idx, "description", e.target.value)}
                      className="input text-sm flex-1"
                      placeholder={t("builder.descriptionPlaceholder")}
                      disabled={isReadonly}
                    />
                    <input
                      type="number"
                      value={li.quantity}
                      onChange={(e) => updateLineItem(idx, "quantity", parseFloat(e.target.value) || 0)}
                      className="input text-sm w-16 text-center"
                      min="0"
                      step="1"
                      disabled={isReadonly}
                    />
                    <input
                      type="number"
                      value={li.unit_price || ""}
                      onChange={(e) => updateLineItem(idx, "unit_price", parseFloat(e.target.value) || 0)}
                      className="input text-sm w-28 text-right"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      disabled={isReadonly}
                    />
                    <div className="w-24 text-sm text-right text-muted pt-2 shrink-0">
                      {formatCurrency(li.quantity * li.unit_price, currency, locale)}
                    </div>
                    {!isReadonly && lineItems.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeLineItem(idx)}
                        className="p-1.5 text-muted hover:text-red-400 transition-colors mt-1"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {!isReadonly && (
                <button
                  type="button"
                  onClick={addLineItem}
                  className="flex items-center gap-1 text-xs text-signal hover:underline mt-3"
                >
                  <Plus size={12} />
                  {t("builder.addLineItem")}
                </button>
              )}

              <Rule className="my-4" />

              {/* Totals */}
              <div className="space-y-2 max-w-xs ml-auto">
                <div className="flex justify-between text-sm">
                  <span className="text-muted">{t("builder.subtotal")}</span>
                  <span className="text-text">{formatCurrency(subtotal, currency, locale)}</span>
                </div>
                <div className="flex justify-between text-sm items-center gap-2">
                  <span className="text-muted">{t("builder.discount")}</span>
                  <input
                    type="number"
                    value={discountAmount || ""}
                    onChange={(e) => setDiscountAmount(parseFloat(e.target.value) || 0)}
                    className="input text-sm w-28 text-right"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    disabled={isReadonly}
                  />
                </div>
                <div className="flex justify-between text-sm items-center gap-2">
                  <span className="text-muted">{t("builder.tax")}</span>
                  <input
                    type="number"
                    value={taxAmount || ""}
                    onChange={(e) => setTaxAmount(parseFloat(e.target.value) || 0)}
                    className="input text-sm w-28 text-right"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    disabled={isReadonly}
                  />
                </div>
                <Rule />
                <div className="flex justify-between text-sm font-semibold">
                  <span className="text-text">{t("builder.total")}</span>
                  <span className="text-text">{formatCurrency(total, currency, locale)}</span>
                </div>
              </div>
            </PanelBody>
          </Panel>
        )}

        {/* Payment Schedule Mode */}
        {mode === "schedule" && (
          <Panel>
            <PanelBody className="py-5">
              <div className="flex items-center justify-between mb-4">
                <span className="label text-muted">{t("builder.installments")}</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => applyPreset("5050")}
                    className="text-xs text-signal hover:underline"
                  >
                    50/50
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPreset("deposit_balance")}
                    className="text-xs text-signal hover:underline"
                  >
                    {t("builder.depositBalance")}
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPreset("three")}
                    className="text-xs text-signal hover:underline"
                  >
                    {t("builder.threeMilestones")}
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                {installments.map((inst, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="text-xs text-muted w-5 shrink-0">{idx + 1}.</span>
                    <input
                      type="text"
                      value={inst.label}
                      onChange={(e) => updateInstallment(idx, "label", e.target.value)}
                      className="input text-sm flex-1"
                      placeholder={t("builder.installmentLabel")}
                    />
                    <input
                      type="number"
                      value={inst.amount || ""}
                      onChange={(e) => updateInstallment(idx, "amount", parseFloat(e.target.value) || 0)}
                      className="input text-sm w-28 text-right"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                    />
                    <input
                      type="date"
                      value={inst.due_date}
                      onChange={(e) => updateInstallment(idx, "due_date", e.target.value)}
                      className="input text-sm w-36"
                    />
                    {installments.length > 2 && (
                      <button
                        type="button"
                        onClick={() => removeInstallment(idx)}
                        className="p-1.5 text-muted hover:text-red-400 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={addInstallment}
                className="flex items-center gap-1 text-xs text-signal hover:underline mt-3"
              >
                <Plus size={12} />
                {t("builder.addInstallment")}
              </button>

              <Rule className="my-4" />

              <div className="flex justify-between text-sm font-semibold max-w-xs ml-auto">
                <span className="text-text">{t("builder.scheduleTotal")}</span>
                <span className="text-text">{formatCurrency(scheduleTotal, currency, locale)}</span>
              </div>
            </PanelBody>
          </Panel>
        )}

        {/* Notes */}
        <Panel>
          <PanelBody className="py-5 space-y-4">
            <div className="space-y-1.5">
              <label className="label text-muted">{t("builder.notes")}</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="input text-sm min-h-[60px]"
                placeholder={t("builder.notesPlaceholder")}
                disabled={isReadonly}
              />
            </div>
            <div className="space-y-1.5">
              <label className="label text-muted">{t("builder.internalNotes")}</label>
              <textarea
                value={internalNotes}
                onChange={(e) => setInternalNotes(e.target.value)}
                className="input text-sm min-h-[60px]"
                placeholder={t("builder.internalNotesPlaceholder")}
                disabled={isReadonly}
              />
              <p className="text-[10px] text-muted">{t("builder.internalNotesHelp")}</p>
            </div>
            {mode === "single" && (
              <div className="space-y-1.5 max-w-xs">
                <label className="label text-muted">{t("builder.dueDate")}</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="input text-sm"
                  disabled={isReadonly}
                />
              </div>
            )}
          </PanelBody>
        </Panel>

        {/* Action Bar */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-3">
            <Link
              href={backHref}
              className="text-sm text-muted hover:text-text transition-colors"
            >
              {isReadonly ? t("builder.back") : t("builder.cancel")}
            </Link>
            {canDelete && (
              <div className="relative">
                {!confirmDelete ? (
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(true)}
                    className="text-sm text-red-400 hover:text-red-300 transition-colors"
                  >
                    {isDraft ? t("actions.delete") : t("actions.cancel")}
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted">
                      {isDraft ? t("actions.confirmDelete") : t("actions.confirmCancel")}
                    </span>
                    <button
                      type="button"
                      onClick={handleDelete}
                      disabled={deleting}
                      className="text-xs bg-red-500/10 text-red-400 hover:bg-red-500/20 px-3 py-1 rounded-md transition-colors disabled:opacity-50"
                    >
                      {deleting ? t("actions.deleting") : t("actions.confirm")}
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmDelete(false)}
                      className="text-xs text-muted hover:text-text transition-colors"
                    >
                      {t("actions.dismiss")}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
          {!isReadonly && (
            <div className="flex items-center gap-3">
              <Button
                variant="secondary"
                onClick={handleSave}
                disabled={saving || sending}
              >
                {saving
                  ? t("builder.saving")
                  : mode === "schedule"
                    ? t("builder.saveSchedule")
                    : t("builder.saveDraft")}
              </Button>
              {mode === "single" && (
                <Button
                  variant="primary"
                  onClick={handleSend}
                  disabled={saving || sending || !clientEmail}
                >
                  {sending ? t("builder.sending") : t("builder.sendToClient")}
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
