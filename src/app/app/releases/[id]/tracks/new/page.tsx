"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabaseBrowserClient";

const MIX_FORMATS = [
  { value: "stereo", label: "Stereo" },
  { value: "5.1", label: "5.1" },
  { value: "7.1.4", label: "7.1.4" },
  { value: "immersive", label: "Immersive" },
];

export default function NewTrackPage() {
  const [name, setName] = useState("");
  const [trackNumber, setTrackNumber] = useState("");
  const [mixFormat, setMixFormat] = useState(MIX_FORMATS[0].value);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const params = useParams();
  const releaseId = params?.id as string;

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

      const trackNumberValue = trackNumber
        ? Number.parseInt(trackNumber, 10)
        : null;

      const { data, error } = await supabase
        .from("projects")
        .insert({
          user_id: user.id,
          release_id: releaseId,
          name,
          track_number: trackNumberValue,
          mix_format: mixFormat,
        })
        .select()
        .single();

      if (error) throw error;

      router.push(`/app/projects/${data.id}/wizard`);
    } catch (err: any) {
      setErrorMsg(err.message ?? "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="max-w-xl space-y-6">
      <h1 className="text-2xl font-semibold">Add track</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1">
          <label className="block text-sm text-neutral-300">Track name</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-md border border-neutral-700 bg-black px-3 py-2 text-sm outline-none focus:border-neutral-400"
            placeholder="Track name"
          />
        </div>

        <div className="space-y-1">
          <label className="block text-sm text-neutral-300">Track number</label>
          <input
            type="number"
            min="1"
            value={trackNumber}
            onChange={(e) => setTrackNumber(e.target.value)}
            className="w-full rounded-md border border-neutral-700 bg-black px-3 py-2 text-sm outline-none focus:border-neutral-400"
            placeholder="Optional"
          />
        </div>

        <div className="space-y-1">
          <label className="block text-sm text-neutral-300">Mix format</label>
          <select
            value={mixFormat}
            onChange={(e) => setMixFormat(e.target.value)}
            className="w-full rounded-md border border-neutral-700 bg-black px-3 py-2 text-sm outline-none focus:border-neutral-400"
          >
            {MIX_FORMATS.map((format) => (
              <option key={format.value} value={format.value}>
                {format.label}
              </option>
            ))}
          </select>
        </div>

        {errorMsg && <p className="text-sm text-red-400">{errorMsg}</p>}

        <button
          type="submit"
          disabled={loading}
          className="rounded-md border border-neutral-700 px-4 py-2 text-sm font-medium hover:bg-neutral-900 disabled:opacity-60"
        >
          {loading ? "Adding..." : "Add track"}
        </button>
      </form>
    </main>
  );
}

