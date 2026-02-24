"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabaseBrowserClient";
import { Panel, PanelBody, PanelHeader } from "@/components/ui/panel";
import { Button } from "@/components/ui/button";
import { Rule } from "@/components/ui/rule";
import { cn } from "@/lib/cn";
import { ArrowLeft } from "lucide-react";

type Props = {
  params: Promise<{ releaseId: string }>;
};

export default function NewTrackPage({ params }: Props) {
  const { releaseId } = use(params);
  const [mode, setMode] = useState<"single" | "batch">("single");
  const [title, setTitle] = useState("");
  const [batchTitles, setBatchTitles] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();
  const supabase = createSupabaseBrowserClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { data: maxTrack } = await supabase
        .from("tracks")
        .select("track_number")
        .eq("release_id", releaseId)
        .order("track_number", { ascending: false })
        .limit(1)
        .maybeSingle();

      let nextNumber = (maxTrack?.track_number ?? 0) + 1;

      if (mode === "single") {
        const { data: track, error: trackErr } = await supabase
          .from("tracks")
          .insert({
            release_id: releaseId,
            track_number: nextNumber,
            title: title.trim(),
          })
          .select()
          .single();

        if (trackErr) throw trackErr;

        await Promise.all([
          supabase.from("track_intent").insert({ track_id: track.id }),
          supabase.from("track_specs").insert({ track_id: track.id }),
        ]);

        router.push(`/app/releases/${releaseId}/tracks/${track.id}`);
      } else {
        const titles = batchTitles
          .split("\n")
          .map((t) => t.trim())
          .filter(Boolean);

        if (titles.length === 0) throw new Error("Enter at least one track title");

        for (const t of titles) {
          const { data: track } = await supabase
            .from("tracks")
            .insert({
              release_id: releaseId,
              track_number: nextNumber++,
              title: t,
            })
            .select()
            .single();

          if (track) {
            await Promise.all([
              supabase.from("track_intent").insert({ track_id: track.id }),
              supabase.from("track_specs").insert({ track_id: track.id }),
            ]);
          }
        }

        router.push(`/app/releases/${releaseId}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <Link
          href={`/app/releases/${releaseId}`}
          className="text-sm text-muted hover:text-text transition-colors flex items-center gap-1"
        >
          <ArrowLeft size={14} />
          Back to Release
        </Link>
      </div>

      <Panel>
        <PanelHeader>
          <h1 className="text-2xl font-semibold h2 text-text">Add Track</h1>
          <p className="mt-1 text-sm text-muted">
            Add one track or paste a tracklist to add multiple at once.
          </p>
        </PanelHeader>
        <Rule />
        <PanelBody className="pt-5">
          <div className="flex items-center gap-4 mb-6">
            <button
              type="button"
              onClick={() => setMode("single")}
              className={cn(
                "text-sm font-medium pb-1 border-b-2 transition-colors",
                mode === "single"
                  ? "border-signal text-text"
                  : "border-transparent text-muted hover:text-text"
              )}
            >
              Single track
            </button>
            <button
              type="button"
              onClick={() => setMode("batch")}
              className={cn(
                "text-sm font-medium pb-1 border-b-2 transition-colors",
                mode === "batch"
                  ? "border-signal text-text"
                  : "border-transparent text-muted hover:text-text"
              )}
            >
              Multiple tracks
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {mode === "single" ? (
              <div className="space-y-1.5">
                <label className="label text-faint">Track title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="input"
                  placeholder="Track name"
                />
              </div>
            ) : (
              <div className="space-y-1.5">
                <label className="label text-faint">
                  Track titles (one per line)
                </label>
                <textarea
                  required
                  value={batchTitles}
                  onChange={(e) => setBatchTitles(e.target.value)}
                  className="input min-h-[160px] resize-y"
                  placeholder={
                    "Midnight Drive\nNeon Sunset\nCoastline\nGolden Hour\nLast Light"
                  }
                />
              </div>
            )}

            {error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
                {error}
              </p>
            )}

            <Button type="submit" variant="primary" disabled={loading}>
              {loading
                ? "Adding\u2026"
                : mode === "single"
                  ? "Add Track"
                  : "Add Tracks"}
            </Button>
          </form>
        </PanelBody>
      </Panel>
    </div>
  );
}
