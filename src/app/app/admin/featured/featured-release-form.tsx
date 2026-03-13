"use client";

import { useRef, useState } from "react";
import type { FeaturedRelease } from "@/types/featured-release";
import { Button } from "@/components/ui/button";

interface Props {
  action: (formData: FormData) => Promise<void>;
  release?: FeaturedRelease;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);
}

export function FeaturedReleaseForm({ action, release }: Props) {
  const [source, setSource] = useState<string>(release?.source ?? "external");
  const [slug, setSlug] = useState(release?.slug ?? "");
  const [autoSlug, setAutoSlug] = useState(!release);
  const formRef = useRef<HTMLFormElement>(null);

  const today = new Date().toISOString().split("T")[0];

  return (
    <form ref={formRef} action={action} className="space-y-8 max-w-2xl">
      {release && <input type="hidden" name="id" value={release.id} />}

      {/* ── Release Info ── */}
      <fieldset className="space-y-4">
        <legend className="text-xs font-semibold tracking-widest uppercase text-zinc-500 mb-2">
          Release Info
        </legend>

        <Field label="Title" required>
          <input
            name="title"
            type="text"
            defaultValue={release?.title}
            required
            maxLength={200}
            className="input"
            onChange={(e) => {
              if (autoSlug) setSlug(slugify(e.target.value));
            }}
          />
        </Field>

        <Field label="Artist Name" required>
          <input
            name="artist_name"
            type="text"
            defaultValue={release?.artist_name}
            required
            maxLength={200}
            className="input"
          />
        </Field>

        <Field label="Slug" required>
          <input
            name="slug"
            type="text"
            value={slug}
            onChange={(e) => {
              setSlug(e.target.value);
              setAutoSlug(false);
            }}
            required
            className="input font-mono text-xs"
          />
          <p className="text-[10px] text-zinc-600 mt-1">
            URL: /featured/{slug || "..."}
          </p>
        </Field>

        <Field label="Release Type" required>
          <select
            name="release_type"
            defaultValue={release?.release_type ?? "album"}
            className="input"
          >
            <option value="single">Single</option>
            <option value="ep">EP</option>
            <option value="album">Album</option>
          </select>
        </Field>

        <Field label="Source" required>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-sm text-zinc-300 cursor-pointer">
              <input
                type="radio"
                name="source"
                value="external"
                checked={source === "external"}
                onChange={() => setSource("external")}
                className="accent-teal-500"
              />
              External
            </label>
            <label className="flex items-center gap-2 text-sm text-zinc-300 cursor-pointer">
              <input
                type="radio"
                name="source"
                value="platform"
                checked={source === "platform"}
                onChange={() => setSource("platform")}
                className="accent-teal-500"
              />
              Platform
            </label>
          </div>
        </Field>

        {source === "platform" && (
          <Field label="Release ID (optional)">
            <input
              name="release_id"
              type="text"
              defaultValue={release?.release_id ?? ""}
              placeholder="UUID of linked Mix Architect release"
              className="input"
            />
          </Field>
        )}
      </fieldset>

      {/* ── Author ── */}
      <fieldset className="space-y-4">
        <legend className="text-xs font-semibold tracking-widest uppercase text-zinc-500 mb-2">
          Author / Byline
        </legend>

        <Field label="Author Name">
          <input
            name="author_name"
            type="text"
            defaultValue={release?.author_name ?? "Mix Architect"}
            className="input"
          />
        </Field>

        <Field label="Author Bio">
          <input
            name="author_bio"
            type="text"
            defaultValue={release?.author_bio ?? ""}
            placeholder="e.g., Mastering engineer and Tape Op contributor"
            className="input"
          />
        </Field>

        <Field label="Author URL">
          <input
            name="author_url"
            type="url"
            defaultValue={release?.author_url ?? ""}
            placeholder="https://..."
            className="input"
          />
        </Field>
      </fieldset>

      {/* ── Content ── */}
      <fieldset className="space-y-4">
        <legend className="text-xs font-semibold tracking-widest uppercase text-zinc-500 mb-2">
          Content
        </legend>

        <Field label="Headline" required>
          <input
            name="headline"
            type="text"
            defaultValue={release?.headline}
            required
            maxLength={300}
            placeholder="Short punchy headline for cards"
            className="input"
          />
        </Field>

        <Field label="Body (Markdown)" required>
          <textarea
            name="body"
            defaultValue={release?.body}
            required
            rows={12}
            placeholder="Full writeup, 300-800 words. Markdown supported."
            className="input resize-y"
          />
        </Field>

        <Field label="Pull Quote">
          <input
            name="pull_quote"
            type="text"
            defaultValue={release?.pull_quote ?? ""}
            placeholder="Standout quote for visual emphasis"
            className="input"
          />
        </Field>

        <Field label="Cover Art" required={!release}>
          <input
            name="cover_art"
            type="file"
            accept="image/*"
            required={!release}
            className="text-sm text-zinc-400 file:mr-3 file:px-3 file:py-1.5 file:text-xs file:font-medium file:rounded-full file:border file:border-white/10 file:bg-panel file:text-zinc-300 file:cursor-pointer hover:file:bg-white/5"
          />
          {release && (
            <p className="text-[10px] text-zinc-600 mt-1">
              Leave empty to keep existing image.
            </p>
          )}
        </Field>
      </fieldset>

      {/* ── Streaming Links ── */}
      <fieldset className="space-y-4">
        <legend className="text-xs font-semibold tracking-widest uppercase text-zinc-500 mb-2">
          Streaming Links
        </legend>

        {[
          { name: "link_spotify", label: "Spotify" },
          { name: "link_apple_music", label: "Apple Music" },
          { name: "link_youtube_music", label: "YouTube Music" },
          { name: "link_bandcamp", label: "Bandcamp" },
          { name: "link_soundcloud", label: "SoundCloud" },
          { name: "link_tidal", label: "Tidal" },
          { name: "link_amazon_music", label: "Amazon Music" },
          { name: "link_deezer", label: "Deezer" },
          { name: "link_website", label: "Website" },
        ].map(({ name, label }) => (
          <Field key={name} label={label}>
            <input
              name={name}
              type="url"
              defaultValue={
                (release?.[name as keyof FeaturedRelease] as string) ?? ""
              }
              placeholder="https://..."
              className="input"
            />
          </Field>
        ))}
      </fieldset>

      {/* ── Metadata ── */}
      <fieldset className="space-y-4">
        <legend className="text-xs font-semibold tracking-widest uppercase text-zinc-500 mb-2">
          Metadata
        </legend>

        <Field label="Genre Tags">
          <input
            name="genre_tags"
            type="text"
            defaultValue={release?.genre_tags?.join(", ") ?? ""}
            placeholder="indie rock, shoegaze (comma separated)"
            className="input"
          />
        </Field>

        <Field label="Credits">
          <textarea
            name="credits"
            defaultValue={release?.credits ?? ""}
            rows={3}
            placeholder="Producer, mixer, mastering engineer, etc."
            className="input resize-y"
          />
        </Field>

        <Field label="Release Date">
          <input
            name="release_date"
            type="date"
            defaultValue={release?.release_date ?? ""}
            className="input"
          />
        </Field>

        <Field label="Featured Date" required>
          <input
            name="featured_date"
            type="date"
            defaultValue={release?.featured_date ?? today}
            required
            className="input"
          />
        </Field>

        <Field label="Active">
          <label className="flex items-center gap-2 text-sm text-zinc-300 cursor-pointer">
            <input
              type="checkbox"
              name="is_active"
              defaultChecked={release?.is_active ?? false}
              className="accent-teal-500"
            />
            Set as the current featured release
          </label>
        </Field>
      </fieldset>

      {/* ── SEO ── */}
      <fieldset className="space-y-4">
        <legend className="text-xs font-semibold tracking-widest uppercase text-zinc-500 mb-2">
          SEO Overrides
        </legend>

        <Field label="Meta Title">
          <input
            name="meta_title"
            type="text"
            defaultValue={release?.meta_title ?? ""}
            maxLength={70}
            placeholder="Custom page title (defaults to Title by Artist)"
            className="input"
          />
        </Field>

        <Field label="Meta Description">
          <textarea
            name="meta_description"
            defaultValue={release?.meta_description ?? ""}
            rows={2}
            maxLength={155}
            placeholder="Custom meta description (defaults to body excerpt)"
            className="input resize-y"
          />
        </Field>
      </fieldset>

      <div className="flex items-center gap-3 pt-4 border-t border-border">
        <Button type="submit" variant="primary">
          {release ? "Save Changes" : "Create Featured Release"}
        </Button>
        <a
          href="/app/admin/featured"
          className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          Cancel
        </a>
      </div>
    </form>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-zinc-400 mb-1.5">
        {label}
        {required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}
