"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabaseBrowserClient";
import { Panel, PanelBody, PanelHeader } from "@/components/ui/panel";
import { Button } from "@/components/ui/button";
import { Rule } from "@/components/ui/rule";
import { TagInput } from "@/components/ui/tag-input";
import { ArrowLeft, Sparkles } from "lucide-react";
import { useSubscription } from "@/lib/subscription-context";

const TYPE_OPTIONS = [
  { value: "single", label: "Single" },
  { value: "ep", label: "EP" },
  { value: "album", label: "Album" },
];

const FORMAT_OPTIONS = [
  { value: "stereo", label: "Stereo" },
  { value: "atmos", label: "Dolby Atmos" },
  { value: "both", label: "Stereo + Atmos" },
];

const GENRE_SUGGESTIONS = [
  "Rock", "Pop", "Hip-Hop", "R&B", "Electronic", "Country", "Jazz",
  "Classical", "Indie", "Alternative", "Metal", "Folk", "Soul", "Funk",
  "Blues", "Reggae", "Latin", "Punk", "Lo-Fi", "Ambient",
];

function PillSelect({
  options,
  value,
  onChange,
}: {
  options: { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex gap-2 flex-wrap">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className="px-4 py-2 text-sm font-medium rounded-md transition-colors"
          style={
            value === opt.value
              ? { background: "var(--signal)", color: "#fff" }
              : { background: "var(--panel2)", color: "var(--text-muted)" }
          }
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

export default function NewReleasePage() {
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [releaseType, setReleaseType] = useState("single");
  const [format, setFormat] = useState("stereo");
  const [genreTags, setGenreTags] = useState<string[]>([]);
  const [targetDate, setTargetDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [upgrading, setUpgrading] = useState(false);

  const router = useRouter();
  const supabase = createSupabaseBrowserClient();
  const sub = useSubscription();
  const isFree = sub.plan !== "pro" || (sub.status !== "active" && sub.status !== "trialing");

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

      // Check release limit on free plan
      const { data: canCreate } = await supabase.rpc("can_create_release", {
        p_user_id: user.id,
      });
      if (canCreate === false) {
        setError(
          "You\u2019ve reached the release limit on the Free plan. Upgrade to Pro for unlimited releases.",
        );
        setLoading(false);
        return;
      }

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
      <div className="flex items-center gap-3 mb-8">
        <Link
          href="/app"
          className="text-sm text-muted hover:text-text transition-colors flex items-center gap-1"
        >
          <ArrowLeft size={14} />
          Back to Releases
        </Link>
      </div>

      {isFree && (
        <div
          className="flex items-center gap-3 px-4 py-3 rounded-lg mb-4 text-sm"
          style={{ background: "var(--panel-2)" }}
        >
          <Sparkles size={16} className="text-signal shrink-0" />
          <span className="text-muted">
            Free plan includes 1 release.{" "}
            <button
              type="button"
              onClick={async () => {
                setUpgrading(true);
                try {
                  const res = await fetch("/api/stripe/checkout", { method: "POST" });
                  const data = await res.json();
                  if (data.url) window.location.href = data.url;
                  else setUpgrading(false);
                } catch {
                  setUpgrading(false);
                }
              }}
              disabled={upgrading}
              className="text-signal font-semibold hover:underline"
            >
              {upgrading ? "Redirecting\u2026" : "Upgrade to Pro"}
            </button>
            {" "}for unlimited releases.
          </span>
        </div>
      )}

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
              <label className="label text-muted">Release title *</label>
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
              <label className="label text-muted">Artist / Client</label>
              <input
                type="text"
                value={artist}
                onChange={(e) => setArtist(e.target.value)}
                className="input"
                placeholder="Artist or client name"
              />
            </div>

            <div className="space-y-1.5">
              <label className="label text-muted">Release type</label>
              <PillSelect
                options={TYPE_OPTIONS}
                value={releaseType}
                onChange={setReleaseType}
              />
            </div>

            <div className="space-y-1.5">
              <label className="label text-muted">Format</label>
              <PillSelect
                options={FORMAT_OPTIONS}
                value={format}
                onChange={setFormat}
              />
            </div>

            <div className="space-y-1.5">
              <label className="label text-muted">Genre tags</label>
              <TagInput
                value={genreTags}
                onChange={setGenreTags}
                suggestions={GENRE_SUGGESTIONS}
                placeholder="Type and press Enter to add"
              />
            </div>

            <div className="space-y-1.5">
              <label className="label text-muted">Target release date</label>
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
