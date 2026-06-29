"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Gift, X, Clock, AlertTriangle, ArrowLeftRight } from "lucide-react";
import { isAtLeastPro, normalizePlan, type Plan } from "@/lib/entitlements";

/**
 * Plan controls for the admin user-detail page.
 *
 * The buttons surface different actions depending on what kind of
 * subscription the user has:
 *
 *   - Free / no row → "Grant Comp Pro" + "Grant Comp Studio" (both call
 *     /api/admin/comp-account, action=grant, with the chosen plan).
 *
 *   - Admin-granted comp → "Switch to Pro/Studio" (re-grants the other
 *     tier in place) + "Remove Comp" (calls /api/admin/cancel-subscription
 *     — handler short-circuits to a DB-only flip when granted_by_admin = true).
 *
 *   - Paid Pro (real Stripe sub, active, NOT scheduled to cancel) →
 *     "Cancel Now" + "Cancel at Period End".
 *
 *   - Paid Pro already scheduled to cancel at period end →
 *     just "Cancel Now" (the user already chose period-end cancel).
 *
 * All destructive actions confirm before sending.
 */

type Subscription = {
  plan: string | null;
  status: string | null;
  granted_by_admin: boolean | null;
  stripe_subscription_id: string | null;
  cancel_at_period_end: boolean | null;
};

type Props = {
  userId: string;
  subscription: Subscription | null;
};

type ActionState = "idle" | "loading" | "error";

export function SubscriptionPlanControl({ userId, subscription }: Props) {
  const router = useRouter();
  const [state, setState] = useState<ActionState>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const isActivePro =
    isAtLeastPro(subscription?.plan) && subscription?.status === "active";
  const isComp = isActivePro && subscription?.granted_by_admin === true;
  const isPaidPro =
    isActivePro && !!subscription?.stripe_subscription_id && !isComp;
  const willCancelAtPeriodEnd =
    isPaidPro && subscription?.cancel_at_period_end === true;
  const currentPlan = normalizePlan(subscription?.plan);

  async function grantComp(plan: Plan, opts?: { switching?: boolean }) {
    const planLabel = plan === "studio" ? "Studio" : "Pro";
    const message = opts?.switching
      ? `Switch this comp account to ${planLabel}? Their workspace plan updates immediately.`
      : `Grant this user a comp ${planLabel} subscription (indefinite)?`;
    if (!confirm(message)) return;
    setState("loading");
    setErrorMsg(null);
    try {
      const res = await fetch("/api/admin/comp-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          action: "grant",
          plan,
          duration: "indefinite",
          reason: opts?.switching
            ? `Admin switched comp to ${planLabel}`
            : "Admin testing / support",
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? `HTTP ${res.status}`);
      }
      router.refresh();
      setState("idle");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Failed");
      setState("error");
    }
  }

  async function cancel(mode: "immediate" | "at_period_end") {
    const prompt =
      mode === "immediate"
        ? isComp
          ? "Remove this user's comp Pro subscription? They go back to Free immediately."
          : "Cancel this user's Stripe subscription NOW? They lose Pro access immediately and are not charged again."
        : "Schedule cancellation at the end of the current billing period? User keeps Pro access until then.";

    if (!confirm(prompt)) return;
    setState("loading");
    setErrorMsg(null);
    try {
      const res = await fetch("/api/admin/cancel-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          mode,
          reason: "Admin action via user detail page",
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? `HTTP ${res.status}`);
      }
      router.refresh();
      setState("idle");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Failed");
      setState("error");
    }
  }

  // Free user — offer to grant a comp at either tier.
  if (!isActivePro) {
    return (
      <>
        <button
          type="button"
          onClick={() => grantComp("pro")}
          disabled={state === "loading"}
          className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded border border-amber-500/30 text-amber-400 hover:bg-amber-500/10 transition-colors disabled:opacity-50"
          title="Grant a comp (admin-granted) Pro subscription"
        >
          <Gift size={12} />
          {state === "loading" ? "Granting…" : "Grant Comp Pro"}
        </button>
        <button
          type="button"
          onClick={() => grantComp("studio")}
          disabled={state === "loading"}
          className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded border border-violet-500/30 text-violet-400 hover:bg-violet-500/10 transition-colors disabled:opacity-50"
          title="Grant a comp (admin-granted) Studio subscription"
        >
          <Gift size={12} />
          {state === "loading" ? "Granting…" : "Grant Comp Studio"}
        </button>
        {errorMsg && (
          <span className="text-xs text-red-400 inline-flex items-center gap-1">
            <AlertTriangle size={12} />
            {errorMsg}
          </span>
        )}
      </>
    );
  }

  // Admin-granted comp — offer a tier switch + removal.
  if (isComp) {
    const otherPlan: Plan = currentPlan === "studio" ? "pro" : "studio";
    const otherLabel = otherPlan === "studio" ? "Studio" : "Pro";
    return (
      <>
        <button
          type="button"
          onClick={() => grantComp(otherPlan, { switching: true })}
          disabled={state === "loading"}
          className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded border border-sky-500/30 text-sky-400 hover:bg-sky-500/10 transition-colors disabled:opacity-50"
          title={`Switch this comp account to ${otherLabel}`}
        >
          <ArrowLeftRight size={12} />
          {state === "loading" ? "Working…" : `Switch to ${otherLabel}`}
        </button>
        <button
          type="button"
          onClick={() => cancel("immediate")}
          disabled={state === "loading"}
          className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50"
          title="Remove comp — user immediately goes back to Free"
        >
          <X size={12} />
          Remove Comp
        </button>
        {errorMsg && (
          <span className="text-xs text-red-400 inline-flex items-center gap-1">
            <AlertTriangle size={12} />
            {errorMsg}
          </span>
        )}
      </>
    );
  }

  // Paid Pro/Studio (real Stripe sub) — offer cancel paths.
  return (
    <>
      <button
        type="button"
        onClick={() => cancel("immediate")}
        disabled={state === "loading"}
        className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50"
        title="Cancel this Stripe subscription immediately"
      >
        <X size={12} />
        Cancel Now
      </button>

      {isPaidPro && !willCancelAtPeriodEnd && (
        <button
          type="button"
          onClick={() => cancel("at_period_end")}
          disabled={state === "loading"}
          className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded border border-amber-500/30 text-amber-400 hover:bg-amber-500/10 transition-colors disabled:opacity-50"
          title="Let the user keep Pro until the current billing period ends"
        >
          <Clock size={12} />
          Cancel at Period End
        </button>
      )}

      {state === "loading" && (
        <span className="text-xs text-muted">Working…</span>
      )}
      {errorMsg && (
        <span className="text-xs text-red-400 inline-flex items-center gap-1">
          <AlertTriangle size={12} />
          {errorMsg}
        </span>
      )}
    </>
  );
}
