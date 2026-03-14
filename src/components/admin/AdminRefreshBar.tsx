"use client";

import { RefreshCcw } from "lucide-react";
import { useAutoRefresh } from "@/hooks/useAutoRefresh";
import { cn } from "@/lib/cn";
import { useState, useEffect } from "react";

export function AdminRefreshBar({ intervalMs = 30_000 }: { intervalMs?: number }) {
  const { lastRefreshed, refresh } = useAutoRefresh(intervalMs);
  const [spinning, setSpinning] = useState(false);
  const [timeAgo, setTimeAgo] = useState("just now");

  // Update the relative time display every 5s
  useEffect(() => {
    function update() {
      const secs = Math.floor((Date.now() - lastRefreshed.getTime()) / 1000);
      if (secs < 5) setTimeAgo("just now");
      else if (secs < 60) setTimeAgo(`${secs}s ago`);
      else setTimeAgo(`${Math.floor(secs / 60)}m ago`);
    }
    update();
    const id = setInterval(update, 5000);
    return () => clearInterval(id);
  }, [lastRefreshed]);

  function handleRefresh() {
    setSpinning(true);
    refresh();
    setTimeout(() => setSpinning(false), 600);
  }

  return (
    <div className="flex items-center gap-2 text-xs text-faint">
      <span>Updated {timeAgo}</span>
      <button
        onClick={handleRefresh}
        className="p-1 rounded hover:bg-panel2 transition-colors text-muted hover:text-text"
        title="Refresh now"
      >
        <RefreshCcw
          size={12}
          className={cn(spinning && "animate-spin")}
        />
      </button>
    </div>
  );
}
