"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabaseBrowserClient";
import { searchItunesApi, buildPlatformUrl, type ItunesResult } from "@/lib/itunes-search";
import { Panel, PanelBody } from "@/components/ui/panel";
import { Button } from "@/components/ui/button";
import { ReferenceCard } from "@/components/ui/reference-card";
import { StatusIndicator } from "@/components/ui/status-dot";
import { Pencil, Check, X, ImageIcon, Upload } from "lucide-react";

// ── Status Editor ──

const RELEASE_STATUSES = ["draft", "in_progress", "ready"] as const;
type ReleaseStatus = (typeof RELEASE_STATUSES)[number];

function releaseStatusColor(s: string): "green" | "orange" | "blue" {
  if (s === "ready") return "green";
  if (s === "in_progress") return "orange";
  return "blue";
}

function releaseStatusLabel(s: string): string {
  if (s === "ready") return "Ready";
  if (s === "in_progress") return "In Progress";
  return "Draft";
}

type StatusEditorProps = {
  releaseId: string;
  initialStatus: string;
};

export function StatusEditor({ releaseId, initialStatus }: StatusEditorProps) {
  const [status, setStatus] = useState<ReleaseStatus>(
    (RELEASE_STATUSES.includes(initialStatus as ReleaseStatus) ? initialStatus : "draft") as ReleaseStatus,
  );
  const router = useRouter();

  async function cycleStatus() {
    const idx = RELEASE_STATUSES.indexOf(status);
    const next = RELEASE_STATUSES[(idx + 1) % RELEASE_STATUSES.length];
    const prev = status;
    setStatus(next);
    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase
        .from("releases")
        .update({ status: next })
        .eq("id", releaseId);
      if (error) throw error;
      router.refresh();
    } catch {
      setStatus(prev);
    }
  }

  return (
    <button
      type="button"
      onClick={cycleStatus}
      className="cursor-pointer hover:opacity-80 transition-opacity"
    >
      <StatusIndicator
        color={releaseStatusColor(status)}
        label={releaseStatusLabel(status)}
      />
    </button>
  );
}

// ── Helper: auto-promote release from draft ──

async function autoPromoteRelease(releaseId: string, currentStatus: string) {
  if (currentStatus !== "draft") return;
  const supabase = createSupabaseBrowserClient();
  await supabase.from("releases").update({ status: "in_progress" }).eq("id", releaseId);
}

// ── Global Direction Editor ──

type DirectionEditorProps = {
  releaseId: string;
  initialValue: string | null;
  initialStatus?: string;
};

export function GlobalDirectionEditor({ releaseId, initialValue, initialStatus }: DirectionEditorProps) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(initialValue ?? "");
  const [saving, setSaving] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (editing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.selectionStart = textareaRef.current.value.length;
    }
  }, [editing]);

  async function handleSave() {
    setSaving(true);
    const supabase = createSupabaseBrowserClient();
    try {
      const { error } = await supabase
        .from("releases")
        .update({ global_direction: value || null })
        .eq("id", releaseId);
      if (error) throw error;
      if (initialStatus) await autoPromoteRelease(releaseId, initialStatus);
      setEditing(false);
      router.refresh();
    } catch {
      // Keep editing open so user can retry
    } finally {
      setSaving(false);
    }
  }

  return (
    <Panel>
      <PanelBody className="py-5">
        <div className="flex items-center justify-between mb-2">
          <div className="label-sm text-muted">GLOBAL MIX DIRECTION</div>
          {!editing && (
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="text-muted hover:text-text transition-colors"
            >
              <Pencil size={13} />
            </button>
          )}
        </div>
        {editing ? (
          <div className="space-y-2">
            <textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="input min-h-[80px] resize-y text-sm w-full"
              placeholder="Overall sonic vision for this release..."
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md transition-colors"
                style={{ background: "var(--signal)", color: "#fff" }}
              >
                <Check size={12} />
                {saving ? "Saving…" : "Save"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setValue(initialValue ?? "");
                  setEditing(false);
                }}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md text-muted hover:text-text transition-colors"
                style={{ background: "var(--panel2)" }}
              >
                <X size={12} />
                Cancel
              </button>
            </div>
          </div>
        ) : value ? (
          <p className="text-sm text-text leading-relaxed">{value}</p>
        ) : (
          <p className="text-sm text-muted italic">No global direction set yet.</p>
        )}
      </PanelBody>
    </Panel>
  );
}

type Ref = {
  id: string;
  song_title: string;
  artist: string | null;
  note: string | null;
  url: string | null;
  artwork_url: string | null;
  sort_order: number;
};

type RefsEditorProps = {
  releaseId: string;
  initialRefs: Ref[];
  initialStatus?: string;
};

export function GlobalReferencesEditor({ releaseId, initialRefs, initialStatus }: RefsEditorProps) {
  const [refs, setRefs] = useState<Ref[]>(initialRefs);
  const [showForm, setShowForm] = useState(false);
  const [refTitle, setRefTitle] = useState("");
  const [refArtist, setRefArtist] = useState("");
  const [refNote, setRefNote] = useState("");
  const [refUrl, setRefUrl] = useState("");
  const [refArtwork, setRefArtwork] = useState("");
  const [refPlatform, setRefPlatform] = useState<"apple" | "spotify" | "tidal" | "youtube">("apple");
  const [itunesResults, setItunesResults] = useState<ItunesResult[]>([]);
  const [showItunesResults, setShowItunesResults] = useState(false);
  const itunesDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const router = useRouter();

  function resetForm() {
    setRefTitle("");
    setRefArtist("");
    setRefNote("");
    setRefUrl("");
    setRefArtwork("");
    setShowForm(false);
    setShowItunesResults(false);
    setItunesResults([]);
  }

  function searchItunes(query: string) {
    if (itunesDebounceRef.current) clearTimeout(itunesDebounceRef.current);
    if (!query.trim()) {
      setItunesResults([]);
      setShowItunesResults(false);
      return;
    }
    itunesDebounceRef.current = setTimeout(async () => {
      const results = await searchItunesApi(query);
      setItunesResults(results);
      setShowItunesResults(results.length > 0);
    }, 400);
  }

  function selectItunesResult(result: ItunesResult) {
    setRefTitle(result.trackName);
    setRefArtist(result.artistName);
    setRefUrl(buildPlatformUrl(refPlatform, result.trackName, result.artistName, result.trackViewUrl));
    setRefArtwork(result.artworkUrl100);
    setShowItunesResults(false);
  }

  async function handleAddRef() {
    if (!refTitle.trim()) return;
    const supabase = createSupabaseBrowserClient();
    const nextOrder =
      refs.length > 0
        ? Math.max(...refs.map((r) => r.sort_order ?? 0)) + 1
        : 0;
    const { data } = await supabase
      .from("mix_references")
      .insert({
        release_id: releaseId,
        track_id: null,
        song_title: refTitle.trim(),
        artist: refArtist || null,
        note: refNote || null,
        url: refUrl || null,
        artwork_url: refArtwork || null,
        sort_order: nextOrder,
      })
      .select()
      .single();
    if (data) {
      setRefs([...refs, data as Ref]);
    }
    if (initialStatus) await autoPromoteRelease(releaseId, initialStatus);
    resetForm();
    router.refresh();
  }

  async function handleDeleteRef(refId: string) {
    const supabase = createSupabaseBrowserClient();
    const removed = refs.find((r) => r.id === refId);
    setRefs((prev) => prev.filter((r) => r.id !== refId));
    try {
      const { error } = await supabase.from("mix_references").delete().eq("id", refId);
      if (error) throw error;
      router.refresh();
    } catch {
      if (removed) setRefs((prev) => [...prev, removed]);
    }
  }

  return (
    <Panel>
      <PanelBody className="py-5">
        <div className="flex items-center justify-between mb-2">
          <div className="label-sm text-muted">GLOBAL REFERENCES</div>
          {!showForm && (
            <button
              type="button"
              onClick={() => setShowForm(true)}
              className="text-xs text-muted hover:text-text transition-colors"
            >
              + Add
            </button>
          )}
        </div>

        {showForm && (
          <div className="space-y-2 p-3 rounded-md border border-border bg-panel2 mb-3">
            <div className="flex gap-1">
              {(["apple", "spotify", "tidal", "youtube"] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setRefPlatform(p)}
                  className={`flex-1 px-1.5 py-1 text-[10px] font-medium rounded transition-colors ${
                    refPlatform === p
                      ? "bg-panel text-text border border-border-strong shadow-sm"
                      : "text-faint hover:text-muted"
                  }`}
                >
                  {p === "apple" ? "Apple" : p === "spotify" ? "Spotify" : p === "tidal" ? "Tidal" : "YouTube"}
                </button>
              ))}
            </div>
            <div className="relative">
              <input
                value={refTitle}
                onChange={(e) => {
                  setRefTitle(e.target.value);
                  searchItunes(e.target.value);
                }}
                onFocus={() => { if (itunesResults.length > 0) setShowItunesResults(true); }}
                placeholder="Search for a song..."
                className="input text-xs h-8 py-1"
                autoFocus
              />
              {showItunesResults && itunesResults.length > 0 && (
                <div className="absolute z-30 left-0 right-0 mt-1 rounded-md border border-border bg-panel shadow-lg overflow-hidden">
                  {itunesResults.map((r, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => selectItunesResult(r)}
                      className="w-full flex items-center gap-2.5 px-2.5 py-2 hover:bg-panel2 transition-colors text-left"
                    >
                      {r.artworkUrl100 && (
                        <img
                          src={r.artworkUrl100}
                          alt=""
                          className="w-8 h-8 rounded-[3px] shrink-0"
                        />
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-medium text-text truncate">{r.trackName}</div>
                        <div className="text-[10px] text-muted truncate">{r.artistName}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            {refArtwork && (
              <div className="flex items-center gap-2">
                <img src={refArtwork} alt="" className="w-10 h-10 rounded-[3px]" />
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-medium text-text truncate">{refTitle}</div>
                  <div className="text-[10px] text-muted truncate">{refArtist}</div>
                </div>
              </div>
            )}
            {!refArtwork && (
              <input
                value={refArtist}
                onChange={(e) => setRefArtist(e.target.value)}
                placeholder="Artist"
                className="input text-xs h-8 py-1"
              />
            )}
            <input
              value={refNote}
              onChange={(e) => setRefNote(e.target.value)}
              placeholder="What to reference about this song"
              className="input text-xs h-8 py-1"
            />
            <input
              value={refUrl}
              onChange={(e) => setRefUrl(e.target.value)}
              placeholder="Link (Spotify, Apple Music, YouTube...)"
              className="input text-xs h-8 py-1"
            />
            <div className="flex gap-2">
              <Button
                variant="primary"
                onClick={handleAddRef}
                disabled={!refTitle.trim()}
                className="h-7 text-xs px-3"
              >
                Add
              </Button>
              <Button
                variant="ghost"
                onClick={resetForm}
                className="h-7 text-xs px-3"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {refs.length > 0 ? (
          <div className="space-y-2">
            {refs.map((ref) => (
              <ReferenceCard
                key={ref.id}
                songTitle={ref.song_title}
                artist={ref.artist}
                note={ref.note}
                url={ref.url}
                artworkUrl={ref.artwork_url}
                onDelete={() => handleDeleteRef(ref.id)}
              />
            ))}
          </div>
        ) : !showForm ? (
          <p className="text-sm text-muted italic">No references added yet.</p>
        ) : null}
      </PanelBody>
    </Panel>
  );
}

type CoverArtEditorProps = {
  releaseId: string;
  initialUrl: string | null;
};

export function CoverArtEditor({ releaseId, initialUrl }: CoverArtEditorProps) {
  const [editing, setEditing] = useState(false);
  const [url, setUrl] = useState(initialUrl ?? "");
  const [urlInput, setUrlInput] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleUpload(file: File) {
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      setError("Image must be under 5MB");
      return;
    }
    const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif"];
    if (!ALLOWED_TYPES.includes(file.type)) {
      setError("Invalid image type. Use PNG, JPG, WebP, or GIF.");
      return;
    }
    setUploading(true);
    setError("");
    const supabase = createSupabaseBrowserClient();
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const ext = file.type.split("/")[1] === "jpeg" ? "jpg" : file.type.split("/")[1];
      const path = `${user.id}/${releaseId}.${ext}`;
      const { error: uploadErr } = await supabase.storage
        .from("cover-art")
        .upload(path, file, { upsert: true });
      if (uploadErr) throw uploadErr;
      const { data: urlData } = supabase.storage
        .from("cover-art")
        .getPublicUrl(path);
      const newUrl = urlData.publicUrl + `?t=${Date.now()}`;
      setUrl(newUrl);
      await supabase.from("releases").update({ cover_art_url: newUrl }).eq("id", releaseId);
      setEditing(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function handleUrlSave() {
    if (!urlInput.trim()) return;
    setError("");
    const supabase = createSupabaseBrowserClient();
    try {
      await supabase.from("releases").update({ cover_art_url: urlInput.trim() }).eq("id", releaseId);
      setUrl(urlInput.trim());
      setUrlInput("");
      setEditing(false);
      router.refresh();
    } catch {
      setError("Failed to save URL");
    }
  }

  async function handleRemove() {
    setError("");
    const supabase = createSupabaseBrowserClient();
    try {
      await supabase.from("releases").update({ cover_art_url: null }).eq("id", releaseId);
      setUrl("");
      setEditing(false);
      router.refresh();
    } catch {
      setError("Failed to remove cover art");
    }
  }

  if (editing) {
    return (
      <div className="rounded-lg border border-border overflow-hidden">
        {/* Preview */}
        <div
          className="w-full aspect-square flex items-center justify-center"
          style={{ background: "var(--panel2)" }}
        >
          {url ? (
            <img src={url} alt="Cover art" className="w-full h-full object-cover" />
          ) : (
            <ImageIcon size={48} className="text-muted opacity-30" />
          )}
        </div>

        {/* Controls */}
        <div className="p-3 space-y-2" style={{ background: "var(--panel)" }}>
          {error && (
            <p className="text-xs text-red-500">{error}</p>
          )}

          <div className="flex items-center gap-2">
            <label
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md cursor-pointer transition-colors"
              style={{ background: "var(--panel2)", color: "var(--text-muted)" }}
            >
              <Upload size={14} />
              {uploading ? "Uploading\u2026" : "Upload"}
              <input
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp,image/gif"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleUpload(f);
                }}
                disabled={uploading}
              />
            </label>
            {url && (
              <button
                type="button"
                onClick={handleRemove}
                className="inline-flex items-center gap-1 text-xs text-red-500 hover:text-red-400 transition-colors"
              >
                <X size={12} /> Remove
              </button>
            )}
          </div>

          <div className="space-y-1">
            <span className="text-[10px] text-muted uppercase tracking-wider">or paste URL</span>
            <div className="flex gap-1.5">
              <input
                type="url"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                className="input text-xs flex-1"
                placeholder="https://..."
              />
              <button
                type="button"
                onClick={handleUrlSave}
                disabled={!urlInput.trim()}
                className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-md transition-colors disabled:opacity-40"
                style={{ background: "var(--signal)", color: "#fff" }}
              >
                <Check size={12} />
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setUrlInput("");
              setError("");
              setEditing(false);
            }}
            className="inline-flex items-center gap-1 text-xs text-muted hover:text-text transition-colors"
          >
            <X size={12} /> Cancel
          </button>
        </div>
      </div>
    );
  }

  // Display mode
  return (
    <button
      type="button"
      onClick={() => setEditing(true)}
      className="group relative w-full rounded-lg overflow-hidden border border-border block cursor-pointer"
    >
      {url ? (
        <img src={url} alt="Cover art" className="w-full aspect-square object-cover block" />
      ) : (
        <div
          className="w-full aspect-square flex flex-col items-center justify-center gap-2"
          style={{ background: "var(--panel2)" }}
        >
          <ImageIcon size={40} className="text-muted opacity-30" />
          <span className="text-xs text-muted">Add cover art</span>
        </div>
      )}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
        <Pencil size={20} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    </button>
  );
}
