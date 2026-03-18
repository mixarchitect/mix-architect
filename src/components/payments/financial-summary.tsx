"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { Check, X, Pencil } from "lucide-react";
import { Panel, PanelBody } from "@/components/ui/panel";
import { createSupabaseBrowserClient } from "@/lib/supabaseBrowserClient";
import type { ReleaseExpense } from "@/app/app/releases/[releaseId]/expense-actions";
import type { ReleaseTimeEntry } from "@/app/app/releases/[releaseId]/time-entry-actions";

function fmt(amount: number, currency: string, locale: string): string {
  return new Intl.NumberFormat(locale, { style: "currency", currency }).format(amount);
}

interface Props {
  releaseId: string;
  feeTotal: number | null;
  paidAmount: number;
  feeCurrency: string;
  paymentStatus: string;
  expenses: ReleaseExpense[];
  timeEntries: ReleaseTimeEntry[];
  locale: string;
}

const STATUS_CYCLE = ["unpaid", "partial", "paid"] as const;

const statusLabels: Record<string, string> = {
  no_fee: "No Fee",
  unpaid: "Unpaid",
  partial: "Partial",
  paid: "Paid",
};

const statusColors: Record<string, string> = {
  no_fee: "text-faint",
  unpaid: "text-red-400",
  partial: "text-amber-400",
  paid: "text-green-400",
};

export function FinancialSummary({
  releaseId,
  feeTotal: initialFee,
  paidAmount: initialPaid,
  feeCurrency,
  paymentStatus: initialStatus,
  expenses,
  timeEntries,
  locale: localeProp,
}: Props) {
  const locale = useLocale() || localeProp;
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();

  const [fee, setFee] = useState(initialFee);
  const [paid, setPaid] = useState(initialPaid);
  const [status, setStatus] = useState(initialStatus);
  const [editingFee, setEditingFee] = useState(false);
  const [feeInput, setFeeInput] = useState(initialFee != null ? String(initialFee) : "");
  const [editingPaid, setEditingPaid] = useState(false);
  const [paidInput, setPaidInput] = useState(String(initialPaid));

  const totalHours = timeEntries.reduce((sum, e) => sum + Number(e.hours), 0);
  const timeBillable = timeEntries.reduce((sum, e) => {
    if (e.rate != null) return sum + Number(e.hours) * Number(e.rate);
    return sum;
  }, 0);
  const expensesTotal = expenses.reduce((sum, e) => sum + Number(e.amount), 0);

  const effectiveFee = status === "no_fee" ? null : fee;
  const feeVal = effectiveFee ?? 0;
  const totalBilled = feeVal + timeBillable + expensesTotal;
  const balance = totalBilled - paid;
  const hasAnyData = effectiveFee != null || timeEntries.length > 0 || expenses.length > 0;

  if (!hasAnyData) return null;

  function deriveStatus(paidAmt: number, total: number): string {
    if (total <= 0) return status;
    if (paidAmt >= total) return "paid";
    if (paidAmt > 0) return "partial";
    return "unpaid";
  }

  async function saveFee() {
    const parsed = feeInput.trim() ? parseFloat(feeInput) : null;
    if (feeInput.trim() && isNaN(parsed!)) return;
    const prev = fee;
    setFee(parsed);
    setEditingFee(false);
    try {
      const newTotal = (parsed ?? 0) + timeBillable + expensesTotal;
      const newStatus = deriveStatus(paid, newTotal);
      const { error } = await supabase
        .from("releases")
        .update({ fee_total: parsed, payment_status: newStatus })
        .eq("id", releaseId);
      if (error) throw error;
      setStatus(newStatus);
      router.refresh();
    } catch {
      setFee(prev);
    }
  }

  async function savePaid() {
    const parsed = paidInput.trim() ? parseFloat(paidInput) : 0;
    if (paidInput.trim() && isNaN(parsed)) return;
    const prev = paid;
    setPaid(parsed);
    setEditingPaid(false);
    const newStatus = deriveStatus(parsed, totalBilled);
    try {
      const { error } = await supabase
        .from("releases")
        .update({ paid_amount: parsed, payment_status: newStatus })
        .eq("id", releaseId);
      if (error) throw error;
      setStatus(newStatus);
      router.refresh();
    } catch {
      setPaid(prev);
    }
  }

  async function cycleStatus() {
    const idx = STATUS_CYCLE.indexOf(status as any);
    const next = STATUS_CYCLE[((idx === -1 ? 0 : idx) + 1) % STATUS_CYCLE.length];
    const prev = status;
    setStatus(next);
    try {
      const { error } = await supabase
        .from("releases")
        .update({ payment_status: next })
        .eq("id", releaseId);
      if (error) throw error;
      router.refresh();
    } catch {
      setStatus(prev);
    }
  }

  return (
    <Panel>
      <PanelBody className="py-5">
        <div className="label-sm text-muted mb-3">FINANCIAL SUMMARY</div>
        <div className="space-y-2 text-sm" style={{ fontVariantNumeric: "tabular-nums" }}>
          {/* Project fee — editable */}
          {effectiveFee != null && (
            <div className="flex justify-between items-center">
              <span className="text-muted">Project fee</span>
              {editingFee ? (
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={feeInput}
                    onChange={(e) => setFeeInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") saveFee();
                      if (e.key === "Escape") {
                        setFeeInput(fee != null ? String(fee) : "");
                        setEditingFee(false);
                      }
                    }}
                    className="input text-xs h-7 w-24 py-0.5 px-2 text-right"
                    autoFocus
                    placeholder="0.00"
                  />
                  <button onClick={saveFee} className="text-signal"><Check size={14} /></button>
                  <button onClick={() => { setFeeInput(fee != null ? String(fee) : ""); setEditingFee(false); }} className="text-muted hover:text-text"><X size={14} /></button>
                </div>
              ) : (
                <button
                  onClick={() => { setFeeInput(fee != null ? String(fee) : ""); setEditingFee(true); }}
                  className="text-text hover:opacity-80 transition-opacity group text-right"
                >
                  {fmt(effectiveFee, feeCurrency, locale)}
                  <Pencil size={10} className="text-faint inline ml-1.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              )}
            </div>
          )}

          {/* Time logged */}
          {timeEntries.length > 0 && (
            <div className="flex justify-between">
              <span className="text-muted">
                Time logged
                <span className="text-faint ml-1.5">{totalHours.toFixed(1)}h</span>
              </span>
              {timeBillable > 0 && (
                <span className="text-text text-right">{fmt(timeBillable, feeCurrency, locale)}</span>
              )}
            </div>
          )}

          {/* Expenses */}
          {expenses.length > 0 && (
            <div className="flex justify-between">
              <span className="text-muted">
                Expenses
                <span className="text-faint ml-1.5">{expenses.length} item{expenses.length !== 1 ? "s" : ""}</span>
              </span>
              <span className="text-text text-right">{fmt(expensesTotal, feeCurrency, locale)}</span>
            </div>
          )}

          {/* Total billed */}
          {totalBilled > 0 && (
            <>
              <div className="border-t border-border my-1" />
              <div className="flex justify-between font-medium">
                <span className="text-muted">Total billed</span>
                <span className="text-green-400">{fmt(totalBilled, feeCurrency, locale)}</span>
              </div>
            </>
          )}

          {/* Paid — editable */}
          {status !== "no_fee" && totalBilled > 0 && (
            <div className="flex justify-between items-center">
              <span className="text-muted">Paid</span>
              {editingPaid ? (
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={paidInput}
                    onChange={(e) => setPaidInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") savePaid();
                      if (e.key === "Escape") {
                        setPaidInput(String(paid));
                        setEditingPaid(false);
                      }
                    }}
                    className="input text-xs h-7 w-24 py-0.5 px-2 text-right"
                    autoFocus
                    placeholder="0.00"
                  />
                  <button onClick={savePaid} className="text-signal"><Check size={14} /></button>
                  <button onClick={() => { setPaidInput(String(paid)); setEditingPaid(false); }} className="text-muted hover:text-text"><X size={14} /></button>
                </div>
              ) : (
                <button
                  onClick={() => { setPaidInput(String(paid)); setEditingPaid(true); }}
                  className="text-red-400 hover:opacity-80 transition-opacity group text-right"
                >
                  {paid > 0 ? `−${fmt(paid, feeCurrency, locale)}` : fmt(0, feeCurrency, locale)}
                  <Pencil size={10} className="text-faint inline ml-1.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              )}
            </div>
          )}

          {/* Balance */}
          {totalBilled > 0 && (
            <div className="flex justify-between font-medium">
              <span className="text-muted">Balance</span>
              <span className={balance > 0 ? "text-amber-400" : balance === 0 ? "text-green-400" : "text-muted"}>
                {fmt(balance, feeCurrency, locale)}
              </span>
            </div>
          )}

          {/* Payment status — always visible so user can recover */}
          {(
            <div className="flex justify-between items-center pt-1 border-t border-border/50">
              <span className="text-muted">Status</span>
              <button
                onClick={cycleStatus}
                className={`text-xs font-medium ${statusColors[status] ?? "text-faint"} hover:opacity-80 transition-opacity`}
              >
                {statusLabels[status] ?? status}
                {status === "paid" && " ✓"}
              </button>
            </div>
          )}
        </div>
      </PanelBody>
    </Panel>
  );
}
