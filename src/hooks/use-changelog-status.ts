"use client";

import { useCallback, useEffect, useState } from "react";
import { getLastSeenChangelog, markChangelogSeen } from "@/lib/changelog-seen";
import type { ChangelogCategory } from "@/types/changelog";

// "1.2.1" gets a v prefix; calver-style tags like "2026.04.B" display as stored
export function displayVersion(tag: string): string {
  return /^\d+(\.\d+)*$/.test(tag) ? `v${tag}` : tag;
}

export type ChangelogRecentEntry = {
  slug: string;
  title: string;
  summary: string;
  category: ChangelogCategory;
  published_at: string;
  version_tag: string | null;
};

/**
 * Feeds the top-bar version chip: recent published entries, the latest
 * version tag, and whether anything was published since the user last
 * opened a What's New surface (shared localStorage key with the Help
 * Center tab). hasUnread stays false until hydrated to avoid a flash.
 */
export function useChangelogStatus() {
  const [entries, setEntries] = useState<ChangelogRecentEntry[]>([]);
  const [hasUnread, setHasUnread] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch("/api/changelog/recent?limit=20");
        if (!res.ok) return;
        const data = await res.json();
        const list: ChangelogRecentEntry[] = data.entries ?? [];
        if (cancelled || list.length === 0) return;
        setEntries(list);
        const lastSeen = getLastSeenChangelog();
        const lastSeenMs = lastSeen ? Date.parse(lastSeen) : NaN;
        const latestMs = Date.parse(list[0].published_at);
        setHasUnread(!Number.isFinite(lastSeenMs) || latestMs > lastSeenMs);
      } catch {
        // non-critical chrome; fail silently like the help portal
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const markSeen = useCallback(() => {
    markChangelogSeen();
    setHasUnread(false);
  }, []);

  const versionTag = entries.find((e) => e.version_tag)?.version_tag ?? null;

  return { entries, versionTag, hasUnread, markSeen };
}
