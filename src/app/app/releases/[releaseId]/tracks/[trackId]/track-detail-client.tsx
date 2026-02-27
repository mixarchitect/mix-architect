"use client";

import { useState, useRef, useCallback, useMemo, useEffect } from "react";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabaseBrowserClient";
import { searchItunesApi, buildPlatformUrl } from "@/lib/itunes-search";
import { cn } from "@/lib/cn";
import { Panel, PanelBody } from "@/components/ui/panel";
import { Button } from "@/components/ui/button";
import { Rule } from "@/components/ui/rule";
import { Pill } from "@/components/ui/pill";
import { TabBar } from "@/components/ui/tab-bar";
import { TagInput } from "@/components/ui/tag-input";
import { NoteEntry } from "@/components/ui/note-entry";
import { ReferenceCard } from "@/components/ui/reference-card";
import { AutoSaveIndicator } from "@/components/ui/auto-save-indicator";
import { StatusIndicator } from "@/components/ui/status-dot";
import { AudioPlayer, type AudioVersionData, type TimelineComment } from "@/components/ui/audio-player";
import { ArrowLeft, Bookmark, Check, Plus, X } from "lucide-react";
import { canEdit, canEditCreative, type ReleaseRole } from "@/lib/permissions";
import { useSavedContacts, type SavedContact } from "@/hooks/use-saved-contacts";

const TABS = [
  { id: "intent", label: "Intent" },
  { id: "specs", label: "Specs" },
  { id: "audio", label: "Audio" },
  { id: "distribution", label: "Distribution" },
  { id: "notes", label: "Notes" },
];

const EMOTIONAL_SUGGESTIONS = [
  "aggressive", "intimate", "spacious", "gritty", "polished", "warm",
  "dark", "bright", "raw", "lush", "punchy", "dreamy", "lo-fi",
  "cinematic", "minimal", "dense", "ethereal", "hypnotic", "nostalgic",
  "euphoric", "melancholic", "organic", "synthetic", "chaotic", "smooth",
  "haunting", "playful", "anthemic", "delicate", "heavy", "airy",
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
type NoteData = {
  id: string;
  content: string;
  author: string;
  created_at: string;
  timecode_seconds?: number | null;
  audio_version_id?: string | null;
};
type RefData = {
  id: string;
  song_title: string;
  artist?: string | null;
  note?: string | null;
  url?: string | null;
  artwork_url?: string | null;
};

type DistributionData = {
  isrc?: string;
  iswc?: string;
  explicit_lyrics?: boolean;
  featured_artist?: string;
  instrumental?: boolean;
  cover_song?: boolean;
  language?: string;
  copyright_number?: string;
  copyright_filing_date?: string;
  producer?: string;
  composers?: string;
  lyrics?: string;
} | null;
type SplitData = {
  id: string;
  split_type: string;
  person_name: string;
  percentage: number;
  sort_order: number;
  pro_org?: string;
  member_account?: string;
  ipi?: string;
  sound_exchange_id?: string;
  label_name?: string;
};

type Props = {
  releaseId: string;
  releaseTitle: string;
  artistName?: string | null;
  releaseFormat: string;
  releaseCoverArt?: string | null;
  track: TrackData;
  intent: IntentData;
  specs: SpecsData;
  samplyUrl: string | null;
  audioVersions: AudioVersionData[];
  notes: NoteData[];
  references: RefData[];
  distribution: DistributionData;
  splits: SplitData[];
  role: ReleaseRole;
  currentUserName: string;
};

export function TrackDetailClient({
  releaseId, releaseTitle, artistName, releaseFormat, releaseCoverArt,
  track, intent, specs, samplyUrl, audioVersions, notes, references, distribution, splits, role,
  currentUserName,
}: Props) {
  const TAB_IDS = TABS.map((t) => t.id);
  const [activeTab, setActiveTab] = useState(() => {
    if (typeof window === "undefined") return "intent";
    const hash = window.location.hash.replace("#", "");
    return TAB_IDS.includes(hash) ? hash : "intent";
  });

  const handleTabChange = useCallback((tab: string) => {
    setActiveTab(tab);
    window.location.hash = tab;
  }, []);
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

  const [localAudioVersions, setLocalAudioVersions] = useState(audioVersions);
  const [localNotes, setLocalNotes] = useState(notes);
  // General notes only — exclude timeline comments (those with timecode + version)
  const generalNotes = useMemo(
    () => localNotes.filter((n) => n.timecode_seconds == null || n.audio_version_id == null),
    [localNotes],
  );
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

  // Distribution state
  const [isrc, setIsrc] = useState(distribution?.isrc ?? "");
  const [iswc, setIswc] = useState(distribution?.iswc ?? "");
  const [explicitLyrics, setExplicitLyrics] = useState(distribution?.explicit_lyrics ?? false);
  const [featuredArtist, setFeaturedArtist] = useState(distribution?.featured_artist ?? "");
  const [instrumental, setInstrumental] = useState(distribution?.instrumental ?? false);
  const [coverSong, setCoverSong] = useState(distribution?.cover_song ?? false);
  const [language, setLanguage] = useState(distribution?.language ?? "English");
  const [copyrightNumber, setCopyrightNumber] = useState(distribution?.copyright_number ?? "");
  const [copyrightFilingDate, setCopyrightFilingDate] = useState(distribution?.copyright_filing_date ?? "");
  const [producer, setProducer] = useState(distribution?.producer ?? "");
  const [composers, setComposers] = useState(distribution?.composers ?? "");
  const [lyrics, setLyrics] = useState(distribution?.lyrics ?? "");
  const [localSplits, setLocalSplits] = useState<SplitData[]>(splits);
  const composersManualRef = useRef(!!distribution?.composers);
  const splitDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [trackStatus, setTrackStatus] = useState(track.status);

  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const { contacts: savedContacts, saveContact: saveContactToBook } = useSavedContacts();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const trackStatusRef = useRef(trackStatus);
  trackStatusRef.current = trackStatus;

  const autoSave = useCallback(
    (table: string, data: Record<string, unknown>, key: string, keyVal: string) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      setSaveStatus("saving");
      debounceRef.current = setTimeout(async () => {
        try {
          // Use upsert for intent/specs tables to handle missing rows gracefully
          const useUpsert = table === "track_intent" || table === "track_specs" || table === "track_distribution";
          let error;
          if (useUpsert) {
            ({ error } = await supabase
              .from(table)
              .upsert({ [key]: keyVal, ...data }, { onConflict: key }));
          } else {
            ({ error } = await supabase.from(table).update(data).eq(key, keyVal));
          }
          if (error) throw error;
          // Auto-promote from "not_started" on first save
          if (trackStatusRef.current === "not_started") {
            setTrackStatus("in_progress");
            await supabase.from("tracks").update({ status: "in_progress" }).eq("id", track.id);
          }
          setSaveStatus("saved");
          setTimeout(() => setSaveStatus("idle"), 2000);
        } catch {
          setSaveStatus("error");
        }
      }, 500);
    },
    [supabase, track.id],
  );

  function saveIntent(data: Record<string, unknown>) {
    autoSave("track_intent", data, "track_id", track.id);
  }

  function saveSpecs(data: Record<string, unknown>) {
    autoSave("track_specs", data, "track_id", track.id);
  }

  function saveDistribution(data: Record<string, unknown>) {
    autoSave("track_distribution", data, "track_id", track.id);
  }

  async function handleAddSplit(splitType: string) {
    const typeSplits = localSplits.filter((s) => s.split_type === splitType);
    const nextOrder = typeSplits.length > 0
      ? Math.max(...typeSplits.map((s) => s.sort_order)) + 1
      : 0;
    const { data } = await supabase
      .from("track_splits")
      .insert({
        track_id: track.id,
        split_type: splitType,
        person_name: "",
        percentage: 0,
        sort_order: nextOrder,
      })
      .select()
      .single();
    if (data) {
      setLocalSplits((prev) => [...prev, data as SplitData]);
    }
  }

  function handleUpdateSplit(splitId: string, updates: Partial<SplitData>) {
    setLocalSplits((prev) =>
      prev.map((s) => (s.id === splitId ? { ...s, ...updates } : s))
    );
    if (splitDebounceRef.current) clearTimeout(splitDebounceRef.current);
    setSaveStatus("saving");
    splitDebounceRef.current = setTimeout(async () => {
      try {
        const { error } = await supabase
          .from("track_splits")
          .update(updates)
          .eq("id", splitId);
        if (error) throw error;
        setSaveStatus("saved");
        setTimeout(() => setSaveStatus("idle"), 2000);
      } catch {
        setSaveStatus("error");
      }
    }, 500);
  }

  async function handleDeleteSplit(splitId: string) {
    const removed = localSplits.find((s) => s.id === splitId);
    setLocalSplits((prev) => prev.filter((s) => s.id !== splitId));
    try {
      const { error } = await supabase
        .from("track_splits")
        .delete()
        .eq("id", splitId);
      if (error) throw error;
    } catch {
      if (removed) setLocalSplits((prev) => [...prev, removed]);
    }
  }

  // Auto-populate composers from writing splits (unless manually edited)
  function deriveComposersFromSplits(currentSplits: SplitData[]) {
    if (composersManualRef.current) return;
    const names = currentSplits
      .filter((s) => s.split_type === "writing" && s.person_name.trim())
      .map((s) => s.person_name.trim())
      .join(", ");
    setComposers(names);
    saveDistribution({ composers: names || null });
  }

  const TRACK_STATUSES = ["not_started", "in_progress", "complete"] as const;

  async function cycleStatus() {
    const idx = TRACK_STATUSES.indexOf(trackStatus as (typeof TRACK_STATUSES)[number]);
    const next = TRACK_STATUSES[(idx + 1) % TRACK_STATUSES.length];
    const prev = trackStatus;
    setTrackStatus(next);
    try {
      const { error } = await supabase.from("tracks").update({ status: next }).eq("id", track.id);
      if (error) throw error;
    } catch {
      setTrackStatus(prev);
    }
  }

  async function autoPromoteTrack() {
    if (trackStatus !== "not_started") return;
    setTrackStatus("in_progress");
    try {
      const { error } = await supabase.from("tracks").update({ status: "in_progress" }).eq("id", track.id);
      if (error) throw error;
    } catch {
      setTrackStatus("not_started");
    }
  }

  async function handlePostNote() {
    if (!newNote.trim()) return;
    const { data } = await supabase
      .from("revision_notes")
      .insert({ track_id: track.id, content: newNote.trim(), author: currentUserName })
      .select()
      .single();
    if (data) {
      setLocalNotes([data, ...localNotes]);
      setNewNote("");
      autoPromoteTrack();
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
      const results = await searchItunesApi(query);
      setItunesResults(results);
      setShowItunesResults(results.length > 0);
    }, 400);
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
      autoPromoteTrack();
    }
  }

  async function handleDeleteRef(refId: string) {
    const removed = localRefs.find((r) => r.id === refId);
    setLocalRefs((prev) => prev.filter((r) => r.id !== refId));
    try {
      const { error } = await supabase.from("mix_references").delete().eq("id", refId);
      if (error) throw error;
    } catch {
      if (removed) setLocalRefs((prev) => [...prev, removed]);
    }
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
      <div className="flex items-center justify-between flex-wrap gap-3 mb-8">
        <div className="flex items-center gap-3 min-w-0">
          {releaseCoverArt && (
            <img
              src={releaseCoverArt}
              alt=""
              className="w-8 h-8 rounded object-cover flex-shrink-0"
            />
          )}
          {artistName && (
            <>
              <Link
                href={`/app?artist=${encodeURIComponent(artistName)}`}
                className="text-sm text-muted hover:text-signal transition-colors shrink-0"
              >
                {artistName}
              </Link>
              <span className="text-faint">·</span>
            </>
          )}
          <Link
            href={`/app/releases/${releaseId}`}
            className="text-sm text-muted hover:text-text transition-colors flex items-center gap-1"
          >
            <ArrowLeft size={14} />
            {releaseTitle}
          </Link>
          <span className="text-faint">/</span>
          <h1 className="text-2xl font-semibold h2 text-text">
            <span className="font-mono text-muted mr-2">
              {String(track.track_number).padStart(2, "0")}
            </span>
            {track.title}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <AutoSaveIndicator status={saveStatus} />
          {canEdit(role) ? (
            <Button
              variant={trackStatus === "complete" ? "primary" : "secondary"}
              onClick={cycleStatus}
              className="h-9 text-xs"
            >
              <Check size={14} />
              {trackStatus === "complete" ? "Marked Ready" : "Mark Ready"}
            </Button>
          ) : (
            <StatusIndicator color={sColor} label={sLabel} />
          )}
        </div>
      </div>

      <TabBar tabs={TABS} activeTab={activeTab} onTabChange={handleTabChange} className="mb-8" />

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">
        {/* ── Tab content ── */}
        <div>
          {/* Intent */}
          {activeTab === "intent" && (
            <div className="space-y-4">
              <Panel>
                <PanelBody className="py-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="label-sm text-muted">What should this track feel like?</div>
                    {canEditCreative(role) && !editingVision && mixVision && (
                      <button
                        type="button"
                        onClick={() => setEditingVision(true)}
                        className="text-xs text-muted hover:text-text transition-colors"
                      >
                        Edit
                      </button>
                    )}
                  </div>
                  {canEditCreative(role) && editingVision ? (
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
                      className={`p-4 rounded-md border border-border bg-panel text-sm text-text leading-relaxed whitespace-pre-wrap${canEditCreative(role) ? " cursor-pointer hover:border-border-strong" : ""} transition-colors`}
                      onClick={canEditCreative(role) ? () => setEditingVision(true) : undefined}
                    >
                      {mixVision}
                    </div>
                  ) : canEditCreative(role) ? (
                    <button
                      type="button"
                      onClick={() => setEditingVision(true)}
                      className="w-full p-4 rounded-md border border-dashed border-border text-sm text-muted hover:border-border-strong hover:text-text transition-colors text-left"
                    >
                      Click to describe the sonic direction...
                    </button>
                  ) : (
                    <p className="text-sm text-muted italic">No sonic direction set.</p>
                  )}
                </PanelBody>
              </Panel>
              <Panel>
                <PanelBody className="py-5">
                  <div className="label-sm text-muted mb-3">Emotional qualities</div>
                  <TagInput
                    value={emotionalTags}
                    onChange={canEditCreative(role) ? (tags) => {
                      setEmotionalTags(tags);
                      saveIntent({ emotional_tags: tags });
                    } : undefined}
                    suggestions={EMOTIONAL_SUGGESTIONS}
                    placeholder={canEditCreative(role) ? "Type or click suggestions below" : ""}
                    disabled={!canEditCreative(role)}
                  />
                </PanelBody>
              </Panel>
              <Panel>
                <PanelBody className="py-5">
                  <div className="label-sm text-muted mb-3">Anti-references</div>
                  <textarea
                    value={antiRefs}
                    onChange={canEditCreative(role) ? (e) => {
                      setAntiRefs(e.target.value);
                      saveIntent({ anti_references: e.target.value });
                    } : undefined}
                    readOnly={!canEditCreative(role)}
                    placeholder={canEditCreative(role) ? "What should this NOT sound like? Describe sounds, styles, or specific mixes to avoid." : ""}
                    className="input min-h-[80px] resize-y text-sm leading-relaxed"
                  />
                </PanelBody>
              </Panel>
            </div>
          )}

          {/* Specs */}
          {activeTab === "specs" && (
            <div className="space-y-4">
              <Panel>
                <PanelBody className="py-5">
                  <div className="label-sm text-muted mb-4">Technical settings</div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                      <label className="label text-muted">Format</label>
                      <select
                        value={formatOverride || releaseFormat}
                        onChange={(e) => {
                          const val = e.target.value;
                          const isRelease = val === releaseFormat;
                          setFormatOverride(isRelease ? "" : val);
                          saveSpecs({ format_override: isRelease ? null : val });
                        }}
                        disabled={!canEdit(role)}
                        className="input"
                      >
                        <option value="stereo">Stereo</option>
                        <option value="atmos">Dolby Atmos</option>
                        <option value="both">Stereo + Atmos</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="label text-muted">Sample rate</label>
                      <select
                        value={sampleRate}
                        onChange={(e) => {
                          setSampleRate(e.target.value);
                          saveSpecs({ sample_rate: e.target.value });
                        }}
                        disabled={!canEdit(role)}
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
                      <label className="label text-muted">Bit depth</label>
                      <select
                        value={bitDepth}
                        onChange={(e) => {
                          setBitDepth(e.target.value);
                          saveSpecs({ bit_depth: e.target.value });
                        }}
                        disabled={!canEdit(role)}
                        className="input"
                      >
                        <option value="16-bit">16-bit</option>
                        <option value="24-bit">24-bit</option>
                        <option value="32-bit float">32-bit float</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>
                </PanelBody>
              </Panel>
              <Panel>
                <PanelBody className="py-5">
                  <div className="label-sm text-muted mb-4">Delivery</div>
                  <div className="space-y-5">
                    <div className="space-y-1.5">
                      <label className="label text-muted">Delivery formats</label>
                      <DeliveryFormatSelector
                        value={deliveryFormats}
                        onChange={(next) => {
                          setDeliveryFormats(next);
                          saveSpecs({ delivery_formats: next });
                        }}
                        disabled={!canEdit(role)}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="label text-muted">Special requirements</label>
                      <textarea
                        value={specialReqs}
                        onChange={canEdit(role) ? (e) => {
                          setSpecialReqs(e.target.value);
                          saveSpecs({ special_reqs: e.target.value });
                        } : undefined}
                        readOnly={!canEdit(role)}
                        placeholder={canEdit(role) ? "e.g., Radio edit needed, TV sync version, vinyl master, stems for remix..." : ""}
                        className="input min-h-[100px] resize-y text-sm"
                      />
                    </div>
                  </div>
                </PanelBody>
              </Panel>
            </div>
          )}

          {/* Player */}
          {activeTab === "audio" && (
            <AudioPlayer
              releaseId={releaseId}
              trackId={track.id}
              versions={localAudioVersions}
              comments={localNotes.filter(
                (n): n is TimelineComment =>
                  n.timecode_seconds != null && n.audio_version_id != null,
              )}
              canUpload={canEditCreative(role)}
              canComment={canEditCreative(role)}
              canDelete={canEdit(role)}
              coverArtUrl={releaseCoverArt ?? null}
              trackTitle={track.title}
              releaseTitle={releaseTitle}
              currentUserName={currentUserName}
              targetLoudness={loudness}
              onVersionsChange={setLocalAudioVersions}
              onCommentsChange={(updated) => {
                setLocalNotes((prev) => {
                  const nonTimecoded = prev.filter(
                    (n) => n.timecode_seconds == null,
                  );
                  return [...updated, ...nonTimecoded];
                });
              }}
            />
          )}

          {/* Notes */}
          {activeTab === "notes" && (
            <div className="space-y-4">
              {canEditCreative(role) && (
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
              )}
              {generalNotes.length > 0 ? (
                <div>
                  {generalNotes.map((note, idx) => (
                    <div key={note.id}>
                      <NoteEntry
                        author={note.author}
                        createdAt={note.created_at}
                        content={note.content}
                      />
                      {idx < generalNotes.length - 1 && <Rule />}
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
          {/* Distribution */}
          {activeTab === "distribution" && (
            <div className="space-y-4">
              <SplitEditor
                label="Writing Split"
                splitType="writing"
                splits={localSplits.filter((s) => s.split_type === "writing")}
                onAdd={() => handleAddSplit("writing")}
                onUpdate={(id, updates) => {
                  handleUpdateSplit(id, updates);
                  if ("person_name" in updates) {
                    const next = localSplits.map((s) => (s.id === id ? { ...s, ...updates } : s));
                    deriveComposersFromSplits(next);
                  }
                }}
                onDelete={(id) => {
                  handleDeleteSplit(id);
                  const next = localSplits.filter((s) => s.id !== id);
                  deriveComposersFromSplits(next);
                }}
                readOnly={!canEdit(role)}
                contacts={savedContacts}
                onSaveContact={saveContactToBook}
              />
              <SplitEditor
                label="Publishing Split"
                splitType="publishing"
                splits={localSplits.filter((s) => s.split_type === "publishing")}
                onAdd={() => handleAddSplit("publishing")}
                onUpdate={handleUpdateSplit}
                onDelete={handleDeleteSplit}
                readOnly={!canEdit(role)}
                contacts={savedContacts}
                onSaveContact={saveContactToBook}
              />
              <SplitEditor
                label="Master Recording Split"
                splitType="master"
                splits={localSplits.filter((s) => s.split_type === "master")}
                onAdd={() => handleAddSplit("master")}
                onUpdate={handleUpdateSplit}
                onDelete={handleDeleteSplit}
                readOnly={!canEdit(role)}
                contacts={savedContacts}
                onSaveContact={saveContactToBook}
              />

              <Panel>
                <PanelBody className="py-5 space-y-5">
                  <div className="label-sm text-muted">CODES &amp; IDENTIFIERS</div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                      <label className="label text-muted">ISRC</label>
                      <input
                        type="text"
                        value={isrc}
                        onChange={(e) => { setIsrc(e.target.value); saveDistribution({ isrc: e.target.value || null }); }}
                        disabled={!canEdit(role)}
                        className="input"
                        placeholder="e.g., USRC17607839"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="label text-muted">ISWC</label>
                      <input
                        type="text"
                        value={iswc}
                        onChange={(e) => { setIswc(e.target.value); saveDistribution({ iswc: e.target.value || null }); }}
                        disabled={!canEdit(role)}
                        className="input"
                        placeholder="e.g., T-345246800-1"
                      />
                    </div>
                  </div>
                </PanelBody>
              </Panel>

              <Panel>
                <PanelBody className="py-5 space-y-5">
                  <div className="label-sm text-muted">CREDITS</div>
                  <div className="space-y-1.5">
                    <label className="label text-muted">Producer</label>
                    <input
                      type="text"
                      value={producer}
                      onChange={(e) => { setProducer(e.target.value); saveDistribution({ producer: e.target.value || null }); }}
                      disabled={!canEdit(role)}
                      className="input"
                      placeholder="Producer name"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <label className="label text-muted">Composer / Songwriter</label>
                      {!composersManualRef.current && (
                        <span className="text-[10px] text-faint">Auto-populated from writing splits</span>
                      )}
                    </div>
                    <input
                      type="text"
                      value={composers}
                      onChange={(e) => {
                        composersManualRef.current = true;
                        setComposers(e.target.value);
                        saveDistribution({ composers: e.target.value || null });
                      }}
                      disabled={!canEdit(role)}
                      className="input"
                      placeholder="e.g., John Doe, Jane Smith"
                    />
                  </div>
                </PanelBody>
              </Panel>

              <Panel>
                <PanelBody className="py-5 space-y-5">
                  <div className="label-sm text-muted">TRACK PROPERTIES</div>
                  <div className="space-y-1.5">
                    <label className="label text-muted">Featured artist</label>
                    <input
                      type="text"
                      value={featuredArtist}
                      onChange={(e) => { setFeaturedArtist(e.target.value); saveDistribution({ featured_artist: e.target.value || null }); }}
                      disabled={!canEdit(role)}
                      className="input"
                      placeholder="Optional featured artist"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="label text-muted">Language</label>
                    <select
                      value={language}
                      onChange={(e) => { setLanguage(e.target.value); saveDistribution({ language: e.target.value }); }}
                      disabled={!canEdit(role)}
                      className="input"
                    >
                      {["English", "Spanish", "French", "German", "Portuguese", "Japanese", "Korean", "Mandarin", "Italian", "Other"].map((l) => (
                        <option key={l} value={l}>{l}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-wrap gap-6 pt-1">
                    <ToggleField label="Explicit Lyrics" value={explicitLyrics} onChange={(v) => { setExplicitLyrics(v); saveDistribution({ explicit_lyrics: v }); }} disabled={!canEdit(role)} />
                    <ToggleField label="Instrumental" value={instrumental} onChange={(v) => { setInstrumental(v); saveDistribution({ instrumental: v }); }} disabled={!canEdit(role)} />
                    <ToggleField label="Cover Song" value={coverSong} onChange={(v) => { setCoverSong(v); saveDistribution({ cover_song: v }); }} disabled={!canEdit(role)} />
                  </div>
                </PanelBody>
              </Panel>

              <Panel>
                <PanelBody className="py-5 space-y-5">
                  <div className="label-sm text-muted">COPYRIGHT</div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                      <label className="label text-muted">Copyright #</label>
                      <input
                        type="text"
                        value={copyrightNumber}
                        onChange={(e) => { setCopyrightNumber(e.target.value); saveDistribution({ copyright_number: e.target.value || null }); }}
                        disabled={!canEdit(role)}
                        className="input"
                        placeholder="Registration number"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="label text-muted">Copyright filing date</label>
                      <input
                        type="date"
                        value={copyrightFilingDate}
                        onChange={(e) => { setCopyrightFilingDate(e.target.value); saveDistribution({ copyright_filing_date: e.target.value || null }); }}
                        disabled={!canEdit(role)}
                        className="input"
                      />
                    </div>
                  </div>
                </PanelBody>
              </Panel>

              <Panel>
                <PanelBody className="py-5 space-y-5">
                  <div className="label-sm text-muted">LYRICS</div>
                  <textarea
                    value={lyrics}
                    onChange={(e) => { setLyrics(e.target.value); saveDistribution({ lyrics: e.target.value || null }); }}
                    disabled={!canEdit(role)}
                    className="input min-h-[160px] resize-y text-sm font-mono"
                    placeholder="Paste or type lyrics here..."
                  />
                </PanelBody>
              </Panel>
            </div>
          )}
        </div>

        {/* ── Inspector sidebar ── */}
        <aside className="space-y-4">
          <Panel>
            <PanelBody className="py-5 space-y-3">
              <div className="label-sm text-muted mb-1">QUICK VIEW</div>
              <div className="flex justify-between text-sm items-center">
                <span className="text-muted">Status</span>
                {canEdit(role) ? (
                  <button
                    type="button"
                    onClick={cycleStatus}
                    className="cursor-pointer hover:opacity-80 transition-opacity"
                  >
                    <StatusIndicator color={sColor} label={sLabel} />
                  </button>
                ) : (
                  <StatusIndicator color={sColor} label={sLabel} />
                )}
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted">Quality</span>
                <span className="font-mono text-xs text-text">
                  {sampleRate} / {bitDepth}
                </span>
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
                <div className="label-sm text-muted">REFERENCES</div>
                {canEditCreative(role) && (
                  <button
                    type="button"
                    onClick={() => setShowRefForm(!showRefForm)}
                    className="text-xs text-muted hover:text-text transition-colors"
                  >
                    + Add
                  </button>
                )}
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
                      onDelete={canEditCreative(role) ? () => handleDeleteRef(ref.id) : undefined}
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
  disabled,
}: {
  value: string[];
  onChange: (next: string[]) => void;
  disabled?: boolean;
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
            onClick={() => !disabled && toggle(fmt)}
            disabled={disabled}
            className={`inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${
              value.includes(fmt)
                ? "bg-signal/10 border-signal text-signal"
                : "border-border text-muted hover:text-text hover:border-border-strong"
            } ${disabled ? "opacity-60 cursor-default" : ""}`}
          >
            {value.includes(fmt) && <Check size={12} />}
            {fmt}
          </button>
        ))}
      </div>
      {!disabled && (
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
      )}
    </div>
  );
}

/* ─── Distribution sub-components ─────────────────────────────── */

function ToggleField({
  label,
  value,
  onChange,
  disabled,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <label className={`flex items-center gap-2 text-sm ${disabled ? "opacity-60" : "cursor-pointer"}`}>
      <button
        type="button"
        role="switch"
        aria-checked={value}
        onClick={() => !disabled && onChange(!value)}
        disabled={disabled}
        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
          value ? "bg-signal" : "bg-border"
        }`}
      >
        <span
          className={`inline-block h-3.5 w-3.5 rounded-full bg-white transition-transform ${
            value ? "translate-x-4" : "translate-x-0.5"
          }`}
        />
      </button>
      <span className="text-text">{label}</span>
    </label>
  );
}

function SplitEditor({
  label,
  splits,
  onAdd,
  onUpdate,
  onDelete,
  readOnly,
  contacts,
  onSaveContact,
}: {
  label: string;
  splitType: string;
  splits: SplitData[];
  onAdd: () => void;
  onUpdate: (id: string, updates: Partial<SplitData>) => void;
  onDelete: (id: string) => void;
  readOnly?: boolean;
  contacts: SavedContact[];
  onSaveContact: (data: { person_name: string; pro_org?: string; member_account?: string; ipi?: string; sound_exchange_id?: string; label_name?: string }) => void;
}) {
  const sorted = [...splits].sort((a, b) => a.sort_order - b.sort_order);
  const total = sorted.reduce((sum, s) => sum + (s.percentage || 0), 0);
  const isValid = Math.abs(total - 100) < 0.01;

  return (
    <Panel>
      <PanelBody className="py-5">
        <div className="flex items-center justify-between mb-4">
          <div className="label-sm text-muted">{label}</div>
          {!readOnly && (
            <button
              type="button"
              onClick={onAdd}
              className="text-xs text-muted hover:text-text transition-colors"
            >
              + Add Person
            </button>
          )}
        </div>

        {sorted.length === 0 ? (
          <p className="text-sm text-muted text-center py-4">
            {readOnly ? "No splits configured." : "No splits yet. Add a person to get started."}
          </p>
        ) : (
          <div className="space-y-2">
            {sorted.map((split) => (
              <SplitRow
                key={split.id}
                split={split}
                splitType={split.split_type}
                onUpdate={onUpdate}
                onDelete={onDelete}
                readOnly={readOnly}
                contacts={contacts}
                onSaveContact={onSaveContact}
              />
            ))}
            <div className="flex items-center justify-between pt-2 border-t border-border">
              <span className="text-xs font-medium text-muted">Total</span>
              <span
                className={`text-sm font-mono font-semibold ${
                  isValid ? "text-emerald-500" : "text-signal"
                }`}
              >
                {total.toFixed(2)}%
                {!isValid && (
                  <span className="text-[10px] ml-2 text-signal font-normal">
                    Must equal 100%
                  </span>
                )}
              </span>
            </div>
          </div>
        )}
      </PanelBody>
    </Panel>
  );
}

function SplitRow({
  split,
  splitType,
  onUpdate,
  onDelete,
  readOnly,
  contacts,
  onSaveContact,
}: {
  split: SplitData;
  splitType: string;
  onUpdate: (id: string, updates: Partial<SplitData>) => void;
  onDelete: (id: string) => void;
  readOnly?: boolean;
  contacts: SavedContact[];
  onSaveContact: (data: { person_name: string; pro_org?: string; member_account?: string; ipi?: string; sound_exchange_id?: string; label_name?: string }) => void;
}) {
  const [localName, setLocalName] = useState(split.person_name);
  const [localPct, setLocalPct] = useState(String(split.percentage));
  const [localPro, setLocalPro] = useState(split.pro_org ?? "");
  const [localAccount, setLocalAccount] = useState(split.member_account ?? "");
  const [localIpi, setLocalIpi] = useState(split.ipi ?? "");
  const [localSeId, setLocalSeId] = useState(split.sound_exchange_id ?? "");
  const [localLabel, setLocalLabel] = useState(split.label_name ?? "");
  const rowDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Combobox state
  const [showDropdown, setShowDropdown] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);
  const [justSaved, setJustSaved] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  function debouncedUpdate(updates: Partial<SplitData>) {
    if (rowDebounceRef.current) clearTimeout(rowDebounceRef.current);
    rowDebounceRef.current = setTimeout(() => onUpdate(split.id, updates), 500);
  }

  // Filter contacts by current name input (case-insensitive)
  const filtered = localName.trim()
    ? contacts.filter((c) =>
        c.person_name.toLowerCase().includes(localName.toLowerCase()) &&
        c.person_name.toLowerCase() !== localName.toLowerCase()
      )
    : contacts;

  function selectContact(contact: SavedContact) {
    setLocalName(contact.person_name);
    setShowDropdown(false);
    setActiveIdx(-1);

    // Only fill fields relevant to the current split type to avoid
    // cross-contamination (e.g., writer account # into publisher member ID)
    const updates: Partial<SplitData> = { person_name: contact.person_name };

    if (splitType === "writing") {
      setLocalPro(contact.pro_org ?? "");
      setLocalAccount(contact.member_account ?? "");
      setLocalIpi(contact.ipi ?? "");
      updates.pro_org = contact.pro_org ?? undefined;
      updates.member_account = contact.member_account ?? undefined;
      updates.ipi = contact.ipi ?? undefined;
    } else if (splitType === "master") {
      setLocalSeId(contact.sound_exchange_id ?? "");
      setLocalLabel(contact.label_name ?? "");
      updates.sound_exchange_id = contact.sound_exchange_id ?? undefined;
      updates.label_name = contact.label_name ?? undefined;
    }
    // Publishing: only fill name — member_account/ipi have different
    // meanings (publisher IDs vs writer IDs) so we don't cross-fill

    onUpdate(split.id, updates);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!showDropdown || filtered.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((prev) => (prev < filtered.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((prev) => (prev > 0 ? prev - 1 : filtered.length - 1));
    } else if (e.key === "Enter" && activeIdx >= 0 && activeIdx < filtered.length) {
      e.preventDefault();
      selectContact(filtered[activeIdx]);
    } else if (e.key === "Escape") {
      setShowDropdown(false);
      setActiveIdx(-1);
    }
  }

  // Close dropdown when clicking outside
  const handleBlur = useCallback(() => {
    setTimeout(() => {
      if (wrapperRef.current && !wrapperRef.current.contains(document.activeElement)) {
        setShowDropdown(false);
        setActiveIdx(-1);
      }
    }, 150);
  }, []);

  const canSave = !readOnly && localName.trim() && (localPro || localAccount || localIpi || localSeId || localLabel);

  return (
    <div className="rounded-md border border-border bg-panel">
      <div className="flex items-center gap-3 px-4 py-3">
        <div ref={wrapperRef} className="relative flex-1" onBlur={handleBlur}>
          <input
            type="text"
            value={localName}
            onChange={(e) => {
              setLocalName(e.target.value);
              debouncedUpdate({ person_name: e.target.value });
              setShowDropdown(true);
              setActiveIdx(-1);
            }}
            onFocus={() => { if (contacts.length > 0) setShowDropdown(true); }}
            onKeyDown={handleKeyDown}
            readOnly={readOnly}
            placeholder="Person or entity name"
            className="w-full text-sm text-text bg-transparent border-none outline-none placeholder:text-faint"
            role="combobox"
            aria-expanded={showDropdown && filtered.length > 0}
            aria-autocomplete="list"
            aria-controls={`contact-list-${split.id}`}
            aria-activedescendant={activeIdx >= 0 ? `contact-${split.id}-${activeIdx}` : undefined}
          />
          {showDropdown && filtered.length > 0 && (
            <div
              id={`contact-list-${split.id}`}
              role="listbox"
              className="absolute left-0 top-full mt-1 w-full min-w-[240px] z-20 surface-float max-h-48 overflow-y-auto"
            >
              {filtered.map((c, i) => (
                <button
                  key={c.id}
                  id={`contact-${split.id}-${i}`}
                  role="option"
                  aria-selected={activeIdx === i}
                  type="button"
                  onMouseDown={(e) => { e.preventDefault(); selectContact(c); }}
                  onMouseEnter={() => setActiveIdx(i)}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-left transition-colors duration-75 ${
                    activeIdx === i ? "bg-signal-muted" : "hover:bg-panel2"
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-text truncate">{c.person_name}</div>
                    {(c.pro_org || c.label_name) && (
                      <div className="text-[10px] text-muted truncate">{c.pro_org || c.label_name}</div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <input
            type="number"
            value={localPct}
            onChange={(e) => {
              setLocalPct(e.target.value);
              const num = parseFloat(e.target.value);
              if (!isNaN(num)) debouncedUpdate({ percentage: num });
            }}
            readOnly={readOnly}
            min="0"
            max="100"
            step="0.01"
            className="w-20 text-sm text-right font-mono text-text bg-transparent border border-border rounded px-2 py-1 outline-none focus:border-signal"
          />
          <span className="text-xs text-muted">%</span>
        </div>
        {canSave && (
          <button
            type="button"
            onClick={() => {
              onSaveContact({
                person_name: localName.trim(),
                pro_org: localPro || undefined,
                member_account: localAccount || undefined,
                ipi: localIpi || undefined,
                sound_exchange_id: localSeId || undefined,
                label_name: localLabel || undefined,
              });
              setJustSaved(true);
              setTimeout(() => setJustSaved(false), 1500);
            }}
            className={`p-1 rounded transition-colors ${justSaved ? "text-emerald-500" : "text-faint hover:text-signal"}`}
            title={justSaved ? "Contact saved!" : "Save as contact for reuse"}
          >
            <Bookmark size={14} />
          </button>
        )}
        {!readOnly && (
          <button
            type="button"
            onClick={() => onDelete(split.id)}
            className="p-1 rounded text-faint hover:text-signal transition-colors"
            title="Remove"
          >
            <X size={14} />
          </button>
        )}
      </div>
      {(splitType === "writing" || splitType === "publishing") && (
        <div className="px-4 pb-3 grid grid-cols-3 gap-2 border-t border-border pt-3">
          {splitType === "writing" && (
            <div className="space-y-1">
              <label className="text-[10px] text-faint">PRO (ASCAP/BMI)</label>
              <input
                type="text"
                value={localPro}
                onChange={(e) => { setLocalPro(e.target.value); debouncedUpdate({ pro_org: e.target.value || undefined }); }}
                readOnly={readOnly}
                placeholder="e.g., BMI"
                className="w-full text-xs text-text bg-transparent border border-border rounded px-2 py-1 outline-none focus:border-signal placeholder:text-faint"
              />
            </div>
          )}
          <div className="space-y-1">
            <label className="text-[10px] text-faint">
              {splitType === "writing" ? "Member Account #" : "Publisher Member ID"}
            </label>
            <input
              type="text"
              value={localAccount}
              onChange={(e) => { setLocalAccount(e.target.value); debouncedUpdate({ member_account: e.target.value || undefined }); }}
              readOnly={readOnly}
              placeholder={splitType === "writing" ? "Account #" : "Member ID"}
              className="w-full text-xs text-text bg-transparent border border-border rounded px-2 py-1 outline-none focus:border-signal placeholder:text-faint"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] text-faint">
              {splitType === "writing" ? "Writer IPI" : "Publisher IPI"}
            </label>
            <input
              type="text"
              value={localIpi}
              onChange={(e) => { setLocalIpi(e.target.value); debouncedUpdate({ ipi: e.target.value || undefined }); }}
              readOnly={readOnly}
              placeholder="IPI #"
              className="w-full text-xs text-text bg-transparent border border-border rounded px-2 py-1 outline-none focus:border-signal placeholder:text-faint"
            />
          </div>
        </div>
      )}
      {splitType === "master" && (
        <div className="px-4 pb-3 grid grid-cols-2 gap-2 border-t border-border pt-3">
          <div className="space-y-1">
            <label className="text-[10px] text-faint">SoundExchange ID</label>
            <input
              type="text"
              value={localSeId}
              onChange={(e) => { setLocalSeId(e.target.value); debouncedUpdate({ sound_exchange_id: e.target.value || undefined }); }}
              readOnly={readOnly}
              placeholder="e.g., 1000139051"
              className="w-full text-xs text-text bg-transparent border border-border rounded px-2 py-1 outline-none focus:border-signal placeholder:text-faint"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] text-faint">Label Name</label>
            <input
              type="text"
              value={localLabel}
              onChange={(e) => { setLocalLabel(e.target.value); debouncedUpdate({ label_name: e.target.value || undefined }); }}
              readOnly={readOnly}
              placeholder="e.g., Self-Released"
              className="w-full text-xs text-text bg-transparent border border-border rounded px-2 py-1 outline-none focus:border-signal placeholder:text-faint"
            />
          </div>
        </div>
      )}
    </div>
  );
}
