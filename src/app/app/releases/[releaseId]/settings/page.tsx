"use client";

import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabaseBrowserClient";
import { Panel, PanelBody, PanelHeader } from "@/components/ui/panel";
import { Button } from "@/components/ui/button";
import { Rule } from "@/components/ui/rule";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { TagInput } from "@/components/ui/tag-input";
import { ArrowLeft } from "lucide-react";

type Props = { params: Promise<{ releaseId: string }> };

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

const STATUS_OPTIONS = [
  { value: "draft", label: "Draft" },
  { value: "in_progress", label: "In Progress" },
  { value: "ready", label: "Ready" },
];

export default function ReleaseSettingsPage({ params }: Props) {
  const { releaseId } = use(params);
  const supabase = createSupabaseBrowserClient();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [releaseType, setReleaseType] = useState("single");
  const [format, setFormat] = useState("stereo");
  const [status, setStatus] = useState("draft");
  const [globalDirection, setGlobalDirection] = useState("");
  const [genreTags, setGenreTags] = useState<string[]>([]);
  const [targetDate, setTargetDate] = useState("");
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [deliveryNotes, setDeliveryNotes] = useState("");

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("releases")
        .select("*")
        .eq("id", releaseId)
        .maybeSingle();

      if (data) {
        setTitle(data.title ?? "");
        setArtist(data.artist ?? "");
        setReleaseType(data.release_type ?? "single");
        setFormat(data.format ?? "stereo");
        setStatus(data.status ?? "draft");
        setGlobalDirection(data.global_direction ?? "");
        setGenreTags(data.genre_tags ?? []);
        setTargetDate(data.target_date ?? "");
        setClientName(data.client_name ?? "");
        setClientEmail(data.client_email ?? "");
        setDeliveryNotes(data.delivery_notes ?? "");
      }
      setLoading(false);
    }
    load();
  }, [supabase, releaseId]);

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      const { error: updateErr } = await supabase
        .from("releases")
        .update({
          title,
          artist: artist || null,
          release_type: releaseType,
          format,
          status,
          global_direction: globalDirection || null,
          genre_tags: genreTags,
          target_date: targetDate || null,
          client_name: clientName || null,
          client_email: clientEmail || null,
          delivery_notes: deliveryNotes || null,
        })
        .eq("id", releaseId);

      if (updateErr) throw updateErr;
      router.push(`/app/releases/${releaseId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="text-sm text-muted py-12 text-center">Loading&hellip;</div>;
  }

  return (
    <div className="max-w-xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
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
          <h1 className="text-2xl font-semibold h2 text-text">
            Release Settings
          </h1>
          <p className="mt-1 text-sm text-muted">
            Edit the details for this release.
          </p>
        </PanelHeader>
        <Rule />
        <PanelBody className="pt-5 space-y-6">
          <div className="space-y-1.5">
            <label className="label text-faint">Release title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input"
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
            <label className="label text-faint">Status</label>
            <SegmentedControl
              options={STATUS_OPTIONS}
              value={status}
              onChange={setStatus}
            />
          </div>

          <div className="space-y-1.5">
            <label className="label text-faint">Global mix direction</label>
            <textarea
              value={globalDirection}
              onChange={(e) => setGlobalDirection(e.target.value)}
              className="input min-h-[100px] resize-y text-sm"
              placeholder="Overall sonic vision for this release..."
            />
          </div>

          <div className="space-y-1.5">
            <label className="label text-faint">Genre tags</label>
            <TagInput
              value={genreTags}
              onChange={setGenreTags}
              placeholder="Type and press Enter"
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

          <Rule />

          <div className="space-y-1.5">
            <label className="label text-faint">Client name</label>
            <input
              type="text"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              className="input"
              placeholder="Client / label contact"
            />
          </div>

          <div className="space-y-1.5">
            <label className="label text-faint">Client email</label>
            <input
              type="email"
              value={clientEmail}
              onChange={(e) => setClientEmail(e.target.value)}
              className="input"
              placeholder="client@example.com"
            />
          </div>

          <div className="space-y-1.5">
            <label className="label text-faint">Delivery notes</label>
            <textarea
              value={deliveryNotes}
              onChange={(e) => setDeliveryNotes(e.target.value)}
              className="input min-h-[80px] resize-y text-sm"
              placeholder="Global delivery specs..."
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
              {error}
            </p>
          )}

          <div className="flex items-center gap-3 pt-2">
            <Button variant="primary" onClick={handleSave} disabled={saving}>
              {saving ? "Saving\u2026" : "Save Changes"}
            </Button>
            <Link href={`/app/releases/${releaseId}`}>
              <Button variant="ghost">Cancel</Button>
            </Link>
          </div>
        </PanelBody>
      </Panel>
    </div>
  );
}
