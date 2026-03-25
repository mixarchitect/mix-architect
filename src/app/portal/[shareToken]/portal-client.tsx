"use client";

import { useState, useCallback } from "react";
import { PortalHeader } from "@/components/portal/portal-header";
import { PortalTrackCard } from "@/components/portal/portal-track-card";
import { PortalFooter } from "@/components/portal/portal-footer";
import { PortalReferenceItem } from "@/components/portal/portal-reference-item";
import { PostActionPrompt } from "@/components/referral/PostActionPrompt";
import { usePostActionPrompt } from "@/hooks/usePostActionPrompt";
import { ChevronRight, CreditCard, CheckCircle } from "lucide-react";
import type { PortalRelease, PortalTrack, PortalShare, ApprovalStatus } from "@/lib/portal-types";
import type { BriefReference } from "@/lib/db-types";

type PortalQuote = {
  id: string;
  quote_number: string;
  status: string;
  total: number;
  currency: string;
  portal_token: string;
  paid_at: string | null;
  schedule_group_id: string | null;
  schedule_label: string | null;
  schedule_order: number | null;
};

type PortalClientProps = {
  shareToken: string;
  share: PortalShare;
  release: PortalRelease;
  tracks: PortalTrack[];
  globalDirection: string | null;
  globalRefs: BriefReference[];
  quotes?: PortalQuote[];
  hasStripeConnected?: boolean;
};

export function PortalClient({
  shareToken,
  share,
  release,
  tracks: initialTracks,
  globalDirection,
  globalRefs,
  quotes = [],
  hasStripeConnected = false,
}: PortalClientProps) {
  const [tracks, setTracks] = useState(initialTracks);

  // Payment gating: if quotes exist, use quote-based gating; otherwise fall back to manual
  const hasUnpaidQuotes = quotes.some((q) => q.status !== "paid");
  const paymentGated =
    share.require_payment_for_download &&
    (quotes.length > 0 ? hasUnpaidQuotes : release.payment_status !== "paid");
  const { showPrompt, promptTrigger, triggerPrompt, dismissPrompt } = usePostActionPrompt();

  // Update a single track's approval status reactively (no page reload)
  const handleStatusChange = useCallback((trackId: string, newStatus: ApprovalStatus) => {
    setTracks((prev) =>
      prev.map((t) =>
        t.id === trackId ? { ...t, approvalStatus: newStatus } : t,
      ),
    );
  }, []);

  // Compute approval counts for the progress bar (re-derived on each render)
  const approvalCounts = {
    approved: tracks.filter((t) => t.approvalStatus === "approved").length,
    awaiting: tracks.filter((t) => t.approvalStatus === "awaiting_review").length,
    changesRequested: tracks.filter((t) => t.approvalStatus === "changes_requested").length,
    delivered: tracks.filter((t) => t.approvalStatus === "delivered").length,
  };

  const hasGlobalContext =
    (share.show_direction && globalDirection) ||
    (share.show_references && globalRefs.length > 0);

  return (
    <main id="main-content" tabIndex={-1} className="portal-page min-h-screen bg-bg py-12 px-4 md:px-6 pb-24 focus:outline-none">
      <div className="max-w-3xl mx-auto">
        {/* ═══ Zone 1: Release Header ═══ */}
        <PortalHeader
          release={release}
          trackCount={tracks.length}
          engineerName={release.engineer_name}
          approvalCounts={approvalCounts}
        />

        {/* ═══ Global Mix Brief (collapsible) ═══ */}
        {hasGlobalContext && (
          <details className="mb-8 group rounded-lg border border-border bg-panel overflow-hidden">
            <summary className="cursor-pointer list-none flex items-center gap-2 px-5 py-3.5 hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors">
              <ChevronRight
                size={16}
                className="text-muted transition-transform group-open:rotate-90 shrink-0"
              />
              <span className="text-sm font-semibold text-muted">
                Global Mix Brief
              </span>
            </summary>
            <div className="border-t border-border px-5 py-5 space-y-4">
              {share.show_direction && globalDirection && (
                <div>
                  <div className="text-[10px] text-faint font-medium uppercase tracking-wider mb-1.5">
                    Direction
                  </div>
                  <p className="text-sm text-text leading-relaxed italic">
                    &ldquo;{globalDirection}&rdquo;
                  </p>
                </div>
              )}
              {share.show_references && globalRefs.length > 0 && (
                <div>
                  <div className="text-[10px] text-faint font-medium uppercase tracking-wider mb-1.5">
                    References
                  </div>
                  <div className="space-y-2">
                    {globalRefs.map((ref) => (
                      <PortalReferenceItem key={ref.id} reference={ref} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </details>
        )}

        {/* ═══ Zone 2: Track List ═══ */}
        <div className="space-y-4 md:space-y-6">
          {tracks.map((track) => (
            <PortalTrackCard
              key={track.id}
              shareToken={shareToken}
              track={track}
              releaseId={release.id}
              releaseTitle={release.title}
              releaseFormat={release.format}
              coverArtUrl={release.cover_art_url}
              showDirection={share.show_direction}
              showSpecs={share.show_specs}
              showReferences={share.show_references}
              showDistribution={share.show_distribution}
              showLyrics={share.show_lyrics}
              paymentGated={paymentGated}
              onStatusChange={(newStatus) => handleStatusChange(track.id, newStatus)}
              onPromoTrigger={triggerPrompt}
            />
          ))}

          {tracks.length === 0 && (
            <div className="rounded-lg border border-border bg-panel p-12 text-center">
              <p className="text-sm text-muted">
                No tracks are available on this portal yet.
              </p>
            </div>
          )}
        </div>

        {/* ═══ Quotes & Payment ═══ */}
        {quotes.length > 0 && share.show_payment_status && (
          <PortalPaymentSection
            quotes={quotes}
            currency={quotes[0]?.currency ?? release.fee_currency}
            hasStripeConnected={hasStripeConnected}
            engineerName={release.engineer_name}
          />
        )}

        {/* ═══ Zone 3: Footer ═══ */}
        <PortalFooter
          showPayment={share.show_payment_status}
          release={release}
          showDistribution={share.show_distribution}
          releaseDistribution={release.distribution}
          tracks={tracks}
          engineerName={release.engineer_name}
          paymentGated={paymentGated}
        />
      </div>

      {/* Post-action signup prompt */}
      {showPrompt && promptTrigger && (
        <PostActionPrompt
          trigger={promptTrigger}
          engineerId={release.engineer_id}
          onDismiss={dismissPrompt}
        />
      )}
    </main>
  );
}

// ── Portal Payment Section ───────────────────────────────────────

function PortalPaymentSection({
  quotes,
  currency,
  hasStripeConnected,
  engineerName,
}: {
  quotes: PortalQuote[];
  currency: string;
  hasStripeConnected: boolean;
  engineerName: string | null;
}) {
  const fmt = new Intl.NumberFormat(undefined, { style: "currency", currency });
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";

  // Separate standalone vs schedule
  const scheduleGroups = new Map<string, PortalQuote[]>();
  const standalone: PortalQuote[] = [];
  for (const q of quotes) {
    if (q.schedule_group_id) {
      const existing = scheduleGroups.get(q.schedule_group_id) ?? [];
      existing.push(q);
      scheduleGroups.set(q.schedule_group_id, existing);
    } else {
      standalone.push(q);
    }
  }

  const totalAmount = quotes.reduce((s, q) => s + Number(q.total), 0);
  const paidAmount = quotes
    .filter((q) => q.status === "paid")
    .reduce((s, q) => s + Number(q.total), 0);

  return (
    <div className="mt-8 rounded-lg border border-border bg-panel overflow-hidden">
      <div className="px-6 py-4 border-b border-border">
        <div className="flex items-center gap-2">
          <CreditCard size={16} className="text-muted" />
          <h3 className="text-sm font-semibold text-text">Payment</h3>
        </div>
        {quotes.length > 1 && (
          <div className="text-xs text-muted mt-1">
            {fmt.format(paidAmount)} of {fmt.format(totalAmount)} paid
          </div>
        )}
      </div>

      <div className="divide-y divide-border">
        {/* Schedule groups */}
        {[...scheduleGroups.entries()].map(([groupId, installments]) => {
          const sorted = [...installments].sort(
            (a, b) => (a.schedule_order ?? 0) - (b.schedule_order ?? 0),
          );
          return (
            <div key={groupId} className="px-6 py-4">
              <div className="text-xs font-semibold text-muted uppercase tracking-wide mb-3">
                Payment Schedule
              </div>
              <div className="space-y-2">
                {sorted.map((q) => (
                  <QuotePaymentRow
                    key={q.id}
                    quote={q}
                    fmt={fmt}
                    hasStripeConnected={hasStripeConnected}
                    engineerName={engineerName}
                    label={q.schedule_label ?? q.quote_number}
                  />
                ))}
              </div>
            </div>
          );
        })}

        {/* Standalone quotes */}
        {standalone.map((q) => (
          <div key={q.id} className="px-6 py-4">
            <QuotePaymentRow
              quote={q}
              fmt={fmt}
              hasStripeConnected={hasStripeConnected}
              engineerName={engineerName}
              label={`Quote ${q.quote_number}`}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function QuotePaymentRow({
  quote,
  fmt,
  hasStripeConnected,
  engineerName,
  label,
}: {
  quote: PortalQuote;
  fmt: Intl.NumberFormat;
  hasStripeConnected: boolean;
  engineerName: string | null;
  label: string;
}) {
  const [loading, setLoading] = useState(false);
  const isPaid = quote.status === "paid";
  const canPay = hasStripeConnected && !isPaid && ["sent", "viewed", "accepted"].includes(quote.status);

  async function handlePay() {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/connect/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quoteId: quote.id, token: quote.portal_token }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-between gap-3">
      <div className="min-w-0">
        <div className="text-sm text-text font-medium">{label}</div>
        <div className="text-xs text-muted">
          {fmt.format(Number(quote.total))}
          {isPaid && quote.paid_at && (
            <span className="ml-2 text-green-500">
              Paid {new Date(quote.paid_at).toLocaleDateString()}
            </span>
          )}
        </div>
      </div>
      {isPaid ? (
        <div className="flex items-center gap-1 text-green-500 shrink-0">
          <CheckCircle size={14} />
          <span className="text-xs font-medium">Paid</span>
        </div>
      ) : canPay ? (
        <button
          onClick={handlePay}
          disabled={loading}
          className="shrink-0 px-4 py-1.5 rounded-md text-xs font-semibold text-white transition-colors"
          style={{ backgroundColor: loading ? "#999" : "#0D9488" }}
        >
          {loading ? "..." : "Pay Now"}
        </button>
      ) : !hasStripeConnected ? (
        <span className="text-xs text-muted shrink-0">
          Contact {engineerName ?? "engineer"}
        </span>
      ) : null}
    </div>
  );
}
