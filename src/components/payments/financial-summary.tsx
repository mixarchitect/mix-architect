import { Panel, PanelBody } from "@/components/ui/panel";
import type { ReleaseExpense } from "@/app/app/releases/[releaseId]/expense-actions";
import type { ReleaseTimeEntry } from "@/app/app/releases/[releaseId]/time-entry-actions";

function fmt(amount: number, currency: string, locale: string): string {
  return new Intl.NumberFormat(locale, { style: "currency", currency }).format(amount);
}

interface Props {
  feeTotal: number | null;
  feeCurrency: string;
  paymentStatus: string;
  expenses: ReleaseExpense[];
  timeEntries: ReleaseTimeEntry[];
  locale: string;
}

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

export function FinancialSummary({ feeTotal, feeCurrency, paymentStatus, expenses, timeEntries, locale }: Props) {
  const totalHours = timeEntries.reduce((sum, e) => sum + Number(e.hours), 0);
  const timeBillable = timeEntries.reduce((sum, e) => {
    if (e.rate != null) return sum + Number(e.hours) * Number(e.rate);
    return sum;
  }, 0);
  const expensesTotal = expenses.reduce((sum, e) => sum + Number(e.amount), 0);

  // If no fee set but time entries have rates, use time total as implied fee
  const feeDisplay = feeTotal ?? (timeBillable > 0 ? timeBillable : null);
  const net = feeDisplay != null ? feeDisplay - expensesTotal : -expensesTotal;
  const hasAnyData = feeTotal != null || timeEntries.length > 0 || expenses.length > 0;

  if (!hasAnyData) return null;

  return (
    <Panel>
      <PanelBody className="py-5">
        <div className="label-sm text-muted mb-3">FINANCIAL SUMMARY</div>
        <div className="space-y-2 text-sm">
          {/* Project fee */}
          {feeTotal != null && (
            <div className="flex justify-between">
              <span className="text-muted">Project fee</span>
              <span className="text-text">{fmt(feeTotal, feeCurrency, locale)}</span>
            </div>
          )}

          {/* Time logged */}
          {timeEntries.length > 0 && (
            <div className="flex justify-between">
              <span className="text-muted">
                Time logged
                <span className="text-faint ml-1.5">{totalHours.toFixed(2)} hrs</span>
              </span>
              {timeBillable > 0 && (
                <span className="text-text">{fmt(timeBillable, feeCurrency, locale)}</span>
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
              <span className="text-text">({fmt(expensesTotal, feeCurrency, locale)})</span>
            </div>
          )}

          {/* Net */}
          {(feeDisplay != null || expensesTotal > 0) && (
            <>
              <div className="border-t border-border my-1" />
              <div className="flex justify-between font-medium">
                <span className="text-muted">Net</span>
                <span className={net < 0 ? "text-amber-400" : "text-text"}>
                  {fmt(net, feeCurrency, locale)}
                </span>
              </div>
            </>
          )}

          {/* Payment status */}
          {paymentStatus !== "no_fee" && (
            <div className="flex justify-between items-center pt-1">
              <span className="text-muted">Payment</span>
              <span className={`text-xs font-medium ${statusColors[paymentStatus] ?? "text-faint"}`}>
                {statusLabels[paymentStatus] ?? paymentStatus}
                {paymentStatus === "paid" && " ✓"}
              </span>
            </div>
          )}
        </div>
      </PanelBody>
    </Panel>
  );
}
