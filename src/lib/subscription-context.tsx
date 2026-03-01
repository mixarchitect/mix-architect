"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabaseBrowserClient";

export type SubscriptionState = {
  plan: "free" | "pro";
  status: "active" | "canceled" | "past_due" | "trialing" | "incomplete";
  cancelAtPeriodEnd: boolean;
  currentPeriodEnd: string | null;
  grantedByAdmin: boolean;
};

const DEFAULT_STATE: SubscriptionState = {
  plan: "free",
  status: "active",
  cancelAtPeriodEnd: false,
  currentPeriodEnd: null,
  grantedByAdmin: false,
};

const SubscriptionContext = createContext<SubscriptionState>(DEFAULT_STATE);

export function SubscriptionProvider({
  initial,
  children,
}: {
  initial: SubscriptionState;
  children: React.ReactNode;
}) {
  const [state, setState] = useState(initial);

  // Keep in sync with the server prop (e.g. after router.refresh())
  useEffect(() => {
    setState(initial);
  }, [initial]);

  // Also verify from the DB on mount so stale server-rendered values get corrected
  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    supabase.auth.getUser().then(({ data: { user } }: { data: { user: { id: string } | null } }) => {
      if (!user) return;
      supabase
        .from("subscriptions")
        .select("plan, status, cancel_at_period_end, current_period_end, granted_by_admin")
        .eq("user_id", user.id)
        .maybeSingle()
        .then(({ data }: { data: { plan?: string; status?: string; cancel_at_period_end?: boolean; current_period_end?: string | null; granted_by_admin?: boolean } | null }) => {
          if (data) {
            setState({
              plan: (data.plan as "free" | "pro") ?? "free",
              status: (data.status as SubscriptionState["status"]) ?? "active",
              cancelAtPeriodEnd: data.cancel_at_period_end ?? false,
              currentPeriodEnd: data.current_period_end ?? null,
              grantedByAdmin: data.granted_by_admin ?? false,
            });
          }
        });
    });
  }, []);

  return (
    <SubscriptionContext.Provider value={state}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  return useContext(SubscriptionContext);
}
