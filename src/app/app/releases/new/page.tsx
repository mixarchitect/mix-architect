"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabaseBrowserClient";
import { Panel, PanelBody, PanelHeader } from "@/components/ui/panel";
import { Button } from "@/components/ui/button";
import { Rule } from "@/components/ui/rule";
import { Pill } from "@/components/ui/pill";
import { Inspector } from "@/components/ui/inspector";

const RELEASE_TYPES = [
  { value: "single", label: "Single" },
  { value: "ep", label: "EP" },
  { value: "album", label: "Album" },
];

export default function NewReleasePage() {
  const [name, setName] = useState("");
  const [artistName, setArtistName] = useState("");
  const [type, setType] = useState("single");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const supabase = createSupabaseBrowserClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError || !user) throw userError ?? new Error("No user");

      const { data, error } = await supabase
        .from("releases")
        .insert({
          user_id: user.id,
          name,
          artist_name: artistName || null,
          type,
        })
        .select()
        .single();

      if (error) throw error;

      router.push(`/app/releases/${data.id}`);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg("Something went wrong");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <Panel>
        <PanelHeader>
          <div className="label text-[11px] text-faint">CREATE</div>
          <h1 className="mt-2 text-3xl font-semibold h1 text-text">New release</h1>
          <p className="mt-2 text-sm text-muted">
            Capture the essentials so your mixer understands the intent.
          </p>
        </PanelHeader>
        <Rule />
        <PanelBody className="pt-5">
          <form onSubmit={handleSubmit} className="space-y-5 max-w-md">
            <div className="space-y-1.5">
              <label className="label text-faint">Release name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input"
                placeholder="Album or project name"
              />
            </div>

            <div className="space-y-1.5">
              <label className="label text-faint">Artist name</label>
              <input
                type="text"
                value={artistName}
                onChange={(e) => setArtistName(e.target.value)}
                className="input"
                placeholder="Optional"
              />
            </div>

            <div className="space-y-1.5">
              <label className="label text-faint">Release type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="input"
              >
                {RELEASE_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            {errorMsg && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
                {errorMsg}
              </p>
            )}

            <div className="flex items-center gap-3 pt-2">
              <Button type="submit" variant="primary" disabled={loading}>
                {loading ? "Creating..." : "Create release"}
              </Button>
              <span className="status-stamp status-stamp-ready">Blueprint ready</span>
            </div>
          </form>
        </PanelBody>
      </Panel>

      {/* Checklist inspector */}
      <div className="lg:hidden">
        <Inspector title="Checklist" subtitle="Keep inputs crisp, avoid ambiguity.">
          <ul className="text-sm text-muted space-y-2">
            <li>• Use a precise release name.</li>
            <li>• Add artist for clear attribution.</li>
            <li>• Pick the right type (single/EP/album).</li>
          </ul>
          <div className="flex gap-2 flex-wrap mt-4">
            <Pill>⌘S Saves</Pill>
            <Pill>Focus</Pill>
          </div>
        </Inspector>
      </div>
    </div>
  );
}
