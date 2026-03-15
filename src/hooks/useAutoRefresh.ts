"use client";

import { useEffect, useCallback, useState } from "react";
import { useRouter } from "next/navigation";

/**
 * Periodically calls router.refresh() to re-fetch server component data.
 * Returns { lastRefreshed, refresh } for manual trigger and display.
 */
export function useAutoRefresh(intervalMs = 60_000) {
  const router = useRouter();
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());

  const refresh = useCallback(() => {
    router.refresh();
    setLastRefreshed(new Date());
  }, [router]);

  useEffect(() => {
    const id = setInterval(refresh, intervalMs);
    return () => clearInterval(id);
  }, [refresh, intervalMs]);

  return { lastRefreshed, refresh };
}
