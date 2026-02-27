"use client";

import { createContext, useContext, useState, useEffect, useMemo } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabaseBrowserClient";

const PaymentsContext = createContext(false);

export function PaymentsProvider({
  enabled,
  children,
}: {
  enabled: boolean;
  children: React.ReactNode;
}) {
  const [clientEnabled, setClientEnabled] = useState(enabled);

  // Keep in sync with the server prop (e.g. after router.refresh())
  useEffect(() => {
    setClientEnabled(enabled);
  }, [enabled]);

  // Also verify from the DB on mount so stale server-rendered values get corrected
  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    supabase.auth.getUser().then(({ data: { user } }: { data: { user: { id: string } | null } }) => {
      if (!user) return;
      supabase
        .from("user_defaults")
        .select("payments_enabled")
        .eq("user_id", user.id)
        .maybeSingle()
        .then(({ data }: { data: { payments_enabled?: boolean } | null }) => {
          setClientEnabled(data?.payments_enabled ?? false);
        });
    });
  }, []);

  return (
    <PaymentsContext.Provider value={clientEnabled}>
      {children}
    </PaymentsContext.Provider>
  );
}

export function usePaymentsEnabled() {
  return useContext(PaymentsContext);
}
