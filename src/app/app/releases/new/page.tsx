"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabaseBrowserClient";

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
    <main className="max-w-2xl space-y-6 card p-6">
      <div className="space-y-2">
        <p className="text-xs text-subtle uppercase tracking-[0.2em]">
          Create
        </p>
        <h1 className="text-2xl font-semibold">New release</h1>
        <p className="text-subtle text-sm">
          Capture the essentials so your mixer understands the intent.
        </p>
      </div>

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

        <button
          type="submit"
          disabled={loading}
          className="btn-primary disabled:opacity-70"
        >
          {loading ? "Creating..." : "Create release"}
        </button>
      </form>
    </main>
  );
}
