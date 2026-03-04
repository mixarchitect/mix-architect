"use client";

import { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/cn";
import { ChevronUp, Plus, X } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabaseBrowserClient";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import type { FeatureCategory, FeatureStatus } from "@/lib/help/types";

type FeatureRequest = {
  id: string;
  created_at: string;
  title: string;
  description: string;
  category: string;
  vote_count: number;
  status: string;
};

const FILTER_CATEGORIES: { value: FeatureCategory | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "workflow", label: "Workflow" },
  { value: "audio", label: "Audio" },
  { value: "collaboration", label: "Collaboration" },
  { value: "integrations", label: "Integrations" },
  { value: "distribution", label: "Distribution" },
  { value: "payments", label: "Payments" },
  { value: "mobile", label: "Mobile" },
  { value: "other", label: "Other" },
];

const STATUS_STYLES: Record<string, string> = {
  under_review: "text-muted bg-panel2",
  planned: "text-signal bg-signal-muted",
  in_progress: "text-status-blue bg-status-blue/10",
  shipped: "text-status-green bg-status-green/10",
};

const STATUS_LABELS: Record<string, string> = {
  under_review: "Under Review",
  planned: "Planned",
  in_progress: "In Progress",
  shipped: "Shipped",
};

export function FeatureBoard() {
  const { toast } = useToast();
  const supabase = createSupabaseBrowserClient();

  const [requests, setRequests] = useState<FeatureRequest[]>([]);
  const [userVotes, setUserVotes] = useState<Set<string>>(new Set());
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FeatureCategory | "all">("all");
  const [showForm, setShowForm] = useState(false);

  const fetchData = useCallback(async () => {
    const [{ data: reqData }, { data: { user } }] = await Promise.all([
      supabase
        .from("feature_requests")
        .select("*")
        .in("status", ["under_review", "planned", "in_progress", "shipped"])
        .order("vote_count", { ascending: false }),
      supabase.auth.getUser(),
    ]);

    setRequests(reqData ?? []);
    setUserId(user?.id ?? null);

    if (user) {
      const { data: votes } = await supabase
        .from("feature_request_votes")
        .select("feature_request_id")
        .eq("user_id", user.id);
      setUserVotes(new Set((votes ?? []).map((v: { feature_request_id: string }) => v.feature_request_id)));
    }
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  async function handleUpvote(requestId: string) {
    if (!userId) {
      toast("Sign in to vote on feature requests.", { variant: "info" });
      return;
    }
    if (userVotes.has(requestId)) return;

    // Optimistic update
    setRequests((prev) =>
      prev.map((r) =>
        r.id === requestId ? { ...r, vote_count: r.vote_count + 1 } : r,
      ),
    );
    setUserVotes((prev) => new Set([...prev, requestId]));

    const { error } = await supabase.rpc("upvote_feature_request", {
      request_id: requestId,
    });

    if (error) {
      // Revert optimistic update
      setRequests((prev) =>
        prev.map((r) =>
          r.id === requestId ? { ...r, vote_count: r.vote_count - 1 } : r,
        ),
      );
      setUserVotes((prev) => {
        const next = new Set(prev);
        next.delete(requestId);
        return next;
      });

      if (error.code === "23505") {
        toast("You have already upvoted this request.", { variant: "info" });
      } else {
        toast(error.message, { variant: "error" });
      }
    }
  }

  const filtered =
    filter === "all"
      ? requests
      : requests.filter((r) => r.category === filter);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-muted text-sm">
        <span className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin mr-2" />
        Loading...
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {FILTER_CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              type="button"
              onClick={() => setFilter(cat.value)}
              className={cn(
                "pill whitespace-nowrap",
                filter === cat.value && "pill-active",
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>
        <Button
          variant="primary"
          className="shrink-0 ml-4 h-9 px-3 text-xs"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? (
            <>
              <X size={14} strokeWidth={1.5} />
              Cancel
            </>
          ) : (
            <>
              <Plus size={14} strokeWidth={1.5} />
              Suggest a Feature
            </>
          )}
        </Button>
      </div>

      {/* Inline form */}
      {showForm && (
        <FeatureForm
          userId={userId}
          onSuccess={() => {
            setShowForm(false);
            fetchData();
          }}
        />
      )}

      {/* Request list */}
      {filtered.length === 0 ? (
        <EmptyState
          title="No feature requests yet"
          description="Be the first to suggest a feature."
          size="md"
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((req) => (
            <div
              key={req.id}
              className="bg-panel border border-border rounded-lg p-4 flex items-start gap-4"
            >
              {/* Upvote */}
              <button
                type="button"
                onClick={() => handleUpvote(req.id)}
                disabled={userVotes.has(req.id)}
                className={cn(
                  "flex flex-col items-center gap-0.5 rounded-lg px-3 py-2 text-xs font-semibold transition-colors shrink-0",
                  userVotes.has(req.id)
                    ? "bg-signal text-signal-on cursor-default"
                    : "bg-panel2 text-muted hover:bg-border-strong hover:text-text",
                )}
                title={
                  userVotes.has(req.id)
                    ? "You have already upvoted this"
                    : "Upvote"
                }
              >
                <ChevronUp size={14} strokeWidth={2} />
                {req.vote_count}
              </button>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm text-text">
                  {req.title}
                </div>
                <p className="text-muted text-xs mt-1 line-clamp-2">
                  {req.description}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="pill text-[10px] py-0.5 px-2">
                    {FILTER_CATEGORIES.find((c) => c.value === req.category)
                      ?.label ?? req.category}
                  </span>
                  <span
                    className={cn(
                      "text-[10px] font-medium px-2 py-0.5 rounded-full",
                      STATUS_STYLES[req.status] ?? "text-muted bg-panel2",
                    )}
                  >
                    {STATUS_LABELS[req.status] ?? req.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Inline Feature Form ── */

function FeatureForm({
  userId,
  onSuccess,
}: {
  userId: string | null;
  onSuccess: () => void;
}) {
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<FeatureCategory>("workflow");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!userId) {
    return (
      <div className="bg-panel border border-border rounded-lg p-4 mb-4 text-center">
        <p className="text-muted text-sm">
          Sign in to suggest and vote on features.
        </p>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;
    if (description.trim().length < 20) {
      toast("Description must be at least 20 characters.", {
        variant: "error",
      });
      return;
    }

    setSubmitting(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const { error } = await supabase.from("feature_requests").insert({
        user_id: user?.id ?? null,
        email: user?.email ?? null,
        title: title.trim(),
        description: description.trim(),
        category,
        vote_count: 1,
      });

      if (error) throw error;

      toast("Feature request submitted. Your vote has been counted.", {
        variant: "success",
      });
      onSuccess();
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to submit feature request";
      toast(msg, { variant: "error" });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-panel border border-border rounded-lg p-4 mb-4 space-y-4"
    >
      <div>
        <label className="label text-faint block mb-2">Title</label>
        <input
          type="text"
          className="input"
          placeholder="What would you like to see?"
          maxLength={100}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>

      <div>
        <label className="label text-faint block mb-2">Category</label>
        <select
          className="input"
          value={category}
          onChange={(e) => setCategory(e.target.value as FeatureCategory)}
        >
          {FILTER_CATEGORIES.filter((c) => c.value !== "all").map((cat) => (
            <option key={cat.value} value={cat.value}>
              {cat.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="label text-faint block mb-2">Description</label>
        <textarea
          className="input min-h-[80px] resize-y"
          placeholder="Tell us more. Why would this help your workflow?"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
        <p className="text-faint text-xs mt-1">Minimum 20 characters</p>
      </div>

      <Button type="submit" variant="primary" disabled={submitting}>
        {submitting ? (
          <span className="flex items-center gap-2">
            <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            Submitting...
          </span>
        ) : (
          "Submit Request"
        )}
      </Button>
    </form>
  );
}
