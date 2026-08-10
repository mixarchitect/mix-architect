"use client";

import { useState, useEffect, useCallback, useTransition } from "react";
import {
  Search,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Tag,
  GitMerge,
  ArrowUpCircle,
  X,
  Check,
  Trash2,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { ConfirmDialog } from "@/components/ui/dialog";
import { formatAdminTimeTitle } from "@/lib/format-admin-time";
import type {
  FeatureRequestAdmin,
  FeatureStatus,
  FeatureCategory,
} from "@/lib/help/types";
import {
  getAdminFeatureRequests,
  updateFeatureRequestStatus,
  bulkUpdateFeatureRequestStatus,
  updateFeatureRequestTags,
  bulkAddTags,
  mergeFeatureRequests,
  unmergeFeatureRequest,
  updateAdminNotes,
  updateAdminResponse,
  getMergedRequests,
  getAllFeatureRequestTags,
  deleteFeatureRequest,
} from "@/actions/admin-feature-requests";

// ── Status config ──

const STATUS_CONFIG: Record<
  FeatureStatus,
  { label: string; classes: string }
> = {
  new: { label: "New", classes: "bg-blue-900 text-blue-300" },
  under_review: {
    label: "Reviewing",
    classes: "bg-panel2 text-muted",
  },
  planned: { label: "Planned", classes: "bg-signal/15 text-signal" },
  in_progress: {
    label: "In Progress",
    classes: "bg-indigo-900 text-indigo-300",
  },
  shipped: { label: "Shipped", classes: "bg-success/15 text-success" },
  declined: { label: "Declined", classes: "bg-danger/15 text-danger" },
};

const ALL_STATUSES: FeatureStatus[] = [
  "new",
  "under_review",
  "planned",
  "in_progress",
  "shipped",
  "declined",
];

const ALL_CATEGORIES: FeatureCategory[] = [
  "workflow",
  "audio",
  "collaboration",
  "integrations",
  "distribution",
  "payments",
  "mobile",
  "other",
];

type SortMode = "votes" | "recency" | "status";

// ── Main board component ──

export function FeatureRequestAdminBoard() {
  const [requests, setRequests] = useState<FeatureRequestAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  // Filters
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [tagFilter, setTagFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [sort, setSort] = useState<SortMode>("recency");

  // Selection
  const [selected, setSelected] = useState<Set<string>>(new Set());

  // Detail panel
  const [detailId, setDetailId] = useState<string | null>(null);

  // All tags (for filter dropdown)
  const [allTags, setAllTags] = useState<string[]>([]);

  // Bulk tag input
  const [bulkTagInput, setBulkTagInput] = useState("");
  const [showBulkTag, setShowBulkTag] = useState(false);

  // Merge modal
  const [showMerge, setShowMerge] = useState(false);
  const [mergeCanonical, setMergeCanonical] = useState<string | null>(null);

  const fetchData = useCallback(() => {
    startTransition(async () => {
      setLoading(true);
      try {
        const [data, tags] = await Promise.all([
          getAdminFeatureRequests({
            status: statusFilter || undefined,
            category: categoryFilter || undefined,
            tag: tagFilter || undefined,
            search: searchQuery || undefined,
            sort,
          }),
          getAllFeatureRequestTags(),
        ]);
        setRequests(data);
        setAllTags(tags);
      } catch (e) {
        console.error("Failed to fetch feature requests:", e);
      } finally {
        setLoading(false);
      }
    });
  }, [statusFilter, categoryFilter, tagFilter, searchQuery, sort]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Debounced search
  const [searchInput, setSearchInput] = useState("");
  useEffect(() => {
    const t = setTimeout(() => setSearchQuery(searchInput), 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === requests.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(requests.map((r) => r.id)));
    }
  };

  // ── Bulk actions ──

  const handleBulkStatus = async (status: FeatureStatus) => {
    await bulkUpdateFeatureRequestStatus(Array.from(selected), status);
    setSelected(new Set());
    fetchData();
  };

  const handleBulkAddTags = async () => {
    const tags = bulkTagInput
      .split(",")
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);
    if (tags.length === 0) return;
    await bulkAddTags(Array.from(selected), tags);
    setBulkTagInput("");
    setShowBulkTag(false);
    setSelected(new Set());
    fetchData();
  };

  const handleMerge = async () => {
    if (!mergeCanonical) return;
    const others = Array.from(selected).filter((id) => id !== mergeCanonical);
    await mergeFeatureRequests(mergeCanonical, others);
    setShowMerge(false);
    setMergeCanonical(null);
    setSelected(new Set());
    fetchData();
  };

  // ── Stats ──

  const stats = requests.reduce(
    (acc, r) => {
      acc[r.status] = (acc[r.status] || 0) + 1;
      acc.totalVotes += r.total_votes;
      return acc;
    },
    { totalVotes: 0 } as Record<string, number>
  );

  const detailRequest = detailId
    ? requests.find((r) => r.id === detailId) ?? null
    : null;

  return (
    <div className="flex gap-4">
      {/* Main list */}
      <div className={cn("flex-1 min-w-0", detailRequest && "max-w-[60%]")}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-text">
              Feature Requests
            </h1>
            <p className="text-sm text-muted mt-1">
              {requests.length} request{requests.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-4">
          <FilterSelect
            label="Status"
            value={statusFilter}
            onChange={setStatusFilter}
            options={ALL_STATUSES.map((s) => ({
              value: s,
              label: STATUS_CONFIG[s].label,
            }))}
          />
          <FilterSelect
            label="Category"
            value={categoryFilter}
            onChange={setCategoryFilter}
            options={ALL_CATEGORIES.map((c) => ({
              value: c,
              label: c.charAt(0).toUpperCase() + c.slice(1),
            }))}
          />
          {allTags.length > 0 && (
            <FilterSelect
              label="Tag"
              value={tagFilter}
              onChange={setTagFilter}
              options={allTags.map((t) => ({ value: t, label: t }))}
            />
          )}
          <FilterSelect
            label="Sort"
            value={sort}
            onChange={(v) => setSort(v as SortMode)}
            options={[
              { value: "recency", label: "Recent" },
              { value: "votes", label: "Votes" },
              { value: "status", label: "Status" },
            ]}
            allowEmpty={false}
          />
          <div className="relative flex-1 min-w-[200px]">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-faint"
            />
            <input
              type="text"
              placeholder="Search..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full h-9 pl-8 pr-3 rounded-md border border-border bg-panel text-sm text-text placeholder:text-faint focus:outline-none focus:ring-1 focus:ring-signal"
            />
          </div>
        </div>

        {/* Bulk actions */}
        {selected.size > 0 && (
          <div className="flex items-center gap-2 mb-3 p-2 rounded-lg bg-panel2/50 border border-border-strong text-sm">
            <span className="text-muted">
              {selected.size} selected
            </span>
            <span className="text-faint">|</span>
            {/* Status dropdown */}
            <div className="relative group">
              <button className="px-2 py-1 text-xs text-muted hover:text-text transition-colors">
                Set Status ▾
              </button>
              <div className="absolute left-0 top-full mt-1 z-20 hidden group-hover:block bg-panel border border-border-strong rounded-md shadow-lg py-1 min-w-[140px]">
                {ALL_STATUSES.map((s) => (
                  <button
                    key={s}
                    onClick={() => handleBulkStatus(s)}
                    className="w-full text-left px-3 py-1.5 text-xs hover:bg-panel2 text-muted"
                  >
                    {STATUS_CONFIG[s].label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tag input */}
            {showBulkTag ? (
              <div className="flex items-center gap-1">
                <input
                  type="text"
                  value={bulkTagInput}
                  onChange={(e) => setBulkTagInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleBulkAddTags()}
                  placeholder="tag1, tag2"
                  className="h-7 px-2 rounded border border-border-strong bg-panel text-xs text-text w-32 focus:outline-none"
                  autoFocus
                />
                <button
                  onClick={handleBulkAddTags}
                  className="text-signal hover:text-signal/80"
                >
                  <Check size={14} />
                </button>
                <button
                  onClick={() => setShowBulkTag(false)}
                  className="text-faint hover:text-text"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowBulkTag(true)}
                className="px-2 py-1 text-xs text-muted hover:text-text transition-colors"
              >
                Add Tags
              </button>
            )}

            {selected.size >= 2 && (
              <button
                onClick={() => {
                  setShowMerge(true);
                  // Pre-select highest voted as canonical
                  const selectedRequests = requests.filter((r) =>
                    selected.has(r.id)
                  );
                  const highest = selectedRequests.sort(
                    (a, b) => b.total_votes - a.total_votes
                  )[0];
                  setMergeCanonical(highest?.id ?? null);
                }}
                className="px-2 py-1 text-xs text-muted hover:text-text transition-colors"
              >
                <GitMerge size={12} className="inline mr-1" />
                Merge
              </button>
            )}
          </div>
        )}

        {/* Request list */}
        {loading && requests.length === 0 ? (
          <div className="text-sm text-muted text-center py-16">
            Loading...
          </div>
        ) : requests.length === 0 ? (
          <div className="rounded-xl border border-border p-8 text-center">
            <p className="text-muted">No feature requests match your filters.</p>
          </div>
        ) : (
          <div className="space-y-1">
            {/* Select all */}
            <div className="flex items-center gap-2 px-3 py-1">
              <input
                type="checkbox"
                checked={
                  selected.size === requests.length && requests.length > 0
                }
                onChange={toggleAll}
                className="accent-[var(--signal)]"
              />
              <span className="text-xs text-faint">Select all</span>
            </div>

            {requests.map((r) => (
              <RequestRow
                key={r.id}
                request={r}
                isSelected={selected.has(r.id)}
                isActive={detailId === r.id}
                onToggleSelect={() => toggleSelect(r.id)}
                onClick={() =>
                  setDetailId(detailId === r.id ? null : r.id)
                }
              />
            ))}
          </div>
        )}

        {/* Stats */}
        {requests.length > 0 && (
          <div className="mt-6 pt-4 border-t border-border text-xs text-muted flex flex-wrap gap-x-4 gap-y-1">
            {ALL_STATUSES.map((s) => (
              <span key={s}>
                {STATUS_CONFIG[s].label}: {stats[s] || 0}
              </span>
            ))}
            <span>Total votes: {stats.totalVotes}</span>
          </div>
        )}
      </div>

      {/* Detail panel */}
      {detailRequest && (
        <DetailPanel
          request={detailRequest}
          allTags={allTags}
          onClose={() => setDetailId(null)}
          onRefresh={fetchData}
        />
      )}

      {/* Merge modal */}
      {showMerge && (
        <MergeModal
          requests={requests.filter((r) => selected.has(r.id))}
          canonicalId={mergeCanonical}
          onSelectCanonical={setMergeCanonical}
          onConfirm={handleMerge}
          onCancel={() => {
            setShowMerge(false);
            setMergeCanonical(null);
          }}
        />
      )}
    </div>
  );
}

// ── Filter select ──

function FilterSelect({
  label,
  value,
  onChange,
  options,
  allowEmpty = true,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  allowEmpty?: boolean;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-9 px-2 rounded-md border border-border bg-panel text-sm text-text appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-signal"
    >
      {allowEmpty && <option value="">All {label}</option>}
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

// ── Request row ──

function RequestRow({
  request,
  isSelected,
  isActive,
  onToggleSelect,
  onClick,
}: {
  request: FeatureRequestAdmin;
  isSelected: boolean;
  isActive: boolean;
  onToggleSelect: () => void;
  onClick: () => void;
}) {
  const r = request;
  const statusCfg = STATUS_CONFIG[r.status];

  return (
    <div
      className={cn(
        "flex items-start gap-3 p-3 rounded-lg border transition-colors cursor-pointer",
        isActive
          ? "border-signal/40 bg-signal/5"
          : "border-border bg-panel hover:bg-panel2"
      )}
    >
      <input
        type="checkbox"
        checked={isSelected}
        onChange={(e) => {
          e.stopPropagation();
          onToggleSelect();
        }}
        className="mt-1 accent-[var(--signal)] shrink-0"
      />

      {/* Vote count */}
      <div className="flex flex-col items-center shrink-0 w-10">
        <ArrowUpCircle size={14} className="text-signal mb-0.5" />
        <span className="text-sm font-semibold text-text">
          {r.total_votes}
        </span>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0" onClick={onClick}>
        <p className="text-sm font-medium text-text truncate">{r.title}</p>
        <p className="text-xs text-muted truncate mt-0.5">{r.description}</p>
        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
          <span className="text-xs text-muted">{r.category}</span>
          <span
            className={cn(
              "text-2xs font-medium px-1.5 py-0.5 rounded",
              statusCfg.classes
            )}
          >
            {statusCfg.label}
          </span>
          {r.merge_count > 0 && (
            <span className="text-2xs text-faint">
              <GitMerge size={10} className="inline mr-0.5" />
              {r.merge_count} merged
            </span>
          )}
          {r.tags.map((tag) => (
            <span
              key={tag}
              className="text-2xs px-1.5 py-0.5 rounded-full bg-panel2 text-muted"
            >
              {tag}
            </span>
          ))}
          {r.submitter_name && (
            <span className="text-2xs text-faint">
              by {r.submitter_name}
            </span>
          )}
        </div>
        {r.admin_notes && (
          <p className="text-2xs text-faint italic mt-1 truncate">
            Admin: {r.admin_notes}
          </p>
        )}
      </div>
    </div>
  );
}

// ── Detail panel ──

function DetailPanel({
  request,
  allTags,
  onClose,
  onRefresh,
}: {
  request: FeatureRequestAdmin;
  allTags: string[];
  onClose: () => void;
  onRefresh: () => void;
}) {
  const [status, setStatus] = useState(request.status);
  const [adminNotes, setAdminNotes] = useState(request.admin_notes ?? "");
  const [adminResponse, setAdminResponse] = useState(
    request.admin_response ?? ""
  );
  const [tags, setTags] = useState<string[]>(request.tags);
  const [tagInput, setTagInput] = useState("");
  const [mergedRequests, setMergedRequests] = useState<any[]>([]);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setStatus(request.status);
    setAdminNotes(request.admin_notes ?? "");
    setAdminResponse(request.admin_response ?? "");
    setTags(request.tags);
  }, [request]);

  useEffect(() => {
    if (request.merge_count > 0) {
      getMergedRequests(request.id).then(setMergedRequests);
    } else {
      setMergedRequests([]);
    }
  }, [request.id, request.merge_count]);

  const handleStatusChange = async (newStatus: FeatureStatus) => {
    setStatus(newStatus);
    await updateFeatureRequestStatus(request.id, newStatus);
    onRefresh();
  };

  const handleSaveNotes = async () => {
    await updateAdminNotes(request.id, adminNotes);
  };

  const handleSaveResponse = async () => {
    await updateAdminResponse(request.id, adminResponse);
    onRefresh();
  };

  const handleAddTag = async () => {
    const tag = tagInput.trim().toLowerCase();
    if (!tag || tags.includes(tag)) return;
    const newTags = [...tags, tag];
    setTags(newTags);
    setTagInput("");
    await updateFeatureRequestTags(request.id, newTags);
    onRefresh();
  };

  const handleRemoveTag = async (tag: string) => {
    const newTags = tags.filter((t) => t !== tag);
    setTags(newTags);
    await updateFeatureRequestTags(request.id, newTags);
    onRefresh();
  };

  const handleUnmerge = async (id: string) => {
    await unmergeFeatureRequest(id);
    onRefresh();
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteFeatureRequest(request.id);
    } finally {
      setDeleting(false);
      setDeleteConfirmOpen(false);
    }
    onClose();
    onRefresh();
  };

  const relativeTime = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const days = Math.floor(diff / 86400000);
    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 30) return `${days}d ago`;
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="w-[40%] shrink-0 border border-border rounded-lg bg-panel p-4 overflow-y-auto max-h-[calc(100vh-12rem)] sticky top-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <h2 className="text-base font-semibold text-text pr-4">
          {request.title}
        </h2>
        <button
          onClick={onClose}
          className="text-faint hover:text-text shrink-0"
        >
          <X size={16} />
        </button>
      </div>

      {/* Description */}
      <p className="text-sm text-muted mb-4">{request.description}</p>

      {/* Meta */}
      <div className="text-xs text-faint mb-4 space-y-0.5">
        <p title={formatAdminTimeTitle(request.created_at)}>
          Submitted {relativeTime(request.created_at)}
          {request.submitter_name && ` by ${request.submitter_name}`}
        </p>
        <p>
          {request.total_votes} vote{request.total_votes !== 1 ? "s" : ""} · {request.category}
        </p>
      </div>

      {/* Status */}
      <div className="mb-4">
        <label className="text-xs text-faint uppercase tracking-wide block mb-1">
          Status
        </label>
        <div className="flex flex-wrap gap-1">
          {ALL_STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => handleStatusChange(s)}
              className={cn(
                "text-[11px] font-medium px-2 py-1 rounded transition-colors",
                status === s
                  ? STATUS_CONFIG[s].classes
                  : "bg-panel2/50 text-faint hover:text-text"
              )}
            >
              {STATUS_CONFIG[s].label}
            </button>
          ))}
        </div>
      </div>

      {/* Admin response (visible to users) */}
      <div className="mb-4">
        <label className="text-xs text-faint uppercase tracking-wide block mb-1">
          Public Response
        </label>
        <textarea
          value={adminResponse}
          onChange={(e) => setAdminResponse(e.target.value)}
          onBlur={handleSaveResponse}
          placeholder="Visible to users on the feature board..."
          rows={2}
          className="w-full rounded-md border border-border bg-panel2 text-sm text-text p-2 focus:outline-none focus:ring-1 focus:ring-signal resize-none"
        />
      </div>

      {/* Admin notes (internal) */}
      <div className="mb-4">
        <label className="text-xs text-faint uppercase tracking-wide block mb-1">
          Internal Notes
        </label>
        <textarea
          value={adminNotes}
          onChange={(e) => setAdminNotes(e.target.value)}
          onBlur={handleSaveNotes}
          placeholder="Internal notes, never shown to users..."
          rows={2}
          className="w-full rounded-md border border-border bg-panel2 text-sm text-text p-2 focus:outline-none focus:ring-1 focus:ring-signal resize-none"
        />
      </div>

      {/* Tags */}
      <div className="mb-4">
        <label className="text-xs text-faint uppercase tracking-wide block mb-1">
          Tags
        </label>
        <div className="flex flex-wrap gap-1 mb-1.5">
          {tags.map((tag) => (
            <span
              key={tag}
              className="text-[11px] px-2 py-0.5 rounded-full bg-panel2 text-muted flex items-center gap-1"
            >
              {tag}
              <button
                onClick={() => handleRemoveTag(tag)}
                className="hover:text-danger"
              >
                <X size={10} />
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-1">
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddTag()}
            placeholder="Add tag..."
            list="tag-suggestions"
            className="flex-1 h-7 px-2 rounded border border-border bg-panel2 text-xs text-text focus:outline-none focus:ring-1 focus:ring-signal"
          />
          <datalist id="tag-suggestions">
            {allTags
              .filter((t) => !tags.includes(t))
              .map((t) => (
                <option key={t} value={t} />
              ))}
          </datalist>
          <button
            onClick={handleAddTag}
            className="h-7 px-2 rounded border border-border bg-panel2 text-xs text-signal hover:text-signal/80"
          >
            <Tag size={12} />
          </button>
        </div>
      </div>

      {/* Merged requests */}
      {mergedRequests.length > 0 && (
        <div className="mb-4">
          <label className="text-xs text-faint uppercase tracking-wide block mb-1">
            Merged Requests ({mergedRequests.length})
          </label>
          <div className="space-y-1">
            {mergedRequests.map((m: any) => (
              <div
                key={m.id}
                className="flex items-center justify-between text-xs p-2 rounded bg-panel2/50"
              >
                <div className="min-w-0">
                  <p className="text-muted truncate">{m.title}</p>
                  <p className="text-faint">
                    {m.vote_count} vote{m.vote_count !== 1 ? "s" : ""}
                  </p>
                </div>
                <button
                  onClick={() => handleUnmerge(m.id)}
                  className="text-faint hover:text-text text-2xs shrink-0 ml-2"
                >
                  Unmerge
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Delete */}
      <div className="pt-3 border-t border-border">
        <button
          onClick={() => setDeleteConfirmOpen(true)}
          className="text-xs text-faint hover:text-danger transition-colors flex items-center gap-1"
        >
          <Trash2 size={12} />
          Delete Request
        </button>
      </div>

      <ConfirmDialog
        open={deleteConfirmOpen}
        title="Delete this feature request?"
        description="This cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        destructive
        busy={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirmOpen(false)}
      />
    </div>
  );
}

// ── Merge modal ──

function MergeModal({
  requests,
  canonicalId,
  onSelectCanonical,
  onConfirm,
  onCancel,
}: {
  requests: FeatureRequestAdmin[];
  canonicalId: string | null;
  onSelectCanonical: (id: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onCancel();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onCancel]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="merge-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div className="bg-panel border border-border-strong rounded-xl p-6 max-w-md w-full mx-4 shadow-xl">
        <h3 id="merge-modal-title" className="text-base font-semibold text-text mb-2">
          Merge {requests.length} Requests
        </h3>
        <p className="text-sm text-muted mb-4">
          Select the canonical request. Others will be merged into it.
        </p>

        <div className="space-y-2 mb-6">
          {requests.map((r) => (
            <label
              key={r.id}
              className={cn(
                "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors",
                canonicalId === r.id
                  ? "border-signal bg-signal/10"
                  : "border-border hover:border-border-strong"
              )}
            >
              <input
                type="radio"
                name="canonical"
                checked={canonicalId === r.id}
                onChange={() => onSelectCanonical(r.id)}
                className="accent-[var(--signal)]"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-text truncate">{r.title}</p>
                <p className="text-xs text-muted">
                  {r.total_votes} vote{r.total_votes !== 1 ? "s" : ""}
                </p>
              </div>
            </label>
          ))}
        </div>

        <div className="flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm text-muted hover:text-text transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={!canonicalId}
            className="px-4 py-2 text-sm bg-signal text-signal-on rounded-lg hover:bg-signal/90 transition-colors disabled:opacity-50"
          >
            Merge
          </button>
        </div>
      </div>
    </div>
  );
}
