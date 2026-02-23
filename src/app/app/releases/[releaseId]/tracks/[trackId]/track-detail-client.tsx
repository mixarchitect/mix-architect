"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabaseBrowserClient";
import { Panel, PanelBody } from "@/components/ui/panel";
import { Button } from "@/components/ui/button";
import { Rule } from "@/components/ui/rule";
import { Pill } from "@/components/ui/pill";
import { TabBar } from "@/components/ui/tab-bar";
import { TagInput } from "@/components/ui/tag-input";
import { ElementRow } from "@/components/ui/element-row";
import { NoteEntry } from "@/components/ui/note-entry";
import { ReferenceCard } from "@/components/ui/reference-card";
import { AutoSaveIndicator } from "@/components/ui/auto-save-indicator";
import { StatusIndicator } from "@/components/ui/status-dot";
import { ArrowLeft, Check, Plus } from "lucide-react";

const TABS = [
  { id: "intent", label: "Intent" },
  { id: "specs", label: "Specs" },
  { id: "elements", label: "Elements" },
  { id: "notes", label: "Notes" },
];

const EMOTIONAL_SUGGESTIONS = [
  "aggressive", "intimate", "spacious", "gritty", "polished", "warm",
  "dark", "bright", "raw", "lush", "punchy", "dreamy", "lo-fi",
  "cinematic", "minimal", "dense", "ethereal", "hypnotic", "nostalgic",
  "euphoric", "melancholic", "organic", "synthetic", "chaotic", "smooth",
  "haunting", "playful", "anthemic", "delicate", "heavy", "airy",
];

const ELEMENT_CATEGORIES: { label: string; items: string[] }[] = [
  { label: "Drums & Percussion", items: ["Kick", "Snare", "Hi-Hats", "Toms", "Overheads/Rooms", "Percussion", "Drum Bus", "Programmed Drums"] },
  { label: "Bass", items: ["Bass Guitar", "Synth Bass", "Sub Bass", "Upright Bass"] },
  { label: "Guitars", items: ["Electric Guitar", "Acoustic Guitar", "Clean Guitar", "Distorted Guitar", "Guitar Bus"] },
  { label: "Keys & Synths", items: ["Piano", "Rhodes/EP", "Organ", "Synth Pad", "Synth Lead", "Strings", "Brass/Horns", "Woodwinds"] },
  { label: "Vocals", items: ["Lead Vocal", "BGVs", "Vocal Doubles", "Vocal Ad-libs", "Vocal Chops", "Rap/Spoken Word"] },
  { label: "Production", items: ["FX/Ear Candy", "Samples/Loops", "808s", "Risers/Impacts", "Ambience/Atmos", "Foley", "Noise/Texture"] },
];

const DEFAULT_ELEMENTS = [
  "Kick", "Snare", "Bass Guitar", "Electric Guitar", "Piano",
  "Lead Vocal", "BGVs", "FX/Ear Candy",
];

type TrackData = {
  id: string;
  title: string;
  status: string;
  track_number: number;
};
type IntentData = {
  mix_vision?: string;
  emotional_tags?: string[];
  anti_references?: string;
} | null;
type SpecsData = {
  target_loudness?: string;
  format_override?: string | null;
  sample_rate?: string;
  bit_depth?: string;
  delivery_formats?: string[];
  special_reqs?: string;
} | null;
type ElementData = {
  id: string;
  name: string;
  notes: string | null;
  flagged: boolean;
  sort_order: number;
  created_at?: string;
  updated_at?: string;
};
type NoteData = {
  id: string;
  content: string;
  author: string;
  created_at: string;
};
type RefData = {
  id: string;
  song_title: string;
  artist?: string | null;
  note?: string | null;
  url?: string | null;
  artwork_url?: string | null;
};

type Props = {
  releaseId: string;
  releaseTitle: string;
  releaseFormat: string;
  track: TrackData;
  intent: IntentData;
  specs: SpecsData;
  elements: ElementData[];
  notes: NoteData[];
  references: RefData[];
};

export function TrackDetailClient({
  releaseId, releaseTitle, releaseFormat,
  track, intent, specs, elements, notes, references,
}: Props) {
  const [activeTab, setActiveTab] = useState("intent");
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  const [mixVision, setMixVision] = useState(intent?.mix_vision ?? "");
  const [editingVision, setEditingVision] = useState(!intent?.mix_vision);
  const [emotionalTags, setEmotionalTags] = useState<string[]>(intent?.emotional_tags ?? []);
  const [antiRefs, setAntiRefs] = useState(intent?.anti_references ?? "");

  const [loudness, setLoudness] = useState(specs?.target_loudness ?? "-14 LUFS");
  const [formatOverride, setFormatOverride] = useState(specs?.format_override ?? "");
  const [sampleRate, setSampleRate] = useState(specs?.sample_rate ?? "48kHz");
  const [bitDepth, setBitDepth] = useState(specs?.bit_depth ?? "24-bit");
  const [deliveryFormats, setDeliveryFormats] = useState<string[]>(specs?.delivery_formats ?? []);
  const [specialReqs, setSpecialReqs] = useState(specs?.special_reqs ?? "");

  const [localElements, setLocalElements] = useState(elements);
  const [localNotes, setLocalNotes] = useState(notes);
  const [newNote, setNewNote] = useState("");
  const [localRefs, setLocalRefs] = useState(references);
  const [showRefForm, setShowRefForm] = useState(false);
  const [refTitle, setRefTitle] = useState("");
  const [refArtist, setRefArtist] = useState("");
  const [refNote, setRefNote] = useState("");
  const [refUrl, setRefUrl] = useState("");
  const [refArtwork, setRefArtwork] = useState("");
  const [refPlatform, setRefPlatform] = useState<"apple" | "spotify" | "tidal" | "youtube">("apple");
  const [itunesResults, setItunesResults] = useState<{ trackName: string; artistName: string; artworkUrl100: string; trackViewUrl: string }[]>([]);
  const [showItunesResults, setShowItunesResults] = useState(false);
  const itunesDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [trackStatus, setTrackStatus] = useState(track.status);

  const supabase = createSupabaseBrowserClient();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const autoSave = useCallback(
    (table: string, data: Record<string, unknown>, key: string, keyVal: string) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      setSaveStatus("saving");
      debounceRef.current = setTimeout(async () => {
        try {
          const { error } = await supabase.from(table).update(data).eq(key, keyVal);
          if (error) throw error;
          setSaveStatus("saved");
          setTimeout(() => setSaveStatus("idle"), 2000);
        } catch {
          setSaveStatus("error");
        }
      }, 500);
    },
    [supabase],
  );

  function saveIntent(data: Record<string, unknown>) {
    autoSave("track_intent", data, "track_id", track.id);
  }

  function saveSpecs(data: Record<string, unknown>) {
    autoSave("track_specs", data, "track_id", track.id);
  }

  async function toggleStatus() {
    const next = trackStatus === "complete" ? "in_progress" : "complete";
    setTrackStatus(next);
    await supabase.from("tracks").update({ status: next }).eq("id", track.id);
  }

  async function handleAddElement(name: string) {
    const nextOrder =
      localElements.length > 0
        ? Math.max(...localElements.map((e) => e.sort_order)) + 1
        : 0;
    const { data } = await supabase
      .from("track_elements")
      .insert({ track_id: track.id, name, sort_order: nextOrder })
      .select()
      .single();
    if (data)
      setLocalElements([
        ...localElements,
        { ...data, notes: data.notes ?? "", flagged: data.flagged ?? false },
      ]);
  }

  async function handleUpdateElement(elementId: string, d: Record<string, unknown>) {
    setLocalElements((prev) =>
      prev.map((e) => (e.id === elementId ? { ...e, ...d } : e)) as ElementData[],
    );
    await supabase.from("track_elements").update(d).eq("id", elementId);
  }

  async function handleDeleteElement(elementId: string) {
    setLocalElements((prev) => prev.filter((e) => e.id !== elementId));
    await supabase.from("track_elements").delete().eq("id", elementId);
  }

  async function handleAddDefaults() {
    const newNames = DEFAULT_ELEMENTS.filter(
      (name) => !localElements.find((e) => e.name === name),
    );
    let nextOrder =
      localElements.length > 0
        ? Math.max(...localElements.map((e) => e.sort_order)) + 1
        : 0;
    const added: ElementData[] = [];
    for (const name of newNames) {
      const { data } = await supabase
        .from("track_elements")
        .insert({ track_id: track.id, name, sort_order: nextOrder++ })
        .select()
        .single();
      if (data)
        added.push({ ...data, notes: data.notes ?? "", flagged: data.flagged ?? false });
    }
    setLocalElements((prev) => [...prev, ...added]);
  }

  async function handlePostNote() {
    if (!newNote.trim()) return;
    const { data } = await supabase
      .from("revision_notes")
      .insert({ track_id: track.id, content: newNote.trim(), author: "You" })
      .select()
      .single();
    if (data) {
      setLocalNotes([data, ...localNotes]);
      setNewNote("");
    }
  }

  function searchItunes(query: string) {
    if (itunesDebounceRef.current) clearTimeout(itunesDebounceRef.current);
    if (!query.trim()) {
      setItunesResults([]);
      setShowItunesResults(false);
      return;
    }
    itunesDebounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&media=music&entity=song&limit=5`,
        );
        const json = await res.json();
        setItunesResults(
          (json.results ?? []).map((r: Record<string, unknown>) => ({
            trackName: r.trackName as string,
            artistName: r.artistName as string,
            artworkUrl100: r.artworkUrl100 as string,
            trackViewUrl: r.trackViewUrl as string,
          })),
        );
        setShowItunesResults(true);
      } catch {
        setItunesResults([]);
      }
    }, 400);
  }

  function buildPlatformUrl(
    platform: "apple" | "spotify" | "tidal" | "youtube",
    trackName: string,
    artistName: string,
    appleUrl: string,
  ): string {
    const q = encodeURIComponent(`${trackName} ${artistName}`);
    switch (platform) {
      case "apple": return appleUrl;
      case "spotify": return `https://open.spotify.com/search/${q}`;
      case "tidal": return `https://tidal.com/search?q=${q}`;
      case "youtube": return `https://music.youtube.com/search?q=${q}`;
    }
  }

  function selectItunesResult(result: { trackName: string; artistName: string; artworkUrl100: string; trackViewUrl: string }) {
    setRefTitle(result.trackName);
    setRefArtist(result.artistName);
    setRefUrl(buildPlatformUrl(refPlatform, result.trackName, result.artistName, result.trackViewUrl));
    setRefArtwork(result.artworkUrl100);
    setShowItunesResults(false);
  }

  async function handleAddRef() {
    if (!refTitle.trim()) return;
    const nextOrder =
      localRefs.length > 0
        ? Math.max(...localRefs.map((r) => (r as Record<string, unknown>).sort_order as number ?? 0)) + 1
        : 0;
    const { data } = await supabase
      .from("mix_references")
      .insert({
        track_id: track.id,
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
      setLocalRefs([...localRefs, data]);
      setRefTitle("");
      setRefArtist("");
      setRefNote("");
      setRefUrl("");
      setRefArtwork("");
      setShowRefForm(false);
      setShowItunesResults(false);
    }
  }

  async function handleDeleteRef(refId: string) {
    setLocalRefs((prev) => prev.filter((r) => r.id !== refId));
    await supabase.from("mix_references").delete().eq("id", refId);
  }

  const sColor =
    trackStatus === "complete"
      ? ("green" as const)
      : trackStatus === "in_progress"
        ? ("orange" as const)
        : ("blue" as const);
  const sLabel =
    trackStatus === "complete"
      ? "Complete"
      : trackStatus === "in_progress"
        ? "In Progress"
        : "Not Started";

  return (
    <div>
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link
            href={`/app/releases/${releaseId}`}
            className="text-sm text-muted hover:text-text transition-colors flex items-center gap-1"
          >
            <ArrowLeft size={14} />
            {releaseTitle}
          </Link>
          <span className="text-faint">/</span>
          <h1 className="text-lg font-semibold text-text">
            <span className="font-mono text-muted mr-2">
              {String(track.track_number).padStart(2, "0")}
            </span>
            {track.title}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <AutoSaveIndicator status={saveStatus} />
          <Button
            variant={trackStatus === "complete" ? "primary" : "secondary"}
            onClick={toggleStatus}
            className="h-9 text-xs"
          >
            <Check size={14} />
            {trackStatus === "complete" ? "Marked Ready" : "Mark Ready"}
          </Button>
        </div>
      </div>

      <TabBar tabs={TABS} activeTab={activeTab} onTabChange={setActiveTab} className="mb-6" />

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
        {/* ── Tab content ── */}
        <div>
          {/* Intent */}
          {activeTab === "intent" && (
            <div className="space-y-6">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="label text-faint">
                    What should this track feel like?
                  </label>
                  {!editingVision && mixVision && (
                    <button
                      type="button"
                      onClick={() => setEditingVision(true)}
                      className="text-xs text-muted hover:text-text transition-colors"
                    >
                      Edit
                    </button>
                  )}
                </div>
                {editingVision ? (
                  <div className="space-y-2">
                    <textarea
                      value={mixVision}
                      onChange={(e) => setMixVision(e.target.value)}
                      placeholder="Describe the sonic direction — mood, energy, spatial qualities, any specifics about the mix."
                      className="input min-h-[160px] resize-y text-sm leading-relaxed"
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <Button
                        variant="primary"
                        className="h-8 text-xs px-4"
                        onClick={() => {
                          saveIntent({ mix_vision: mixVision });
                          setEditingVision(false);
                        }}
                      >
                        Save
                      </Button>
                      {intent?.mix_vision && (
                        <Button
                          variant="ghost"
                          className="h-8 text-xs px-3"
                          onClick={() => {
                            setMixVision(intent.mix_vision ?? "");
                            setEditingVision(false);
                          }}
                        >
                          Cancel
                        </Button>
                      )}
                    </div>
                  </div>
                ) : mixVision ? (
                  <div
                    className="p-4 rounded-md border border-border bg-panel text-sm text-text leading-relaxed whitespace-pre-wrap cursor-pointer hover:border-border-strong transition-colors"
                    onClick={() => setEditingVision(true)}
                  >
                    {mixVision}
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setEditingVision(true)}
                    className="w-full p-4 rounded-md border border-dashed border-border text-sm text-muted hover:border-border-strong hover:text-text transition-colors text-left"
                  >
                    Click to describe the sonic direction...
                  </button>
                )}
              </div>
              <div className="space-y-1.5">
                <label className="label text-faint">Emotional qualities</label>
                <TagInput
                  value={emotionalTags}
                  onChange={(tags) => {
                    setEmotionalTags(tags);
                    saveIntent({ emotional_tags: tags });
                  }}
                  suggestions={EMOTIONAL_SUGGESTIONS}
                  placeholder="Type or click suggestions below"
                />
              </div>
              <div className="space-y-1.5">
                <label className="label text-faint">Anti-references</label>
                <textarea
                  value={antiRefs}
                  onChange={(e) => {
                    setAntiRefs(e.target.value);
                    saveIntent({ anti_references: e.target.value });
                  }}
                  placeholder="What should this NOT sound like? Describe sounds, styles, or specific mixes to avoid."
                  className="input min-h-[80px] resize-y text-sm leading-relaxed"
                />
              </div>
            </div>
          )}

          {/* Specs */}
          {activeTab === "specs" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="label text-faint">Target loudness</label>
                  <select
                    value={loudness}
                    onChange={(e) => {
                      setLoudness(e.target.value);
                      saveSpecs({ target_loudness: e.target.value });
                    }}
                    className="input"
                  >
                    <option value="-14 LUFS">-14 LUFS — Spotify / YouTube</option>
                    <option value="-16 LUFS">-16 LUFS — Apple Music / Tidal</option>
                    <option value="-12 LUFS">-12 LUFS — Louder master</option>
                    <option value="-11 LUFS">-11 LUFS — Club / DJ</option>
                    <option value="-9 LUFS">-9 LUFS — Competitive / radio</option>
                    <option value="-23 LUFS">-23 LUFS — Broadcast (EBU R128)</option>
                    <option value="-24 LUFS">-24 LUFS — Broadcast (ATSC A/85)</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="label text-faint">Format</label>
                  <select
                    value={formatOverride || releaseFormat}
                    onChange={(e) => {
                      const val = e.target.value;
                      const isRelease = val === releaseFormat;
                      setFormatOverride(isRelease ? "" : val);
                      saveSpecs({ format_override: isRelease ? null : val });
                    }}
                    className="input"
                  >
                    <option value="stereo">Stereo</option>
                    <option value="atmos">Dolby Atmos</option>
                    <option value="both">Stereo + Atmos</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="label text-faint">Sample rate</label>
                  <select
                    value={sampleRate}
                    onChange={(e) => {
                      setSampleRate(e.target.value);
                      saveSpecs({ sample_rate: e.target.value });
                    }}
                    className="input"
                  >
                    <option value="44.1 kHz">44.1 kHz</option>
                    <option value="48 kHz">48 kHz</option>
                    <option value="88.2 kHz">88.2 kHz</option>
                    <option value="96 kHz">96 kHz</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="label text-faint">Bit depth</label>
                  <select
                    value={bitDepth}
                    onChange={(e) => {
                      setBitDepth(e.target.value);
                      saveSpecs({ bit_depth: e.target.value });
                    }}
                    className="input"
                  >
                    <option value="16-bit">16-bit</option>
                    <option value="24-bit">24-bit</option>
                    <option value="32-bit float">32-bit float</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="label text-faint">Delivery formats</label>
                <DeliveryFormatSelector
                  value={deliveryFormats}
                  onChange={(next) => {
                    setDeliveryFormats(next);
                    saveSpecs({ delivery_formats: next });
                  }}
                />
              </div>
              <div className="space-y-1.5">
                <label className="label text-faint">Special requirements</label>
                <textarea
                  value={specialReqs}
                  onChange={(e) => {
                    setSpecialReqs(e.target.value);
                    saveSpecs({ special_reqs: e.target.value });
                  }}
                  placeholder="e.g., Radio edit needed, TV sync version, vinyl master, stems for remix..."
                  className="input min-h-[100px] resize-y text-sm"
                />
              </div>
            </div>
          )}

          {/* Elements */}
          {activeTab === "elements" && (
            <div className="space-y-3">
              {localElements.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-sm text-muted mb-4">
                    No elements defined. Add your stems and instruments.
                  </p>
                  <Button variant="secondary" onClick={handleAddDefaults}>
                    Add default elements
                  </Button>
                </div>
              )}
              {localElements.map((el) => (
                <ElementRow
                  key={el.id}
                  name={el.name}
                  notes={el.notes ?? ""}
                  flagged={el.flagged}
                  createdAt={el.created_at}
                  updatedAt={el.updated_at}
                  onUpdate={(d) => handleUpdateElement(el.id, d)}
                  onDelete={() => handleDeleteElement(el.id)}
                />
              ))}
              <div className="pt-2">
                <QuickAddElement
                  onAdd={handleAddElement}
                  existingNames={localElements.map((e) => e.name)}
                />
              </div>
            </div>
          )}

          {/* Notes */}
          {activeTab === "notes" && (
            <div className="space-y-4">
              <div className="flex gap-3">
                <textarea
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Add a note..."
                  className="input flex-1 min-h-[80px] resize-y text-sm"
                />
                <Button
                  variant="primary"
                  onClick={handlePostNote}
                  disabled={!newNote.trim()}
                  className="self-end h-10"
                >
                  Post
                </Button>
              </div>
              {localNotes.length > 0 ? (
                <div>
                  {localNotes.map((note, idx) => (
                    <div key={note.id}>
                      <NoteEntry
                        author={note.author}
                        createdAt={note.created_at}
                        content={note.content}
                      />
                      {idx < localNotes.length - 1 && <Rule />}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted text-center py-8">
                  No notes yet. Start documenting decisions and feedback.
                </p>
              )}
            </div>
          )}
        </div>

        {/* ── Inspector sidebar ── */}
        <aside className="space-y-4">
          <Panel>
            <PanelBody className="py-4 space-y-3">
              <div className="label text-faint text-[10px] mb-1">QUICK VIEW</div>
              <div className="flex justify-between text-sm items-center">
                <span className="text-muted">Status</span>
                <StatusIndicator color={sColor} label={sLabel} />
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted">Loudness</span>
                <span className="font-mono text-xs text-text">{loudness}</span>
              </div>
              <div className="flex justify-between text-sm items-center">
                <span className="text-muted">Format</span>
                <Pill className="text-[10px]">{
                  (() => {
                    const f = formatOverride || releaseFormat;
                    if (f === "both") return "Stereo & Atmos";
                    if (f === "atmos") return "Dolby Atmos";
                    return "Stereo";
                  })()
                }</Pill>
              </div>
            </PanelBody>
          </Panel>

          <Panel>
            <PanelBody className="py-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="label text-faint text-[10px]">REFERENCES</div>
                <button
                  type="button"
                  onClick={() => setShowRefForm(!showRefForm)}
                  className="text-xs text-muted hover:text-text transition-colors"
                >
                  + Add
                </button>
              </div>
              {showRefForm && (
                <div className="space-y-2 p-3 rounded-md border border-border bg-panel2">
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
                      onClick={() => {
                        setShowRefForm(false);
                        setShowItunesResults(false);
                        setRefTitle("");
                        setRefArtist("");
                        setRefNote("");
                        setRefUrl("");
                        setRefArtwork("");
                      }}
                      className="h-7 text-xs px-3"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
              {localRefs.length > 0 ? (
                <div className="space-y-2">
                  {localRefs.map((ref) => (
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
              ) : (
                <p className="text-xs text-muted italic">No references added yet.</p>
              )}
            </PanelBody>
          </Panel>

        </aside>
      </div>
    </div>
  );
}

/* ── Delivery format selector sub-component ── */

const DELIVERY_FORMATS = [
  "WAV", "AIFF", "FLAC", "MP3", "AAC", "OGG",
  "DDP", "ADM BWF (Atmos)", "MQA", "ALAC",
];

function DeliveryFormatSelector({
  value,
  onChange,
}: {
  value: string[];
  onChange: (next: string[]) => void;
}) {
  const [custom, setCustom] = useState("");
  const allFormats = [...new Set([...DELIVERY_FORMATS, ...value.filter((v) => !DELIVERY_FORMATS.includes(v))])];

  function toggle(fmt: string) {
    const next = value.includes(fmt)
      ? value.filter((f) => f !== fmt)
      : [...value, fmt];
    onChange(next);
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {allFormats.map((fmt) => (
          <button
            key={fmt}
            type="button"
            onClick={() => toggle(fmt)}
            className={`inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${
              value.includes(fmt)
                ? "bg-signal/10 border-signal text-signal"
                : "border-border text-muted hover:text-text hover:border-border-strong"
            }`}
          >
            {value.includes(fmt) && <Check size={12} />}
            {fmt}
          </button>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={custom}
          onChange={(e) => setCustom(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && custom.trim()) {
              toggle(custom.trim().toUpperCase());
              setCustom("");
            }
          }}
          placeholder="Custom format..."
          className="input text-sm h-9 flex-1"
        />
        <Button
          variant="ghost"
          onClick={() => {
            if (custom.trim()) {
              toggle(custom.trim().toUpperCase());
              setCustom("");
            }
          }}
          disabled={!custom.trim()}
          className="h-9 text-xs"
        >
          <Plus size={14} />
          Add
        </Button>
      </div>
    </div>
  );
}

/* ── Quick-add element sub-component ── */

function QuickAddElement({
  onAdd,
  existingNames,
}: {
  onAdd: (name: string) => void;
  existingNames: string[];
}) {
  const [custom, setCustom] = useState("");
  const [expanded, setExpanded] = useState(false);

  const quickSuggestions = DEFAULT_ELEMENTS.filter(
    (name) => !existingNames.includes(name),
  );

  return (
    <div className="space-y-3">
      {quickSuggestions.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {quickSuggestions.map((name) => (
            <button
              key={name}
              type="button"
              onClick={() => onAdd(name)}
              className="chip text-xs"
            >
              + {name}
            </button>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="text-xs text-muted hover:text-text transition-colors"
      >
        {expanded ? "Hide all instruments" : "Browse all instruments..."}
      </button>

      {expanded && (
        <div className="space-y-3 p-3 rounded-md border border-border bg-panel2">
          {ELEMENT_CATEGORIES.map((cat) => {
            const available = cat.items.filter((name) => !existingNames.includes(name));
            if (available.length === 0) return null;
            return (
              <div key={cat.label}>
                <div className="text-[10px] font-semibold text-faint uppercase tracking-wider mb-1.5">
                  {cat.label}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {available.map((name) => (
                    <button
                      key={name}
                      type="button"
                      onClick={() => onAdd(name)}
                      className="chip text-xs"
                    >
                      + {name}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="flex gap-2">
        <input
          type="text"
          value={custom}
          onChange={(e) => setCustom(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && custom.trim()) {
              onAdd(custom.trim());
              setCustom("");
            }
          }}
          placeholder="Custom element name..."
          className="input text-sm h-9 flex-1"
        />
        <Button
          variant="ghost"
          onClick={() => {
            if (custom.trim()) {
              onAdd(custom.trim());
              setCustom("");
            }
          }}
          disabled={!custom.trim()}
          className="h-9 text-xs"
        >
          <Plus size={14} />
          Add
        </Button>
      </div>
    </div>
  );
}
