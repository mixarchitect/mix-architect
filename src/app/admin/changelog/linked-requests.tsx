"use client";

import { useState, useEffect, useTransition } from "react";
import { Search, X, ArrowUpCircle, Lightbulb } from "lucide-react";
import {
  linkFeatureRequestsToChangelog,
  unlinkFeatureRequestFromChangelog,
  getLinkedFeatureRequests,
} from "@/actions/admin-changelog";
import { getAdminFeatureRequests } from "@/actions/admin-feature-requests";
import type { FeatureRequestAdmin } from "@/lib/help/types";

export function LinkedFeatureRequests({
  changelogEntryId,
}: {
  changelogEntryId: string;
}) {
  const [linked, setLinked] = useState<any[]>([]);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<FeatureRequestAdmin[]>([]);
  const [isPending, startTransition] = useTransition();

  const fetchLinked = () => {
    startTransition(async () => {
      const data = await getLinkedFeatureRequests(changelogEntryId);
      setLinked(data);
    });
  };

  useEffect(() => {
    fetchLinked();
  }, [changelogEntryId]);

  // Search feature requests
  useEffect(() => {
    if (!showSearch || searchQuery.length < 2) {
      setSearchResults([]);
      return;
    }
    const t = setTimeout(async () => {
      const results = await getAdminFeatureRequests({
        search: searchQuery,
        sort: "votes",
      });
      // Filter out already linked
      const linkedIds = new Set(linked.map((l: any) => l.id));
      setSearchResults(results.filter((r) => !linkedIds.has(r.id)));
    }, 300);
    return () => clearTimeout(t);
  }, [searchQuery, showSearch, linked]);

  const handleLink = async (requestId: string) => {
    await linkFeatureRequestsToChangelog(changelogEntryId, [requestId]);
    setSearchQuery("");
    setShowSearch(false);
    fetchLinked();
  };

  const handleUnlink = async (requestId: string) => {
    await unlinkFeatureRequestFromChangelog(changelogEntryId, requestId);
    fetchLinked();
  };

  return (
    <div className="mt-8 pt-6 border-t border-border">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Lightbulb size={14} className="text-teal-400" />
          <h3 className="text-sm font-medium text-text">
            Linked Feature Requests
          </h3>
          {linked.length > 0 && (
            <span className="text-xs text-muted">({linked.length})</span>
          )}
        </div>
        <button
          onClick={() => setShowSearch(!showSearch)}
          className="text-xs text-signal hover:underline"
        >
          + Link Request
        </button>
      </div>

      {/* Search */}
      {showSearch && (
        <div className="mb-3">
          <div className="relative">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-faint"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search feature requests..."
              autoFocus
              className="w-full h-9 pl-8 pr-8 rounded-md border border-border bg-panel text-sm text-text placeholder:text-faint focus:outline-none focus:ring-1 focus:ring-signal"
            />
            <button
              onClick={() => {
                setShowSearch(false);
                setSearchQuery("");
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-faint hover:text-text"
            >
              <X size={14} />
            </button>
          </div>
          {searchResults.length > 0 && (
            <div className="mt-1 border border-border rounded-md bg-zinc-900 max-h-48 overflow-y-auto">
              {searchResults.map((r) => (
                <button
                  key={r.id}
                  onClick={() => handleLink(r.id)}
                  className="w-full text-left px-3 py-2 hover:bg-zinc-800 transition-colors flex items-center gap-2"
                >
                  <ArrowUpCircle size={12} className="text-teal-500 shrink-0" />
                  <span className="text-xs text-zinc-300 truncate flex-1">
                    {r.title}
                  </span>
                  <span className="text-[10px] text-zinc-500 shrink-0">
                    {r.total_votes} votes
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Linked list */}
      {linked.length === 0 ? (
        <p className="text-xs text-muted">
          No feature requests linked yet. Link requests to credit users who
          suggested this feature.
        </p>
      ) : (
        <div className="space-y-1">
          {linked.map((r: any) => (
            <div
              key={r.id}
              className="flex items-center justify-between p-2 rounded-lg bg-zinc-800/50 text-xs"
            >
              <div className="flex items-center gap-2 min-w-0">
                <ArrowUpCircle size={12} className="text-teal-500 shrink-0" />
                <span className="text-zinc-300 truncate">{r.title}</span>
                <span className="text-zinc-500 shrink-0">
                  {r.vote_count} votes
                </span>
              </div>
              <button
                onClick={() => handleUnlink(r.id)}
                className="text-zinc-500 hover:text-red-400 shrink-0 ml-2"
              >
                <X size={12} />
              </button>
            </div>
          ))}
          <p className="text-[10px] text-zinc-500 mt-1">
            These users will be credited as &ldquo;Suggested by&rdquo; in the
            public changelog.
          </p>
        </div>
      )}
    </div>
  );
}
