"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabaseBrowserClient";
import { Rail } from "@/components/ui/rail";
import { Surface, SurfaceBody, SurfaceHeader } from "@/components/ui/surface";
import { Tag } from "@/components/ui/tag";
import { Folder, Plus, Settings } from "lucide-react";

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
    <div className="mx-auto max-w-[1400px] px-4 py-6">
      <div className="flex gap-4">
        <Rail
          items={[
            { href: "/app", icon: <Folder size={18} />, label: "Releases" },
            { href: "/app/releases/new", icon: <Plus size={18} />, label: "New release" },
            { href: "/app/settings", icon: <Settings size={18} />, label: "Settings" },
          ]}
        />

        <div className="flex-1 min-w-0 flex flex-col gap-4">
          <Surface>
            <SurfaceHeader className="space-y-2">
              <p className="text-xs text-subtle uppercase tracking-[0.24em]">
                Create
              </p>
              <h1 className="text-3xl font-semibold h1 leading-tight">New release</h1>
              <p className="text-subtle text-sm">
                Capture the essentials so your mixer understands the intent.
              </p>
            </SurfaceHeader>
            <SurfaceBody className="space-y-4">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="label">Release name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="input"
                    placeholder="Album or project name"
                  />
                </div>

                <div className="space-y-1">
                  <label className="label">Artist name</label>
                  <input
                    type="text"
                    value={artistName}
                    onChange={(e) => setArtistName(e.target.value)}
                    className="input"
                    placeholder="Optional"
                  />
                </div>

                <div className="space-y-1">
                  <label className="label">Release type</label>
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

                {errorMsg && <p className="text-sm text-red-400">{errorMsg}</p>}

                <div className="flex items-center gap-3">
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary disabled:opacity-70"
                  >
                    {loading ? "Creating..." : "Create release"}
                  </button>
                  <Tag>Blueprint ready</Tag>
                </div>
              </form>
            </SurfaceBody>
          </Surface>
        </div>

        <aside className="hidden lg:block w-[360px] shrink-0">
          <Surface className="sticky top-4">
            <SurfaceHeader>
              <div className="text-sm font-semibold h2">Checklist</div>
              <div className="text-xs text-muted mt-1">
                Keep inputs crisp, avoid ambiguity.
              </div>
            </SurfaceHeader>
            <SurfaceBody className="space-y-3">
              <ul className="text-xs text-muted space-y-2">
                <li>• Use a precise release name.</li>
                <li>• Add artist for clear attribution.</li>
                <li>• Pick the right type (single/EP/album).</li>
              </ul>
              <div className="flex gap-2 flex-wrap">
                <Tag>⌘S Saves</Tag>
                <Tag>Focus</Tag>
              </div>
            </SurfaceBody>
          </Surface>
        </aside>
      </div>

      <div className="lg:hidden mt-4">
        <Surface>
          <SurfaceHeader>
            <div className="text-sm font-semibold h2">Checklist</div>
            <div className="text-xs text-muted mt-1">
              Keep inputs crisp, avoid ambiguity.
            </div>
          </SurfaceHeader>
          <SurfaceBody className="space-y-3">
            <ul className="text-xs text-muted space-y-2">
              <li>• Use a precise release name.</li>
              <li>• Add artist for clear attribution.</li>
              <li>• Pick the right type (single/EP/album).</li>
            </ul>
            <div className="flex gap-2 flex-wrap">
              <Tag>⌘S Saves</Tag>
              <Tag>Focus</Tag>
            </div>
          </SurfaceBody>
        </Surface>
      </div>
    </div>
  );
}
