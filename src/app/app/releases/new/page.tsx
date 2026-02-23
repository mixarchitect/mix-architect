"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabaseBrowserClient";
import { Panel, PanelBody, PanelHeader } from "@/components/ui/panel";
import { Button } from "@/components/ui/button";
import { Rule } from "@/components/ui/rule";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { TagInput } from "@/components/ui/tag-input";
import { ArrowLeft } from "lucide-react";

const TYPE_OPTIONS = [
  { value: "single", label: "Single" },
  { value: "ep", label: "EP" },
  { value: "album", label: "Album" },
];

const FORMAT_OPTIONS = [
  { value: "stereo", label: "Stereo" },
  { value: "atmos", label: "Dolby Atmos" },
  { value: "both", label: "Both" },
];

export default function NewReleasePage() {
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [releaseType, setReleaseType] = useState("single");
  const [format, setFormat] = useState("stereo");
  const [genreTags, setGenreTags] = useState<string[]>([]);
  const [targetDate, setTargetDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();
  const supabase = createSupabaseBrowserClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const {
        data: { user },
        error: userErr,
      } = await supabase.auth.getUser();
      if (userErr || !user) throw userErr ?? new Error("Not authenticated");

      const { data: release, error: insertErr } = await supabase
        .from("releases")
        .insert({
          user_id: user.id,
          title,
          artist: artist || null,
          release_type: releaseType,
          format,
          genre_tags: genreTags,
          target_date: targetDate || null,
        })
        .select()
        .single();

      if (insertErr) throw insertErr;

      if (releaseType === "single") {
        const { data: track } = await supabase
          .from("tracks")
          .insert({ release_id: release.id, track_number: 1, title })
          .select()
          .single();

        if (track) {
          await Promise.all([
            supabase.from("track_intent").insert({ track_id: track.id }),
            supabase.from("track_specs").insert({ track_id: track.id }),
          ]);
        }
      }

      router.push(`/app/releases/${release.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/app"
          className="text-sm text-muted hover:text-text transition-colors flex items-center gap-1"
        >
          <ArrowLeft size={14} />
          Back to Releases
        </Link>
      </div>

      <Panel>
        <PanelHeader>
          <h1 className="text-2xl font-semibold h2 text-text">New Release</h1>
          <p className="mt-1 text-sm text-muted">
            Set up your project &mdash; you can always edit these details later.
          </p>
        </PanelHeader>
        <Rule />
        <PanelBody className="pt-5">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-1.5">
              <label className="label text-faint">Release title *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="input"
                placeholder="Midnight Drive EP"
              />
            </div>

            <div className="space-y-1.5">
              <label className="label text-faint">Artist / Client</label>
              <input
                type="text"
                value={artist}
                onChange={(e) => setArtist(e.target.value)}
                className="input"
                placeholder="Artist or client name"
              />
            </div>

            <div className="space-y-1.5">
              <label className="label text-faint">Release type</label>
              <SegmentedControl
                options={TYPE_OPTIONS}
                value={releaseType}
                onChange={setReleaseType}
              />
            </div>

            <div className="space-y-1.5">
              <label className="label text-faint">Format</label>
              <SegmentedControl
                options={FORMAT_OPTIONS}
                value={format}
                onChange={setFormat}
              />
            </div>

            <div className="space-y-1.5">
              <label className="label text-faint">Genre tags</label>
              <TagInput
                value={genreTags}
                onChange={setGenreTags}
                placeholder="Type and press Enter to add"
              />
            </div>

            <div className="space-y-1.5">
              <label className="label text-faint">Target release date</label>
              <input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="input"
              />
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
                {error}
              </p>
            )}

            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                disabled={loading || !title.trim()}
              >
                {loading ? "Creating\u2026" : "Create Release"}
              </Button>
            </div>
          </form>
        </PanelBody>
      </Panel>
    </div>
  );
}
