"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Radio,
  Plus,
  Send,
  ExternalLink,
  Trash2,
  Loader2,
  Sparkles,
  Search,
  X,
  ChevronDown,
} from "lucide-react";
import { Panel, PanelBody } from "@/components/ui/panel";
import { Button } from "@/components/ui/button";
import { Pill } from "@/components/ui/pill";
import { StatusIndicator } from "@/components/ui/status-dot";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/cn";
import {
  PLATFORMS,
  DISTRIBUTORS,
  DISTRIBUTOR_PLATFORMS,
  statusLabel,
  getPlatformIcon,
  type DistributionEntry,
  type PlatformId,
} from "@/lib/distribution/platforms";

type StatusColor = "blue" | "green" | "orange";

function getStatusColor(status: string): StatusColor {
  if (status === "live") return "green";
  if (status === "submitted" || status === "processing") return "orange";
  return "blue";
}

type Props = {
  releaseId: string;
  initialEntries: DistributionEntry[];
  releaseTitle: string;
  releaseArtist: string;
  canEdit: boolean;
};

export function DistributionPanel({
  releaseId,
  initialEntries,
  releaseTitle,
  releaseArtist,
  canEdit,
}: Props) {
  const router = useRouter();
  const [entries, setEntries] = useState<DistributionEntry[]>(initialEntries);
  const [showBulkForm, setShowBulkForm] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [checking, setChecking] = useState(false);
  const [checkResult, setCheckResult] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const res = await fetch(
      `/api/releases/${releaseId}/distribution`,
    );
    if (res.ok) {
      const data = await res.json();
      setEntries(data.entries);
    }
  }, [releaseId]);

  async function handleDelete(id: string) {
    const res = await fetch(
      `/api/releases/${releaseId}/distribution/${id}`,
      { method: "DELETE" },
    );
    if (res.ok) {
      setEntries((prev) => prev.filter((e) => e.id !== id));
    }
  }

  async function handleCheckNow() {
    setChecking(true);
    setCheckResult(null);
    try {
      const res = await fetch(
        `/api/releases/${releaseId}/distribution/check-now`,
        { method: "POST" },
      );
      const data = await res.json();
      if (res.ok) {
        const found = (data.results ?? []).filter(
          (r: { found: boolean }) => r.found,
        );
        if (found.length > 0) {
          setCheckResult(
            `Found on ${found.map((r: { platform: string }) => r.platform === "apple_music" ? "Apple Music" : "Spotify").join(", ")}!`,
          );
          await refresh();
          router.refresh();
        } else {
          setCheckResult("Not found yet. We'll keep checking daily.");
        }
      } else {
        setCheckResult(data.error ?? "Check failed");
      }
    } catch {
      setCheckResult("Check failed");
    } finally {
      setChecking(false);
    }
  }

  async function handleStatusChange(id: string, newStatus: string) {
    const res = await fetch(
      `/api/releases/${releaseId}/distribution/${id}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      },
    );
    if (res.ok) {
      await refresh();
    }
  }

  async function handleSetUrl(id: string, url: string) {
    await fetch(`/api/releases/${releaseId}/distribution/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ external_url: url }),
    });
    await refresh();
  }

  // Split entries into Spotify (auto) and other (manual)
  const spotifyEntry = entries.find((e) => e.platform === "spotify");
  const otherEntries = entries.filter((e) => e.platform !== "spotify");

  const hasSpotifySubmitted =
    spotifyEntry &&
    (spotifyEntry.status === "submitted" || spotifyEntry.status === "processing");

  return (
    <Panel>
      <PanelBody className="py-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="label-sm text-muted">DISTRIBUTION TRACKER</div>
          {canEdit && entries.length > 0 && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  setShowBulkForm(!showBulkForm);
                }}
                className="flex items-center gap-1 text-[11px] text-muted hover:text-signal transition-colors"
              >
                <Send size={12} />
                Mark as Submitted
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowBulkForm(false);
                  setShowAddForm(!showAddForm);
                }}
                className="flex items-center gap-1 text-[11px] text-muted hover:text-signal transition-colors"
              >
                <Plus size={12} />
                Add Platform
              </button>
            </div>
          )}
        </div>

        {/* Bulk Submit Form */}
        {showBulkForm && canEdit && (
          <BulkSubmitForm
            releaseId={releaseId}
            existingPlatforms={entries.map((e) => e.platform)}
            onDone={() => {
              setShowBulkForm(false);
              refresh();
            }}
            onCancel={() => setShowBulkForm(false)}
          />
        )}

        {/* Add Single Platform Form */}
        {showAddForm && canEdit && (
          <AddPlatformForm
            releaseId={releaseId}
            existingPlatforms={entries.map((e) => e.platform)}
            onDone={() => {
              setShowAddForm(false);
              refresh();
            }}
            onCancel={() => setShowAddForm(false)}
          />
        )}

        {/* Empty State */}
        {entries.length === 0 && !showBulkForm && !showAddForm ? (
          <EmptyState
            icon={Radio}
            title="No platforms tracked"
            description="Track your release on Spotify."
            size="sm"
            action={
              canEdit
                ? {
                    label: "Get Started",
                    onClick: () => setShowBulkForm(true),
                  }
                : undefined
            }
          />
        ) : (
          <div className="space-y-4">
            {/* ── Spotify Section (Auto-detected) ── */}
            {spotifyEntry && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5 text-[11px] text-muted">
                    <Sparkles size={11} className="text-signal" />
                    Updates automatically
                  </div>
                  {hasSpotifySubmitted && (
                    <button
                      type="button"
                      onClick={handleCheckNow}
                      disabled={checking}
                      className="flex items-center gap-1 text-[11px] text-muted hover:text-signal transition-colors disabled:opacity-50"
                    >
                      {checking ? (
                        <Loader2 size={12} className="animate-spin" />
                      ) : (
                        <Search size={12} />
                      )}
                      Check Now
                    </button>
                  )}
                </div>

                {/* Check result feedback */}
                {checkResult && (
                  <div className="text-xs text-muted bg-panel2 rounded-md px-3 py-2 mb-2 flex items-center justify-between">
                    <span>{checkResult}</span>
                    <button
                      type="button"
                      onClick={() => setCheckResult(null)}
                      className="text-faint hover:text-text ml-2"
                    >
                      <X size={12} />
                    </button>
                  </div>
                )}

                <PlatformRow
                  entry={spotifyEntry}
                  canEdit={canEdit}
                  onDelete={() => handleDelete(spotifyEntry.id)}
                  onStatusChange={(status) =>
                    handleStatusChange(spotifyEntry.id, status)
                  }
                  onSetUrl={(url) => handleSetUrl(spotifyEntry.id, url)}
                />
              </div>
            )}

            {/* ── Other Platforms Section (Manual) ── */}
            {otherEntries.length > 0 && (
              <div>
                {spotifyEntry && (
                  <div className="flex items-center gap-1.5 text-[11px] text-muted mb-2">
                    Manually updated
                  </div>
                )}
                <div className="space-y-0.5">
                  {otherEntries.map((entry) => (
                    <PlatformRow
                      key={entry.id}
                      entry={entry}
                      canEdit={canEdit}
                      onDelete={() => handleDelete(entry.id)}
                      onStatusChange={(status) =>
                        handleStatusChange(entry.id, status)
                      }
                      onSetUrl={(url) => handleSetUrl(entry.id, url)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </PanelBody>
    </Panel>
  );
}

/* ------------------------------------------------------------------ */
/*  Platform Row                                                       */
/* ------------------------------------------------------------------ */

function PlatformRow({
  entry,
  canEdit,
  onDelete,
  onStatusChange,
  onSetUrl,
}: {
  entry: DistributionEntry;
  canEdit: boolean;
  onDelete: () => void;
  onStatusChange: (status: string) => void;
  onSetUrl: (url: string) => void;
}) {
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlValue, setUrlValue] = useState(entry.external_url ?? "");

  const platform = PLATFORMS.find((p) => p.id === entry.platform);

  return (
    <div className="flex items-center gap-3 py-2 px-1 rounded-md hover:bg-panel2/50 transition-colors group">
      {/* Platform icon + name */}
      <img
        src={getPlatformIcon(entry.platform)}
        alt=""
        className="w-4 h-4 shrink-0 object-contain"
      />
      <span className="text-sm text-text w-[120px] shrink-0">
        {platform?.label ?? entry.platform}
      </span>

      {/* Status */}
      <span className="w-[80px] shrink-0">
        <StatusIndicator
          color={getStatusColor(entry.status)}
          label={statusLabel(entry.status)}
          className="text-xs"
        />
      </span>

      {/* Distributor pill */}
      <span className="w-[90px] shrink-0">
        {entry.distributor ? (
          <Pill className="text-[10px]">{entry.distributor}</Pill>
        ) : null}
      </span>

      {/* Auto-detected sparkle */}
      {entry.auto_detected && (
        <span title="Automatically detected">
          <Sparkles
            size={12}
            className="text-signal shrink-0"
          />
        </span>
      )}

      {/* Spacer */}
      <span className="flex-1" />

      {/* External link */}
      {entry.external_url && (
        <a
          href={entry.external_url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-muted hover:text-signal transition-colors"
          title="Open on platform"
        >
          <ExternalLink size={13} />
        </a>
      )}

      {/* Actions (visible on hover) */}
      {canEdit && (
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {/* Status cycle */}
          {entry.status !== "live" && (
            <button
              type="button"
              onClick={() => {
                const cycle: Record<string, string> = {
                  not_submitted: "submitted",
                  submitted: "processing",
                  processing: "live",
                };
                const next = cycle[entry.status];
                if (next) onStatusChange(next);
              }}
              className="text-[10px] text-muted hover:text-signal transition-colors px-1"
              title="Advance status"
            >
              <ChevronDown size={12} className="rotate-[-90deg]" />
            </button>
          )}

          {/* Add URL */}
          {!entry.external_url && (
            <button
              type="button"
              onClick={() => setShowUrlInput(!showUrlInput)}
              className="text-[10px] text-muted hover:text-signal transition-colors px-1"
              title="Add URL"
            >
              <ExternalLink size={12} />
            </button>
          )}

          {/* Delete */}
          <button
            type="button"
            onClick={onDelete}
            className="text-[10px] text-muted hover:text-red-400 transition-colors px-1"
            title="Remove"
          >
            <Trash2 size={12} />
          </button>
        </div>
      )}

      {/* Inline URL input */}
      {showUrlInput && (
        <form
          className="flex items-center gap-1 ml-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (urlValue.trim()) {
              onSetUrl(urlValue.trim());
              setShowUrlInput(false);
            }
          }}
        >
          <input
            type="url"
            value={urlValue}
            onChange={(e) => setUrlValue(e.target.value)}
            className="input h-6 text-xs w-40"
            placeholder="https://..."
            autoFocus
            style={{ padding: "4px 8px" }}
          />
          <Button
            type="submit"
            variant="primary"
            className="h-6 text-[10px] px-2"
          >
            Save
          </Button>
        </form>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Bulk Submit Form                                                   */
/* ------------------------------------------------------------------ */

function BulkSubmitForm({
  releaseId,
  existingPlatforms,
  onDone,
  onCancel,
}: {
  releaseId: string;
  existingPlatforms: string[];
  onDone: () => void;
  onCancel: () => void;
}) {
  const [distributor, setDistributor] = useState("");
  const [selectedPlatforms, setSelectedPlatforms] = useState<Set<string>>(
    new Set(),
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const existingSet = new Set(existingPlatforms);

  // When distributor changes, pre-select their platforms
  function handleDistributorChange(name: string) {
    setDistributor(name);
    const platforms = DISTRIBUTOR_PLATFORMS[name] ?? [];
    setSelectedPlatforms(
      new Set(platforms.filter((p) => !existingSet.has(p))),
    );
  }

  function togglePlatform(id: string) {
    setSelectedPlatforms((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function handleSubmit() {
    if (!distributor || selectedPlatforms.size === 0) return;
    setSubmitting(true);
    setError(null);

    const res = await fetch(
      `/api/releases/${releaseId}/distribution/bulk-submit`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          platforms: Array.from(selectedPlatforms),
          distributor,
        }),
      },
    );

    if (res.ok) {
      onDone();
    } else {
      const data = await res.json();
      setError(data.error ?? "Failed to submit");
    }
    setSubmitting(false);
  }

  return (
    <div className="mb-4 border border-border rounded-lg p-3 space-y-3">
      <div className="text-xs font-medium text-text">Mark as Submitted</div>

      {/* Distributor select */}
      <div className="space-y-1">
        <label className="text-[11px] text-muted">Distributor</label>
        <select
          value={distributor}
          onChange={(e) => handleDistributorChange(e.target.value)}
          className="input text-xs w-full"
          style={{ height: "32px", padding: "4px 36px 4px 10px" }}
        >
          <option value="">Select distributor...</option>
          {DISTRIBUTORS.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      </div>

      {/* Platform checkboxes */}
      {distributor && (
        <div className="space-y-1">
          <label className="text-[11px] text-muted">Platforms</label>
          <div className="grid grid-cols-2 gap-1">
            {PLATFORMS.map((p) => {
              const alreadyExists = existingSet.has(p.id);
              return (
                <label
                  key={p.id}
                  className={cn(
                    "flex items-center gap-2 text-xs py-1 px-1 rounded cursor-pointer",
                    alreadyExists && "opacity-40 cursor-not-allowed",
                  )}
                >
                  <input
                    type="checkbox"
                    checked={selectedPlatforms.has(p.id)}
                    onChange={() => togglePlatform(p.id)}
                    disabled={alreadyExists}
                    className="rounded border-border accent-[var(--signal)]"
                  />
                  <img
                    src={getPlatformIcon(p.id)}
                    alt=""
                    className="w-3.5 h-3.5 shrink-0 object-contain"
                  />
                  <span className="text-text">
                    {p.label}
                    {alreadyExists && " (tracked)"}
                  </span>
                </label>
              );
            })}
          </div>
        </div>
      )}

      {error && (
        <p className="text-xs text-red-400">{error}</p>
      )}

      <div className="flex items-center gap-2">
        <Button
          variant="primary"
          className="h-7 text-xs"
          disabled={!distributor || selectedPlatforms.size === 0 || submitting}
          onClick={handleSubmit}
        >
          {submitting ? "Submitting..." : `Submit ${selectedPlatforms.size} Platforms`}
        </Button>
        <button
          type="button"
          onClick={onCancel}
          className="text-xs text-muted hover:text-text transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Add Single Platform Form                                           */
/* ------------------------------------------------------------------ */

function AddPlatformForm({
  releaseId,
  existingPlatforms,
  onDone,
  onCancel,
}: {
  releaseId: string;
  existingPlatforms: string[];
  onDone: () => void;
  onCancel: () => void;
}) {
  const existingSet = new Set(existingPlatforms);
  const available = PLATFORMS.filter((p) => !existingSet.has(p.id));

  const [platform, setPlatform] = useState<string>(available[0]?.id ?? "");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    if (!platform) return;
    setSubmitting(true);

    const res = await fetch(
      `/api/releases/${releaseId}/distribution`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platform }),
      },
    );

    if (res.ok) {
      onDone();
    }
    setSubmitting(false);
  }

  if (available.length === 0) {
    return (
      <div className="mb-4 text-xs text-muted">
        All platforms are already being tracked.
      </div>
    );
  }

  return (
    <div className="mb-4 border border-border rounded-lg p-3 flex items-center gap-3">
      <select
        value={platform}
        onChange={(e) => setPlatform(e.target.value)}
        className="input text-xs flex-1"
        style={{ height: "32px", padding: "4px 36px 4px 10px" }}
      >
        {available.map((p) => (
          <option key={p.id} value={p.id}>
            {p.label}
          </option>
        ))}
      </select>
      <Button
        variant="primary"
        className="h-7 text-xs"
        disabled={!platform || submitting}
        onClick={handleSubmit}
      >
        {submitting ? "Adding..." : "Add"}
      </Button>
      <button
        type="button"
        onClick={onCancel}
        className="text-xs text-muted hover:text-text transition-colors"
      >
        Cancel
      </button>
    </div>
  );
}
