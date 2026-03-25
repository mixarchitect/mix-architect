"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { FileText, MoreHorizontal, Copy, Send, Ban, CheckCircle, ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/cn";
import { EmptyState } from "@/components/ui/empty-state";
import { formatCurrency } from "@/lib/currency";
import { deleteQuote, sendQuote, duplicateQuote, markQuotePaid } from "@/actions/quotes";
import type { Quote } from "@/types/payments";

const STATUS_STYLES: Record<string, string> = {
  draft: "bg-zinc-500/10 text-zinc-400",
  sent: "bg-blue-500/10 text-blue-400",
  viewed: "bg-amber-500/10 text-amber-400",
  accepted: "bg-teal-500/10 text-teal-400",
  paid: "bg-green-500/10 text-green-400",
  expired: "bg-zinc-500/10 text-zinc-500 line-through",
  cancelled: "bg-red-500/10 text-red-400",
};

type Props = {
  quotes: Quote[];
  releaseId?: string;
  showRelease?: boolean;
  locale: string;
  releases?: { id: string; title: string }[];
};

export function QuotesList({
  quotes: initialQuotes,
  releaseId,
  showRelease = false,
  locale,
  releases = [],
}: Props) {
  const t = useTranslations("quotes");
  const [quotes, setQuotes] = useState(initialQuotes);
  const [expandedSchedules, setExpandedSchedules] = useState<Set<string>>(new Set());
  const [actionMenu, setActionMenu] = useState<string | null>(null);

  // Group quotes: standalone + schedule groups
  const scheduleGroups = new Map<string, Quote[]>();
  const standalone: Quote[] = [];

  for (const q of quotes) {
    if (q.schedule_group_id) {
      const existing = scheduleGroups.get(q.schedule_group_id) ?? [];
      existing.push(q);
      scheduleGroups.set(q.schedule_group_id, existing);
    } else {
      standalone.push(q);
    }
  }

  // Sort schedule groups by first installment's created_at
  const sortedGroups = [...scheduleGroups.entries()].sort((a, b) => {
    const aDate = a[1][0]?.created_at ?? "";
    const bDate = b[1][0]?.created_at ?? "";
    return bDate.localeCompare(aDate);
  });

  // Interleave standalone quotes and schedule groups by date
  type ListItem =
    | { type: "quote"; quote: Quote }
    | { type: "schedule"; groupId: string; installments: Quote[] };

  const items: ListItem[] = [];
  let sIdx = 0;
  let gIdx = 0;

  while (sIdx < standalone.length || gIdx < sortedGroups.length) {
    const sDate = standalone[sIdx]?.created_at ?? "";
    const gDate = sortedGroups[gIdx]?.[1][0]?.created_at ?? "";

    if (sIdx < standalone.length && (gIdx >= sortedGroups.length || sDate >= gDate)) {
      items.push({ type: "quote", quote: standalone[sIdx] });
      sIdx++;
    } else if (gIdx < sortedGroups.length) {
      const [groupId, installments] = sortedGroups[gIdx];
      items.push({ type: "schedule", groupId, installments });
      gIdx++;
    }
  }

  const newQuoteHref = releaseId
    ? `/app/releases/${releaseId}/quotes/new`
    : "/app/quotes/new";

  if (items.length === 0) {
    return (
      <EmptyState
        icon={FileText}
        size="md"
        title={t("emptyTitle")}
        description={t("emptyDescription")}
        action={{ label: t("createQuote"), href: newQuoteHref, variant: "primary" }}
      />
    );
  }

  async function handleAction(action: string, quoteId: string) {
    setActionMenu(null);
    if (action === "send") {
      await sendQuote(quoteId);
      setQuotes((prev) =>
        prev.map((q) =>
          q.id === quoteId
            ? { ...q, status: "sent" as const, issued_at: new Date().toISOString() }
            : q,
        ),
      );
    } else if (action === "duplicate") {
      const result = await duplicateQuote(quoteId);
      if (result.quote) {
        setQuotes((prev) => [result.quote!, ...prev]);
      }
    } else if (action === "delete") {
      await deleteQuote(quoteId);
      setQuotes((prev) => prev.filter((q) => q.id !== quoteId));
    } else if (action === "mark_paid") {
      await markQuotePaid(quoteId);
      setQuotes((prev) =>
        prev.map((q) =>
          q.id === quoteId
            ? { ...q, status: "paid" as const, paid_at: new Date().toISOString() }
            : q,
        ),
      );
    }
  }

  function toggleSchedule(groupId: string) {
    setExpandedSchedules((prev) => {
      const next = new Set(prev);
      if (next.has(groupId)) next.delete(groupId);
      else next.add(groupId);
      return next;
    });
  }

  function getReleaseName(rId: string | null) {
    if (!rId) return "—";
    return releases.find((r) => r.id === rId)?.title ?? "—";
  }

  const quoteDetailHref = (q: Quote) =>
    releaseId
      ? `/app/releases/${releaseId}/quotes/${q.id}`
      : `/app/releases/${q.release_id}/quotes/${q.id}`;

  return (
    <div className="space-y-1">
      {items.map((item) => {
        if (item.type === "quote") {
          return (
            <QuoteRow
              key={item.quote.id}
              quote={item.quote}
              href={quoteDetailHref(item.quote)}
              locale={locale}
              showRelease={showRelease}
              releaseName={getReleaseName(item.quote.release_id)}
              actionMenu={actionMenu}
              onActionMenu={setActionMenu}
              onAction={handleAction}
            />
          );
        }

        // Schedule group
        const { groupId, installments } = item;
        const isExpanded = expandedSchedules.has(groupId);
        const totalAmount = installments.reduce((s, q) => s + Number(q.total), 0);
        const paidCount = installments.filter((q) => q.status === "paid").length;
        const currency = installments[0]?.currency ?? "USD";

        return (
          <div key={groupId}>
            <button
              type="button"
              onClick={() => toggleSchedule(groupId)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-panel2 transition-colors text-left"
            >
              {isExpanded ? (
                <ChevronDown size={14} className="text-muted shrink-0" />
              ) : (
                <ChevronRight size={14} className="text-muted shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <span className="text-sm font-medium text-text">
                  {t("paymentSchedule")}
                </span>
                <span className="text-xs text-muted ml-2">
                  {installments.length} {t("installments")} · {formatCurrency(totalAmount, currency, locale)} · {paidCount} of {installments.length} {t("paidLabel")}
                </span>
              </div>
            </button>
            {isExpanded && (
              <div className="pl-8 space-y-1">
                {installments.map((q) => (
                  <QuoteRow
                    key={q.id}
                    quote={q}
                    href={quoteDetailHref(q)}
                    locale={locale}
                    showRelease={showRelease}
                    releaseName={getReleaseName(q.release_id)}
                    actionMenu={actionMenu}
                    onActionMenu={setActionMenu}
                    onAction={handleAction}
                    isScheduleItem
                  />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── QuoteRow ─────────────────────────────────────────────────────

function QuoteRow({
  quote,
  href,
  locale,
  showRelease,
  releaseName,
  actionMenu,
  onActionMenu,
  onAction,
  isScheduleItem = false,
}: {
  quote: Quote;
  href: string;
  locale: string;
  showRelease: boolean;
  releaseName: string;
  actionMenu: string | null;
  onActionMenu: (id: string | null) => void;
  onAction: (action: string, quoteId: string) => void;
  isScheduleItem?: boolean;
}) {
  const t = useTranslations("quotes");
  const isOpen = actionMenu === quote.id;

  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-panel2 transition-colors group">
      <Link href={href} className="flex-1 min-w-0 flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-text truncate">
              {quote.quote_number}
            </span>
            {isScheduleItem && quote.schedule_label && (
              <span className="text-xs text-muted">— {quote.schedule_label}</span>
            )}
            {quote.title && !isScheduleItem && (
              <span className="text-xs text-muted truncate hidden sm:inline">
                — {quote.title}
              </span>
            )}
            <span
              className={cn(
                "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wide shrink-0",
                STATUS_STYLES[quote.status] ?? STATUS_STYLES.draft,
              )}
            >
              {t(`status.${quote.status}`)}
            </span>
          </div>
          <div className="flex items-center gap-3 mt-0.5 text-xs text-muted">
            {showRelease && <span>{releaseName}</span>}
            {quote.client_name && <span>{quote.client_name}</span>}
            <span>{new Date(quote.created_at).toLocaleDateString()}</span>
          </div>
        </div>
        <div className="text-sm font-medium text-text shrink-0">
          {formatCurrency(Number(quote.total), quote.currency, locale)}
        </div>
      </Link>

      {/* Actions menu */}
      <div className="relative">
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            onActionMenu(isOpen ? null : quote.id);
          }}
          className="p-1.5 rounded-md text-muted hover:text-text hover:bg-panel transition-colors opacity-0 group-hover:opacity-100"
        >
          <MoreHorizontal size={14} />
        </button>
        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => onActionMenu(null)}
            />
            <div className="absolute right-0 top-8 z-20 w-44 rounded-lg border border-border bg-panel shadow-lg py-1">
              {quote.status === "draft" && (
                <MenuBtn
                  icon={Send}
                  label={t("actions.send")}
                  onClick={() => onAction("send", quote.id)}
                />
              )}
              <MenuBtn
                icon={Copy}
                label={t("actions.duplicate")}
                onClick={() => onAction("duplicate", quote.id)}
              />
              {(quote.status === "sent" || quote.status === "viewed") && (
                <MenuBtn
                  icon={CheckCircle}
                  label={t("actions.markPaid")}
                  onClick={() => onAction("mark_paid", quote.id)}
                />
              )}
              {(quote.status === "draft" || quote.status === "sent") && (
                <MenuBtn
                  icon={Ban}
                  label={quote.status === "draft" ? t("actions.delete") : t("actions.cancel")}
                  onClick={() => onAction("delete", quote.id)}
                  destructive
                />
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function MenuBtn({
  icon: Icon,
  label,
  onClick,
  destructive = false,
}: {
  icon: typeof Send;
  label: string;
  onClick: () => void;
  destructive?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 w-full px-3 py-2 text-xs text-left hover:bg-panel2 transition-colors",
        destructive ? "text-red-400" : "text-text",
      )}
    >
      <Icon size={13} />
      {label}
    </button>
  );
}
