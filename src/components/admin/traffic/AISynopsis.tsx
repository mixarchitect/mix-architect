"use client";

import { useState, useEffect } from "react";
import { Sparkles, RefreshCw } from "lucide-react";

interface AISynopsisProps {
  range: string;
}

export function AISynopsis({ range }: AISynopsisProps) {
  const [synopsis, setSynopsis] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  async function fetchSynopsis(refresh = false) {
    setLoading(true);
    setError(false);
    try {
      const params = new URLSearchParams({ range });
      if (refresh) params.set("refresh", "true");
      const res = await fetch(`/api/admin/analytics/synopsis?${params}`);
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setSynopsis(data.synopsis);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchSynopsis();
  }, [range]);

  return (
    <div className="rounded-lg border border-border bg-panel p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Sparkles size={14} className="text-amber-400" />
          <span className="text-sm font-medium text-muted">AI Synopsis</span>
        </div>
        <button
          onClick={() => fetchSynopsis(true)}
          disabled={loading}
          className="inline-flex items-center gap-1.5 text-xs text-muted hover:text-text transition-colors disabled:opacity-50"
        >
          <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
          Regenerate
        </button>
      </div>

      {loading && (
        <div className="animate-pulse space-y-2">
          <div className="h-4 bg-panel2 rounded w-full" />
          <div className="h-4 bg-panel2 rounded w-5/6" />
          <div className="h-4 bg-panel2 rounded w-4/6" />
        </div>
      )}

      {error && !loading && (
        <p className="text-sm text-muted">
          Unable to generate synopsis.{" "}
          <button onClick={() => fetchSynopsis()} className="text-signal hover:underline">
            Retry
          </button>
        </p>
      )}

      {!loading && !error && synopsis && (
        <p className="text-sm text-text leading-relaxed">{synopsis}</p>
      )}
    </div>
  );
}
