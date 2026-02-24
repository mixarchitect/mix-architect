"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabaseBrowserClient";
import { searchItunesApi, buildPlatformUrl, type ItunesResult } from "@/lib/itunes-search";
import { Panel, PanelBody } from "@/components/ui/panel";
import { Button } from "@/components/ui/button";
import { ReferenceCard } from "@/components/ui/reference-card";
import { Pencil, Check, X } from "lucide-react";

type DirectionEditorProps = {
  releaseId: string;
  initialValue: string | null;
};

export function GlobalDirectionEditor({ releaseId, initialValue }: DirectionEditorProps) {
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
          <div className="label-sm text-faint">GLOBAL MIX DIRECTION</div>
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
};

export function GlobalReferencesEditor({ releaseId, initialRefs }: RefsEditorProps) {
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
          <div className="label-sm text-faint">GLOBAL REFERENCES</div>
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
