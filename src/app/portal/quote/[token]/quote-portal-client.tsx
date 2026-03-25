"use client";

import { useState } from "react";
import { CheckCircle, Clock, AlertCircle, CreditCard } from "lucide-react";
import type { Quote, QuoteLineItem } from "@/types/payments";

type ScheduleQuote = {
  id: string;
  quote_number: string;
  schedule_label: string | null;
  schedule_order: number | null;
  total: number;
  status: string;
  paid_at: string | null;
};

type Props = {
  quote: Quote & { line_items: QuoteLineItem[] };
  engineerName: string;
  releaseTitle: string | null;
  canPay: boolean;
  hasStripeConnected: boolean;
  token: string;
  paymentResult: string | null;
  scheduleQuotes: ScheduleQuote[];
};

const STATUS_COLORS: Record<string, string> = {
  draft: "#71717a",
  sent: "#3b82f6",
  viewed: "#f59e0b",
  accepted: "#0d9488",
  paid: "#22c55e",
  expired: "#71717a",
  cancelled: "#ef4444",
};

export function QuotePortalClient({
  quote,
  engineerName,
  releaseTitle,
  canPay,
  hasStripeConnected,
  token,
  paymentResult,
  scheduleQuotes,
}: Props) {
  const [loading, setLoading] = useState(false);
  const isPaid = quote.status === "paid";
  const isExpired = quote.status === "expired";
  const isCancelled = quote.status === "cancelled";
  const isSchedule = scheduleQuotes.length > 1;

  const currencyFormatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: quote.currency,
  });

  async function handlePay() {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/connect/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quoteId: quote.id, token }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || "Failed to create checkout session");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f5f5f5]" style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>
      <div className="max-w-2xl mx-auto px-4 py-10">
        {/* Payment result banner */}
        {paymentResult === "success" && (
          <div className="mb-6 rounded-lg bg-green-50 border border-green-200 p-4 flex items-start gap-3">
            <CheckCircle size={20} className="text-green-600 shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-green-800 text-sm">Payment received!</div>
              <div className="text-green-700 text-sm mt-0.5">{engineerName} has been notified.</div>
            </div>
          </div>
        )}

        {paymentResult === "cancelled" && (
          <div className="mb-6 rounded-lg bg-amber-50 border border-amber-200 p-4 flex items-start gap-3">
            <AlertCircle size={20} className="text-amber-600 shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-amber-800 text-sm">Payment not completed</div>
              <div className="text-amber-700 text-sm mt-0.5">You can try again anytime.</div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="bg-white rounded-lg border border-[#e5e5e5] overflow-hidden">
          <div className="px-8 py-6 border-b border-[#e5e5e5]">
            <div className="text-sm font-semibold text-[#0D9488] tracking-wide uppercase mb-3">
              {engineerName}
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold text-[#1a1a1a]">
                  Quote {quote.quote_number}
                </h1>
                {releaseTitle && (
                  <div className="text-sm text-[#666] mt-1">{releaseTitle}</div>
                )}
              </div>
              <div
                className="px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide"
                style={{
                  backgroundColor: `${STATUS_COLORS[quote.status] ?? "#71717a"}15`,
                  color: STATUS_COLORS[quote.status] ?? "#71717a",
                }}
              >
                {quote.status}
              </div>
            </div>
            <div className="flex items-center gap-4 mt-3 text-xs text-[#999]">
              {quote.issued_at && (
                <span>Issued {new Date(quote.issued_at).toLocaleDateString()}</span>
              )}
              {quote.due_date && (
                <span>Due {new Date(quote.due_date).toLocaleDateString()}</span>
              )}
              {quote.client_name && <span>To: {quote.client_name}</span>}
            </div>
          </div>

          {/* Schedule progress (if part of a schedule) */}
          {isSchedule && (
            <div className="px-8 py-4 border-b border-[#e5e5e5] bg-[#fafafa]">
              <div className="text-xs font-semibold text-[#999] uppercase tracking-wide mb-3">
                Payment Schedule
              </div>
              <div className="flex items-center gap-1">
                {scheduleQuotes.map((sq, idx) => {
                  const isCurrent = sq.id === quote.id;
                  const isPaidStep = sq.status === "paid";
                  return (
                    <div key={sq.id} className="flex items-center gap-1 flex-1">
                      <div className="flex flex-col items-center flex-1">
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                            isPaidStep
                              ? "bg-green-500 text-white"
                              : isCurrent
                                ? "bg-[#0D9488] text-white"
                                : "bg-[#e5e5e5] text-[#999]"
                          }`}
                        >
                          {isPaidStep ? "✓" : idx + 1}
                        </div>
                        <div className="text-[10px] text-[#666] mt-1 text-center truncate max-w-[80px]">
                          {sq.schedule_label ?? `Payment ${idx + 1}`}
                        </div>
                        <div className="text-[10px] text-[#999]">
                          {currencyFormatter.format(Number(sq.total))}
                        </div>
                      </div>
                      {idx < scheduleQuotes.length - 1 && (
                        <div
                          className={`h-0.5 w-4 shrink-0 ${
                            isPaidStep ? "bg-green-500" : "bg-[#e5e5e5]"
                          }`}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Line items */}
          <div className="px-8 py-6">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-[#999] uppercase tracking-wide border-b border-[#e5e5e5]">
                  <th className="text-left pb-2 font-medium">Description</th>
                  <th className="text-center pb-2 font-medium w-16">Qty</th>
                  <th className="text-right pb-2 font-medium w-24">Price</th>
                  <th className="text-right pb-2 font-medium w-24">Total</th>
                </tr>
              </thead>
              <tbody>
                {quote.line_items.map((li) => (
                  <tr key={li.id} className="border-b border-[#f0f0f0]">
                    <td className="py-3 text-[#1a1a1a]">{li.description}</td>
                    <td className="py-3 text-center text-[#666]">{li.quantity}</td>
                    <td className="py-3 text-right text-[#666]">
                      {currencyFormatter.format(li.unit_price)}
                    </td>
                    <td className="py-3 text-right text-[#1a1a1a] font-medium">
                      {currencyFormatter.format(li.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Totals */}
            <div className="mt-4 ml-auto max-w-[200px] space-y-1">
              <div className="flex justify-between text-sm text-[#666]">
                <span>Subtotal</span>
                <span>{currencyFormatter.format(Number(quote.subtotal))}</span>
              </div>
              {Number(quote.discount_amount) > 0 && (
                <div className="flex justify-between text-sm text-[#666]">
                  <span>Discount</span>
                  <span>-{currencyFormatter.format(Number(quote.discount_amount))}</span>
                </div>
              )}
              {Number(quote.tax_amount) > 0 && (
                <div className="flex justify-between text-sm text-[#666]">
                  <span>Tax</span>
                  <span>{currencyFormatter.format(Number(quote.tax_amount))}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-bold text-[#1a1a1a] pt-2 border-t border-[#e5e5e5]">
                <span>Total</span>
                <span>{currencyFormatter.format(Number(quote.total))}</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          {quote.notes && (
            <div className="px-8 py-4 border-t border-[#e5e5e5]">
              <div className="text-xs font-semibold text-[#999] uppercase tracking-wide mb-2">
                Notes
              </div>
              <p className="text-sm text-[#666] whitespace-pre-wrap">{quote.notes}</p>
            </div>
          )}

          {/* Terms */}
          {quote.terms && (
            <div className="px-8 py-4 border-t border-[#e5e5e5]">
              <div className="text-xs font-semibold text-[#999] uppercase tracking-wide mb-2">
                Terms
              </div>
              <p className="text-sm text-[#666] whitespace-pre-wrap">{quote.terms}</p>
            </div>
          )}

          {/* Payment action */}
          <div className="px-8 py-6 border-t border-[#e5e5e5] bg-[#fafafa]">
            {isPaid ? (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle size={20} className="text-green-600" />
                </div>
                <div>
                  <div className="font-semibold text-green-800 text-sm">Paid</div>
                  <div className="text-xs text-green-700">
                    {quote.paid_at
                      ? new Date(quote.paid_at).toLocaleDateString()
                      : "Payment confirmed"}
                    {quote.payment_method === "manual" && " (marked manually)"}
                  </div>
                </div>
              </div>
            ) : isExpired ? (
              <div className="flex items-center gap-3">
                <Clock size={20} className="text-[#999]" />
                <span className="text-sm text-[#999]">This quote has expired.</span>
              </div>
            ) : isCancelled ? (
              <div className="flex items-center gap-3">
                <AlertCircle size={20} className="text-[#999]" />
                <span className="text-sm text-[#999]">This quote has been cancelled.</span>
              </div>
            ) : canPay ? (
              <button
                onClick={handlePay}
                disabled={loading}
                className="w-full py-3 rounded-lg font-semibold text-white text-sm transition-colors"
                style={{ backgroundColor: loading ? "#999" : "#0D9488" }}
              >
                <span className="flex items-center justify-center gap-2">
                  <CreditCard size={16} />
                  {loading ? "Redirecting to payment..." : `Pay ${currencyFormatter.format(Number(quote.total))}`}
                </span>
              </button>
            ) : !hasStripeConnected ? (
              <div className="text-sm text-[#666] text-center">
                Contact {engineerName} to arrange payment.
              </div>
            ) : null}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-xs text-[#999]">
          Powered by <a href="https://mixarchitect.com" className="text-[#0D9488] hover:underline">Mix Architect</a>
        </div>
      </div>
    </div>
  );
}
