/* ------------------------------------------------------------------ */
/*  Plan entitlements — single source of truth for plan → features    */
/* ------------------------------------------------------------------ */
//
// Every plan-gated decision should route through here rather than
// comparing `plan === "pro"` inline. That's what keeps Studio correctly
// treated as "Pro or better" everywhere: a scattered `=== "pro"` check
// would under-entitle a Studio user (gated like Free for Pro features).
//
// Server-safe (no client/browser deps) so it can back route handlers,
// server actions, and RSC pages as well as client components.

export type Plan = "free" | "pro" | "studio";
export type SubStatus =
  | "active"
  | "canceled"
  | "past_due"
  | "trialing"
  | "incomplete";

const RANK: Record<Plan, number> = { free: 0, pro: 1, studio: 2 };

/** Coerce any DB/string value to a known Plan, defaulting to "free". */
export function normalizePlan(plan: string | null | undefined): Plan {
  return plan === "pro" || plan === "studio" ? plan : "free";
}

/** Pro tier or above (Pro or Studio). */
export function isAtLeastPro(plan: string | null | undefined): boolean {
  return RANK[normalizePlan(plan)] >= RANK.pro;
}

export function isStudio(plan: string | null | undefined): boolean {
  return normalizePlan(plan) === "studio";
}

/** A subscription status that grants active access. */
export function isActiveStatus(status: string | null | undefined): boolean {
  return status === "active" || status === "trialing";
}

/**
 * Active Pro-or-better access = the plan is Pro/Studio AND the
 * subscription is in an access-granting state. This is the predicate
 * that replaces the scattered `plan === "pro" && (active|trialing)`.
 */
export function hasProAccess(
  plan: string | null | undefined,
  status: string | null | undefined,
): boolean {
  return isAtLeastPro(plan) && isActiveStatus(status);
}

export type Entitlements = {
  /** Max releases. Infinity for Pro/Studio. */
  releaseLimit: number;
  /** Member seats in the workspace. Infinity for Studio. */
  seats: number;
  /** Portal branding level. */
  branding: "none" | "basic" | "full";
  /** Studio-only white-label capabilities. */
  customDomain: boolean;
  brandedEmail: boolean;
  removePoweredBy: boolean;
  teamWorkspace: boolean;
};

/**
 * Feature entitlements for a plan. Note this is plan-only — callers
 * that also care about subscription status should gate with
 * hasProAccess() / isActiveStatus() as well (a past_due Pro plan still
 * has Pro *entitlements* by shape, but shouldn't get active access).
 */
export function getEntitlements(plan: string | null | undefined): Entitlements {
  switch (normalizePlan(plan)) {
    case "studio":
      return {
        releaseLimit: Infinity,
        seats: Infinity,
        branding: "full",
        customDomain: true,
        brandedEmail: true,
        removePoweredBy: true,
        teamWorkspace: true,
      };
    case "pro":
      return {
        releaseLimit: Infinity,
        seats: 1,
        branding: "basic",
        customDomain: false,
        brandedEmail: false,
        removePoweredBy: false,
        teamWorkspace: false,
      };
    default:
      return {
        releaseLimit: 1,
        seats: 1,
        branding: "none",
        customDomain: false,
        brandedEmail: false,
        removePoweredBy: false,
        teamWorkspace: false,
      };
  }
}
