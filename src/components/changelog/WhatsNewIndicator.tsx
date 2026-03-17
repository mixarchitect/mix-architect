"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const STORAGE_KEY = "ma_last_seen_changelog";

export function WhatsNewIndicator() {
  const [hasNew, setHasNew] = useState(false);

  useEffect(() => {
    async function check() {
      try {
        const res = await fetch("/api/changelog/latest");
        const { published_at } = await res.json();
        if (!published_at) return;

        const lastSeen = localStorage.getItem(STORAGE_KEY);
        if (!lastSeen || new Date(published_at) > new Date(lastSeen)) {
          setHasNew(true);
        }
      } catch {
        // Silently fail — this is a non-critical indicator
      }
    }
    check();
  }, []);

  function handleClick() {
    localStorage.setItem(STORAGE_KEY, new Date().toISOString());
    setHasNew(false);
  }

  return (
    <Link
      href="/changelog"
      onClick={handleClick}
      className="relative text-sm text-muted hover:text-text transition-colors"
    >
      What&apos;s New
      {hasNew && (
        <span className="absolute -top-0.5 -right-2 h-2 w-2 rounded-full bg-teal-500" />
      )}
    </Link>
  );
}
